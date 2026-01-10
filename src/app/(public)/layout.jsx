import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingCartWrapper from "@/components/layout/FloatingCartWrapper";

export default function PublicLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <FloatingCartWrapper />
            <Footer />
        </div>
    );
}
