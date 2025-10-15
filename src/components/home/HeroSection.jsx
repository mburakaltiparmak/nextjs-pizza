import { HERO_CONFIG } from "@/lib/constants/homeData";
import HeroCTA from "./HeroCTA";

export default function HeroSection() {
  return (
    <div
      className="bg-cover bg-center h-screen w-full max-md:h-96"
      style={{ backgroundImage: `url(${HERO_CONFIG.backgroundImage.src})` }}
    >
      <div className="flex flex-col justify-start items-center gap-4 mt-4">
        <div className="flex flex-col justify-between items-center gap-4 text-center">
          <h4 className="font-Satisfy text-yellow text-2xl">
            {HERO_CONFIG.subtitle}
          </h4>
          <h2 className="font-Barlow text-4xl tracking-tighter text-lightgray">
            {HERO_CONFIG.title.line1} <br /> {HERO_CONFIG.title.line2}
          </h2>
          <HeroCTA />
        </div>
      </div>
    </div>
  );
}