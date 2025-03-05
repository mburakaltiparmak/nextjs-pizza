"use client";
import { useState, useEffect } from "react";

const ImageUpload = ({
  preview,
  onChange,
  
  onError,
  height = "h-[250px]",
}) => {
  // State for tracking loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localPreview, setLocalPreview] = useState(preview);

  // Update local preview when prop changes
  useEffect(() => {
    setLocalPreview(preview);
  }, [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    // Reset states
    setError(null);
    setIsLoading(true);

    // Validate file exists
    if (!file) {
      setIsLoading(false);
      return;
    }

    console.log(
      "ImageUpload: Seçilen dosya",
      file.name,
      file.type,
      file.size,
      "bytes"
    );
/*
    // Validate file size
    if (file.size > maxSize) {
      const errorMsg = `Dosya boyutu ${(maxSize / (1024 * 1024)).toFixed(
        1
      )}MB'dan küçük olmalıdır`;
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
      setIsLoading(false);
      return;
    }
*/
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);

    // Return file data to parent
    const imageData = {
      file,
      preview: previewUrl,
    };

    console.log("ImageUpload: onChange'e gönderilen veri", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      previewUrl: previewUrl ? "Mevcut" : "Yok",
    });

    onChange(imageData);
    setIsLoading(false);
  };

  return (
    <div className="">
      
      <div className="mt-1 flex flex-col items-center">
        <label className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-300 border-dashed cursor-pointer hover:bg-gray-50">
          {isLoading ? (
            <div className="flex items-center justify-center ">
              <svg
                className="animate-spin h-6 w-6 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : localPreview ? (
            <div className={`relative `}>
              <img
                src={localPreview}
                alt="Preview"
                className="h-[150px] mx-auto object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLocalPreview(null);
                  onChange({ file: null, preview: null });
                }}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center ">
              <svg
                className="w-8 h-8 mb-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="mb-2> text-sm text-gray-500">
                <span className="font-semibold">
                  Resim yüklemek için tıklayın
                </span>
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG (MAX {/*(maxSize / (1024 * 1024)).toFixed(1)*/}MB)
              </p>
            </div>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default ImageUpload;
