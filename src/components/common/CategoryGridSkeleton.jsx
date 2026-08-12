export default function CategoryGridSkeleton({ count = 4, className = "" }) {
  return (
    <div
      className={`grid grid-cols-2 gap-4 md:gap-6 md:grid-cols-2 xl:grid-cols-4 ${className}`}
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="surface-card h-65 sm:h-120 animate-pulse rounded-3xl bg-white/70"
        />
      ))}
    </div>
  );
}
