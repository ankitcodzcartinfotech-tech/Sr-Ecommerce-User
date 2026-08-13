import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { CompareProvider } from "@/contexts/CompareContext";

const fs = require('fs');
try {
  const src = 'C:/Users/pc/.gemini/antigravity-ide/brain/187a4c10-d8b9-44a8-b679-c70ca134f112/media__1786534785820.jpg';
  const dest1 = 'd:/Codzcart Infotech/Sr-Ecommerce/Sr-Ecommerce-User/public/logo.jpg';
  const dest2 = 'd:/Codzcart Infotech/Sr-Ecommerce/Sr-Ecommerce-User/public/images/logo.jpg';
  const dest3 = 'd:/Codzcart Infotech/Sr-Ecommerce/Sr-Ecommerce-Admin/public/logo.jpg';
  const dest4 = 'd:/Codzcart Infotech/Sr-Ecommerce/Sr-Ecommerce-User/src/app/icon.jpg';
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest1);
    fs.copyFileSync(src, dest2);
    fs.copyFileSync(src, dest3);
    fs.copyFileSync(src, dest4);
  }
} catch (e) {
  console.error("Failed to copy logo:", e);
}
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
  title: "SR Ecommerce | Premium Storefront",
  description: "Discover curated high-quality products for all your lifestyle needs.",
  icons: {
    icon: "/logo.jpg",
  },
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
