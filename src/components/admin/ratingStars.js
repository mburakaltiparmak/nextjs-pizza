"use client";
import { Star } from "lucide-react";

// Yıldız puanlama bileşeni
const RatingStars = ({ rating, showValue = true, size = 16 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={
            i < fullStars
              ? "text-yellow"
              : i === fullStars && hasHalfStar
              ? "text-yellow/70"
              : "text-lightgray2"
          }
        >
          <Star
            size={size}
            fill={
              i < fullStars
                ? "#FDC913"
                : i === fullStars && hasHalfStar
                ? "#FDC913"
                : "none"
            }
          />
        </span>
      ))}
      {showValue && (
        <span className="text-xs font-semibold font-Barlow text-darkgray ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
