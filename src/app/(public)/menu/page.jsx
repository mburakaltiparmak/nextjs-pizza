import { FeaturedProductsSection } from "@/components/home";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
    title: "Teknolojik Yemekler - Menü",
    description: "Lezzetli pizzalarımız!",
};

export default function MenuPage() {
    return (
        <>
            <div className="pt-8">
                <FeaturedProductsSection />
            </div>
        </>
    );
}
