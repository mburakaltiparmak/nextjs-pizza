"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function SignupSuccessPage() {
  const router = useRouter();

  // Kullanıcı doğrudan bu sayfaya erişirse 5 saniye sonra otomatik olarak login sayfasına yönlendir
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.push("/login");
    }, 5000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-red items-center justify-center ">
      <div className="bg-yellow shadow-md rounded-lg max-w-md mx-auto p-8 w-full text-center">
        <div className="flex justify-center mb-4">
          <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-6xl" />
        </div>
        
        <h2 className="text-3xl font-bold tracking-tight text-red font-Barlow mb-4">
          Kayıt Başarılı!
        </h2>
        
        <p className="text-gray-800 mb-6 font-Quattrocento_Sans">
          Email adresinize bir doğrulama bağlantısı gönderdik. Lütfen hesabınızı aktifleştirmek için email'inizi kontrol edin.
        </p>
        
        <div className="bg-white p-4 rounded-md mb-6 border border-gray-200">
          <p className="text-sm text-gray-700">
            <strong>Not:</strong> Doğrulama email'ini göremiyorsanız, lütfen spam klasörünüzü kontrol edin.
          </p>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Otomatik olarak 5 saniye içinde giriş sayfasına yönlendirileceksiniz.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/login" 
            className="inline-block px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red"
          >
            Giriş Yap
          </Link>
          
          <Link 
            href="/" 
            className="inline-block px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}