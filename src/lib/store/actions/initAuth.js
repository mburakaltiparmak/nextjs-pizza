import { setToken, setIsLogin, setEmail } from "./userActions";
import { instance } from "@/lib/hooks";
import { extractSupabaseToken } from "@/lib/supabaseSync";

// Uygulama başlangıcında token'ı Redux'a yükle
export const initializeAuth = () => async (dispatch) => {
  try {
    // Önce tarayıcı ortamında olup olmadığımızı kontrol et
    const isBrowser = typeof window !== "undefined";

    if (!isBrowser) {
      // Sunucu tarafında çalışıyoruz, erken çık
      return false;
    }

    // Tarayıcı tarafında çalışıyoruz, devam edebiliriz
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    const storage = rememberMe ? localStorage : sessionStorage;

    // Backend'in yeni formatı: accessToken ve refreshToken
    let token = storage.getItem("accessToken");

    // 2. Eğer accessToken yoksa, eski token formatını kontrol et (backward compatibility)
    if (!token) {
      token = storage.getItem("token");
    }

    // 3. Eğer hala token yoksa, Supabase token'ını kontrol et
    if (!token) {
      token = extractSupabaseToken();

      // Supabase token varsa localStorage'a kaydet
      if (token) {
        storage.setItem("accessToken", token);
      }
    }

    // 4. Token varsa Redux store'a yükle ve header'ları ayarla
    if (token) {
      // Redux store'a token bilgisini yükle
      dispatch(setToken(token));
      dispatch(setIsLogin(true));

      // Axios header'larını ayarla
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Email bilgisini de yükle (eğer varsa)
      const email = storage.getItem("userEmail");
      if (email) {
        dispatch(setEmail(email));
      }

      console.log(
        "💾 Auth bilgileri başlatıldı, token:",
        token.substring(0, 10) + "..."
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error("Auth bilgileri başlatılırken hata:", error);
    return false;
  }
};
