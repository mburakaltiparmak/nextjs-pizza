// app/layout.js
import "./globals.css";
import { Barlow, Quattrocento, Satisfy } from 'next/font/google';
import Providers from "./Providers";

// Font tanımlamaları
const barlow = Barlow({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-barlow',
  display: 'swap',
});

const quattrocento = Quattrocento({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-quattrocento',
  display: 'swap',
});

const satisfy = Satisfy({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-satisfy',
  display: 'swap',
});

// Font sınıflarını global olarak tanımlama
export const fontClasses = `${barlow.variable} ${quattrocento.variable} ${satisfy.variable}`;

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
        </Providers>
      </body>
    </html>
  );
}