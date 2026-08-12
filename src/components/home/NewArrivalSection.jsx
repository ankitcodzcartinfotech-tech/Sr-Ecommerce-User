"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import ProductCard from "@/components/ProductCard";
import ProductGridSkeleton from "@/components/common/ProductGridSkeleton";
import Button from "@/components/Button";
import { getProducts } from "@/Api/AllApi";
import { normalizeProductList } from "@/lib/storefront";

export default function NewArrivalSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ limit: 4 })
      .then((data) => {
        console.log("New Arrivals API data:", data);
        const normalized = normalizeProductList(data);
        console.log("New Arrivals normalized products:", normalized);
        setProducts(normalized);
      })
      .catch((error) => {
        if (!error?.message?.toLowerCase().includes("abort") && error?.name !== "CanceledError") {
          console.error("Failed to load new arrivals:", error);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section id="new-arrivals" className="bg-[rgba(255,255,255,0.38)] px-4 py-16 sm:px-6 sm:py-20 md:px-10 lg:px-14">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-8 flex flex-row items-end justify-between border-b border-stone-200 pb-4">
          <SectionHeading
            title="New Arrivals"
            eyebrow="Latest Drop"
            align="left"
            className="mb-0"
          />
          <Button
            href="/shop"
            variant="ghost"
            size="sm"
            className="sticky right-0 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-(--gold) active:text-(--gold) px-2"
          >
            View All &rarr;
          </Button>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} className="grid-cols-2 md:grid-cols-4" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-7">
            {products.map((item, index) => (
              <div key={item._id || index}>
                <ProductCard product={{ ...item, isNew: true }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
