"use client";
import { Star } from 'lucide-react';

// Yıldız puanlama bileşeni
const RatingStars = ({ rating, showValue = true, size = 16 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={
          i < fullStars 
            ? "text-yellow" 
            : (i === fullStars && hasHalfStar ? "text-yellow-300" : "text-gray-300")
        }>
          <Star 
            size={size} 
            fill={
              i < fullStars 
                ? "#F59E0B" 
                : (i === fullStars && hasHalfStar ? "#F59E0B" : "none")
            } 
          />
        </span>
      ))}
      {showValue && (
        <span className="ml-1 text-xs text-gray-500">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default RatingStars;