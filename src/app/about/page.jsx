"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import PageHero from "@/components/common/PageHero";
import Sr Software ScrollStory from "@/components/ui/skiper-ui/skiper19";

const values = [
  {
    number: "01",
    title: "Timeless Quality",
    description:
      "Every product is selected for its utility, design, and enduring quality. We ensure only the finest items reach you.",
  },
  {
    number: "02",
    title: "Modern Style",
    description:
      "Classic style and exceptional craftsmanship presented through a contemporary lens, matching modern aesthetic demands.",
  },
  {
    number: "03",
    title: "Meaningful Gifting",
    description:
      "Collections curated for celebrations, gifting, and everyday quality, ensuring a lasting impression in every purchase.",
  },
];

export default function AboutPage() {
  return (
    <main className="overflow-x-clip bg-white">
      <PageHero
        eyebrow="About SR Ecommerce"
        title="Crafted with care, designed for living."
        description="SR Ecommerce brings handpicked quality products into a curated modern experience where durability, elegance, and exceptional service come together."
        primaryAction={{
          href: "/shop",
          label: "Explore Collection",
        }}
        secondaryAction={{
          href: "/contact",
          label: "Talk to Us",
          variant: "outline",
        }}
      />
      {/* Editorial Intro */}
      <section className="relative bg-white px-4 py-20 sm:px-6 md:px-10 lg:px-14 lg:py-32">
        <div className="absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-600 sm:text-[11px]"
            >
              <span className="h-px w-8 bg-emerald-500/60" />
              Our Story
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mt-8 font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-[1.15] text-stone-900"
            >
              Every product begins
              <br className="hidden sm:block" />
              <span className="italic text-stone-500">with a story.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-8 max-w-xl text-sm leading-8 text-stone-600 sm:mt-10 sm:text-base sm:leading-9 md:text-lg md:leading-10"
            >
              SR Ecommerce was created for people who appreciate exceptional craftsmanship
              but expect a modern, seamless shopping experience. We carefully curate products
              that celebrate design excellence while remaining relevant to today's lifestyles.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative h-[400px] w-full overflow-hidden rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] sm:h-[500px] lg:h-[600px]"
          >
            <Image
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80"
              alt="SR Ecommerce Story"
              fill
              className="object-cover transition-transform duration-1000 hover:scale-105"
            />
          </motion.div>
        </div>
      </section>
      {/* Values */}
      <section className="bg-white px-4 py-20 sm:px-6 md:px-10 lg:px-14 lg:py-32">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid gap-8 lg:grid-cols-3">
            {values.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.15 }}
                className="group relative overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white p-10 transition-all duration-500 hover:border-emerald-500/40 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] sm:p-12"
              >
                <span className="absolute -right-4 -top-8 font-serif text-[130px] font-bold text-stone-900/5 transition-transform duration-500 group-hover:-translate-y-4 group-hover:scale-110 group-hover:text-emerald-500/10">
                  {item.number}
                </span>

                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm transition-colors duration-500 group-hover:border-emerald-500/30">
                    <span className="font-serif text-xl font-medium text-emerald-600">
                      {item.number}
                    </span>
                  </div>
                  <h3 className="font-serif text-3xl text-stone-900 md:text-4xl">
                    {item.title}
                  </h3>

                  <p className="mt-5 text-sm leading-relaxed text-stone-600 sm:text-base sm:leading-8">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Storytelling Scroll */}
      <Sr Software ScrollStory />
      {/* Image + Story Section */}
      <section className="overflow-hidden bg-white px-4 py-20 sm:px-6 md:px-10 lg:px-14 lg:py-40">
        <div className="mx-auto grid max-w-[1280px] items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[450px] w-full overflow-hidden rounded-[3rem] shadow-2xl sm:h-[550px] md:h-[700px]"
          >
            <Image
              src="https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80"
              alt="SR Ecommerce Standard"
              fill
              className="object-cover transition-transform duration-1000 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="rounded-3xl border border-white/20 bg-white/10 px-10 py-12 text-center backdrop-blur-xl">
                <span className="block font-serif text-4xl text-white sm:text-5xl md:text-6xl">
                  Tradition
                </span>
                <span className="mt-5 block text-[11px] font-bold uppercase tracking-[0.4em] text-[#e3cdab]">
                  Meets Modernity
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-emerald-600">
              Our Approach
            </span>

            <h2 className="mt-6 font-serif text-[clamp(2.5rem,7vw,4.5rem)] font-light leading-[1.15] text-stone-900">
              Quality reimagined
              <br className="hidden sm:block" />
              <span className="italic text-stone-500">for today.</span>
            </h2>

            <div className="mt-10 h-px w-16 bg-emerald-500/40" />

            <p className="mt-10 text-base leading-relaxed text-stone-600 sm:text-lg sm:leading-9">
              We seek products that feel premium yet practical. Every collection
              is curated with attention to materials, craftsmanship, packaging, and
              usability, ensuring each piece feels considered from discovery to unboxing.
            </p>

            <p className="mt-6 text-base leading-relaxed text-stone-600 sm:text-lg sm:leading-9">
              Our goal is simple: bring together exceptional craftsmanship and a
              seamless modern experience.
            </p>
          </motion.div>
        </div>
      </section>
      {/* Editorial Statement */}
      <section className="relative overflow-hidden bg-[#0A0A0A] px-4 py-32 sm:px-6 md:px-10 lg:px-14 lg:py-48">
        <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        <div className="pointer-events-none absolute -top-1/2 left-1/2 h-[800px] w-[1000px] -translate-x-1/2 rounded-full bg-emerald-500 opacity-[0.08] blur-[120px]" />

        <div className="relative mx-auto max-w-[1280px] text-center">
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="font-serif text-[clamp(4rem,15vw,10rem)] font-light leading-[1] tracking-tight text-white"
          >
            Crafted.<br />
            <span className="italic text-stone-400">Curated.</span><br />
            Celebrated.
          </motion.h2>
        </div>
      </section>
      {/* CTA */}
      <section className="bg-white px-4 py-20 sm:px-6 md:px-10 lg:px-14 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-[1280px] overflow-hidden rounded-[3rem] bg-gradient-to-br from-white to-stone-50 px-6 py-20 text-center shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] sm:px-12 md:rounded-[4.5rem] md:py-32 lg:px-24 border border-white"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-emerald-600">
            Explore SR Ecommerce
          </span>

          <h2 className="mx-auto mt-8 max-w-4xl font-serif text-[clamp(2.5rem,6vw,5rem)] font-light leading-[1.1] text-stone-900">
            Find the product that becomes <br className="hidden sm:block" />
            <span className="italic text-emerald-600">part of your story.</span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Discover thoughtfully curated products designed for gifting, upgrades,
            and everyday utility.
          </p>

          <div className="mt-12">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 rounded-full bg-emerald-700 px-10 py-5 text-[11px] font-bold uppercase tracking-[0.25em] text-white shadow-[0_15px_30px_-10px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-105 hover:bg-emerald-600 active:scale-95 cursor-pointer"
            >
              Explore Collection
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

