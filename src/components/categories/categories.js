/* eslint-disable @next/next/no-img-element */
"use client";
import { useAppSelector } from "@/lib/hooks";
import { LoadingSpinner } from "../ui/LoadingSpinner";

const allLogo = "/assets/adv-aseets/icons/all-logo.png";

const Categories = ({ selectedCategoryId, onCategorySelect }) => {
  // Redux state
  const categories = useAppSelector((state) => state.category.categories);
  const loading = useAppSelector((state) => state.global.loading);

  if (loading || !categories) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-center gap-4 py-6">
        <button
          onClick={() => onCategorySelect(null)}
          className={`
            px-6 py-3 rounded-full font-Barlow font-bold text-lg transition-all duration-300 shadow-md border-2
            ${selectedCategoryId === null
              ? "bg-red text-yellow border-red scale-105"
              : "bg-white text-black border-transparent hover:border-red hover:text-red hover:bg-yellow/10"
            }
          `}
        >
          Tümü
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`
              px-6 py-3 rounded-full font-Barlow font-bold text-lg transition-all duration-300 shadow-md border-2 whitespace-nowrap
              ${selectedCategoryId === category.id
                ? "bg-red text-yellow border-red scale-105"
                : "bg-white text-black border-transparent hover:border-red hover:text-red hover:bg-yellow/10"
              }
            `}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Categories;
