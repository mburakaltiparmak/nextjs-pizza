"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export const InstagramGallery = ({ photos }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const openPhoto = (photo) => {
    setSelectedPhoto(photo);
    document.body.style.overflow = "hidden"; // Sayfayı kaydırmayı engelle
  };

  const closePhoto = () => {
    setSelectedPhoto(null);
    document.body.style.overflow = "auto"; // Sayfayı kaydırmayı tekrar etkinleştir
  };

  // Fotoğrafın dışına tıklandığında kapatma
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closePhoto();
    }
  };

  // ESC tuşuna basıldığında kapatma
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      closePhoto();
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded cursor-pointer w-full aspect-square"
            onClick={() => openPhoto(photo)}
          >
            <img
              src={photo.img}
              alt={`Instagram fotoğrafı ${index + 1}`}
              className="object-cover w-full h-fit transition-transform duration-300 hover:scale-110"
            />
            <div className="absolute inset-0 bg-red/30 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-xs font-medium">Görüntüle</span>
            </div>
          </div>
        ))}
      </div>

      {/* Instagram sayfasına yönlendiren link */}
      <div className="mt-4">
        <a
          href="https://instagram.com"
          className="text-yellow hover:underline text-sm flex items-center gap-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            className="w-4 h-4"
            fill="currentColor"
          >
            <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
          </svg>
          <span>@teknolojikyemekler</span>
        </a>
      </div>

      {/* Modal/Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative bg-darkgray rounded-lg overflow-hidden">
            <button
              onClick={closePhoto}
              className="absolute top-4 right-4 max-md:right-2 z-10 bg-red/80 text-white p-2 rounded-full hover:bg-red transition-colors"
              aria-label="Kapat"
            >
              <X size={20} />
            </button>

            <div className="flex flex-row justify-center gap-4 max-md:gap-1 py-4 max-w-[600px] md:max-w-[500px] items-center max-md:mt-2 md:flex-row">
              {/* Fotoğraf */}
              <div>
                <img
                  src={selectedPhoto.img}
                  alt="Instagram fotoğrafı"
                  className="max-h-[400px] max-md:max-w-[200px] max-w-[400px] rounded-lg object-center border-2 border-lightgray"
                />
              </div>

              {/* Açıklama */}
              <div className="p-2 bg-darkgray text-lightgray ">
                <h3 className="text-yellow text-lg max-md:text-base font-bold mb-4">
                  Teknolojik Yemekler
                </h3>
                <p className="mb-4 max-md:text-sm">
                  {selectedPhoto.description ||
                    "Lezzetli menülerimizden bir seçki. Teknolojik bir lezzet deneyimi için sizi restoranımıza bekliyoruz."}
                </p>

                <div className="mt-6 max-md:mt-4">
                  <a
                    href="https://instagram.com"
                    className="bg-yellow text-darkgray font-medium py-2 px-4 max-md:px-2 max-md:text-sm rounded inline-flex items-center hover:bg-yellow/90 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                    >
                      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                    </svg>
                    Instagram'da Gör
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstagramGallery;
