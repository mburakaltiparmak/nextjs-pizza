import Footer from "@/components/footer";
import Header from "@/components/header";

export const metadata = {
    title : "Kişisel Bilgiler",
    description : "Profile",
}
export default function Layout({children}) {
    return (
        <div className="min-h-screen flex flex-col bg-lightgray ">
            <Header />
            {children}
            <Footer />
        </div>
    );
}