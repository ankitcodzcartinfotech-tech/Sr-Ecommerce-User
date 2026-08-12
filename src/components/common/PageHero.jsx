import Button from "@/components/Button";
import { Sparkles } from "lucide-react";

export default function PageHero({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
}) {
  return (
    <section className="relative px-4 pb-10 pt-22 sm:px-6 md:px-10 lg:px-12 xl:px-16">
      <div className="relative mx-auto w-full max-w-[1600px] overflow-hidden rounded-[28px] border border-stone-900/[0.07] bg-[linear-gradient(145deg,rgba(255,253,248,0.96)_0%,rgba(255,250,243,0.88)_48%,rgba(246,239,229,0.82)_100%)] px-5 py-10 shadow-(--shadow-soft) backdrop-blur-md sm:rounded-4xl sm:px-6 md:px-12 md:py-16 lg:px-16">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(182,123,69,0.22),transparent_68%)] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(216,178,162,0.28),transparent_70%)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "linear-gradient(to bottom right, rgba(0,0,0,0.5), transparent 72%)",
          }}
        />

        <div className="relative z-10 max-w-4xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-2.5 rounded-full border border-(--gold)/20 bg-white/55 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-(--gold) shadow-[0_8px_24px_rgba(182,123,69,0.08)] backdrop-blur-sm">
              <Sparkles size={13} strokeWidth={2.2} className="shrink-0 opacity-90" />
              <span>{eyebrow}</span>
            </div>
          )}

          <div className="mt-6 flex items-start gap-4 md:mt-8 md:gap-5">
            <div
              aria-hidden
              className="mt-2 hidden h-16 w-px shrink-0 bg-linear-to-b from-(--gold) via-(--accent) to-transparent sm:block"
            />
            <div className="min-w-0 flex-1">
              <h1 className="max-w-3xl text-[clamp(2rem,8vw,4.1rem)] font-normal leading-[1.04] tracking-[-0.02em] text-stone-900">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-(--muted) sm:text-base md:mt-6 md:text-lg md:leading-8">
                {description}
              </p>
            </div>
          </div>

          {(primaryAction || secondaryAction) && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 md:mt-10">
              {primaryAction && (
                <Button
                  href={primaryAction.href}
                  variant={primaryAction.variant || "primary"}
                  size="lg"
                  icon
                >
                  {primaryAction.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  href={secondaryAction.href}
                  variant={secondaryAction.variant || "outline"}
                  size="lg"
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Corner accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 translate-x-1/4 translate-y-1/4 rounded-full border border-(--gold)/10 bg-[radial-gradient(circle_at_center,rgba(182,123,69,0.06),transparent_70%)]"
        />
      </div>
    </section>
  );
}
