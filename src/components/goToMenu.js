"use client";
import { useState } from "react";

const GoToMenu = () => {
  const [showScrollButton, setShowScrollButton] = useState(true);
  const scrollToCategories = () => {
    const categoriesSection = document.getElementById("categories");
    setShowScrollButton(false);
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    showScrollButton && (
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-8">
        <button
          onClick={scrollToCategories}
          className="bg-yellow text-darkgray text-xs font-Barlow px-6 py-3 rounded-full shadow-lg hover:bg-red hover:text-lightgray transition-colors duration-300 font-semibold"
        >
          <p className=""> MENÜLERE GİT </p>
        </button>
      </div>
    )
  );
};
export default GoToMenu;
