"use client";

import { useRouter } from "next/navigation";
import { HERO_CONFIG } from "@/lib/constants/homeData";

export default function HeroCTA() {
  const router = useRouter();

  const handleClick = () => {
    router.push(HERO_CONFIG.ctaLink);
  };

  return (
    <button onClick={handleClick} className="btn-primary">
      {HERO_CONFIG.ctaText}
    </button>
  );
}