import "./globals.css";
import { Inter } from "next/font/google";
import Footer from "@/components/footer";
import Header from "@/components/header";
import StoreProvider from "./StoreProvider";
import { Toaster } from "@/components/ui/toaster";
import FloatingCartButton from "@/components/floatingCartButton";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
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