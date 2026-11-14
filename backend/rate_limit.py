from collections import defaultdict, deque
import threading
import time
from typing import Callable


class SlidingWindowRateLimiter:
    """Thread-safe per-key sliding-window rate limiter for single-process / warm workers."""

    def __init__(
        self,
        max_requests: int = 5,
        window_seconds: int = 600,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._clock = clock
        self._lock = threading.Lock()
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def check_and_record(self, client_key: str) -> tuple[bool, int]:
        now = self._clock()
        cutoff = now - self.window_seconds

        with self._lock:
            timestamps = self._hits[client_key]
            while timestamps and timestamps[0] <= cutoff:
                timestamps.popleft()

            if len(timestamps) >= self.max_requests:
                retry_after = max(1, int(self.window_seconds - (now - timestamps[0])) + 1)
                return False, retry_after

            timestamps.append(now)

            # Prune idle keys occasionally to keep memory bounded
            if len(self._hits) > 1000:
                stale = [
                    key
                    for key, bucket in self._hits.items()
                    if not bucket or bucket[-1] <= cutoff
                ]
                for key in stale:
                    del self._hits[key]

            return True, 0
