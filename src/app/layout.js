import "./globals.css";
import { Barlow, Quattrocento, Satisfy } from 'next/font/google';
import Footer from "@/components/footer";
import Header from "@/components/header";
import StoreProvider from "./StoreProvider";
import { Toaster } from "@/components/ui/toaster";
import FloatingCartButton from "@/components/floatingCartButton";

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-barlow',
});

const quattrocento = Quattrocento({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-quattrocento',
});

const satisfy = Satisfy({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-satisfy',
});

export const metadata = {
  title: "Teknolojik Yemekler",
  description: "made by burak altiparmak",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <div className="min-h-screen bg-background antialiased">
            {children}
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}