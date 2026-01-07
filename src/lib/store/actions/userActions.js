// lib/store/actions/userActions.js
import { instance } from "@/lib/hooks";
import { getTokenExpiration } from "@/lib/utils/tokenUtils";
import { setTokens, clearTokens, getAccessToken, getRefreshToken, getRememberMe, setRememberMe as setRememberMeStorage } from "@/lib/utils/tokenStorage";
import { tokenRefreshManager } from "@/lib/utils/tokenRefreshManager";
import { setError, setLoading, setSuccess } from "./globalActions";
import { fetchStates } from "../constants";
import { initializeAuth } from "./initAuth";
import { supabase } from "@/lib/supabase";

export const userActions = {
  SET_EMAIL: "SET_EMAIL",
  SET_REMEMBER_ME: "SET_REMEMBER_ME",
  SET_IS_LOGIN: "SET_IS_LOGIN",
  SET_TOKEN: "SET_TOKEN",
  SET_USER_PROFILE: "SET_USER_PROFILE",
  SET_USER_STATUS: "SET_USER_STATUS",
  SET_USER_ROLE: "SET_USER_ROLE",
  SET_FETCH_STATE: "SET_FETCH_STATE",
  CLEAR_USER_DATA: "CLEAR_USER_DATA",
  SET_AUTH_PROVIDER: "SET_AUTH_PROVIDER",
  SET_USER_ADDRESSES: "SET_USER_ADDRESSES",
  ADD_USER_ADDRESS: "ADD_USER_ADDRESS",
  UPDATE_USER_ADDRESS: "UPDATE_USER_ADDRESS",
  REMOVE_USER_ADDRESS: "REMOVE_USER_ADDRESS",
  SET_DEFAULT_ADDRESS: "SET_DEFAULT_ADDRESS",
  SET_TOKEN_EXPIRATION: "SET_TOKEN_EXPIRATION",
};

export const setEmail = (email) => ({
  type: userActions.SET_EMAIL,
  payload: email,
});

export const setRememberMe = (rememberMe) => {
  setRememberMeStorage(rememberMe);
  return {
    type: userActions.SET_REMEMBER_ME,
    payload: rememberMe,
  };
};

export const setIsLogin = (isLogin) => ({
  type: userActions.SET_IS_LOGIN,
  payload: isLogin,
});

export const setToken = (token) => ({
  type: userActions.SET_TOKEN,
  payload: token,
});

export const setUserProfile = (profile) => ({
  type: userActions.SET_USER_PROFILE,
  payload: profile,
});

export const setUserStatus = (status) => ({
  type: userActions.SET_USER_STATUS,
  payload: status,
});

export const setUserRole = (role) => ({
  type: userActions.SET_USER_ROLE,
  payload: role,
});

export const setUserFetchState = (fetchState) => ({
  type: userActions.SET_FETCH_STATE,
  payload: fetchState,
});

export const clearUserData = () => ({
  type: userActions.CLEAR_USER_DATA,
});

export const setAuthProvider = (provider) => ({
  type: userActions.SET_AUTH_PROVIDER,
  payload: provider,
});

export const setUserAddresses = (addresses) => ({
  type: userActions.SET_USER_ADDRESSES,
  payload: addresses,
});

export const addUserAddress = (address) => ({
  type: userActions.ADD_USER_ADDRESS,
  payload: address,
});

export const updateUserAddress = (address) => ({
  type: userActions.UPDATE_USER_ADDRESS,
  payload: address,
});

export const removeUserAddress = (addressId) => ({
  type: userActions.REMOVE_USER_ADDRESS,
  payload: addressId,
});

export const setDefaultAddress = (addressId) => ({
  type: userActions.SET_DEFAULT_ADDRESS,
  payload: addressId,
});

export const setTokenExpiration = (expiresAt, expiresIn) => ({
  type: userActions.SET_TOKEN_EXPIRATION,
  payload: { expiresAt, expiresIn },
});

// Token depolama fonksiyonu artık tokenStorage.js içinde
// const storeToken = ... kaldırıldı

// Login işlemi - yeni backend response formatı için güncellendi
export const login = (formData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    console.log("Login formData received:", formData);

    // Backend ile login
    const response = await instance.post("/auth/login", {
      email: formData.username,
      password: formData.password,
    });

    // Backend'den accessToken, refreshToken ve user objesi gelir
    if (!response.data || !response.data.accessToken) {
      throw new Error("Access token alınamadı");
    }

    const { accessToken, refreshToken, user } = response.data;

    // Redux store'u güncelle
    dispatch(setToken(accessToken)); // Access token'ı kaydet
    dispatch(setIsLogin(true));
    dispatch(setAuthProvider("email"));
    dispatch(setRememberMe(formData.rememberMe));

    // User objesinden bilgileri güncelle
    if (user) {
      dispatch(setEmail(user.email));
      dispatch(setUserRole(user.role));
      dispatch(setUserStatus(user.status));
      dispatch(setUserProfile({
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        status: user.status,
      }));
    }

    // Access token, refresh token ve email bilgilerini storage'a kaydet
    setTokens(
      accessToken,
      refreshToken,
      user?.email || formData.username,
      formData.rememberMe
    );

    instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    // Expire bilgisini kaydet
    const expiresAt = getTokenExpiration(accessToken);
    // Backend expiresIn dönebilir, dönmezse hesaptan
    const expiresIn = response.data.expiresIn || (expiresAt ? Math.floor((expiresAt - Date.now()) / 1000) : null);
    dispatch(setTokenExpiration(expiresAt, expiresIn));

    dispatch(setLoading(false));
    dispatch(setSuccess("Giriş başarılı"));
    return { accessToken, user };
  } catch (err) {
    console.error("Login error full details:", err);

    let errorMessage = "Giriş başarısız oldu";
    if (err.response && err.response.data) {
      errorMessage = err.response.data.message || errorMessage;
    } else if (err.message) {
      errorMessage = err.message;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

// Google OAuth başlatma - Supabase'e yönlendirme yapacak
export const initiateGoogleLogin = () => async () => {
  try {
    console.log("Google login başlatılıyor...");

    // Mevcut URL'i kaydet (geri dönüş için)
    const returnUrl = window.location.pathname;
    localStorage.setItem("authReturnUrl", returnUrl);
    console.log("Geri dönüş URL'i kaydedildi:", returnUrl);

    // Beni Hatırla tercihini geçici olarak sakla
    const rememberMe = getRememberMe();
    setRememberMeStorage(rememberMe);
    console.log("RememberMe durumu kaydedildi:", rememberMe);

    // Supabase OAuth başlat - callback sayfasına yönlendirecek
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/oauth2/callback`, // Callback sayfasını belirt
      },
    });
  } catch (error) {
    console.error("Google login başlatma hatası:", error);
  }
};

// OAuth callback işleyici - Supabase token için güncellendi
export const handleOAuthCallback =
  (token, rememberMe = true) =>
    async (dispatch) => {
      if (!token) return { error: "Token bulunamadı" };

      try {
        dispatch(setLoading(true));

        // Redux store'u güncelle
        dispatch(setToken(token));
        dispatch(setIsLogin(true));
        dispatch(setAuthProvider("google"));
        dispatch(setRememberMe(rememberMe));

        // Token bilgisini kaydet
        setTokens(token, "", "", rememberMe);
        instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Expire bilgisini kaydet
        const expiresAt = getTokenExpiration(token);
        const expiresIn = expiresAt ? Math.floor((expiresAt - Date.now()) / 1000) : null;
        dispatch(setTokenExpiration(expiresAt, expiresIn));

        // Kullanıcı profilini getir - bu token'ın geçerliliğini de doğrular
        try {
          await dispatch(fetchUserProfile());
        } catch (profileError) {
          console.error("Profil bilgisi alınamadı:", profileError);
          // Profil hatası olsa bile devam et
        }

        dispatch(setLoading(false));
        dispatch(setSuccess("Google ile giriş başarılı"));

        return { success: true };
      } catch (error) {
        dispatch(setError("OAuth ile giriş yapılamadı"));
        dispatch(setLoading(false));
        console.error("OAuth callback error:", error);
        return { error: "OAuth callback failed" };
      }
    };

export const logout = () => async (dispatch) => {
  try {
    // Backend'e logout isteği gönder
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      try {
        await instance.post("/auth/logout", { refreshToken });
      } catch (logoutError) {
        console.warn("Backend logout hatası (devam ediliyor):", logoutError);
        // Backend hatası olsa bile local temizliğe devam et
      }
    }

    // Tüm depolamaları temizle
    clearTokens();
    tokenRefreshManager.reset();

    // Axios header'larını temizle
    if (
      typeof instance !== "undefined" &&
      instance.defaults &&
      instance.defaults.headers
    ) {
      delete instance.defaults.headers.common["Authorization"];
    }

    // Redux store temizliği
    dispatch(clearUserData());

    return { success: true };
  } catch (error) {
    console.error("Logout hatası:", error);

    // Hata olsa bile temizlik yapmaya çalış
    try {
      clearTokens();
      tokenRefreshManager.reset();
      dispatch(clearUserData());
    } catch (cleanupError) {
      console.error("Logout temizleme hatası:", cleanupError);
    }

    return { error: "Çıkış yapılamadı", success: false };
  }
};

// İstek kontrolü için değişkenler
let authCheckInProgress = false;
let authCheckPromise = null;
let lastAuthCheckTime = 0;
const AUTH_CACHE_TIME = 2000; // 2 saniye (ms cinsinden)

// Auth durumu kontrolü - birleştirilmiş token sistemi için güncellendi
export const checkAuthStatus = () => async (dispatch) => {
  // Aynı anda birden fazla istek göndermeyi önle
  if (authCheckInProgress && authCheckPromise) {
    console.log("Auth check zaten devam ediyor, mevcut Promise'i kullan");
    return authCheckPromise;
  }

  // Önbellek kontrolü
  const now = Date.now();
  if (now - lastAuthCheckTime < AUTH_CACHE_TIME) {
    console.log("Son auth check süresi dolmadı");
    return Promise.resolve(true);
  }

  try {
    authCheckInProgress = true;

    authCheckPromise = (async () => {
      try {
        // Unified token storage
        const token = getAccessToken();

        if (!token) {
          console.log("Token bulunamadı, oturum sonlandırılıyor");
          dispatch(clearUserData());
          return false;
        }

        // Token'ı header'a set et
        instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        dispatch(setToken(token));

        // Oturum durumunu güncelle
        dispatch(setIsLogin(true));
        dispatch(setRememberMe(getRememberMe()));

        // OAuth callback'te profil yüklemesini atla
        if (window.location.pathname.includes("/oauth2/callback")) {
          console.log("OAuth callback sürecinde profil yüklemesi atlanıyor");
          return true;
        }

        // Kullanıcı profilini çek
        try {
          await dispatch(fetchUserProfile());
        } catch (profileError) {
          console.error("Profil bilgisi çekilemedi:", profileError);
          // Profil çekme hatası olsa bile oturum devam edebilir
        }

        return true;
      } catch (error) {
        console.error("Auth status kontrolü hatası:", error);
        await dispatch(logout());
        return false;
      }
    })();

    const result = await authCheckPromise;
    lastAuthCheckTime = Date.now();
    return result;
  } finally {
    setTimeout(() => {
      authCheckInProgress = false;
      authCheckPromise = null;
    }, 100);
  }
};

export const registerUser = (userData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    // Form validation
    if (!userData.phoneNumber || userData.phoneNumber.trim() === "") {
      throw new Error("Telefon numarası boş olamaz");
    }

    // Destructure to remove confirmPassword
    const { confirmPassword, ...registrationData } = userData;

    // Register directly with our backend
    const response = await instance.post("/auth/register", registrationData);

    dispatch(setLoading(false));
    dispatch(
      setSuccess(
        "Kayıt başarılı! Lütfen e-posta adresinize gönderilen doğrulama bağlantısına tıklayın."
      )
    );
    return { success: true, data: response.data };
  } catch (err) {
    console.error("Registration error details:", err);
    let errorMessage = "Kayıt işlemi başarısız oldu";

    // Timeout hatası kontrolü
    if (err.code === "ECONNABORTED") {
      // Timeout hatası - bunu başarı olarak işleyelim çünkü backend'deki işlem aslında başarılı
      dispatch(setLoading(false));
      dispatch(
        setSuccess(
          "Kayıt işlemi muhtemelen başarılı! Lütfen e-posta kutunuzu kontrol edin."
        )
      );
      return { success: true, timeout: true };
    }

    // Diğer hatalar için normal hata işleme
    if (err.message) {
      errorMessage = err.message;
    } else if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};
// userActions.js dosyasına eklenecek kod

// Şifre değiştirme fonksiyonu
export const changePassword = (passwordData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    await instance.post("/user/password", passwordData);

    dispatch(setLoading(false));
    dispatch(setSuccess("Şifreniz başarıyla değiştirildi"));

    return { success: true };
  } catch (err) {
    let errorMessage = "Şifre değiştirilemedi";

    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    } else if (err.request) {
      errorMessage =
        "Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.";
    } else {
      errorMessage = err.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

// Kullanıcı profil bilgilerini getirme fonksiyonu
export const fetchUserProfile = () => async (dispatch, getState) => {
  try {
    console.log("Kullanıcı profili alınıyor...");
    const { user } = getState();
    const token = user.token;

    // Token yoksa localStorage/sessionStorage'dan kontrol et
    if (!token) {
      console.log(
        "Redux'ta token bulunamadı, localStorage'dan kontrol ediliyor"
      );
      // Token'ı Redux'a yüklemeyi dene
      await dispatch(initializeAuth());

      // Tekrar token kontrolü yap
      const updatedState = getState();
      const updatedToken = updatedState.user.token;

      if (!updatedToken) {
        console.error("Token bulunamadı (Redux ve localStorage'da yok)");
        return null;
      }
    }

    // En güncel token'ı al
    const currentState = getState();
    const currentToken = currentState.user.token;

    console.log("Kullanıyor token:", currentToken.substring(0, 10) + "...");

    // Double-check auth header is set properly
    instance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${currentToken}`;

    try {
      const response = await instance.get("/user/profile");
      const userData = response.data;
      console.log("Kullanıcı profili alındı:", userData);

      dispatch(setUserProfile(userData));

      // Rol bilgisini güncelle (eğer mevcutsa)
      if (userData.role) {
        dispatch(setUserRole(userData.role));
      }

      // Status bilgisini güncelle (eğer mevcutsa)
      if (userData.status) {
        dispatch(setUserStatus(userData.status));
      }
      dispatch(setUserFetchState(fetchStates.FETCHED));

      return userData;
    } catch (error) {
      console.error("API request error:", error);

      // Yetkilendirme hatası durumunda
      if (error.response && error.response.status === 401) {
        dispatch(clearUserData()); // Oturumu temizle
      }

      throw error;
    }
  } catch (error) {
    console.error("Kullanıcı profili alma hatası:", error);
    throw error;
  }
};

// Kullanıcı email doğrulama fonksiyonu
export const verifyEmail = (token) => async (dispatch) => {
  try {
    console.log("verifyEmail çağrıldı, token:", token);
    dispatch(setLoading(true));
    dispatch(setError(null));

    // API endpointine istek gönder - backend /auth/verify-email bekliyor
    const response = await instance.get(`/auth/verify-email?token=${token}`);
    console.log("Doğrulama yanıtı:", response.data);

    // İşlem başarılı - global state'i güncelle
    dispatch(setSuccess("Email adresiniz başarıyla doğrulandı."));
    dispatch(setLoading(false));

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Email doğrulama hatası:", error);

    let errorMessage = "Email doğrulama işlemi başarısız oldu";

    // Hata mesajını ayrıştır
    if (error.response) {
      // Backend'den gelen hata mesajı
      errorMessage =
        error.response.data?.message ||
        (error.response.data?.error ? error.response.data.error : errorMessage);
    } else if (error.request) {
      errorMessage =
        "Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.";
    } else {
      errorMessage = error.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));

    return { error: errorMessage };
  }
};

// Kullanıcı profil bilgilerini güncelleme fonksiyonu
export const updateUserProfile = (userData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await instance.put("/user/profile", userData);

    if (!response || !response.data) {
      throw new Error("Profil güncellenemedi");
    }

    const updatedUserData = response.data;

    // Güncellenmiş kullanıcı bilgilerini Redux store'a kaydet
    dispatch(setUserProfile(updatedUserData));

    // Email değiştiyse, email state'ini de güncelle
    if (updatedUserData.email) {
      dispatch(setEmail(updatedUserData.email));

      // Local storage'daki email'i de güncelle
      const rememberMe = getRememberMe();
      setTokens(user.token, getRefreshToken(), updatedUserData.email, rememberMe);
    }

    dispatch(setLoading(false));
    dispatch(setSuccess("Profiliniz başarıyla güncellendi"));

    return updatedUserData;
  } catch (err) {
    let errorMessage = "Profil güncellenemedi";

    if (err.response) {
      if (err.response.status === 401) {
        dispatch(logout());
        errorMessage = "Oturumunuz sona erdi, lütfen tekrar giriş yapın";
      } else {
        errorMessage = err.response.data?.message || errorMessage;
      }
    } else if (err.request) {
      errorMessage =
        "Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.";
    } else {
      errorMessage = err.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

export const fetchUserAddresses = () => async (dispatch, getState) => {
  dispatch(setUserFetchState(fetchStates.FETCHING));

  try {
    // Get current token from Redux store
    const { user } = getState();
    let token = user.token;

    // Token yoksa localStorage/sessionStorage'dan kontrol et
    if (!token) {
      await dispatch(initializeAuth());

      // Tekrar token kontrolü yap
      const updatedState = getState();
      token = updatedState.user.token;

      if (!token) {
        dispatch(setUserAddresses([]));
        dispatch(setUserFetchState(fetchStates.FETCHED));
        return [];
      }
    }

    // Debug ve sorun giderme amaçlı token bilgisi
    console.debug("Adres API token tipi:", token.substring(0, 30));

    // Ensure the token is set in the request headers
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    try {
      // API endpoint'i düzeltildi - backend /user/addresses bekliyor
      const response = await instance.get("/user/addresses", {
        // timeout: 10000, // Timeout süresi artırıldı
        headers: { Authorization: `Bearer ${token}` }, // Header'ı isteğe özel tekrar ekle
      });

      dispatch(setUserAddresses(response.data || []));
      dispatch(setUserFetchState(fetchStates.FETCHED));
      return response.data || [];
    } catch (requestError) {
      // Tüm hata durumlarını debug için logla
      console.warn("Adres API isteği hatası:", {
        status: requestError.response?.status,
        data: requestError.response?.data,
        message: requestError.message,
      });

      // Tüm hatalarda boş dizi dön
      dispatch(setUserAddresses([]));
      dispatch(setUserFetchState(fetchStates.FETCHED));
      return [];
    }
  } catch (err) {
    // Genel hata yakalama
    console.error("Adres fonksiyonu hatası:", err);
    dispatch(setUserAddresses([]));
    dispatch(setUserFetchState(fetchStates.FETCHED));
    return [];
  }
};
// Yeni adres ekleme fonksiyonu
export const createAddress = (addressData) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const response = await instance.post("/user/addresses", addressData);

    if (!response || !response.data) {
      throw new Error("Adres eklenirken bir hata oluştu");
    }

    dispatch(setUserAddresses(response.data)); // Backend tüm adresleri döndürür
    dispatch(setSuccess("Adres başarıyla eklendi"));
    dispatch(setLoading(false));

    return response.data;
  } catch (err) {
    console.error("Adres eklenirken hata:", err);

    let errorMessage = "Adres eklenemedi";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;

      // Yetkilendirme hatası durumunda
      if (err.response.status === 401) {
        dispatch(logout()); // Oturumu temizle
      }
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));

    return { error: errorMessage };
  }
};

// Adres güncelleme fonksiyonu
export const updateAddress = (addressId, addressData) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const response = await instance.put(
      `/user/addresses/${addressId}`,
      addressData
    );

    if (!response || !response.data) {
      throw new Error("Adres güncellenirken bir hata oluştu");
    }

    dispatch(setUserAddresses(response.data)); // Backend'in tüm güncel adresleri döndürdüğünü varsayıyoruz
    dispatch(setSuccess("Adres başarıyla güncellendi"));
    dispatch(setLoading(false));

    return response.data;
  } catch (err) {
    console.error("Adres güncellenirken hata:", err);

    let errorMessage = "Adres güncellenemedi";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;

      // Yetkilendirme hatası durumunda
      if (err.response.status === 401) {
        dispatch(logout()); // Oturumu temizle
      }
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));

    return { error: errorMessage };
  }
};

// Adres silme fonksiyonu
export const deleteAddress = (addressId) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const response = await instance.delete(`/user/addresses/${addressId}`);

    // Backend'in tüm güncel adresleri döndürdüğünü varsayıyoruz
    if (response && response.data) {
      dispatch(setUserAddresses(response.data));
    } else {
      // Eğer backend sadece başarı durumu dönüyorsa, adresleri tekrar çekelim
      await dispatch(fetchUserAddresses());
    }

    dispatch(setSuccess("Adres başarıyla silindi"));
    dispatch(setLoading(false));

    return { success: true };
  } catch (err) {
    console.error("Adres silinirken hata:", err);

    let errorMessage = "Adres silinemedi";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;

      // Yetkilendirme hatası durumunda
      if (err.response.status === 401) {
        dispatch(logout()); // Oturumu temizle
      }
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));

    return { error: errorMessage };
  }
};

// Varsayılan adres ayarlama fonksiyonu
export const setAddressAsDefault = (addressId) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const response = await instance.put(
      `/user/addresses/${addressId}/set-default`
    );

    if (!response || !response.data) {
      throw new Error("Varsayılan adres ayarlanırken bir hata oluştu");
    }

    dispatch(setUserAddresses(response.data)); // Tüm güncellenmiş adresleri al
    dispatch(setSuccess("Varsayılan adres ayarlandı"));
    dispatch(setLoading(false));

    return response.data;
  } catch (err) {
    console.error("Varsayılan adres ayarlanırken hata:", err);

    let errorMessage = "Varsayılan adres ayarlanamadı";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;

      // Yetkilendirme hatası durumunda
      if (err.response.status === 401) {
        dispatch(logout()); // Oturumu temizle
      }
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));

    return { error: errorMessage };
  }
};

// Şifre sıfırlama işlemleri için yeni eklenen eylemler
export const forgotPassword = (email) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await instance.post("/auth/forgot-password", { email });

    dispatch(setLoading(false));
    dispatch(
      setSuccess("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi")
    );

    return { success: true };
  } catch (err) {
    let errorMessage = "Şifre sıfırlama işlemi başarısız oldu";

    if (err.response && err.response.data) {
      errorMessage = err.response.data.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

export const resetPassword = (token, newPassword) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await instance.post("/auth/reset-password", {
      token,
      newPassword,
    });

    dispatch(setLoading(false));
    dispatch(setSuccess("Şifreniz başarıyla sıfırlandı. Lütfen giriş yapın."));

    return { success: true };
  } catch (err) {
    let errorMessage = "Şifre sıfırlama işlemi başarısız oldu";

    if (err.response && err.response.data) {
      errorMessage = err.response.data.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};
