export default function SectionHeading({
  title,
  subtitle,
  eyebrow = "Curated for You",
  align = "center",
  className = "",
}) {
  const alignment = align === "left" ? "text-left items-start" : "text-center items-center";

  return (
    <div className={`flex flex-col ${alignment} ${className}`}>
      <span className="mb-4 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-(--gold)">
        <span className="h-px w-10 bg-(--gold)/40" />
        {eyebrow}
      </span>
      <h2 className="max-w-3xl text-3xl leading-tight text-stone-900 md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 max-w-2xl text-sm leading-7 text-(--muted) md:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}
