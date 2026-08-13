"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";

import { getStories, getImageSrc } from "@/Api/AllApi";

const FALLBACK_STORIES = [
  {
    _id: '1',
    title: "Crafted for quality",
    subtitle: "Our Standards",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: '2',
    title: "Modern Lifestyle",
    subtitle: "Style",
    image: "https://images.unsplash.com/photo-1555529669-2269763671c0?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: '3',
    title: "Ethical Sourcing",
    subtitle: "Planet",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: '4',
    title: "Premium Materials",
    subtitle: "Quality",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
  }
];

export default function StoryBanner() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await getStories();
        if (res?.data?.length > 0) {
          setStories(res.data);
        } else {
          // Fallback static story if no data
          setStories(FALLBACK_STORIES);
        }
      } catch (err) {
        console.error("Failed to fetch stories", err);
        // Use fallback stories if the request fails (e.g. 404 API not found)
        setStories(FALLBACK_STORIES);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  return (
    <section className="px-4 py-12 md:px-10 lg:px-14 bg-gray-50 overflow-hidden" style={{ perspective: "1500px" }}>
      <div className="mx-auto max-w-[1400px]">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-10 flex items-end justify-between"
        >
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light text-gray-900 tracking-tight">
              Brand Stories
            </h2>
            <div className="mt-3 h-px w-16 bg-emerald-500 rounded-full" />
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-gray-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : stories.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} // Smooth cinematic easing
          >
            <Swiper
              modules={[Autoplay, Pagination]}
              grabCursor={true}
              spaceBetween={20}
              slidesPerView={1.15}
              breakpoints={{
                640: { slidesPerView: 2.15, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 32 },
              }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              pagination={{ clickable: true, bulletClass: 'swiper-pagination-bullet bg-gray-300 w-2.5 h-2.5 rounded-full transition-all inline-block mx-1.5', bulletActiveClass: '!bg-gray-900 !w-8' }}
              className="w-full pb-16 story-square-swiper group/swiper"
            >
              {stories.map((story) => (
                <SwiperSlide key={story._id} className="relative aspect-[4/3] lg:aspect-[16/11] w-full rounded-3xl overflow-hidden shadow-lg group cursor-pointer border border-gray-100">
                  {/* Image Background - Absolutely positioned to strictly fill the box */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden bg-gray-100">
                    <Image
                      src={getImageSrc(story.image) || story.image}
                      alt={story.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center transition-transform duration-[1.5s] ease-out group-hover:scale-[1.08]"
                      quality={90}
                    />
                  </div>

                  {/* Elegant Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                  
                  {/* Text Content */}
                  <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-8">
                    {story.subtitle && (
                      <div className="overflow-hidden mb-2">
                        <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                          {story.subtitle}
                        </p>
                      </div>
                    )}
                    
                    <h3 className="font-serif text-2xl md:text-3xl font-medium leading-[1.1] text-white line-clamp-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                      {story.title}
                    </h3>

                    {/* Subtle hover line indicator */}
                    <div className="mt-4 h-0.5 w-0 bg-white opacity-0 group-hover:w-12 group-hover:opacity-100 transition-all duration-500 ease-out delay-100" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        ) : null}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .story-square-swiper .swiper-pagination { bottom: 0 !important; }
      `}} />
    </section>
  );
}
