"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/store/actions/userActions";
import { useAppDispatch } from "@/lib/hooks";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function verifyUserEmail() {
      // URL parametrelerinden token al
      const token = searchParams.get("token");
      
      if (!token) {
        setStatus("error");
        setMessage("Token bulunamadı. Geçersiz bir bağlantı kullanıyor olabilirsiniz.");
        return;
      }

      console.log("Verifying email with token:", token);
      
      try {
        // Token doğrulama işlemini dispatch et ve sonucu bekle
        const result = await dispatch(verifyEmail(token));
        console.log("Verification result:", result);
        
        if (result && result.success) {
          setStatus("success");
          setMessage("E-posta adresiniz başarıyla doğrulandı!");
        } else {
          setStatus("error");
          setMessage(
            result && result.error
              ? result.error
              : "Doğrulama başarısız oldu. Token geçersiz veya süresi dolmuş olabilir."
          );
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setStatus("error");
        setMessage("Doğrulama sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
      }
    }

    verifyUserEmail();
  }, [searchParams, dispatch]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red p-4">
      <div className="bg-yellow p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-red text-5xl mb-4 animate-spin"
            />
            <h1 className="text-2xl font-bold text-red mb-4">
              E-posta Doğrulanıyor...
            </h1>
            <p className="text-gray-800">
              Lütfen bekleyin, e-posta adresiniz doğrulanıyor.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-green-600 text-5xl mb-4"
            />
            <h1 className="text-2xl font-bold text-red mb-4">
              Doğrulama Başarılı!
            </h1>
            <p className="text-gray-800 mb-6">{message}</p>
            <div className="flex flex-col space-y-3">
              <Link
                href="/login"
                className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Giriş Yapın
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-white text-red rounded-md hover:bg-gray-100 transition-colors"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <FontAwesomeIcon
              icon={faTimesCircle}
              className="text-red-600 text-5xl mb-4"
            />
            <h1 className="text-2xl font-bold text-red mb-4">
              Doğrulama Başarısız
            </h1>
            <p className="text-gray-800 mb-6">{message}</p>
            <div className="flex flex-col space-y-3">
              <Link
                href="/signup"
                className="px-4 py-2 bg-white text-red rounded-md hover:bg-gray-100 transition-colors"
              >
                Tekrar Kayıt Ol
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-white text-red rounded-md hover:bg-gray-100 transition-colors"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}