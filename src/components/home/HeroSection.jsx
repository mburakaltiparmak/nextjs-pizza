"use client";

import heroImg from "../../../public/images/mvp-banner.png";

export default function HeroSection() {

  const scrollToMenu = () => {
    const menuSection = document.getElementById("menu");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className="bg-cover bg-center h-[95vh] w-full"
      style={{ backgroundImage: `url(${heroImg.src})` }}
    >
      <div className="flex flex-col justify-start items-center gap-4 mt-4">
        <div className="flex flex-col justify-between items-center gap-4 text-center">
          <h4 className="font-Satisfy text-yellow text-2xl">
            fırsatı kaçırma
          </h4>
          <h2 className="font-Barlow text-4xl tracking-tighter text-lightgray">
            KOD ACIKTIRIR, <br /> PİZZA DOYURUR
          </h2>
          <button onClick={scrollToMenu} className="btn-primary">
            ACIKTIM
          </button>
        </div>
      </div>
    </div>
  );
}
