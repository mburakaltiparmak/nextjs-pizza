import "./globals.css";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import Footer from "@/components/footer";
import Header from "@/components/header";
import StoreProvider from "./StoreProvider";
import { Toaster } from "@/components/ui/toaster";
import FloatingCartButton from "@/components/floatingCartButton";
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
export const metadata = {
  title: "Teknolojik Yemekler",
  description: "made by burak altiparmak",
};
export default function RootLayout({ children }) {
  return (
    <StoreProvider>
      <html lang="en">
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Londrina+Solid:wght@100;300;400;900&family=Quattrocento+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Quattrocento:wght@400;700&family=Satisfy&display=swap"
            rel="stylesheet"
          />
        </head>

        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          <header>
            <Header />
          </header>
          <FloatingCartButton />
          {children}
          <Toaster />
          <footer>
            <Footer />
          </footer>
        </body>
      </html>
    </StoreProvider>
  );
}
