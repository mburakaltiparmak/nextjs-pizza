'use client';

import React from 'react';

// Özel toast içeriği bileşeni
export const CustomToastContent = ({ title, image, message }) => {
  return (
    <div className="flex items-center">
      {image && (
        <div className="flex-shrink-0 mr-3">
          <img 
            src={image} 
            alt="Toast image"
            className="h-8 w-8 rounded-full object-cover"
          />
        </div>
      )}
      <div>
        {title && <p className="font-normal">{title}</p>}
        {message && <p className="text-xs">{message}</p>}
      </div>
    </div>
  );
};

export default CustomToastContent;