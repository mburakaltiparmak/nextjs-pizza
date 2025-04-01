"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { instance } from "@/lib/hooks";
import Link from "next/link";

const VerifyEmailPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("verifying"); // "verifying", "success", "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setStatus("error");
      setMessage("Doğrulama bağlantısı geçersiz.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await instance.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage("E-posta adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data || 
          "Doğrulama işlemi başarısız oldu. Bağlantınız geçersiz veya süresi dolmuş olabilir."
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4 bg-lightgray p-10 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-darkgray font-Londrina_Solid">
            E-posta Doğrulama
          </h2>
        </div>

        {status === "verifying" && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red mx-auto"></div>
            <p className="mt-4 text-darkgray font-Barlow">Doğrulama işlemi yapılıyor...</p>
          </div>
        )}

        {status === "success" && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{message}</span>
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-lightgray bg-red hover:bg-yellow hover:text-red focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="bg-red border border-red text-lightgray px-4 py-3 rounded relative">
            <span className="block sm:inline">{message}</span>
            <div className="mt-6 text-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-red bg-lightgray hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red"
              >
                Yeniden Kayıt Ol
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;