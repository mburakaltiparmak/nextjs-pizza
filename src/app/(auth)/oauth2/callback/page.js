"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/context/authContext";
import Loading from "@/app/loading";

export default function OAuth2CallbackPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [error, setError] = useState(null);
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
        
        // Supabase session kontrolü
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error(sessionError?.message || "Oturum bilgisi alınamadı");
        }
        
        // Auth durumunu yenile - bu AuthContext'teki checkAuth'ı tetikleyecek
        // ve kullanıcı bilgilerini yükleyecek
        await refreshAuth();

        // Başarılı giriş - geri dönüş URL'sine yönlendir
        const returnUrl = localStorage.getItem("authReturnUrl") || "/";
        
        // Geçici storage öğelerini temizle
        localStorage.removeItem("authReturnUrl");
        localStorage.removeItem("tempRememberMe");
        
        console.log("OAuth işlemi tamamlandı, yönlendiriliyor:", returnUrl);
        
        // Yönlendir
        router.push(returnUrl);
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red">
      <div className="bg-yellow p-8 rounded-lg shadow-lg max-w-md text-center">
        {error ? (
          <>
            <h2 className="text-2xl font-bold text-red mb-4">Giriş Hatası</h2>
            <p className="mb-4">{error}</p>
            <p>Giriş sayfasına yönlendiriliyorsunuz...</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-red mb-4">Giriş Yapılıyor</h2>
            <p className="mb-4">Oturumunuz başlatılıyor, lütfen bekleyin...</p>
            <Loading />
          </>
        )}
      </div>
    </div>
  );
}