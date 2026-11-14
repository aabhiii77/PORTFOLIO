import { execFile, spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type Request, type Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const USE_VITE_DEV = process.env.VITE_DEV === 'true';

function findAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('Failed to determine free port')));
        return;
      }
      const { port } = address;
      server.close((err) => {
        if (err) reject(err);
        else resolve(port);
      });
    });
  });
}

function resolvePythonExecutable(): string {
  const venvPython = path.join(__dirname, '.venv', 'bin', 'python');
  if (fs.existsSync(venvPython)) {
    return venvPython;
  }
  return 'python3';
}

function hasPythonFastApiDeps(pythonBin: string): Promise<boolean> {
  return new Promise((resolve) => {
    execFile(
      pythonBin,
      ['-c', 'import fastapi, uvicorn, pydantic'],
      { cwd: __dirname, timeout: 5000 },
      (error) => {
        resolve(!error);
      }
    );
  });
}

async function waitForPythonHealth(port: number, timeoutMs = 10000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ok = await new Promise<boolean>((resolve) => {
      const req = http.get(
        {
          hostname: '127.0.0.1',
          port,
          path: '/api/health',
          timeout: 800,
        },
        (res) => {
          res.resume();
          resolve(res.statusCode === 200);
        }
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    });

    if (ok) return true;
    await new Promise((r) => setTimeout(r, 150));
  }
  return false;
}

function startPythonProcess(pythonBin: string, port: number): ChildProcess {
  const child = spawn(
    pythonBin,
    [
      '-m',
      'uvicorn',
      'api.index:app',
      '--host',
      '127.0.0.1',
      '--port',
      String(port),
      '--log-level',
      'warning',
    ],
    {
      cwd: __dirname,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  child.stdout?.on('data', (chunk: Buffer) => {
    process.stdout.write(`[python-api] ${chunk.toString()}`);
  });
  child.stderr?.on('data', (chunk: Buffer) => {
    process.stderr.write(`[python-api] ${chunk.toString()}`);
  });

  return child;
}

interface PythonBackendState {
  port: number | null;
  errorReason: string | null;
  readyPromise: Promise<void>;
  stop: () => void;
}

function initPythonBackend(): PythonBackendState {
  let child: ChildProcess | null = null;
  const state: PythonBackendState = {
    port: null,
    errorReason: null,
    readyPromise: Promise.resolve(),
    stop: () => {
      if (child && !child.killed) {
        child.kill('SIGTERM');
      }
    },
  };

  state.readyPromise = (async () => {
    try {
      const pythonBin = resolvePythonExecutable();
      const depsOk = await hasPythonFastApiDeps(pythonBin);
      if (!depsOk) {
        state.errorReason =
          'Python FastAPI backend dependencies are not installed in this Node runtime.';
        console.warn(`[python-api] ${state.errorReason}`);
        return;
      }

      const freePort = await findAvailablePort();
      child = startPythonProcess(pythonBin, freePort);
      child.on('exit', (code) => {
        if (state.port !== null && code !== 0 && code !== null) {
          state.port = null;
          state.errorReason = 'Python FastAPI process exited unexpectedly.';
        }
      });

      const healthy = await waitForPythonHealth(freePort);
      if (healthy) {
        state.port = freePort;
        console.log(`[python-api] FastAPI ready on 127.0.0.1:${freePort}`);
      } else {
        state.errorReason = 'Python FastAPI backend did not respond to health check.';
        console.warn(`[python-api] ${state.errorReason}`);
        state.stop();
      }
    } catch (err) {
      state.errorReason =
        err instanceof Error ? err.message : 'Unable to start Python FastAPI backend.';
      console.warn(`[python-api] ${state.errorReason}`);
    }
  })();

  return state;
}

function createApiProxy(pythonState: PythonBackendState) {
  return async (req: Request, res: Response) => {
    if (pythonState.port === null && !pythonState.errorReason) {
      await Promise.race([
        pythonState.readyPromise,
        new Promise((r) => setTimeout(r, 3000)),
      ]);
    }

    if (pythonState.port === null) {
      if (req.path === '/health') {
        res.status(503).json({
          status: 'unavailable',
          service: 'portfolio-contact-api',
          email_configured: false,
        });
        return;
      }

      res.status(503).json({
        detail:
          'Contact form backend is unavailable in this runtime environment. Please use the direct email link instead.',
      });
      return;
    }

    const targetPort = pythonState.port;
    const headers: http.OutgoingHttpHeaders = {
      ...req.headers,
      host: `127.0.0.1:${targetPort}`,
    };

    const proxyReq = http.request(
      {
        hostname: '127.0.0.1',
        port: targetPort,
        path: req.originalUrl,
        method: req.method,
        headers,
      },
      (proxyRes) => {
        res.status(proxyRes.statusCode || 502);
        Object.entries(proxyRes.headers).forEach(([key, value]) => {
          if (value !== undefined) {
            res.setHeader(key, value);
          }
        });
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', () => {
      if (!res.headersSent) {
        res.status(502).json({
          detail: 'Python contact service is temporarily unavailable. Please email directly.',
        });
      }
    });

    req.pipe(proxyReq);
  };
}

async function bootstrap() {
  const pythonState = initPythonBackend();

  const cleanup = () => {
    pythonState.stop();
  };
  process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });
  process.on('exit', cleanup);

  const app = express();
  app.disable('x-powered-by');

  app.use('/api', createApiProxy(pythonState));

  const distDir = path.join(__dirname, 'dist');
  const distIndex = path.join(distDir, 'index.html');
  const shouldServeStatic =
    !USE_VITE_DEV &&
    (process.env.NODE_ENV === 'production' || fs.existsSync(distIndex));

  if (shouldServeStatic) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(distIndex);
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio server listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
