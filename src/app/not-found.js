import React from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="bg-red min-h-screen flex flex-col items-center justify-center text-lightgray">
      <AlertCircle className="h-24 w-24 text-yellow mb-4" />
      <h1 className="text-4xl font-Barlow font-bold mb-2">404</h1>
      <h2 className="text-2xl font-Satisfy mb-4">Sayfa Bulunamadı</h2>
      <p className="text-xl mb-8">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
      <Link href="/" className="bg-yellow text-darkgray py-2 px-4 rounded-md hover:bg-lightgray hover:text-red transition-colors duration-300">
        Ana Sayfaya Dön
      </Link>
    </div>
  );
};

export default NotFound;