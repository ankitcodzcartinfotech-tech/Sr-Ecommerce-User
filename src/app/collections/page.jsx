"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import PageHero from "@/components/common/PageHero";
import CategoryGridSkeleton from "@/components/common/CategoryGridSkeleton";
import { getCategories } from "@/Api/AllApi";
import { getCategoryHref, normalizeCategoryList, resolveMediaSrc } from "@/lib/storefront";
import { ArrowRight, Tag } from "lucide-react";

export default function CollectionsPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    getCategories()
      .then((data) => {
        if (ignore) return;
        setCategories(normalizeCategoryList(data));
      })
      .catch((err) => {
        console.error("Failed to load collections:", err);
        if (!ignore) setError("Could not load collections.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, []);

  return (
    <div className="page-shell bg-[#FAF9F6] pb-16 lg:pb-28">
      <PageHero
        eyebrow="Collections"
        title="A collection architecture built for occasions, textures, and mood."
        description="Use these edits to shop by silhouette, fabric personality, or the kind of event you are dressing for."
        primaryAction={{ href: "/shop", label: "Shop All Products" }}
        secondaryAction={{ href: "/contact", label: "Need Guidance", variant: "outline" }}
      />

      <section className="px-4 py-8 sm:px-6 md:px-10 lg:px-14 lg:py-14">
        <div className="mx-auto max-w-[1400px]">

          {loading ? (
            <CategoryGridSkeleton count={4} />
          ) : error ? (
            <div className="rounded-3xl border border-stone-100 bg-white px-6 py-16 text-center text-stone-400 shadow-sm">
              <p className="text-base font-medium">{error}</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-3xl border border-stone-100 bg-white px-6 py-16 text-center text-stone-400 shadow-sm">
              <p className="text-base font-medium">No collections yet. Add categories from the admin panel.</p>
            </div>
          ) : (
            <>
              {/* Section label */}
              <div className="mb-6 flex items-center justify-between lg:mb-10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#e88436]">Browse</p>
                  <h2 className="mt-1 text-xl font-bold text-stone-900 lg:text-2xl">All Collections</h2>
                </div>
                <p className="text-xs text-stone-400">{categories.length} collection{categories.length !== 1 ? "s" : ""}</p>
              </div>

              {/* Grid */}
              <div className="grid gap-4 grid-cols-2 sm:gap-5 lg:gap-6 xl:grid-cols-4">
                {categories.map((category, index) => {
                  const image = resolveMediaSrc(category.categoryLogo);
                  const productCount = category.productCount || 0;

                  return (
                    <motion.div
                      key={category._id || category.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: index * 0.07 }}
                    >
                      <Link
                        href={getCategoryHref(category)}
                        aria-label={`Explore ${category.name} collection`}
                        className="group relative flex flex-col overflow-hidden rounded-2xl bg-stone-200 transition-all duration-500 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] sm:rounded-3xl cursor-pointer"
                      >
                        {/* Image */}
                        <div className="relative aspect-[3/4] w-full overflow-hidden">
                          {image ? (
                            <Image
                              src={image}
                              alt={category.name}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                              className="object-cover object-top transition-transform duration-700 group-hover:scale-107"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-stone-200 to-stone-300" />
                          )}
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          {/* Product count badge */}
                          <div className="absolute right-2.5 top-2.5 sm:right-4 sm:top-4 z-10 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 backdrop-blur-md sm:px-3.5">
                            <Tag size={9} className="text-white/70" />
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-white/90">
                              {productCount} Saree{productCount !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {/* Bottom text */}
                          <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5 lg:p-6">
                            <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60 line-clamp-1">
                              {category.hsnCode || "Curated Edit"}
                            </p>
                            <h2 className="mt-1.5 text-base font-bold leading-tight sm:text-xl lg:text-2xl">
                              {category.name}
                            </h2>
                            {/* CTA row */}
                            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                              Explore <ArrowRight size={10} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
