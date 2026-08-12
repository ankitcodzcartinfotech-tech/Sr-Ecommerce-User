import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  icon = false,
  className = "",
  style = {},
  disabled = false,
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-[0.24em] transition-all duration-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

  const sizes = {
    sm: "min-h-[38px] md:min-h-[44px] px-4 md:px-5 py-2 md:py-2.5 text-[9px] md:text-[10px]",
    md: "min-h-[42px] md:min-h-[48px] px-5 md:px-7 py-2.5 md:py-3.5 text-[10px] md:text-[11px]",
    lg: "min-h-[46px] md:min-h-[52px] px-6 md:px-9 py-3 md:py-4 text-[10px] md:text-[11px]",
  };

  const variants = {
    primary:
      "bg-stone-900 text-white shadow-[0_14px_30px_rgba(36,23,19,0.18)] hover:-translate-y-0.5 hover:bg-[#1a1a1a]",
    dark:
      "bg-(--primary) text-white shadow-[0_12px_30px_rgba(4,120,87,0.30)] hover:-translate-y-0.5 hover:bg-(--primary-hover)",
    outline:
      "border border-stone-900/15 bg-white/70 text-stone-900 hover:-translate-y-0.5 hover:bg-stone-900 hover:text-white",
    white:
      "bg-white text-stone-900 shadow-[0_16px_32px_rgba(255,255,255,0.18)] hover:-translate-y-0.5 hover:bg-(--gold-soft)",
    "outline-white":
      "border border-white/40 bg-transparent text-white hover:bg-white hover:text-stone-900",
    glass:
      "border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/18",
    ghost:
      "bg-transparent text-stone-700 hover:-translate-y-0.5 hover:text-(--gold)",
  };

  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link
        href={disabled ? "#" : href}
        aria-disabled={disabled}
        onClick={disabled ? (event) => event.preventDefault() : undefined}
        className={`${classes} cursor-pointer`}
        style={style}
      >
        {children}
        {icon && <ArrowRight size={14} />}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${classes} cursor-not-allowed`} style={style}>
      {children}
      {icon && <ArrowRight size={14} />}
    </button>
  );
}
