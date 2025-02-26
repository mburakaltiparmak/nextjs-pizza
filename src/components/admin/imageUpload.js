"use client";
import { useState } from 'react';

const ImageUpload = ({ 
  preview, 
  onChange, 
  maxSize = 2 * 1024 * 1024, // Default 2MB
  label = "Resim", 
  onError
}) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > maxSize) {
      if (onError) {
        onError(`Dosya boyutu ${maxSize / (1024 * 1024)}MB'dan küçük olmalıdır`);
      }
      return;
    }
    
    onChange({
      file,
      preview: URL.createObjectURL(file)
    });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="mt-1 flex items-center">
        <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border border-gray-300 border-dashed cursor-pointer hover:bg-gray-50">
          {preview ? (
            <div className={`relative object-cover max-w-[250px] mb-4`}>
              <img
                src={preview}
                alt="Preview"
                className="h-full mx-auto object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Resim yüklemek için tıklayın</span></p>
              <p className="text-xs text-gray-500">PNG, JPG (MAX {maxSize / (1024 * 1024)}MB)</p>
            </div>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>
      </div>
    </div>
  );
};

export default ImageUpload;