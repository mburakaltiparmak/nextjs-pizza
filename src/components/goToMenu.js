"use client";
import { CircleArrowDown } from "lucide-react";
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
      <div className="absolute lg:bottom-0 left-0 right-0 max-md:top-1/3  flex justify-center max-md:pb-4 pb-8 max-lg:hidden ">
        <button onClick={scrollToCategories} className="btn-third">
          <CircleArrowDown size={36} />
        </button>
      </div>
    )
  );
};

export default GoToMenu;
