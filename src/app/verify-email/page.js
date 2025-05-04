"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { verifyEmail } from "@/lib/store/actions/userActions";
import {
  faCheckCircle,
  faSpinner,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useAppDispatch } from "@/lib/hooks"; // useAppDispatch hook'unu import ettik

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [message, setMessage] = useState("Email adresiniz doğrulanıyor...");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const dispatch = useAppDispatch(); // Redux dispatch fonksiyonunu aldık

  useEffect(() => {
    // Debug bilgisi
    console.log("VerifyEmailPage yükleniyor, token:", token);

    const verifyUserEmail = async () => {
      if (!token) {
        console.log("Token bulunamadı!");
        setVerificationStatus("error");
        setMessage("Doğrulama bağlantısı geçersiz. Token bulunamadı.");
        return;
      }

      try {
        console.log("verifyEmail action'ı dispatch ediliyor...");
        const result = await dispatch(verifyEmail(token));
        console.log("verifyEmail sonucu:", result);

        if (result && result.success) {
          console.log("Doğrulama başarılı!");
          setVerificationStatus("success");
          setMessage("Email adresiniz başarıyla doğrulandı.");

          // 3 saniye sonra giriş sayfasına yönlendir
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else {
          console.log("Doğrulama başarısız:", result?.error);
          setVerificationStatus("error");
          setMessage(
            result && result.error
              ? result.error
              : "Doğrulama başarısız oldu. Token geçersiz veya süresi dolmuş olabilir."
          );
        }
      } catch (error) {
        console.error("Doğrulama işlemi hata:", error);
        setVerificationStatus("error");
        setMessage(
          "Doğrulama sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin."
        );
      }
    };

    verifyUserEmail();
  }, [token, router, dispatch]);

  // Renderer bileşeni aynı (değişiklik yok)
  return (
    <div className="flex flex-col min-h-screen bg-red items-center justify-center font-Barlow">
      <div className="bg-yellow shadow-md rounded-lg max-w-md mx-auto p-8 w-full text-center">
        {verificationStatus === "pending" && (
          <div className="flex flex-col items-center space-y-4">
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-red text-4xl animate-spin"
            />
            <h2 className="text-2xl font-bold tracking-tight text-red font-Barlow">
              Email Doğrulanıyor
            </h2>
            <p className="text-gray-800 font-Quattrocento_Sans">
              Lütfen bekleyin, email adresiniz doğrulanıyor...
            </p>
          </div>
        )}

        {verificationStatus === "success" && (
          <div className="flex flex-col items-center space-y-4">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-green-600 text-6xl"
            />
            <h2 className="text-3xl font-bold tracking-tight text-red font-Barlow">
              Email Doğrulandı!
            </h2>
            <p className="text-gray-800 font-Quattrocento_Sans">{message}</p>
            <p className="text-sm text-gray-600">
              3 saniye içinde giriş sayfasına yönlendirileceksiniz.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red"
            >
              Giriş Yap
            </Link>
          </div>
        )}

        {verificationStatus === "error" && (
          <div className="flex flex-col items-center space-y-4">
            <FontAwesomeIcon
              icon={faTimesCircle}
              className="text-red-600 text-6xl"
            />
            <h2 className="text-3xl font-bold tracking-tight text-red font-Barlow">
              Doğrulama Başarısız
            </h2>
            <p className="text-gray-800 font-Quattrocento_Sans">{message}</p>
            <div className="bg-white p-4 rounded-md mb-2 border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>Yardım:</strong> Doğrulama bağlantısının süresi 24 saat
                sonra dolar. Eğer süre dolduysa, yeni bir doğrulama bağlantısı
                talep edebilirsiniz.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
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
        )}
      </div>
    </div>
  );
}
