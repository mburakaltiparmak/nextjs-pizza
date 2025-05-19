// app/signup/success/page.jsx
"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faEnvelope } from "@fortawesome/free-solid-svg-icons";

export default function SignupSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red p-4 font-Barlow">
      <div className="bg-yellow p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <FontAwesomeIcon 
          icon={faCheckCircle} 
          className="text-green-600 text-5xl mb-4" 
        />
        
        <h1 className="text-2xl font-bold text-red mb-4">
          Kayıt İşlemi Başarılı!
        </h1>
        
        <div className="bg-white p-4 rounded-md mb-6">
          <FontAwesomeIcon 
            icon={faEnvelope} 
            className="text-red text-3xl mb-2" 
          />
          <p className="text-gray-800 mb-4">
            E-posta adresinize bir doğrulama bağlantısı gönderdik. Lütfen e-postanızı kontrol edin ve hesabınızı doğrulamak için bağlantıya tıklayın.
          </p>
          <p className="text-sm text-gray-600">
            Eğer e-postayı göremiyorsanız, spam klasörünüzü kontrol etmeyi unutmayın.
          </p>
        </div>
        
        <div className="flex flex-col space-y-3">
          <Link
            href="/login"
            className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Giriş Sayfasına Git
          </Link>
          
          <Link
            href="/"
            className="px-4 py-2 bg-white text-red rounded-md hover:bg-gray-100 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}