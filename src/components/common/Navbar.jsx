"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, ShoppingBag, User, X, Home, Heart, LayoutGrid } from "lucide-react";
import { getUserProfile, logoutUser } from "@/Api/AllApi";
import { useCartWishlist } from "@/contexts/CartWishlistContext";
import SearchOverlay from "@/components/common/SearchOverlay";
import NotificationDropdown from "@/components/common/NotificationDropdown";
import { toast } from "@/utils/toast";
import { playMessage } from "@/utils/notificationSound";



const occasionMenu = [
  { label: "All Occasions", href: "/occasions" },
  { label: "Bridal", href: "/shop?occasion=wedding" },
  { label: "Wedding", href: "/shop?occasion=wedding" },
  { label: "Festive", href: "/shop?occasion=festive" },
  { label: "Party Wear", href: "/shop?occasion=party" },
  { label: "Casual", href: "/shop?occasion=daily" },
];

export default function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const { cartCount, wishlistCount, setIsCartOpen } = useCartWishlist();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const token = typeof window !== "undefined" && localStorage.getItem("userToken");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoggedIn(!!token);
    if (token) {
      getUserProfile()
        .then((data) => {
          if (data?.user) {
            setUserProfile(data.user);
          }
        })
        .catch((err) => {
          const msg = (err.message || "").toLowerCase();
          const isTokenInvalid = 
            msg.includes("token expired") || 
            msg.includes("invalid token") || 
            (msg.includes("authorization denied") && msg.includes("user not found"));

          if (isTokenInvalid) {
            // Silently clear invalid token
            localStorage.removeItem("userToken");
            setIsLoggedIn(false);
          } else {
            console.error("Failed to load user profile:", err);
          }
        });
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else if (!isSearchOpen) {
      document.body.style.overflow = originalOverflow;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-stone-900/5 bg-[rgba(251,245,238,0.86)] backdrop-blur-xl">
        <div className="bg-stone-900 px-4 py-2 text-center text-[10px] font-medium uppercase tracking-[0.25em] text-white/95 sm:text-[11px]">
          Free shipping across India on premium orders over <span className="text-(--gold) font-bold">Rs. 2,500</span>
        </div>

        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:h-20 sm:gap-4 md:px-8">
          
          {/* Left section: Menu & Logo */}
          <div className="flex flex-1 items-center gap-3 sm:gap-4">
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-900/8 p-0 text-stone-700 active:bg-stone-100 lg:hidden cursor-pointer"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <Link href="/" className="min-w-0 shrink flex flex-col items-center md:items-start cursor-pointer z-10">
              <Image
                src="/logo.jpg"
                alt="Keshrag Logo"
                width={56}
                height={56}
                // style={{ width: "auto", height: "auto" }}
                className="w-10 h-10 rounded-full object-cover sm:w-14 sm:h-14"
                priority
              />
            </Link>
          </div>

          <nav className="hidden items-center gap-5 lg:flex lg:gap-7">
            <Link href="/" className="group relative text-[13px] font-medium uppercase tracking-[0.2em] text-stone-700 transition-colors hover:text-(--gold) cursor-pointer">
              Home
              <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-(--gold) transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/shop" className="group relative text-[13px] font-medium uppercase tracking-[0.2em] text-stone-700 transition-colors hover:text-(--gold) cursor-pointer">
              Shop
              <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-(--gold) transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/collections" className="group relative text-[13px] font-medium uppercase tracking-[0.2em] text-stone-700 transition-colors hover:text-(--gold) cursor-pointer">
              Collections
              <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-(--gold) transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/about" className="group relative text-[13px] font-medium uppercase tracking-[0.2em] text-stone-700 transition-colors hover:text-(--gold) cursor-pointer">
              Our Story
              <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-(--gold) transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/contact" className="group relative text-[13px] font-medium uppercase tracking-[0.2em] text-stone-700 transition-colors hover:text-(--gold) cursor-pointer">
              Contact
              <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-(--gold) transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          <div className="flex flex-1 shrink-0 items-center justify-end gap-0.5 sm:gap-1 lg:min-w-50">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
              className="flex h-11 w-11 items-center justify-center rounded-full text-stone-700 transition-all hover:bg-stone-200/50 hover:text-(--gold) active:bg-stone-200 cursor-pointer"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            {isLoggedIn && <NotificationDropdown />}

            <div className="group relative hidden lg:block">
              <button
                type="button"
                aria-label="Account"
                className="flex h-11 w-11 items-center justify-center rounded-full text-stone-700 transition-all hover:bg-stone-200/50 hover:text-(--gold) active:bg-stone-200 cursor-pointer"
              >
                <User size={20} strokeWidth={1.5} />
              </button>
              <div className="invisible absolute right-0 top-full min-w-50 translate-y-3 rounded-2xl border border-stone-900/8 bg-(--surface) p-3 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:translate-y-2 group-hover:opacity-100">
                {isLoggedIn ? (
                  <div className="flex flex-col">
                    <Link
                      href="/account"
                      className="rounded-xl px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-(--gold) cursor-pointer"
                    >
                      {userProfile?.name ? `Hi, ${userProfile.name.split(" ")[0]}` : "My Account"}
                    </Link>
                    <Link
                      href="/wishlist"
                      className="rounded-xl px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-(--gold) cursor-pointer"
                    >
                      Wishlist
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await logoutUser();
                        } catch (err) {
                          console.error("Logout API failed", err);
                        }
                        localStorage.removeItem("userToken");
                        playMessage();
                        toast.info("Logged out successfully");
                        setTimeout(() => {
                          window.location.reload();
                        }, 1500);
                      }}
                      className="mt-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/login"
                      className="flex h-10 items-center justify-center rounded-xl bg-stone-900 text-xs font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-(--gold) cursor-pointer"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/login?tab=signup"
                      className="flex h-10 items-center justify-center rounded-xl border-2 border-stone-200 text-xs font-bold uppercase tracking-[0.14em] text-stone-700 transition-all hover:border-(--gold) hover:text-(--gold) cursor-pointer"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative hidden lg:flex h-11 w-11 items-center justify-center rounded-full text-stone-700 transition-all hover:bg-stone-200/50 hover:text-(--gold) active:bg-stone-200 cursor-pointer"
            >
              <Heart size={20} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[rgba(251,245,238,0.86)] bg-(--gold) px-1 text-[9px] font-bold text-white shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-stone-700 transition-all hover:bg-stone-200/50 hover:text-(--gold) active:bg-stone-200 cursor-pointer"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[rgba(251,245,238,0.86)] bg-(--gold) px-1 text-[9px] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      {/* Render the new SearchOverlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-60 bg-black/45 backdrop-blur-sm lg:hidden cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-[min(85vw,24rem)] overflow-y-auto bg-(--surface) p-5 shadow-2xl sm:p-6 cursor-pointer"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Image
                    src="/logo.jpg"
                    alt="Keshrag Logo"
                    width={40}
                    height={40}
                    style={{ width: "auto", height: "auto" }}
                    className="rounded-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-colors hover:bg-stone-200 active:bg-stone-300 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="mt-8 space-y-2">
                {[
                  { label: "Home", href: "/" },
                  { label: "Shop", href: "/shop" },
                  { label: "Collections", href: "/collections" },
                  { label: "About", href: "/about" },
                  { label: "Contact", href: "/contact" },
                  { label: "Privacy Policy", href: "/privacy-policy" },
                  { label: "Wishlist", href: "/wishlist" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center min-h-10 rounded-xl border border-stone-900/8 bg-white/70 px-4 py-3 text-xs uppercase tracking-[0.22em] text-stone-700 transition-colors hover:border-(--gold) hover:bg-amber-50 hover:text-(--gold) active:bg-amber-100 cursor-pointer"
                  >
                    {item.label}
                  </Link>
                ))}

                {isLoggedIn ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center min-h-10 rounded-xl border border-stone-900/8 bg-white/70 px-4 py-3 text-xs uppercase tracking-[0.22em] text-stone-700 transition-colors hover:border-(--gold) hover:bg-amber-50 hover:text-(--gold) active:bg-amber-100 cursor-pointer"
                    >
                      {userProfile?.name ? `Hi, ${userProfile.name.split(" ")[0]}` : "Account"}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem("userToken");
                        setIsMobileMenuOpen(false);
                        playMessage();
                        toast.info("Logged out successfully");
                        setTimeout(() => {
                          window.location.href = "/";
                        }, 1500);
                      }}
                      className="flex items-center w-full min-h-10 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-xs uppercase tracking-[0.22em] font-semibold text-rose-600 transition-colors hover:bg-rose-100 active:bg-rose-200 cursor-pointer"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex min-h-10 items-center justify-center rounded-xl bg-stone-900 px-4 py-3 text-xs uppercase tracking-[0.22em] font-bold text-white transition-colors hover:bg-(--gold) cursor-pointer"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/login?tab=signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex min-h-10 items-center justify-center rounded-xl border-2 border-stone-300 bg-white/70 px-4 py-3 text-xs uppercase tracking-[0.22em] font-bold text-stone-700 transition-colors hover:border-(--gold) hover:text-(--gold) cursor-pointer"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
