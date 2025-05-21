"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/context/authContext";
import Loading from "@/app/loading";
import Link from "next/link";

export default function OAuth2CallbackPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [returnUrl, setReturnUrl] = useState("/");
  const processingRef = useRef(false);

  useEffect(() => {
    // Eğer işlem zaten başladıysa, tekrar başlatma
    if (processingRef.current) {
      console.log("OAuth callback işlemi zaten devam ediyor, atlanıyor");
      return;
    }

    async function processCallback() {
      try {
        // İşlem başladı olarak işaretle
        processingRef.current = true;
        setLoading(true);

        // Geri dönüş URL'sini al ve kaydet
        const savedReturnUrl = localStorage.getItem("authReturnUrl") || "/";
        setReturnUrl(savedReturnUrl);

        // Supabase session kontrolü
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw new Error(sessionError?.message || "Oturum bilgisi alınamadı");
        }

        console.log("Supabase oturumu bulundu, auth durumu yenileniyor...");

        // Auth durumunu yenile - bu AuthContext'teki checkAuth'ı tetikleyecek
        // ve kullanıcı bilgilerini yükleyecek
        await refreshAuth();

        // Geçici storage öğelerini temizle
        localStorage.removeItem("authReturnUrl");
        localStorage.removeItem("rememberMe");

        console.log("OAuth işlemi tamamlandı");

        // Artık otomatik yönlendirme yapmıyoruz
        setLoading(false);
      } catch (err) {
        console.error("OAuth callback işleme hatası:", err);
        setError(err.message || "Giriş işlemi sırasında bir hata oluştu.");

        // Hata durumunda giriş sayfasına yönlendir
        setTimeout(() => {
          router.push("/login?error=oauth");
        }, 2000);
      } finally {
        // İşlem tamamlandı - flag'i sıfırla
        setTimeout(() => {
          processingRef.current = false;
        }, 300);
      }
    }

    processCallback();
  }, [refreshAuth, router]);

  const handleManualNavigation = () => {
    router.push(returnUrl);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red">
      <div className="bg-yellow p-8 rounded-lg shadow-lg max-w-md text-center">
        {error ? (
          <>
            <h2 className="text-2xl font-bold text-red mb-4">Giriş Hatası</h2>
            <p className="mb-4">{error}</p>
            <p>Giriş sayfasına yönlendiriliyorsunuz...</p>
          </>
        ) : loading ? (
          <>
            <h2 className="text-2xl font-bold text-red mb-4">
              Giriş Yapılıyor
            </h2>
            <p className="mb-4">Oturumunuz başlatılıyor, lütfen bekleyin...</p>
            <Loading />
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-green-700 mb-4">
              Giriş Başarılı!
            </h2>
            <p className="mb-6">Google hesabınızla başarıyla giriş yaptınız.</p>
            <button
              onClick={handleManualNavigation}
              className="px-6 py-3 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Devam Et
            </button>
          </>
        )}
      </div>
    </div>
  );
}
