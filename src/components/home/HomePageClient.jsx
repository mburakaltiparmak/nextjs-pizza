"use client";

import HeroSection from "./HeroSection";
import PromoCards from "./PromoCards";
import MenuSection from "./MenuSection";

export default function HomePageClient() {
  return (
    <>
      <div className="flex flex-col justify-between items-center gap-2 text-lightgray">
        <HeroSection />
        <PromoCards />
        <MenuSection />
      </div>
    </>
  );
}
