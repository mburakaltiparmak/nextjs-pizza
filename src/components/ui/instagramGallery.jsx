"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ExternalLink, Heart, MessageCircle, Share, Eye } from "lucide-react";

export const InstagramGallery = ({ photos }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [hoveredPhoto, setHoveredPhoto] = useState(null);

  // Fotoğraf seçme işlemi
  const openPhoto = useCallback((photo) => {
    setSelectedPhoto(photo);
    document.body.style.overflow = "hidden";
  }, []);

  // Fotoğrafı kapatma işlemi
  const closePhoto = useCallback(() => {
    setSelectedPhoto(null);
    document.body.style.overflow = "auto";
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
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Gallery Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow to-lightyellow px-6 py-3 rounded-2xl shadow-lg">
          <div className="w-8 h-8 bg-red rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              className="w-4 h-4 text-white"
              fill="currentColor"
            >
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
            </svg>
          </div>
          <div className="text-red font-bold text-lg font-Barlow">
            Instagram Galerimiz
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      <div
        className={`grid grid-cols-3 gap-3 md:gap-4 transition-all duration-700 ${
          loaded 
            ? "opacity-100 transform translate-y-0" 
            : "opacity-0 transform translate-y-8"
        }`}
      >
        {photos.map((photo, index) => (
          <div
            key={photo.id || index}
            className={`group relative overflow-hidden rounded-2xl cursor-pointer w-full aspect-square bg-gradient-to-br from-lightgray to-lightgray2 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 ${
              loaded ? 'animate-fadeInUp' : ''
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => openPhoto(photo)}
            onMouseEnter={() => setHoveredPhoto(index)}
            onMouseLeave={() => setHoveredPhoto(null)}
            onKeyDown={(e) => e.key === "Enter" && openPhoto(photo)}
            tabIndex={0}
            role="button"
            aria-label={`Instagram fotoğrafı ${index + 1}: ${
              photo.description || "Fotoğrafı görüntüle"
            }`}
          >
            {/* Image */}
            <Image
              src={photo.img}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={index < 4}
              alt={`Instagram fotoğrafı ${index + 1}`}
              className="object-cover w-full h-full transition-all duration-700 group-hover:scale-110"
              onLoad={() => index === 0 && setLoaded(true)}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
            
            {/* Hover Content */}
            <div className={`absolute inset-0 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform ${
              hoveredPhoto === index ? 'translate-y-0' : 'translate-y-4'
            }`}>
              {/* Top Icons */}
              <div className="flex justify-between items-start">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <div className="bg-red/80 backdrop-blur-sm rounded-full p-2">
                  <Heart className="w-4 h-4 text-white" />
                </div>
              </div>
              
              {/* Bottom Content */}
              <div className="text-center">
                <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <span className="text-white text-sm font-bold">Görüntüle</span>
                </div>
              </div>
            </div>

            {/* Border Animation */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-yellow rounded-2xl transition-all duration-300" />
          </div>
        ))}
      </div>

        

      {/* Enhanced Modal/Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="relative flex flex-col lg:flex-row max-w-6xl w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden animate-scaleIn shadow-2xl">
            {/* Close Button */}
            <button
              onClick={closePhoto}
              className="absolute top-6 right-6 z-10 bg-red text-white p-3 rounded-full hover:bg-darkred transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
              aria-label="Kapat"
            >
              <X size={24} />
            </button>

            {/* Image Section */}
            <div className="lg:w-2/3 bg-gradient-to-br from-lightgray to-lightgray2 flex items-center justify-center p-6">
              <div className="relative w-full max-w-2xl">
                <img
                  src={selectedPhoto.img}
                  alt="Instagram fotoğrafı"
                  className="w-full h-auto max-h-[70vh] object-contain rounded-2xl shadow-2xl"
                />
                
                {/* Image Border */}
                <div className="absolute inset-0 rounded-2xl ring-4 ring-yellow ring-opacity-50"></div>
              </div>
            </div>

            {/* Content Section */}
            <div className="lg:w-1/3 bg-white p-8 flex flex-col justify-between">
              {/* Header */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow to-lightyellow rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                      className="w-6 h-6 text-red"
                      fill="currentColor"
                    >
                      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                    </svg>
                  </div>
                  <div>
                    <h3 id="modal-title" className="text-red text-xl font-bold font-Barlow">
                      Teknolojik Yemekler
                    </h3>
                    <p className="text-gray text-sm">@teknolojikyemekler</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <p className="text-darkgray leading-relaxed font-medium">
                    {selectedPhoto.description ||
                      "Lezzetli menülerimizden bir seçki. Modern teknoloji ile geleneksel lezzetleri buluşturan eşsiz yemek deneyimimizi keşfedin. Sizi restoranımızda ağırlamaktan mutluluk duyarız."}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-8 p-4 bg-lightgray rounded-2xl">
                  <div className="flex items-center gap-2 text-red">
                    <Heart className="w-5 h-5" />
                    <span className="font-bold text-sm">1.2k</span>
                  </div>
                  <div className="flex items-center gap-2 text-red">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-bold text-sm">89</span>
                  </div>
                  <div className="flex items-center gap-2 text-red">
                    <Share className="w-5 h-5" />
                    <span className="font-bold text-sm">34</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-4">
                <a
                  href={`https://instagram.com/p/${selectedPhoto.code || ""}`}
                  className="w-full bg-gradient-to-r from-yellow to-lightyellow text-red font-bold py-4 px-6 rounded-2xl inline-flex items-center justify-center hover:from-lightyellow hover:to-yellow transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300"
                    fill="currentColor"
                  >
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                  </svg>
                  Instagram&apos;da Görüntüle
                  <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
      `}</style>
    </>
  );
};

export default InstagramGallery;