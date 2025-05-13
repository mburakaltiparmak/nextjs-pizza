"use client";
import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  fetchUserProfile,
  setIsLogin,
  setToken,
  setAuthProvider,
  setEmail,
  setRememberMe,
  setUserProfile,
} from "@/lib/store/actions/userActions";
import {
  setSuccess,
  setError,
  setLoading,
  handleApiError,
} from "@/lib/store/actions/globalActions";
import { supabase } from "@/lib/supabase";
import { instance } from "@/lib/hooks";
import { useAuthContext } from "@/lib/context/authContext";
import Loading from "@/app/loading";

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const processingRef = useRef(false);
  const hasNavigatedRef = useRef(false);
  const { refreshAuth } = useAuthContext([], "/", false);

  // Güvenli yönlendirme fonksiyonu - tekrarlı yönlendirmeleri önler
  const navigateSafely = (url) => {
    if (!hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      router.push(url);
    } else {
      console.log("Yönlendirme zaten yapıldı, ek yönlendirme atlanıyor");
    }
  };

  useEffect(() => {
    // Eğer işlem zaten başladıysa, tekrar başlatma
    if (processingRef.current) {
      console.log("OAuth callback işlemi zaten devam ediyor, atlanıyor");
      return;
    }

    const processAuth = async () => {
      try {
        // İşlem başladı olarak işaretle
        processingRef.current = true;
        dispatch(setLoading(true));

        console.log("OAuth callback işleniyor - başlangıç");

        // URL parametrelerini kontrol et
        const hash = window.location.hash;
        const query = new URLSearchParams(window.location.search);
        console.log(
          "URL parametreleri kontrol ediliyor:",
          Object.fromEntries(query.entries())
        );

        // Supabase oturumunu kontrol et
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Supabase session hatası:", sessionError);
          navigateSafely("/error?message=Kimlik+doğrulama+bilgisi+alınamadı");
          return;
        }

        let currentSession = session;

        if (!currentSession) {
          console.error("Supabase oturumu bulunamadı");

          // URL'den hata kontrolü
          const errorMessage =
            query.get("error_description") || query.get("error");
          if (errorMessage) {
            console.error("OAuth error from URL:", errorMessage);
            navigateSafely(
              `/error?message=${encodeURIComponent(
                "Authentication error: " + errorMessage
              )}`
            );
            return;
          }

          // Kod varsa oturum için değiş tokuş et
          const code = query.get("code");
          if (code) {
            console.log(
              "URL'de authorization code bulundu, oturum için değiştiriliyor"
            );
            const { data, error } = await supabase.auth.exchangeCodeForSession(
              code
            );

            if (error || !data.session) {
              console.error("Session değişimi hatası:", error);
              navigateSafely(
                "/error?message=Kimlik+doğrulama+işlemi+başarısız+oldu"
              );
              return;
            }

            // Yeni oturumu kullan
            currentSession = data.session;
          } else {
            navigateSafely("/error?message=Oturum+bilgisi+alınamadı");
            return;
          }
        }

        // Geçerli bir oturumumuz var
        const token = currentSession.access_token;
        console.log("Token durumu:", token ? "mevcut" : "eksik");

        // Önemli: Authorization header'ı ayarla
        instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Kullanıcı bilgisini al
        const userData = currentSession.user;
        const userMetadata = userData.user_metadata || {};

        console.log("User info:", {
          email: userData.email,
          id: userData.id,
          metadata: userMetadata,
        });

        // "Beni hatırla" tercihini al
        const rememberMe = localStorage.getItem("tempRememberMe") === "true";
        console.log("RememberMe durumu:", rememberMe);

        // Redux store'u güncelle
        dispatch(setToken(token));
        dispatch(setIsLogin(true));
        dispatch(setAuthProvider("supabase"));
        dispatch(setRememberMe(rememberMe));

        if (userData.email) {
          dispatch(setEmail(userData.email));
        }

        // Token'ı uygun storage'a kaydet
        const storage = rememberMe ? localStorage : sessionStorage;
        try {
          storage.setItem("token", token);
          if (userData.email) {
            storage.setItem("userEmail", userData.email);
          }
          console.log(
            "Token başarıyla saklandı:",
            storage === localStorage ? "localStorage" : "sessionStorage"
          );
        } catch (storageError) {
          console.error("Token depolama hatası:", storageError);
        }

        // "Beni hatırla" durumunu localStorage'a kaydet
        localStorage.setItem("rememberMe", rememberMe ? "true" : "false");

        // Backend ile senkronize et ve profil bilgilerini getir
        try {
          console.log("Backend ile senkronizasyon başlatılıyor");

          // Önceki hata mesajlarını temizle
          dispatch(setError(null));

          // ÖNEMLİ: Kullanıcı profil verilerini Redux store'a önden yükle
          // Bu şekilde UI, yönlendirmeden önce profil verilerine sahip olacak
          dispatch(
            setUserProfile({
              name: userMetadata.name || userMetadata.full_name || "",
              surname: userMetadata.surname || userMetadata.family_name || "",
              email: userData.email,
              phoneNumber:
                userMetadata.phone_number || userMetadata.phone || "",
              // Gerekli diğer alanlar
            })
          );

          // Tek bir post işlemi ile backend'e kullanıcı bilgilerini gönder
          await instance.post("/auth/sync-supabase-user", {
            email: userData.email,
            supabaseId: userData.id,
            name: userMetadata.name || userMetadata.full_name || "",
            surname: userMetadata.surname || userMetadata.family_name || "",
            phoneNumber: userMetadata.phone_number || userMetadata.phone || "",
          });

          console.log("Backend senkronizasyonu tamamlandı");

          // Auth durumunu tek seferde yenile
          // Bu şekilde tekrarlayan fetchUserProfile çağrıları önlenir
          await refreshAuth();
        } catch (syncError) {
          // Backend hatası durumunda handleApiError ile yönet
          const errorResult = handleApiError(syncError, dispatch, "OAuth Sync");

          // Eğer yetkilendirme hatası varsa login sayfasına yönlendir
          if (errorResult === "auth/expired") {
            navigateSafely("/login?expired=true");
            return;
          }

          console.error("Backend senkronizasyon hatası:", syncError);
          // Senkronizasyon hatası olsa bile devam et
        }

        // Başarı mesajı
        dispatch(setSuccess("Giriş başarılı"));

        // Geçici "Beni hatırla" verisini temizle
        localStorage.removeItem("tempRememberMe");

        // Geri dönüş URL'ine yönlendir
        const returnUrl = localStorage.getItem("authReturnUrl") || "/";
        localStorage.removeItem("authReturnUrl"); // Temizle

        console.log("OAuth işlemi tamamlandı, yönlendiriliyor:", returnUrl);

        // Loading state'i kapat
        dispatch(setLoading(false));

        // Güvenli yönlendirme fonksiyonunu kullan
        navigateSafely(returnUrl);
      } catch (error) {
        console.error("OAuth işleme hatası:", error);

        // Hata detaylarını logla
        if (error.response) {
          console.error("Response hata detayları:", {
            status: error.response.status,
            data: error.response.data,
          });
        }

        // Genel hata yönetimi
        handleApiError(error, dispatch, "OAuth Process");

        // Loading state'i kapat
        dispatch(setLoading(false));

        // Hata sayfasına güvenli yönlendirme yap
        const errorMsg = error.message || "Unknown error";
        navigateSafely(
          `/error?message=${encodeURIComponent(
            "Giriş işlemi sırasında bir hata oluştu: " + errorMsg
          )}`
        );
      } finally {
        // İşlem tamamlandı - biraz gecikmeli olarak flag'i sıfırla
        // (olası race condition'ları önlemek için)
        setTimeout(() => {
          processingRef.current = false;
        }, 300);
      }
    };

    // Tek seferlik çalıştır
    processAuth();

    // Cleanup function
    return () => {
      // Component unmount olursa
      console.log("OAuthCallbackPage unmounting");
    };
  }, [dispatch, router, refreshAuth]); // Sadece mount olduğunda çalışması için bağımlılıkları koru

  // Yükleme durumdaysa Loading componentini göster
  return <Loading />;
}
