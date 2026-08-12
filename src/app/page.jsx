import HeroSection from "@/components/home/HeroSection";
import TrustStrip from "@/components/home/TrustStrip";
import VideoSection from "@/components/home/VideoSection";
import Skiper from "@/components/home/Skiper";
import NewArrivalSection from "@/components/home/NewArrivalSection";
import BestSellerSection from "@/components/home/BestSellerSection";
import StoryBanner from "@/components/home/StoryBanner";
import WhyKeshrag from "@/components/home/WhyKeshrag";
import TestimonialSection from "@/components/home/TestimonialSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import RecentlyViewedSection from "@/components/home/RecentlyViewedSection";

export const metadata = {
  title: "SR Ecommerce | Premium Storefront",
  description: "Discover curated high-quality products for all your lifestyle needs.",
};

export default function Home() {
  return (
    <div className="page-shell">
      {/* 1. Hero Banner */}
      <HeroSection />
      {/* 2. Trust Strip */}
      <TrustStrip />
      {/* 3. Shop by Occasion */}
      <VideoSection />
      {/* 4. Premium Gallery Parallax */}
      <Skiper />
      {/* 5. New Arrivals */}
      <NewArrivalSection />
      {/* 7. Brand Story */}
      <StoryBanner />
      {/* 8. Why Keshrag */}
      <WhyKeshrag />
      {/* 6. Best Sellers */}
      <BestSellerSection />
      {/* 9. Customer Reviews */}
      <TestimonialSection />
      {/* 10. Recently Viewed (logged-in users) */}
      <RecentlyViewedSection />
      {/* 12. Newsletter */}
      <NewsletterSection />
    </div>
  );
}
