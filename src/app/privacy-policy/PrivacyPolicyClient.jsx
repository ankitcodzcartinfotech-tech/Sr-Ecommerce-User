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
  { id: 'introduction', title: 'Introduction' },
  { id: 'information-we-collect', title: 'Information We Collect' },
  { id: 'how-we-use', title: 'How We Use Information' },
  { id: 'cookies-policy', title: 'Cookies Policy' },
  { id: 'third-party-services', title: 'Third Party Services' },
  { id: 'payment-information', title: 'Payment Information' },
  { id: 'data-security', title: 'Data Security' },
  { id: 'user-rights', title: 'User Rights' },
  { id: 'childrens-privacy', title: "Children&apos;s Privacy" },
  { id: 'policy-updates', title: 'Policy Updates' },
  { id: 'contact', title: 'Contact Information' }
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

export default function PrivacyPolicyClient() {
  const [activeSection, setActiveSection] = useState('introduction');
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
            <Link href="/" className="hover:text-var(--gold)) transition-colors cursor-pointer">Home</Link>
            <ChevronRight size={12} />
            <span className="text-stone-900">Privacy Policy</span>
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
              Privacy Policy
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mx-auto mt-4 sm:mt-6 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-stone-600"
            >
              At Keshrag Premium Sarees, your trust and privacy are our highest priority. We are committed to protecting and safeguarding your personal information.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 sm:mt-8 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold text-stone-600 shadow-sm"
            >
              <Clock size={14} />
              <span>Last Updated: June 2026</span>
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
                    className={`w-full text-left text-xs sm:text-sm py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg transition-all ${activeSection === section.id
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
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleNavClick(section.id)}
                      className={`w-full text-left text-sm py-2.5 px-3 rounded-xl transition-all ${activeSection === section.id
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
            <AnimatedSection id="introduction" title="Introduction">
              <p>
                Welcome to Keshrag Premium Sarees. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, make a purchase, or interact with our services.
              </p>
              <p>
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </AnimatedSection>

            <AnimatedSection id="information-we-collect" title="Information We Collect">
              <p>We may collect information about you in a variety of ways:</p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2">
                <li><strong>Personal Data:</strong> Name, email address, shipping and billing addresses, phone number.</li>
                <li><strong>Payment Data:</strong> Credit card numbers, billing addresses (processed securely through our payment providers).</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, pages visited, time spent on site.</li>
                <li><strong>Usage Data:</strong> Purchase history, wishlist items, cart contents, and preferences.</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection id="how-we-use" title="How We Use Information">
              <p>We use the information we collect for various purposes:</p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2">
                <li>To process and fulfill your orders and payments</li>
                <li>To communicate with you about your orders and account</li>
                <li>To personalize your shopping experience</li>
                <li>To send you marketing communications (with your consent)</li>
                <li>To improve our website and services</li>
                <li>To detect and prevent fraud</li>
                <li>To comply with legal obligations</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection id="cookies-policy" title="Cookies Policy">
              <p>
                We use cookies and similar tracking technologies to enhance your experience on our website. Cookies are small files stored on your device that help us remember your preferences and understand how you use our site.
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                <li><strong>Performance Cookies:</strong> Help us understand how visitors use our site</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Advertising Cookies:</strong> Deliver relevant advertisements</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection id="third-party-services" title="Third Party Services">
              <p>
                We may share your information with third-party service providers who perform services on our behalf:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2">
                <li>Payment processors (Razorpay, Stripe, etc.)</li>
                <li>Shipping and logistics partners</li>
                <li>Email service providers</li>
                <li>Analytics and marketing tools</li>
                <li>Cloud storage and hosting providers</li>
              </ul>
              <p>
                All third parties are contractually required to keep your information secure and only use it for the purposes we specify.
              </p>
            </AnimatedSection>

            <AnimatedSection id="payment-information" title="Payment Information">
              <p>
                Your payment security is paramount. We do not store your complete credit card information on our servers. All payment transactions are processed through secure, PCI-DSS compliant payment gateways.
              </p>
              <p>
                When you make a purchase, your payment information is encrypted and transmitted directly to our payment processors, who handle all payment details in accordance with their privacy policies.
              </p>
            </AnimatedSection>

            <AnimatedSection id="data-security" title="Data Security">
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, disclosure, alteration, or destruction.
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure servers and firewalls</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal information</li>
                <li>Employee training on data protection</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection id="user-rights" title="User Rights">
              <p>Depending on your location, you may have certain rights regarding your personal data:</p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2">
                <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Right to Object:</strong> Opt out of certain processing activities</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection id="childrens-privacy" title="Children&apos;s Privacy">
              <p>
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you believe we have collected information from a child under 18, please contact us immediately and we will delete it.
              </p>
            </AnimatedSection>

            <AnimatedSection id="policy-updates" title="Policy Updates">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. When we update the policy, we will revise the &quot;Last Updated&quot; date at the top of this page and notify you through appropriate channels.
              </p>
              <p>
                We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.
              </p>
            </AnimatedSection>

            <AnimatedSection id="contact" title="Contact Information">
              <p className="mb-6">
                If you have any questions about this Privacy Policy, or wish to exercise your rights, please contact us:
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mt-6 bg-stone-900 text-white rounded-2xl md:rounded-3xl p-6 md:p-10"
              >
                <div className="grid gap-6 md:grid-cols-3 md:gap-8">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="mt-1 p-2.5 md:p-3 rounded-full bg-(--gold)/20">
                      <Mail className="text-(--gold)" size={20} />
                    </div>
                    <div>
                      <h4 className="font-serif text-base md:text-lg mb-1">Email Us</h4>
                      <a href="mailto:support@keshrag.com" className="text-stone-300 hover:text-(--gold) transition-colors text-sm cursor-pointer">
                        support@keshrag.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="mt-1 p-2.5 md:p-3 rounded-full bg-(--gold)/20">
                      <Phone className="text-(--gold)" size={20} />
                    </div>
                    <div>
                      <h4 className="font-serif text-base md:text-lg mb-1">Call Us</h4>
                      <a href="tel:+919876543210" className="text-stone-300 hover:text-(var(--gold)) transition-colors text-sm cursor-pointer">
                        +91 98246 76060
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="mt-1 p-2.5 md:p-3 rounded-full bg-(--gold)/20">
                      <MapPin className="text-(--gold)" size={20} />
                    </div>
                    <div>
                      <h4 className="font-serif text-base md:text-lg mb-1">Visit Us</h4>
                      <p className="text-stone-300 text-sm">
                        Keshrag Premium Sarees<br />
                        Surat, Gujarat, India
                      </p>
                    </div>
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
