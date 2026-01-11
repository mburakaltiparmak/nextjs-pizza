import Link from "next/link";
const Header = () => {
    return (
        <div className="font-Londrina_Solid font-medium text-3xl text-lightgray bg-red py-3 px-4 relative">
            <div className="container mx-auto flex justify-center items-center">
                <Link href="/" className="hover:opacity-90 transition-opacity">
                    Teknolojik Yemekler
                </Link>
            </div>
        </div>
    );
};

export default Header;
