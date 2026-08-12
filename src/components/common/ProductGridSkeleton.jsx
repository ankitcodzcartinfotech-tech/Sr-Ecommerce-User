export default function ProductGridSkeleton({ count = 4, className = "" }) {
  return (
    <div
      className={`grid grid-cols-2 gap-4 md:gap-6 md:grid-cols-2 xl:grid-cols-3 ${className}`}
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="surface-card aspect-3/4 animate-pulse rounded-[28px]"
        />
      ))}
    </div>
  );
}
