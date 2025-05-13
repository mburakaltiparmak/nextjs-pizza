"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
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

        console.log("OAuth callback işleniyor - Google OAuth2 için Supabase kullanılıyor");

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
        const providerType = userData.app_metadata?.provider || "google";

        console.log("User info:", {
          email: userData.email,
          id: userData.id,
          provider: providerType,
          metadata: userMetadata,
        });

        // "Beni hatırla" tercihini al (default: true)
        const rememberMe = localStorage.getItem("tempRememberMe") !== "false";
        console.log("RememberMe durumu:", rememberMe);

        // Redux store'u güncelle - Önemli: Auth provider olarak Google belirt
        dispatch(setToken(token));
        dispatch(setIsLogin(true));
        dispatch(setAuthProvider("google"));
        dispatch(setRememberMe(rememberMe));

        if (userData.email) {
          dispatch(setEmail(userData.email));
        }

        // Token'ı uygun storage'a kaydet
        const storage = rememberMe ? localStorage : sessionStorage;
        try {
          storage.setItem("token", token);
          storage.setItem("authProvider", "google"); // Auth provider'ı kaydet
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
          console.log("Backend ile senkronizasyon başlatılıyor - Google OAuth2 kullanıcısı");

          // Önceki hata mesajlarını temizle
          dispatch(setError(null));

          // ÖNEMLİ: Kullanıcı profil verilerini Redux store'a önden yükle
          dispatch(
            setUserProfile({
              name: userMetadata.name || userMetadata.full_name || "",
              surname: userMetadata.surname || userMetadata.family_name || "",
              email: userData.email,
              phoneNumber: userMetadata.phone_number || userMetadata.phone || "",
              role: "CUSTOMER", // Varsayılan rol
              // Gerekli diğer alanlar
            })
          );

          // Backend'e kullanıcı bilgilerini gönder ve senkronize et
          const syncResponse = await instance.post("/auth/sync-supabase-user", {
            email: userData.email,
            supabaseId: userData.id,
            name: userMetadata.name || userMetadata.full_name || "",
            surname: userMetadata.surname || userMetadata.family_name || "",
            phoneNumber: userMetadata.phone_number || userMetadata.phone || "",
            provider: "google" // Provider bilgisini ekledik
          });

          console.log("Backend senkronizasyonu tamamlandı:", syncResponse.data);
          
          // Backend'den gelen rol ve durum bilgilerini güncelle
          if (syncResponse.data && syncResponse.data.role) {
            dispatch(setUserProfile(prevProfile => ({
              ...prevProfile,
              role: syncResponse.data.role
            })));
          }

          // Auth durumunu tek seferde yenile
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
        dispatch(setSuccess("Google ile giriş başarılı"));

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
            "Google ile giriş sırasında bir hata oluştu: " + errorMsg
          )}`
        );
      } finally {
        // İşlem tamamlandı - biraz gecikmeli olarak flag'i sıfırla
        setTimeout(() => {
          processingRef.current = false;
        }, 300);
      }
    };

    // Tek seferlik çalıştır
    processAuth();

    // Cleanup function
    return () => {
      console.log("OAuthCallbackPage unmounting");
    };
  }, [dispatch, router, refreshAuth]); // Sadece mount olduğunda çalışması için bağımlılıkları koru

  // Yükleme durumdaysa Loading componentini göster
  return <Loading />;
}