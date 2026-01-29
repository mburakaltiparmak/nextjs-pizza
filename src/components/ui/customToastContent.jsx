'use client';

import React from 'react';
import Image from "next/image";

// Özel toast içeriği bileşeni
export const CustomToastContent = ({ title, image, message }) => {
  return (
    <div className="flex items-center text-sm">
      {image && (
        <div className="flex-shrink-0 mr-3 relative w-8 h-8">
          <Image
            src={image}
            alt="Toast image"
            fill
            className="rounded-full object-cover"
            sizes="32px"
          />
        </div>
      )}
      <div>
        {title && <p className="font-light">{title}</p>}
        {message && <p className="text-xs">{message}</p>}
      </div>
    </div>
  );
};

export default CustomToastContent;