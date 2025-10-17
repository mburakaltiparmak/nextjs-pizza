// app/layout.js
import "./globals.css";
import {
  Barlow,
  Londrina_Solid,
  Quattrocento,
  Satisfy,
} from "next/font/google";

import FloatingCartButton from "@/components/cart-button/floatingCartButton";
import FloatingUserButton from "@/components/user-button/floatingUserButton";
import ClientComponentWrapper from "./ClientComponentWrapper";
import Providers from "@/lib/providers/Providers";
// Font tanımlamaları
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
});

const quattrocento = Quattrocento({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-quattrocento",
  display: "swap",
});

const satisfy = Satisfy({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-satisfy",
  display: "swap",
});

const londrina = Londrina_Solid({
  subsets: ["latin"],
  weight: ["100", "300", "400", "900"],
  variable: "--font-londrina-solid",
  display: "swap",
});

// Font sınıflarını global olarak tanımlama
export const fontClasses = `${barlow.variable} ${quattrocento.variable} ${satisfy.variable} ${londrina.variable}`;

export const metadata = {
  title: "Teknolojik Yemekler",
  description: "made by burak altiparmak",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fontClasses}>
      <body>
        <Providers>
          {children}
          <ClientComponentWrapper />
        </Providers>
      </body>
    </html>
  );
}
