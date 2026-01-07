import { setToken, setIsLogin, setEmail, setTokenExpiration } from "./userActions";
import { instance } from "@/lib/hooks";
import { getAccessToken, getUserEmail } from "@/lib/utils/tokenStorage";
import { getTokenExpiration } from "@/lib/utils/tokenUtils";

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

    // Unified token storage kullanımı
    const token = getAccessToken();

    // 4. Token varsa Redux store'a yükle ve header'ları ayarla
    if (token) {
      // Redux store'a token bilgisini yükle
      dispatch(setToken(token));
      dispatch(setIsLogin(true));

      // Axios header'larını ayarla
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Email bilgisini de yükle (eğer varsa)
      const email = getUserEmail();
      if (email) {
        dispatch(setEmail(email));
      }

      // Token bitiş süresini yükle
      const expiresAt = getTokenExpiration(token);
      const expiresIn = expiresAt ? Math.floor((expiresAt - Date.now()) / 1000) : null;
      dispatch(setTokenExpiration(expiresAt, expiresIn));

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
