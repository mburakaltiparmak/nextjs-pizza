import React from "react";
import Link from "next/link";
import FloatingUserButton from "./floatingUserButton";

const Header = () => {
  return (
    <div className="font-Londrina_Solid font-medium text-3xl text-lightgray bg-red py-3 px-4 relative">
      <div className="container mx-auto flex justify-center items-center">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          Teknolojik Yemekler
        </Link>
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <FloatingUserButton />
        </div>
      </div>
    </div>
  );
};

export default Header;