"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Quote, CheckCircle2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import { getFeaturedReviews } from "@/Api/AllApi";
import {
  getProductHref,
  mapFeaturedReviewToTestimonial,
  normalizeFeaturedReviews,
  resolveMediaSrc,
} from "@/lib/storefront";

import "swiper/css";
import "swiper/css/free-mode";

function Stars({ count }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={
            s <= count
              ? "fill-amber-400 text-amber-400"
              : "fill-stone-200 text-stone-200"
          }
        />
      ))}
    </div>
  );
}

function Avatar({ name, profileImage }) {
  const [imgError, setImgError] = useState(false);

  const src = resolveMediaSrc(profileImage);

  const initials = (name || "K")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hue =
    (name || "K")
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  if (src && !imgError) {
    return (
      <Image
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ background: `hsl(${hue},45%,52%)` }}
    >
      {initials}
    </div>
  );
}

function ReviewCard({ review }) {
  const productHref =
    review.productId || review.productSlug
      ? getProductHref({
          _id: review.productId,
          slug: review.productSlug,
        })
      : "/shop";

  const displayText =
    review.text?.trim().length > 0
      ? review.text
      : "Exquisite craftsmanship and premium quality. Absolutely in love with this piece.";

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-stone-100 bg-white p-5 xs:p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] group cursor-default">
      {/* Decorative Quote mark */}
      <div className="absolute right-6 top-6 opacity-[0.03] transition-opacity duration-500 group-hover:opacity-[0.06]">
        <Quote size={80} className="text-stone-900" />
      </div>

      <div className="flex items-center justify-between z-10">
        <Stars count={review.rating || 5} />
        <span className="flex items-center gap-1 rounded-full bg-stone-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-stone-500 border border-stone-100">
          <CheckCircle2 size={12} className="text-(--gold)" /> Verified
        </span>
      </div>

      <p className="mt-6 flex-1 text-sm xs:text-base leading-relaxed xs:leading-loose text-stone-600 italic z-10">
        &ldquo;{displayText}&rdquo;
      </p>

      <div className="mt-8 z-10">
        <Link
          href={productHref}
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-(--gold) transition-colors hover:text-stone-900"
        >
          {review.product || "Premium Store Item"}
        </Link>
        <div className="my-5 h-px w-full bg-gradient-to-r from-stone-200 to-transparent" />
        
        <div className="flex items-center gap-4">
          <div className="rounded-full p-0.5 border border-stone-200 transition-colors group-hover:border-(--gold)">
            <Avatar
              name={review.name || "Customer"}
              profileImage={review.profileImage}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-stone-900">
              {review.name || "Customer"}
            </p>
            <p className="text-[10px] font-semibold tracking-widest text-stone-400 uppercase mt-0.5">
              {review.location || "India"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex h-70 flex-col gap-3 rounded-3xl border border-(--border) bg-white p-6">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className="h-3 w-3 animate-pulse rounded-full bg-stone-200"
          />
        ))}
      </div>

      <div className="space-y-2 flex-1">
        <div className="h-3 w-full animate-pulse rounded-full bg-stone-100" />
        <div className="h-3 w-5/6 animate-pulse rounded-full bg-stone-100" />
        <div className="h-3 w-4/6 animate-pulse rounded-full bg-stone-100" />
      </div>

      <div className="h-6 w-28 animate-pulse rounded-full bg-stone-100" />

      <div className="h-px bg-stone-100" />

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-stone-100" />

        <div className="space-y-1.5">
          <div className="h-3 w-24 animate-pulse rounded-full bg-stone-100" />
          <div className="h-2.5 w-16 animate-pulse rounded-full bg-stone-100" />
        </div>
      </div>
    </div>
  );
}

export default function TestimonialSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    getFeaturedReviews(10)
      .then((data) => {
        if (ignore) return;

        const mapped = normalizeFeaturedReviews(data)
          .map(mapFeaturedReviewToTestimonial)
          .filter((review) => review.text?.trim()?.length > 0);

        setReviews(mapped);
      })
      .catch(() => {
        if (!ignore) setReviews([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const displayReviews = reviews;

  const avgRating =
    displayReviews.length > 0
      ? (
          displayReviews.reduce(
            (sum, review) => sum + (review.rating || 5),
            0
          ) / displayReviews.length
        ).toFixed(1)
      : "0";

  return (
    <section className="overflow-hidden bg-(--background) px-4 py-20 sm:px-6 md:px-10 lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-12 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-(--gold)">
              Social Proof
            </p>

            <h2 className="mt-3 font-serif text-3xl font-light tracking-tight text-(--text) sm:text-4xl">
              Loved by Women Across India
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-(--muted)">
              Real reviews from customers who wear Keshrag for celebrations,
              gifting, and everyday moments.
            </p>
          </div>

          {!loading && displayReviews.length > 0 && (
            <div className="flex shrink-0 flex-col items-center justify-center rounded-[2rem] border border-stone-100 bg-white px-6 py-4 sm:px-8 sm:py-5 shadow-sm transition-transform duration-500 hover:scale-105 hover:shadow-md sm:items-end">
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-5xl font-semibold tracking-tight text-stone-900">
                  {avgRating}
                </span>
                <span className="text-sm font-medium text-stone-400">/5</span>
              </div>
              <div className="mt-1.5">
                <Stars count={5} />
              </div>
              <p className="mt-2.5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                {displayReviews.length} Reviews
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : displayReviews.length === 0 ? (
          <div className="flex justify-center py-12">
            <p className="text-center text-(--muted)">
              No customer reviews available yet.
            </p>
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, FreeMode]}
            spaceBetween={24}
            slidesPerView={1.1}
            freeMode
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              480: { slidesPerView: 1.2 },
              640: { slidesPerView: 2.1 },
              1024: { slidesPerView: 3.1 },
              1280: { slidesPerView: 3.2 },
            }}
            className="overflow-visible! pb-12 pt-4"
          >
            {displayReviews.map((review) => (
              <SwiperSlide key={review.id} className="h-auto">
                <ReviewCard review={review} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {!loading && (
          <div className="mt-10 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-(--gold) cursor-pointer"
            >
              Discover Our Collection →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
