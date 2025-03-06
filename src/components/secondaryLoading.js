import React from 'react';
import { Loader2 } from 'lucide-react';

const SecondaryLoading = ({ text = "Yükleniyor", size = "medium" }) => {
  // Size classes
  const sizeClasses = {
    small: {
      container: "py-2",
      loader: "h-4 w-4",
      text: "text-xs"
    },
    medium: {
      container: "py-4",
      loader: "h-6 w-6",
      text: "text-sm"
    },
    large: {
      container: "py-6",
      loader: "h-8 w-8",
      text: "text-base"
    }
  };

  const { container, loader, text: textSize } = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className={`flex flex-col items-center justify-center w-full ${container}`}>
      <div className="relative">
        <Loader2 className={`animate-spin ${loader} text-red`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-1/3 h-1/3 bg-yellow rounded-full opacity-80`}></div>
        </div>
      </div>
      {text && (
        <p className={`mt-2 ${textSize} text-darkgray font-Barlow`}>{text}</p>
      )}
    </div>
  );
};

export default SecondaryLoading;