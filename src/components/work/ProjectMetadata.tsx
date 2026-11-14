interface ProjectMetadataProps {
  title: string;
  category: string;
  description: string;
}

export function ProjectMetadata({
  title,
  category,
  description,
}: ProjectMetadataProps) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-xs font-display font-semibold tracking-[0.08em] uppercase text-[var(--color-orange)] break-words">
        {category}
      </p>

      <h3 className="mt-1.5 font-display text-xl sm:text-2xl font-bold tracking-[-0.015em] text-[var(--color-espresso-deep)] transition-colors duration-250 ease-[var(--ease-editorial)] group-hover:text-[var(--color-orange)] text-balance break-words">
        {title}
      </h3>

      <p className="mt-2.5 text-sm sm:text-[15px] leading-[1.6] text-[var(--color-espresso)] break-words max-w-md">
        {description}
      </p>
    </div>
  );
}
