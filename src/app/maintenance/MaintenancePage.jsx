"use client";

import { useEffect, useState } from 'react';
import { Construction, Pizza, Code, Wrench, Clock } from 'lucide-react';

const MaintenancePage = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkgray via-darkgray to-red flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-4xl w-full">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border-4 border-yellow">
          {/* Icon section with animation */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-yellow to-red p-6 rounded-full">
                <Construction className="w-16 h-16 md:w-20 md:h-20 text-darkgray animate-bounce" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-Londrina_Solid text-center text-darkgray mb-4">
            <span className="text-red">Teknolojik</span>
            <br />
            <span className="text-yellow">Yemekler</span>
          </h1>

          {/* Subtitle with typing effect */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-Barlow font-bold text-darkgray mb-3">
              Bakımdayız! 🔧
            </h2>
            <p className="text-lg md:text-xl font-Quattrocento_Sans text-gray-700">
              Sitemiz şu anda yenileniyor
            </p>
          </div>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-1 w-20 bg-gradient-to-r from-transparent to-yellow rounded"></div>
            <Pizza className="w-8 h-8 text-red animate-spin-slow" />
            <div className="h-1 w-20 bg-gradient-to-l from-transparent to-red rounded"></div>
          </div>

          {/* Description */}
          <div className="bg-lightgray/50 rounded-2xl p-6 md:p-8 mb-8">
            <p className="text-center text-darkgray font-Barlow text-lg md:text-xl leading-relaxed mb-4">
              Sizlere daha iyi hizmet verebilmek için sistemimizi güncelliyoruz. 
              <br className="hidden md:block" />
              Kısa süre içinde yeni ve geliştirilmiş özelliklerle karşınızda olacağız!
            </p>
            
            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-xl p-4 shadow-md transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow/20 p-3 rounded-lg">
                    <Code className="w-6 h-6 text-red" />
                  </div>
                  <div>
                    <h3 className="font-Barlow font-bold text-darkgray">Yeni Özellikler</h3>
                    <p className="text-sm text-gray-600 font-Quattrocento_Sans">Geliştiriliyor</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-3">
                  <div className="bg-red/20 p-3 rounded-lg">
                    <Wrench className="w-6 h-6 text-yellow" />
                  </div>
                  <div>
                    <h3 className="font-Barlow font-bold text-darkgray">Performans</h3>
                    <p className="text-sm text-gray-600 font-Quattrocento_Sans">İyileştiriliyor</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow/20 p-3 rounded-lg">
                    <Pizza className="w-6 h-6 text-red" />
                  </div>
                  <div>
                    <h3 className="font-Barlow font-bold text-darkgray">Menü</h3>
                    <p className="text-sm text-gray-600 font-Quattrocento_Sans">Güncelleniyor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Time indicator */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-red animate-pulse" />
            <p className="text-darkgray font-Barlow text-sm md:text-base">
              Tahmini süre: <span className="font-bold text-red">Yakında tamamlanacak</span>
            </p>
          </div>

          {/* Contact info */}
          <div className="text-center">
            <p className="text-gray-600 font-Quattrocento_Sans text-sm md:text-base mb-2">
              Acil durumlar için bizimle iletişime geçebilirsiniz:
            </p>
            <a 
              href="mailto:aciktim@teknolojikyemekler.com" 
              className="text-red hover:text-yellow font-Barlow font-semibold text-lg transition-colors duration-300"
            >
              aciktim@teknolojikyemekler.com
            </a>
            <div className="mt-2">
              <a 
                href="tel:+902161234567" 
                className="text-red hover:text-yellow font-Barlow font-semibold transition-colors duration-300"
              >
                +90 216 123 45 67
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-300">
            <p className="text-center text-gray-500 text-sm font-Quattrocento_Sans">
              &copy; {new Date().getFullYear()} Teknolojik Yemekler. Tüm hakları saklıdır.
            </p>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute -top-10 -left-10 opacity-20">
          <Pizza className="w-32 h-32 text-yellow animate-float" />
        </div>
        <div className="absolute -bottom-10 -right-10 opacity-20">
          <Code className="w-32 h-32 text-red animate-float-delayed" />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(-5deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite 1s;
        }

        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default MaintenancePage;