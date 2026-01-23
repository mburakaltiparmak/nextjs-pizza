"use client";
import { Star } from "lucide-react";

// Yıldız puanlama bileşeni
const RatingStars = ({ rating = 0, showValue = true, size = 16 }) => {
  // Null, undefined veya NaN kontrolü
  const validRating = typeof rating === "number" && !isNaN(rating) ? rating : 0;

  // Yıldız hesaplamaları
  const fullStars = Math.floor(validRating);
  const hasHalfStar = validRating % 1 >= 0.5;

  // Rating değerini formatla (string'e çevir ve 1 ondalık basamak göster)
  const formattedRating = validRating ? validRating.toFixed(1) : "0.0";

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
          {formattedRating}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
