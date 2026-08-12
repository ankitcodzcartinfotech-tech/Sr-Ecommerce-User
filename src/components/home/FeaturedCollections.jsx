"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import CategoryGridSkeleton from "@/components/common/CategoryGridSkeleton";
import { getCategories } from "@/Api/AllApi";
import { getCategoryHref, normalizeCategoryList, resolveMediaSrc } from "@/lib/storefront";

export default function FeaturedCollections() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await getCategories();
        setCategories(normalizeCategoryList(response).slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (!loading && categories.length === 0) {
    return null;
  }

  return (
    <section id="collections" className="px-6 py-24 md:px-10 lg:px-14 lg:py-28">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          title="Explore Featured Collections"
          subtitle="Discover signature collections crafted with premium materials, fine details, and enduring usability."
          eyebrow="Featured Collections"
          className="mb-14"
        />

        {loading ? (
          <CategoryGridSkeleton count={4} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category, index) => {
              const image = resolveMediaSrc(category.categoryLogo);

              return (
                <Link
                  key={category._id || category.name}
                  href={getCategoryHref(category)}
                  className={`group relative overflow-hidden rounded-[30px] bg-stone-200 ${
                    index === 0 ? "xl:col-span-2 xl:row-span-2 xl:aspect-7/6" : "aspect-4/5"
                  } cursor-pointer`}
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={category.name}
                      fill
                      sizes={
                        index === 0
                          ? "(max-width: 1280px) 100vw, 50vw"
                          : "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      }
                      className="object-cover object-center transition-transform duration-900 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,12,10,0.1),rgba(17,12,10,0.82))]" />
                  <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-8">
                    {/* <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/72">
                      {category.hsnCode || "Curated Collection"}
                    </p> */}
                    <h3 className="mt-3 text-3xl leading-tight md:text-[2.15rem]">{category.name}</h3>
                    {/* <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/90 backdrop-blur-sm">
                      Explore Collection
                    </div> */}
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
