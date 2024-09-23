"use client";
import { useState, useEffect } from "react";

const GoToMenu = () => {
  const [showScrollButton, setShowScrollButton] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Sayfanın sonuna yaklaşıldığında düğmeyi gizle
      if (scrollPosition + windowHeight > documentHeight - 100) {
        setShowScrollButton(false);
      } else {
        setShowScrollButton(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToCategories = () => {
    const categoriesSection = document.getElementById("categories");
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: "smooth" });
    }
  };
//make a decision to show it or not show it on smaller screen
  return (
    showScrollButton && (
      <div className="fixed lg:bottom-0 left-0 right-0 max-md:top-1/3  flex justify-center max-md:pb-4 pb-8 max-lg:hidden ">
        <button
          onClick={scrollToCategories}
          className="bg-yellow text-darkgray font-Barlow px-6 py-3 rounded-full shadow-lg hover:bg-red hover:text-lightgray transition-colors duration-300 font-semibold
                     text-xs transform flex items-center space-x-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 max-md:h-5 max-md:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <span>MENÜLERE GİT</span>
        </button>
      </div>
    )
  );
};

export default GoToMenu;
