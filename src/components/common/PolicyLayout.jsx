'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring, useInView } from 'framer-motion';
import { ChevronRight, Menu, X } from 'lucide-react';

const GOLD = '#b67b45';

const AnimatedSection = ({ id, title, children }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px 0px' });

  return (
    <section
      id={id}
      ref={ref}
      className="scroll-mt-32"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6 }}
        className="surface-card rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-10 hover:shadow-(--shadow-strong) transition-shadow duration-300 bg-white shadow-sm border border-stone-100"
      >
        <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-semibold mb-4 sm:mb-6 text-stone-900">
          {title}
        </h2>
        <div className="text-stone-600 space-y-3 sm:space-y-4 text-sm sm:text-base prose prose-stone max-w-none">
          {children}
        </div>
      </motion.div>
    </section>
  );
};

export default function PolicyLayout({ title, description, date, sections }) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px'
      }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 z-50 origin-left"
        style={{
          scaleX,
          background: `linear-gradient(90deg, ${GOLD}, #ead7c4)`
        }}
      />
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative border-b border-stone-200/60 bg-[rgba(251,245,238,0.7)] py-12 md:py-24 overflow-hidden pt-24 md:pt-32"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-14 relative z-10">
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 flex items-center justify-center space-x-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-stone-500"
          >
            <Link href="/" className="hover:text-(--gold) transition-colors cursor-pointer">Home</Link>
            <ChevronRight size={12} />
            <span className="text-stone-900">{title}</span>
          </motion.nav>

          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6 text-stone-900"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mx-auto mt-4 sm:mt-6 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-stone-600"
            >
              {description}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 sm:mt-8 text-[10px] sm:text-xs uppercase tracking-widest text-stone-500 font-bold"
            >
              Effective Date: {date}
            </motion.p>
          </div>
        </div>
      </motion.div>
      {/* Main Content */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-14 py-12 md:py-20">
        <div className="grid grid-cols-12 gap-8 lg:gap-16">
          {/* Mobile Navigation Toggle */}
          <div className="col-span-12 lg:hidden sticky top-24 z-40">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm border border-stone-200 cursor-pointer"
            >
              <span className="font-semibold text-sm">Table of Contents</span>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-stone-200 p-4 max-h-[60vh] overflow-y-auto"
              >
                <nav className="flex flex-col space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleNavClick(section.id)}
                      className={`text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        activeSection === section.id
                          ? 'bg-(--gold)/10 text-(--gold) font-medium'
                          : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                      } cursor-pointer`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </motion.div>
            )}
          </div>

          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block col-span-12 lg:col-span-3">
            <div className="sticky top-32">
              <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900 mb-6 px-4">
                Contents
              </h3>
              <nav className="flex flex-col space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleNavClick(section.id)}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                      activeSection === section.id
                        ? 'bg-white shadow-sm border-l-2 border-(--gold) text-(--gold) font-medium'
                        : 'border-l-2 border-transparent text-stone-500 hover:text-stone-900 hover:bg-white/50'
                    } cursor-pointer`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Sections */}
          <div className="col-span-12 lg:col-span-9">
            <div className="space-y-8 md:space-y-12">
              {sections.map((section) => (
                <AnimatedSection key={section.id} id={section.id} title={section.title}>
                  {section.content}
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
