import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { CompareProvider } from "@/contexts/CompareContext";
import { CartWishlistProvider } from "@/contexts/CartWishlistContext";
import CompareBar from "@/components/compare/CompareBar";
import CartDrawer from "@/components/common/CartDrawer";
import FloatingWhatsApp from "@/components/common/FloatingWhatsApp";
import ScrollToTop from "@/components/common/ScrollToTop";
import { Outfit, Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import SmoothScrolling from "@/components/common/SmoothScrolling";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "Keshrag | Premium Sarees",
  description: "Discover the elegance of premium Indian sarees for every occasion.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${outfit.variable} min-h-screen w-full overflow-x-hidden bg-(--background) text-(--text) antialiased`}>
        <CompareProvider>
          <CartWishlistProvider>
            <Navbar />
            <SmoothScrolling>
              <main>{children}</main>
            </SmoothScrolling>
            <CartDrawer />
            <CompareBar />
            <Footer />
            <ScrollToTop />
            <FloatingWhatsApp />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              pauseOnHover={true}
              newestOnTop={true}
              closeOnClick={true}
              draggable={true}
              theme="colored"
            />
          </CartWishlistProvider>
        </CompareProvider>
      </body>
    </html>
  );
}
