"use client";

import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";

const Navbar = ({ title, showAddButton, addButtonText = "Yeni Ekle", onAddButtonClick, isMobile }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="bg-yellow text-red shadow-sm">
      <div className="px-4 py-4 flex justify-between items-center">
        <h1 className={`text-xl font-bold text-gray-800 ${isMobile ? 'ml-12' : ''}`}>
          {title}
        </h1>
        
        {showAddButton && (
          <button
            onClick={onAddButtonClick}
            className="bg-lightgray ring-2 ring-inset ring-darkred text-darkred hover:text-lightgray hover:bg-darkred px-3 py-2 rounded-lg text-sm font-medium flex items-center font-Barlow"
            aria-label={addButtonText}
          >
            <PlusCircle className="mr-2" size={16} />
             <span>{addButtonText}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;