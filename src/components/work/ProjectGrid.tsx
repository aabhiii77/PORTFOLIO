import type { ProjectItem } from '../../data/portfolioData';
import { ProjectCard } from './ProjectCard';

interface ProjectGridProps {
  projects: ProjectItem[];
  revealed?: boolean;
}

export function ProjectGrid({ projects, revealed = true }: ProjectGridProps) {
  return (
    <div className="mt-10 sm:mt-12 lg:mt-14 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 lg:gap-x-12 lg:gap-y-14">
      {projects.map((project, idx) => (
        <ProjectCard
          key={project.id}
          project={project}
          revealed={revealed}
          index={idx}
        />
      ))}
    </div>
  );
}
