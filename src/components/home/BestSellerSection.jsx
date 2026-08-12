"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import ProductCard from "@/components/ProductCard";
import ProductGridSkeleton from "@/components/common/ProductGridSkeleton";
import { getProducts } from "@/Api/AllApi";
import { normalizeProductList } from "@/lib/storefront";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

export default function BestSellerSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ limit: 8, page: 1 })
      .then((data) => {
        console.log("Best Sellers API data:", data);
        const items = normalizeProductList(data);
        console.log("Best Sellers normalized products:", items);
        if (items.length > 0) {
          setProducts(items);
        }
      })
      .catch((error) => {
        if (!error?.message?.toLowerCase().includes("abort") && error?.name !== "CanceledError") {
          console.error("Failed to load best sellers:", error);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section id="best-sellers" className="px-4 py-16 sm:px-6 sm:py-20 md:px-10 lg:px-14">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-8 border-b border-stone-200 pb-4">
          <SectionHeading
            title="Best Sellers"
            eyebrow="Customer Favourites"
            align="left"
            className="mb-0"
          />
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} className="grid-cols-2 md:grid-cols-3 xl:grid-cols-4" />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-7">
              {products.slice(0, 8).map((item, index) => (
                <div key={item._id || index}>
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
            
            <div className="mt-12 flex justify-center">
              <Link
                href="/shop?sort=bestselling"
                className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#e88436]/40 hover:text-[#e88436] hover:shadow-md cursor-pointer"
              >
                View All Best Sellers
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
