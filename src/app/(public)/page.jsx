import HomePageClient from "@/components/home/HomePageClient";
import GoToMenu from "@/components/home/GoToMenu";
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
            <div className="flex flex-col justify-between items-center gap-2 text-lightgray">
                <HeroSection />
                <PromoCards />
                <FeaturedProductsSection />
            </div>
            <GoToMenu />
        </HomePageClient>
    );
}
