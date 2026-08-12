import Link from "next/link";
import Image from "next/image";

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Facebook", href: "https://facebook.com" },
  { label: "Pinterest", href: "https://pinterest.com" },
];

export default function Footer() {
  return (
    <footer className="border-t border-stone-900/8 bg-[rgba(255,255,255,0.52)] px-4 py-12 sm:px-6 sm:py-16 md:px-10 lg:px-14">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-8 sm:gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:gap-12">
          <div>
            <Image
              src="/logo.jpg"
              alt="Keshrag Logo"
              width={50}
              height={50}
              // style={{ width: "auto", height: "auto" }}
              className="rounded-full object-cover"
            />
            <p className="mt-6 max-w-sm text-sm leading-7 text-(--muted) sm:mt-5">
              A warmer, more modern way to discover handcrafted sarees for celebrations, gifting,
              and everyday elegance.
            </p>
            <div className="mt-6 text-sm text-(--muted) max-w-sm leading-relaxed">
              <p className="font-semibold text-stone-900 mb-2">Visit Us</p>
              <p>
                Ground Floor, Raghuvir Scarlett, G-59,<br />
                Nr. DMD Logistic Park, Saroli,<br />
                Surat, Gujarat 395010
              </p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-900">
              Explore
            </p>
            <div className="mt-5 space-y-3 text-sm text-(--muted) sm:mt-5">
              <Link href="/shop" className="block transition-colors hover:text-(--gold) cursor-pointer">
                Shop
              </Link>
              <Link href="/collections" className="block transition-colors hover:text-(--gold) cursor-pointer">
                Collections
              </Link>
              <Link href="/about" className="block transition-colors hover:text-(--gold) cursor-pointer">
                About
              </Link>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-900">
              Support
            </p>
            <div className="mt-5 space-y-3 text-sm text-(--muted) sm:mt-5">
              <Link href="/contact" className="block transition-colors hover:text-(--gold) cursor-pointer">
                Contact
              </Link>
              <Link href="/privacy-policy" className="block transition-colors hover:text-(--gold) cursor-pointer">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block transition-colors hover:text-(--gold) cursor-pointer">
                Terms & Condition
              </Link>
              <Link href="/return-policy" className="block transition-colors hover:text-(--gold) cursor-pointer">
                Return & Refund Policy
              </Link>
              <Link href="/shipping-policy" className="block transition-colors hover:text-(--gold) cursor-pointer">
                Shipping Policy
              </Link>
              <Link href="/cancellation-policy" className="block transition-colors hover:text-(--gold) cursor-pointer">
                Cancellation Policy
              </Link>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-900">
              Follow
            </p>
            <div className="mt-5 space-y-3 text-sm text-(--muted) sm:mt-5">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition-colors hover:text-(--gold) cursor-pointer"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-stone-900/8 pt-8 text-xs leading-relaxed text-(--muted) sm:mt-14 md:flex-row md:items-center md:justify-between">
          <p>Copyright (c) {new Date().getFullYear()} Keshrag. All rights reserved.</p>
          <p className="max-w-md">Handcrafted style, thoughtful service, and a softer luxury experience.</p>
        </div>
      </div>
    </footer>
  );
}
