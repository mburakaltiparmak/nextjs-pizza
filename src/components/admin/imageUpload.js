"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setError, setLoading } from "@/lib/store/actions/globalActions";
import { useState, useEffect } from "react";
import SecondaryLoading from "../secondaryLoading";

const ImageUpload = ({ preview, onChange }) => {
  // State for tracking loading and errors
  const loading = useAppSelector((state) => state.global.loading);
  const error = useAppSelector((state) => state.global.error);
  const dispatch = useAppDispatch();
  //const [error, setError] = useState(null);
  const [localPreview, setLocalPreview] = useState(preview);

  // Update local preview when prop changes
  useEffect(() => {
    setLocalPreview(preview);
  }, [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    // Reset states
    dispatch(setError(null));
    dispatch(setLoading(true));

    // Validate file exists
    if (!file) {
      dispatch(setLoading(false));
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
      dispatch(setLoading(false));
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
    dispatch(setLoading(false));
  };

  return (
    <div className="">
      <div className="mt-1 flex flex-col items-center">
        <label className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-300 border-dashed cursor-pointer hover:bg-gray-50">
          {loading ? (
            <SecondaryLoading />
          ) : localPreview ? (
            <div className={`relative `}>
              <img
                src={localPreview}
                alt="Preview"
                className="h-[150px] max-md:h-[100px] mx-auto object-cover"
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
