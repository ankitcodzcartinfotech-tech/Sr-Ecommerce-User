/* Instagram icon as inline SVG — lucide-react v1 doesn't export Instagram */
function InstagramIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

/* ── Static placeholder grid ───────────────────────────────────────────
   Replace these src paths with real Instagram CDN URLs or a proper
   Instagram Feed API integration when credentials are available.
   Each image should ideally be a square crop of a product/lifestyle shot.
──────────────────────────────────────────────────────────────────────── */
const POSTS = [
  { src: "/images/saree1.jpg", alt: "Keshrag saree editorial 1" },
  { src: "/images/saree2.jpg", alt: "Keshrag saree editorial 2" },
  { src: "/images/saree3.jpg", alt: "Keshrag saree editorial 3" },
  { src: "/images/saree4.jpg", alt: "Keshrag saree editorial 4" },
  { src: "/images/saree5.jpg", alt: "Keshrag saree editorial 5" },
  { src: "/images/saree6.jpg", alt: "Keshrag saree editorial 6" },
];

export default function InstagramSection() {
  return (
    <section className="px-4 py-20 sm:px-6 md:px-10 lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[1440px]">

        {/* Header */}
        <div className="mb-10 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-(--gold)">
              Instagram
            </p>
            <h2 className="mt-2 font-serif text-2xl font-light tracking-tight text-(--text) sm:text-3xl">
              Follow <span className="text-(--gold)">@keshrag09</span>
            </h2>
            <p className="mt-1 text-sm text-(--muted)">
              Real women, real sarees — join the circle on Instagram.
            </p>
          </div>
          <a
            href="https://instagram.com/keshrag09"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-5 py-2.5 text-xs font-semibold text-(--text) transition-all hover:border-(--gold) hover:text-(--gold) cursor-pointer"
          >
            <InstagramIcon size={14} />
            Follow Us
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
          {POSTS.map((post, i) => (
            <a
              key={i}
              href="https://instagram.com/keshrag09"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-[14px] bg-stone-100 cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.src}
                alt={post.alt}
                loading="lazy"
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <InstagramIcon size={22} className="text-white" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
