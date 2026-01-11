import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingCartWrapper from "@/components/layout/FloatingCartWrapper";
import Sidebar from "@/components/layout/Sidebar";

export default function PublicLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen transition-all duration-300">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <FloatingCartWrapper />
            <Footer />
            <Sidebar />
        </div>
    );
}
