"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export const InstagramGallery = ({ photos }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Fotoğraf seçme işlemi
  const openPhoto = useCallback((photo) => {
    setSelectedPhoto(photo);
    document.body.style.overflow = "hidden"; // Sayfayı kaydırmayı engelle
  }, []);

  // Fotoğrafı kapatma işlemi
  const closePhoto = useCallback(() => {
    setSelectedPhoto(null);
    document.body.style.overflow = "auto"; // Sayfayı kaydırmayı tekrar etkinleştir
  }, []);

  // Fotoğrafın dışına tıklandığında kapatma
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        closePhoto();
      }
    },
    [closePhoto]
  );

  // ESC tuşuna basıldığında kapatma
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        closePhoto();
      }
    },
    [closePhoto]
  );

  // Klavye event listener'ı ekle/kaldır
  useEffect(() => {
    if (selectedPhoto) {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [selectedPhoto, handleKeyDown]);

  // Sayfa yüklendiğinde animasyon
  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <>
      <div
        className={`grid grid-cols-3 gap-2 transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      >
        {photos.map((photo, index) => (
          <div
            key={photo.id || index}
            className="relative overflow-hidden rounded cursor-pointer w-full aspect-square"
            onClick={() => openPhoto(photo)}
            onKeyDown={(e) => e.key === "Enter" && openPhoto(photo)}
            tabIndex={0}
            role="button"
            aria-label={`Instagram fotoğrafı ${index + 1}: ${
              photo.description || "Fotoğrafı görüntüle"
            }`}
          >
            <Image
              src={photo.img}
              fill
              sizes="(max-width: 768px) 33vw, 20vw"
              priority={index < 3} // İlk üç fotoğrafı öncelikli yükle
              alt={`Instagram fotoğrafı ${index + 1}`}
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
              onLoad={() => index === 0 && setLoaded(true)}
            />
            <div className="absolute inset-0 bg-red/30 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-xs font-medium px-2 py-1 bg-black/40 rounded">
                Görüntüle
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Instagram sayfasına yönlendiren link */}
      <div className="mt-4">
        <a
          href="https://instagram.com/teknolojikyemekler"
          className="text-yellow hover:text-yellow/80 hover:underline text-sm flex items-center gap-1 transition-colors duration-200"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram'da @teknolojikyemekler hesabını görüntüle"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            className="w-4 h-4"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
          </svg>
          <span>@teknolojikyemekler</span>
        </a>
      </div>

      {/* Modal/Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fadeIn"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="relative flex flex-col md:flex-row max-w-4xl w-full md:h-[500px] bg-darkgray rounded-lg overflow-hidden animate-scaleIn">
            <button
              onClick={closePhoto}
              className="absolute top-4 right-4 z-10 bg-red/80 text-white p-2 rounded-full hover:bg-red transition-colors"
              aria-label="Kapat"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col md:flex-row justify-center md:gap-4 p-4 items-center rounded-lg w-full">
              {/* Fotoğraf */}
              <div className="w-full md:w-1/2 flex-shrink-0">
                <img
                  src={selectedPhoto.img}
                  alt="Instagram fotoğrafı"
                  className="rounded-lg object-contain w-full max-h-[300px] md:max-h-[450px] border-2 border-lightgray"
                />
              </div>

              {/* Açıklama */}
              <div className="p-4 md:p-6 bg-darkgray text-lightgray flex flex-col w-full md:w-1/2">
                <h3
                  id="modal-title"
                  className="text-yellow text-lg font-bold mb-4"
                >
                  Teknolojik Yemekler
                </h3>
                <p className="mb-6 text-sm md:text-base">
                  {selectedPhoto.description ||
                    "Lezzetli menülerimizden bir seçki. Teknolojik bir lezzet deneyimi için sizi restoranımıza bekliyoruz."}
                </p>

                <div className="mt-auto">
                  <a
                    href={`https://instagram.com/p/${selectedPhoto.code || ""}`}
                    className="bg-yellow text-darkgray font-medium py-2 px-4 rounded inline-flex items-center hover:bg-yellow/90 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      aria-hidden="true"
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

// Buraya özel animasyonlar için CSS ekleyin
// Bu stil kodunu globals.css dosyanıza da ekleyebilirsiniz
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

.animate-scaleIn {
  animation: scaleIn 0.3s ease-out;
}
`;

export default InstagramGallery;
