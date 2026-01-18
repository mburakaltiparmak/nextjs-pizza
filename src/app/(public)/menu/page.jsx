import MenuClient from "./MenuClient";

export const metadata = {
    title: "Teknolojik Yemekler - Menü",
    description: "Lezzetli pizzalarımız!",
};

export default function MenuPage() {
    return (
        <>
            <div className="pt-8">
                <MenuClient />
            </div>
        </>
    );
}
