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
            <div className="absolute lg:bottom-0 left-0 right-0 max-md:top-1/3 flex justify-center items-center max-md:pb-4 pb-8 max-lg:hidden ">
                <button
                    onClick={scrollToCategories}
                    className="flex items-center justify-center bg-yellow text-red hover:bg-black hover:text-yellow hover:z-50 ring-2 ring-inset ring-lightgray p-3 max-md:px-6 max-md:text-sm rounded-full font-semibold text-base transition-all duration-300 font-Barlow shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                >
                    <p>Yemeklere Git</p>

                </button>
            </div>
        )
    );
};

export default GoToMenu;
