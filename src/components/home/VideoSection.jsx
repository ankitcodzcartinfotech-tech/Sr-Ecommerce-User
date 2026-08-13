"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import CategoryGridSkeleton from "@/components/common/CategoryGridSkeleton";
import { getCategories } from "@/Api/AllApi";
import { getCategoryHref, normalizeCategoryList, resolveMediaSrc } from "@/lib/storefront";

const OCCASION_LABELS = [
  { eyebrow: "Bridal & Wedding", tag: "Most Loved" },
  { eyebrow: "Festive Collection", tag: "New Season" },
  { eyebrow: "Everyday Elegance", tag: null },
  { eyebrow: "Party & Events", tag: null },
];

export default function VideoSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    getCategories()
      .then(r => setCategories(normalizeCategoryList(r).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && categories.length === 0) return null;

  return (
    <section className="px-4 py-20 sm:px-6 md:px-10 lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <SectionHeading
          title="Shop by Occasion"
          subtitle="Find a collection matched to every moment — from bridal mornings to understated festive dressing."
          eyebrow="Style Stories"
          className="mb-12"
        />

        {loading ? (
          <CategoryGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {categories.map((cat, i) => {
              const image  = resolveMediaSrc(cat.categoryLogo);
              const meta   = OCCASION_LABELS[i] || { eyebrow: "Curated Edit", tag: null };

              return (
                <Link
                  key={cat._id || cat.name}
                  href={getCategoryHref(cat)}
                  className="group relative flex h-65 flex-col overflow-hidden rounded-3xl bg-stone-200 sm:h-120 cursor-pointer"
                >
                  {/* Background Image */}
                  {image && (
                    <Image
                      src={image}
                      alt={cat.name}
                      fill
                      sizes="(max-width:640px) 50vw,(max-width:1024px) 50vw,25vw"
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
                  {/* Tag badge */}
                  {meta.tag && (
                    <div className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-full bg-(--gold) px-2 py-0.5 sm:px-3 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-white">
                      {meta.tag}
                    </div>
                  )}
                  {/* Text content */}
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 text-white">
                    <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] sm:tracking-[0.32em] text-white/70">
                      {meta.eyebrow}
                    </p>
                    <h3 className="mt-1 sm:mt-2 text-sm xs:text-base sm:text-2xl font-light leading-tight">{cat.name}</h3>
                    <div className="mt-2 sm:mt-4 flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/80 transition-all duration-300 group-hover:text-white group-hover:gap-2.5 sm:group-hover:gap-3">
                      Explore <ArrowRight className="h-3 w-3 sm:h-[13px] sm:w-[13px]" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
