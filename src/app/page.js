import Header from "@/components/header";
import Footer from "@/components/footer";
import GoToMenu from "@/components/goToMenu";
import HomePageClient from "@/components/home/HomePageClient";
import {
  HeroSection,
  PromoCards,
  FeaturedProductsSection,
} from "@/components/home";

export const metadata = {
  title: "Teknolojik Yemekler - Anasayfa",
  description: "Kod acıktırır, pizza doyurur!",
};

export default function HomePage() {
  return (
    <HomePageClient>
      <div>
        <Header />
        <div className="flex flex-col justify-between items-center gap-2 text-lightgray">
          <HeroSection />
          <PromoCards />
          <FeaturedProductsSection />
        </div>
        <GoToMenu />
        <Footer />
      </div>
    </HomePageClient>
  );
}