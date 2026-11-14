import type { ProjectItem } from '../../data/portfolioData';
import { Reveal } from '../Reveal';
import { ProjectActions } from './ProjectActions';
import { ProjectMetadata } from './ProjectMetadata';
import { ProjectVisual } from './ProjectVisual';

interface ProjectCardProps {
  project: ProjectItem;
  revealed: boolean;
  index: number;
}

export function ProjectCard({ project, revealed, index }: ProjectCardProps) {
  const baseDelay = 90 + index * 100;

  return (
    <article className="group relative h-full min-w-0 flex flex-col cursor-pointer transition-[transform,translate,scale] duration-300 ease-[var(--ease-editorial)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.992] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-8 has-[:focus-visible]:outline-[var(--color-orange)]">
      <Reveal revealed={revealed} variant="image-clip" delayMs={baseDelay}>
        <ProjectVisual
          title={project.title}
          imageUrl={project.imageUrl}
          imageAlt={project.imageAlt}
          fallbackTheme={project.fallbackTheme}
        />
      </Reveal>

      <div className="mt-5 flex-1 flex flex-wrap items-start justify-between gap-4">
        <Reveal revealed={revealed} variant="up" delayMs={baseDelay + 90} className="min-w-0 flex-1">
          <ProjectMetadata
            title={project.title}
            category={project.category}
            description={project.description}
          />
        </Reveal>

        <Reveal revealed={revealed} variant="fade" delayMs={baseDelay + 150} className="shrink-0">
          <ProjectActions
            title={project.title}
            liveUrl={project.liveUrl}
            actionLabel={project.actionLabel}
          />
        </Reveal>
      </div>
    </article>
  );
}
