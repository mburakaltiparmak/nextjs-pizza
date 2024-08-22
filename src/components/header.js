import React from "react";
import Link from "next/link";
const Header = () => {
  return (
    <div className="text-center bg-red font-Londrina_Solid font-semibold text-3xl text-lightgray py-4">
      <Link href="/">Teknolojik Yemekler</Link>
    </div>
  );
};
export default Header;
