"use client";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorMessage = searchParams.get("message") || "Bir hata oluştu";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-Londrina_Solid text-red">
            Teknolojik Yemekler
          </h1>
          <p className="text-gray-600 font-Barlow">
            Bir Hata Oluştu
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <svg
                className="w-8 h-8 text-red"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <h2 className="text-3xl font-Barlow font-bold text-gray-800 mb-2">
              İşlem Başarısız
            </h2>
            <p className="text-gray-600 font-Barlow text-center mb-6">
              {errorMessage}
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push("/login")}
                className="px-6 py-3 bg-red text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-Barlow font-medium flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 17l-5-5m0 0l5-5m-5 5h12"
                  ></path>
                </svg>
                Giriş Sayfasına Dön
              </button>
              <Link href="/">
                <button className="px-6 py-3 bg-yellow text-darkgray rounded-lg hover:bg-lightyellow transition-colors duration-200 font-Barlow font-medium flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    ></path>
                  </svg>
                  Ana Sayfa
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm font-Barlow">
          &copy; {new Date().getFullYear()} Teknolojik Yemekler. Tüm hakları
          saklıdır.
        </div>
      </div>
    </div>
  );
}
