import koreLogo from "../../assets/adv-aseets/icons/1.svg";
import pizzaLogo from "../../assets/adv-aseets/icons/2.svg";
import burgerLogo from "../../assets/adv-aseets/icons/3.svg";
import kizartmaLogo from "../../assets/adv-aseets/icons/4.svg";
import fastfoodLogo from "../../assets/adv-aseets/icons/5.svg";
import gazliIcecekLogo from "../../assets/adv-aseets/icons/6.svg";
import cardImg1 from "../../assets/adv-aseets/kart-1.png";
import cardImg2 from "../../assets/adv-aseets/kart-2.png";
import cardImg3 from "../../assets/adv-aseets/kart-3.png";
import instaImg1 from "../../assets/adv-aseets/insta/li-0.png";
import instaImg2 from "../../assets/adv-aseets/insta/li-1.png";
import instaImg3 from "../../assets/adv-aseets/insta/li-2.png";
import instaImg4 from "../../assets/adv-aseets/insta/li-3.png";
import instaImg5 from "../../assets/adv-aseets/insta/li-4.png";
import instaImg6 from "../../assets/adv-aseets/insta/li-5.png";
import {
  faCartShopping,
  faCashRegister,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";

export const homeMenuBar = {
  1: {
    name: "YENİ! Kore",
    logo: koreLogo,
    hoverText: "Used shadcnUI & next.js",
  },
  2: {
    name: "Pizza",
    logo: pizzaLogo,
    hoverText: "Used shadcnUI & next.js",
  },
  3: {
    name: "Burger",
    logo: burgerLogo,
    hoverText: "Used shadcnUI & next.js",
  },
  4: {
    name: "Kızartmalar",
    logo: kizartmaLogo,
    hoverText: "Used shadcnUI & next.js",
  },
  5: {
    name: "Fast Food",
    logo: fastfoodLogo,
    hoverText: "Used shadcnUI & next.js",
  },
  6: {
    name: "Gazlı İçecekler",
    logo: gazliIcecekLogo,
    hoverText: "Used shadcnUI & next.js",
  },
};
export const homeCards = [
  {
    text: "Özel Lezzetus",
    buttonText: "SİPARİŞ VER",
    background: cardImg1,
  },
  {
    text: "Hackathlon Burger Menu",
    buttonText: "SİPARİŞ VER",
    background: cardImg2,
  },
  {
    text: "Çoooook hızlı npm gibi kurye",
    buttonText: "SİPARİŞ VER",
    background: cardImg3,
  },
];
export const homeMenuLink = [
  {
    name: "Ramen",
    logo: koreLogo,
  },
  {
    name: "Pizza",
    logo: pizzaLogo,
  },
  {
    name: "Burger",
    logo: burgerLogo,
  },
  {
    name: "French Fries",
    logo: kizartmaLogo,
  },
  {
    name: "Fast Food",
    logo: fastfoodLogo,
  },
  {
    name: "Soft Drinks",
    logo: gazliIcecekLogo,
  },
];
export const footerInstaPhoto = [
  {
    name: "photo1",
    img: "https://res.cloudinary.com/dqjqkgpt3/image/upload/v1746187940/salami_pizza_zypgtz.jpg",
  },
  {
    name: "photo2",
    img: "https://res.cloudinary.com/dqjqkgpt3/image/upload/v1746187940/pizza_2_hy8gin.jpg",
  },
  {
    name: "photo3",
    img: "https://res.cloudinary.com/dqjqkgpt3/image/upload/v1746187940/55592bd2-27ea-4a14-b129-1e66cb96761f_dtdd8j.jpg",
  },
  {
    name: "photo4",
    img: "https://res.cloudinary.com/dqjqkgpt3/image/upload/v1746187939/7c8b366c-6e40-4f88-974a-347d222817bd_ljvcrb.jpg",
  },
  {
    name: "photo5",
    img: "https://res.cloudinary.com/dqjqkgpt3/image/upload/v1746187939/Classic_Sweet_Tea_kwk5mi.jpg",
  },
  {
    name: "photo6",
    img: "https://res.cloudinary.com/dqjqkgpt3/image/upload/v1746187939/7dd3251b-bf5f-4853-a167-5a34050fa386_gyjbg3.jpg",
  },
];
export const items = [
  {
    id: "Pepperoni",
    label: "Pepperoni",
  },
  {
    id: "Domates",
    label: "Domates",
  },
  {
    id: "Biber",
    label: "Biber",
  },
  {
    id: "Sosis",
    label: "Sosis",
  },
  {
    id: "Misir",
    label: "Mısır",
  },
  {
    id: "Sucuk",
    label: "Sucuk",
  },
  {
    id: "Kanada Jambonu",
    label: "Kanada Jambonu",
  },
  {
    id: "Ananas",
    label: "Ananas",
  },
  {
    id: "Tavuk Izgara",
    label: "Tavuk Izgara",
  },
  {
    id: "Jalepeno",
    label: "Jalepeno",
  },
  {
    id: "Kabak",
    label: "Kabak",
  },
  {
    id: "Sogan",
    label: "Soğan",
  },
  {
    id: "Sarimsak",
    label: "Sarımsak",
  },
];
export const steps = [
  {
    title: "Kişisel Bilgiler",
    value: "user",
    icon: faUser,
    success: faCheck,
  },
  {
    title: "Sipariş Özeti",
    value: "summary",
    icon: faCartShopping,
    success: faCheck,
  },
  {
    title: "Ödeme",
    value: "payment",
    icon: faCashRegister,
    success: faCheck,
  },
];
