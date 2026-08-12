'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring, useInView } from 'framer-motion';
import {
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  Menu,
  X
} from 'lucide-react';

const GOLD = '#b67b45';

const sections = [
  { id: 'eligibility', title: 'Eligibility' },
  { id: 'user-account', title: 'User Account' },
  { id: 'products-availability', title: 'Products and Availability' },
  { id: 'pricing', title: 'Pricing' },
  { id: 'orders', title: 'Orders' },
  { id: 'payments', title: 'Payments' },
  { id: 'shipping-delivery', title: 'Shipping and Delivery' },
  { id: 'intellectual-property', title: 'Intellectual Property' },
  { id: 'acceptable-use', title: 'Acceptable Use' },
  { id: 'limitation-liability', title: 'Limitation of Liability' },
  { id: 'disclaimer', title: 'Disclaimer' },
  { id: 'termination', title: 'Termination' },
  { id: 'changes-to-terms', title: 'Changes to These Terms' },
  { id: 'governing-law', title: 'Governing Law' },
  { id: 'contact', title: 'Contact Us' }
];

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
        className="surface-card rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-10 hover:shadow-(--shadow-strong) transition-shadow duration-300"
      >
        <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-semibold mb-4 sm:mb-6 text-stone-900">
          {title}
        </h2>
        <div className="text-stone-600 space-y-3 sm:space-y-4 text-sm sm:text-base">
          {children}
        </div>
      </motion.div>
    </section>
  );
};

export default function TermsClient() {
  const [activeSection, setActiveSection] = useState('eligibility');
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
  }, []);

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
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
        className="relative border-b border-stone-200/60 bg-[rgba(251,245,238,0.7)] py-12 md:py-24 overflow-hidden"
      >
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.16) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.4), transparent 75%)"
          }}
        />

        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-14 relative z-10">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 flex items-center justify-center space-x-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-stone-500"
          >
            <Link href="/" className="hover:text-(--gold) transition-colors cursor-pointer">Home</Link>
            <ChevronRight size={12} />
            <span className="text-stone-900">Terms & Condition</span>
          </motion.nav>

          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold"
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, #d4a574 50%, #c9a14a 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Terms & Condition
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mx-auto mt-4 sm:mt-6 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-stone-600"
            >
              Welcome to Keshrag. These Terms & Condition govern your access to and use of our website, products, and services. By accessing or using our website, creating an account, or placing an order, you agree to be bound by these Terms.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mx-auto mt-2 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-stone-600"
            >
              If you do not agree with any part of these Terms, please do not use our website.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 sm:mt-8 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold text-stone-600 shadow-sm"
            >
              <Clock size={14} />
              <span>Effective Date: July 1, 2026</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
      {/* Main Content */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-12 md:py-24 lg:px-14">
        {/* Mobile Table of Contents Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between surface-card rounded-2xl p-3.5 sm:p-4 cursor-pointer"
          >
            <span className="font-serif text-base sm:text-lg font-semibold">Table of Contents</span>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="surface-card rounded-2xl mt-3 overflow-hidden"
            >
              <nav className="p-3.5 sm:p-4 space-y-2.5 sm:space-y-3">
                {sections.map((section, idx) => (
                  <button
                    key={section.id}
                    onClick={() => handleNavClick(section.id)}
                    className={`w-full text-left text-xs sm:text-sm py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg transition-all ${
                      activeSection === section.id
                        ? 'bg-(--gold)/10 text-(var(--gold)) font-medium'
                        : 'text-stone-600 hover:bg-stone-100'
                    } cursor-pointer`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </div>

        <div className="lg:flex lg:gap-16">
          {/* Desktop Sticky Table of Contents */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block w-72 shrink-0"
          >
            <div className="sticky top-32">
              <div className="surface-card rounded-3xl p-6">
                <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-stone-900">
                  Table of Contents
                </h3>
                <nav className="space-y-2">
                  {sections.map((section, idx) => (
                    <button
                      key={section.id}
                      onClick={() => handleNavClick(section.id)}
                      className={`w-full text-left text-sm py-2.5 px-3 rounded-xl transition-all ${
                        activeSection === section.id
                          ? 'bg-(--gold)/10 text-(--gold) font-medium border-l-2 border-(--gold)'
                          : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/50'
                      } cursor-pointer`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </motion.aside>

          {/* Main Content Sections */}
          <div className="flex-1 space-y-6 lg:space-y-8">
            <AnimatedSection id="eligibility" title="Eligibility">
              <p>
                You must be at least 18 years old or have the permission of a parent or legal guardian to use this website. By using our services, you confirm that the information you provide is accurate and complete.
              </p>
            </AnimatedSection>

            <AnimatedSection id="user-account" title="User Account">
              <p>You may be required to create an account to access certain features.</p>
              <p>You are responsible for:</p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2">
                <li>Maintaining the confidentiality of your account credentials.</li>
                <li>Providing accurate and up-to-date information.</li>
                <li>All activities that occur under your account.</li>
              </ul>
              <p>Please notify us immediately if you believe your account has been accessed without authorization.</p>
            </AnimatedSection>

            <AnimatedSection id="products-availability" title="Products and Availability">
              <p>We make every effort to display our sarees, fabrics, colors, and product details accurately. However:</p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2">
                <li>Product colors may vary slightly due to screen settings.</li>
                <li>Handmade or artisan products may have slight variations.</li>
                <li>Product availability is subject to stock.</li>
                <li>We reserve the right to discontinue or modify products without prior notice.</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection id="pricing" title="Pricing">
              <ul className="list-disc pl-5 sm:pl-6 space-y-2">
                <li>All prices are displayed in Indian Rupees (INR).</li>
                <li>Prices may change without prior notice.</li>
                <li>Applicable taxes will be charged according to Indian law.</li>
                <li>In the event of a pricing error, we reserve the right to cancel or modify the affected order.</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection id="orders" title="Orders">
              <p>After placing an order, you will receive an order confirmation.</p>
              <p>Order confirmation does not guarantee acceptance. We reserve the right to refuse or cancel any order due to:</p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2">
                <li>Product unavailability</li>
                <li>Pricing errors</li>
                <li>Payment issues</li>
                <li>Suspected fraudulent activity</li>
                <li>Violation of these Terms</li>
              </ul>
              <p>If payment has already been received for a cancelled order, the applicable amount will be refunded.</p>
            </AnimatedSection>

            <AnimatedSection id="payments" title="Payments">
              <p>We accept secure online payments through authorized payment gateways.</p>
              <p>Available payment methods may include:</p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2">
                <li>UPI</li>
                <li>Credit Cards</li>
                <li>Debit Cards</li>
                <li>Net Banking</li>
                <li>Digital Wallets</li>
                <li>Cash on Delivery (where available)</li>
              </ul>
              <p>We do not store your payment card information on our servers.</p>
            </AnimatedSection>

            <AnimatedSection id="shipping-delivery" title="Shipping and Delivery">
              <p>Delivery timelines are estimates and may vary depending on your location and courier services.</p>
              <p>Delays caused by weather conditions, natural disasters, public holidays, transportation issues, or other unforeseen circumstances are beyond our control.</p>
              <p>Customers are responsible for providing accurate shipping information.</p>
            </AnimatedSection>

            <AnimatedSection id="intellectual-property" title="Intellectual Property">
              <p>All content available on this website, including but not limited to:</p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2">
                <li>Logo</li>
                <li>Brand name</li>
                <li>Product images</li>
                <li>Product descriptions</li>
                <li>Graphics</li>
                <li>Designs</li>
                <li>Icons</li>
                <li>Text</li>
                <li>Website layout</li>
              </ul>
              <p>is the property of Keshrag and is protected under applicable intellectual property laws.</p>
              <p>No content may be copied, reproduced, distributed, or used without prior written permission.</p>
            </AnimatedSection>

            <AnimatedSection id="acceptable-use" title="Acceptable Use">
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2">
                <li>Use the website for unlawful purposes.</li>
                <li>Attempt unauthorized access to our systems.</li>
                <li>Upload malicious software or harmful code.</li>
                <li>Interfere with website functionality.</li>
                <li>Submit false or misleading information.</li>
                <li>Engage in fraudulent activities.</li>
              </ul>
              <p>Violation of these Terms may result in suspension or termination of your account.</p>
            </AnimatedSection>

            <AnimatedSection id="limitation-liability" title="Limitation of Liability">
              <p>To the maximum extent permitted by law, Keshrag shall not be liable for any indirect, incidental, special, or consequential damages arising from:</p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2">
                <li>Website interruptions</li>
                <li>Delivery delays</li>
                <li>Technical errors</li>
                <li>Third-party payment gateway issues</li>
                <li>Unauthorized access beyond our reasonable control</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection id="disclaimer" title="Disclaimer">
              <p>Our products and services are provided on an &quot;as available&quot; and &quot;as is&quot; basis.</p>
              <p>While we strive to maintain accurate information, we do not guarantee that the website will always be uninterrupted, secure, or error-free.</p>
            </AnimatedSection>

            <AnimatedSection id="termination" title="Termination">
              <p>We reserve the right to suspend or terminate access to our website without prior notice if a user violates these Terms or engages in activities that may harm our business or other users.</p>
            </AnimatedSection>

            <AnimatedSection id="changes-to-terms" title="Changes to These Terms">
              <p>We may update these Terms & Condition from time to time.</p>
              <p>Updated versions will be published on this page with the revised Effective Date.</p>
              <p>Continued use of the website after any changes constitutes acceptance of the updated Terms.</p>
            </AnimatedSection>

            <AnimatedSection id="governing-law" title="Governing Law">
              <p>These Terms shall be governed and interpreted in accordance with the laws of India.</p>
              <p>Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Surat, Gujarat.</p>
            </AnimatedSection>

            <AnimatedSection id="contact" title="Contact Us">
              <p className="mb-6">
                If you have any questions regarding these Terms & Condition, please contact us.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mt-8 bg-stone-900 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden"
              >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#b67b45]/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-[#b67b45]/10 blur-3xl" />

                <div className="grid gap-6 md:grid-cols-3 relative z-10">
                  {/* Email Card */}
                  <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="mb-5 p-4 rounded-full bg-[#b67b45]/15 ring-1 ring-[#b67b45]/30">
                      <Mail className="text-[#b67b45]" size={28} />
                    </div>
                    <h4 className="font-serif text-lg md:text-xl mb-2 font-medium">Email Us</h4>
                    <a href="mailto:support@keshrag.com" className="text-stone-300 hover:text-white transition-colors text-sm cursor-pointer">
                      support@keshrag.com
                    </a>
                  </div>

                  {/* Phone Card */}
                  <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="mb-5 p-4 rounded-full bg-[#b67b45]/15 ring-1 ring-[#b67b45]/30">
                      <Phone className="text-[#b67b45]" size={28} />
                    </div>
                    <h4 className="font-serif text-lg md:text-xl mb-2 font-medium">Call Us</h4>
                    <a href="tel:+919824676060" className="text-stone-300 hover:text-white transition-colors text-sm cursor-pointer">
                      +91 98246 76060
                    </a>
                  </div>

                  {/* Address Card */}
                  <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors md:col-span-1 sm:col-span-2">
                    <div className="mb-5 p-4 rounded-full bg-[#b67b45]/15 ring-1 ring-[#b67b45]/30">
                      <MapPin className="text-[#b67b45]" size={28} />
                    </div>
                    <h4 className="font-serif text-lg md:text-xl mb-2 font-medium">Visit Us</h4>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      <span className="text-white font-medium block mb-1">Keshrag</span>
                      Ground Floor, Raghuvir Scarlett, G-59,<br />
                      Nr. DMD Logistic Park, Saroli,<br />
                      Surat, Gujarat 395010
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  );
}
