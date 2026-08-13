"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getProducts, getImageSrc } from "@/Api/AllApi";

const fallbackItems = [
  {
    title: "Minimalist Leather Watch",
    subtitle: "Timepieces",
    price: "₹14,999",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    link: "/products"
  },
  {
    title: "Premium Leather Backpack",
    subtitle: "Travel",
    price: "₹8,499",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    link: "/products"
  },
  {
    title: "Classic Active Wear",
    subtitle: "Footwear",
    price: "₹5,999",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    link: "/products"
  },
  {
    title: "Wireless Studio Headphones",
    subtitle: "Audio",
    price: "₹24,999",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    link: "/products"
  },
  {
    title: "Retro Aviator Sunglasses",
    subtitle: "Accessories",
    price: "₹4,200",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80",
    link: "/products"
  },
  {
    title: "Modern Tufted Armchair",
    subtitle: "Furniture",
    price: "₹32,000",
    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=600&q=80",
    link: "/products"
  },
  {
    title: "Classic Matte Sunglasses",
    subtitle: "Accessories",
    price: "₹3,800",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80",
    link: "/products"
  },
  {
    title: "Professional DSLR Camera",
    subtitle: "Electronics",
    price: "₹74,999",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
    link: "/products"
  },
  {
    title: "Minimalist Wall Frames",
    subtitle: "Decor",
    price: "₹6,500",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
    link: "/products"
  },
  {
    title: "Sleek Leather Jacket",
    subtitle: "Apparel",
    price: "₹18,999",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
    link: "/products"
  },
  {
    title: "Smart Watch Pro",
    subtitle: "Wearables",
    price: "₹12,499",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80",
    link: "/products"
  },
  {
    title: "Sleek Travel Duffle",
    subtitle: "Travel",
    price: "₹9,200",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80",
    link: "/products"
  }
];

const Skiper = () => {
  const gallery = useRef(null);
  const [height, setHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [items, setItems] = useState(fallbackItems);

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ["start end", "end start"],
  });

  // Balanced, premium parallax scroll offsets
  const y1 = useTransform(scrollYProgress, [0, 1], [0, height * 0.15]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 0.25]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 0.1]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 0.2]);

  const yM1 = useTransform(scrollYProgress, [0, 1], [0, height * 0.12]);
  const yM2 = useTransform(scrollYProgress, [0, 1], [0, height * 0.18]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProducts({ limit: 12 });
        if (res?.data?.products?.length > 0) {
          const formatted = res.data.products.map((prod, idx) => ({
            title: prod.name,
            subtitle: prod.category?.name || "Premium Collection",
            price: `₹${prod.price?.toLocaleString('en-IN')}`,
            image: getImageSrc(prod.images?.[0]) || fallbackItems[idx].image,
            link: `/products/${prod._id}`
          }));

          if (formatted.length < 12) {
            const padded = [...formatted, ...fallbackItems.slice(formatted.length)];
            setItems(padded);
          } else {
            setItems(formatted);
          }
        }
      } catch (err) {
        console.error("Failed to fetch products for lookbook", err);
      }
    };
    
    fetchProducts();
  }, []);

  useEffect(() => {
    const update = () => {
      setHeight(window.innerHeight);
      setIsMobile(window.innerWidth < 768);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <section className="w-full bg-white py-16">
      
      {/* Editorial Header */}
      <div className="mx-auto max-w-[1440px] px-8 sm:px-16 md:px-24 mb-12 text-center md:text-left">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-600 block mb-2">
          Shop The Look
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light text-gray-900 leading-tight">
          Curated Lifestyle Showcase
        </h2>
        <div className="mt-4 h-px w-20 bg-emerald-500 rounded-full mx-auto md:mx-0" />
      </div>

      {/* Gallery Frame */}
      <div className="mx-auto max-w-[1440px] px-8 sm:px-16 md:px-24">
        <div
          ref={gallery}
          className="relative flex h-[75vh] md:h-[85vh] gap-4 overflow-hidden rounded-3xl border border-gray-100 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.1)] bg-gray-50/50"
        >
          {isMobile ? (
            <>
              <Column items={items.slice(0, 6)} y={yM1} />
              <Column items={items.slice(6, 12)} y={yM2} />
            </>
          ) : (
            <>
              <Column items={items.slice(0, 3)} y={y1} topOffset="-15%" />
              <Column items={items.slice(3, 6)} y={y2} topOffset="-30%" />
              <Column items={items.slice(6, 9)} y={y3} topOffset="-10%" />
              <Column items={items.slice(9, 12)} y={y4} topOffset="-25%" />
            </>
          )}
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="flex flex-col items-center justify-center mt-10 gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
          Scroll Down to Explore
        </span>
        <div className="w-1.5 h-10 rounded-full bg-gray-100 flex justify-center p-0.5 overflow-hidden">
          <motion.div 
            animate={{ y: [0, 24, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-3 rounded-full bg-emerald-500"
          />
        </div>
      </div>
    </section>
  );
};

const Column = ({ items, y, topOffset = "0%" }) => {
  return (
    <motion.div
      className="relative flex h-[150%] w-1/2 md:w-1/4 flex-col gap-4"
      style={{ y, top: topOffset, willChange: "transform" }}
    >
      {items.map((item, i) => (
        <Link
          href={item.link}
          key={i}
          className="relative w-full overflow-hidden rounded-2xl group cursor-pointer shadow-sm border border-gray-200/20"
          style={{ height: "33.33%" }}
        >
          {/* Image - Styled to fully fill the container perfectly */}
          <div className="absolute inset-0 w-full h-full bg-gray-100 overflow-hidden">
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover object-center transition-transform duration-[1.2s] ease-out group-hover:scale-110"
              loading="lazy"
            />
          </div>

          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/50 transition-colors duration-500 z-10" />

          {/* Frosted Glass Overlay Panel */}
          <div className="absolute inset-x-3 bottom-3 p-4 md:p-5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl transform translate-y-[120%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-[0.5s] ease-out z-20 flex flex-col justify-between shadow-2xl">
            <div>
              {item.subtitle && (
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">
                  {item.subtitle}
                </p>
              )}
              <h4 className="text-xs md:text-sm font-medium text-white line-clamp-1 mb-1">
                {item.title}
              </h4>
              <p className="text-[11px] md:text-xs font-semibold text-white/95">
                {item.price}
              </p>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-[10px] md:text-[11px] font-bold text-white group-hover/btn:text-emerald-300 transition-colors border-t border-white/10 pt-3">
              <span>SHOP NOW</span>
              <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </motion.div>
  );
};

export default Skiper;
