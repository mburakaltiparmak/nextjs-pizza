import heroImg from "../../../public/images/mvp-banner.png";
import card1 from "../../../public/images/kart-1.png";
import card2 from "../../../public/images/kart-2.png";
import card3 from "../../../public/images/kart-3.png";
export const PROMO_CARDS = [
  {
    id: 1,
    productId: 32,
    text: "Özel Lezzetus",
    buttonText: "SİPARİŞ VER",
    backgroundImage: card1,
    textSize: "text-5xl",
    textWidth: "w-1/2",
  },
  {
    id: 2,
    productId: 33,
    text: "Hackathlon Burger Menü",
    buttonText: "SİPARİŞ VER",
    backgroundImage: card2,
    textSize: "text-xl",
    textWidth: "w-3/4",
  },
  {
    id: 3,
    productId: 39,
    text: "Çoooook hızlı npm gibi kurye",
    buttonText: "SİPARİŞ VER",
    backgroundImage: card3,
    textSize: "text-xl",
    textWidth: "w-3/5",
  },
];

export const HERO_CONFIG = {
  backgroundImage: heroImg,
  title: {
    line1: "KOD ACIKTIRIR,",
    line2: "PİZZA DOYURUR",
  },
  subtitle: "fırsatı kaçırma",
  ctaText: "ACIKTIM",
  ctaLink: "/order",
};

export const FEATURED_SECTION = {
  subtitle: "en çok paketlenen menüler",
  title: "Acıktıran Kodlara Doyuran Lezzetler",
};