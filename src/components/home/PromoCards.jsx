"use client";

import { useRouter } from "next/navigation";
import card1 from "../../../public/images/kart-1.png";
import card2 from "../../../public/images/kart-2.png";
import card3 from "../../../public/images/kart-3.png";

export default function PromoCards() {
  const router = useRouter();

  const handleCardClick = (productId) => {
    router.push(`/products/${productId}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 h-auto md:h-[500px]">
        {/* Large Left Card */}
        <div
          className="relative w-full h-[300px] md:h-full bg-cover bg-center rounded-2xl overflow-hidden cursor-pointer group shadow-lg transition-transform duration-300 hover:scale-[1.01]"
          style={{
            backgroundImage: `url(${card1.src})`,
          }}
          onClick={() => handleCardClick(32)}
        >
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300"></div>
          <div className="relative h-full flex flex-col justify-center items-start p-8 md:p-12">
            <p className="text-3xl md:text-5xl font-bold font-Quattrocento text-white mb-6 leading-tight w-2/3 drop-shadow-lg">
              Özel Lezzetus
            </p>
            <button className="btn-primary shadow-xl">
              SİPARİŞ VER
            </button>
          </div>
        </div>

        {/* Right Column Stacked Cards */}
        <div className="flex flex-col gap-4 md:gap-6 h-full">
          {/* Top Right Card */}
          <div
            className="relative flex-1 bg-cover bg-center rounded-2xl overflow-hidden cursor-pointer group shadow-lg transition-transform duration-300 hover:scale-[1.01] min-h-[200px]"
            style={{
              backgroundImage: `url(${card2.src})`,
            }}
            onClick={() => handleCardClick(33)}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
            <div className="relative h-full flex flex-col justify-center items-start p-6 md:p-10">
              <p className="text-xl md:text-2xl font-bold font-Barlow text-white mb-4 w-3/4 drop-shadow-md">
                Hackathlon Burger Menü
              </p>
              <button className="btn-third shadow-lg">
                SİPARİŞ VER
              </button>
            </div>
          </div>

          {/* Bottom Right Card */}
          <div
            className="relative flex-1 bg-cover bg-center rounded-2xl overflow-hidden cursor-pointer group shadow-lg transition-transform duration-300 hover:scale-[1.01] min-h-[200px]"
            style={{
              backgroundImage: `url(${card3.src})`,
            }}
            onClick={() => handleCardClick(39)}
          >
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300"></div>
            <div className="relative h-full flex flex-col justify-center items-start p-6 md:p-10">
              <p className="text-xl md:text-2xl text-darkgray font-bold font-Barlow mb-4 w-3/5 drop-shadow-sm">
                Çoooook hızlı npm gibi kurye
              </p>
              <button className="btn-fourth shadow-lg">
                SİPARİŞ VER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}