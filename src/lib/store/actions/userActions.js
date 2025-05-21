// lib/store/actions/userActions.js
import { instance, userInstance } from "@/lib/hooks";
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
};

export const setEmail = (email) => ({
  type: userActions.SET_EMAIL,
  payload: email,
});

export const setRememberMe = (rememberMe) => ({
  type: userActions.SET_REMEMBER_ME,
  payload: rememberMe,
});

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

// Token depolama fonksiyonları
const storeToken = (token, email, rememberMe) => {
  // rememberMe true ise localStorage, değilse sessionStorage kullan
  const storage = rememberMe ? localStorage : sessionStorage;

  // Token ve email bilgilerini kaydet
  storage.setItem("token", token);
  storage.setItem("userEmail", email);

  // "Beni hatırla" tercihini kaydet
  localStorage.setItem("rememberMe", rememberMe ? "true" : "false");

  // Authorization header'ı güncelle
  instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// Login işlemi - birleştirilmiş kimlik doğrulama sistemi için güncellendi
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

    if (!response.data || !response.data.token) {
      throw new Error("Token alınamadı");
    }

    const token = response.data.token;

    // Redux store'u güncelle
    dispatch(setToken(token));
    dispatch(setIsLogin(true));
    dispatch(setAuthProvider("email"));
    dispatch(setRememberMe(formData.rememberMe));

    // Ek kullanıcı bilgilerini güncelle (eğer backend'den dönüyorsa)
    if (response.data.email) {
      dispatch(setEmail(response.data.email));
    } else {
      dispatch(setEmail(formData.username));
    }

    if (response.data.role) {
      dispatch(setUserRole(response.data.role));
    }

    if (response.data.name || response.data.surname) {
      dispatch(
        setUserProfile({
          ...response.data,
        })
      );
    }

    // Token ve email bilgilerini uygun storage'a kaydet
    storeToken(
      token,
      response.data.email || formData.username,
      formData.rememberMe
    );

    dispatch(setLoading(false));
    dispatch(setSuccess("Giriş başarılı"));
    return { token };
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
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    localStorage.setItem("rememberMe", rememberMe ? "true" : "false");
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
      storeToken(token, "", rememberMe);

      // Token doğrulama isteği gönder - kullanıcı bilgilerini al
      try {
        const response = await instance.post("/auth/validate-token", null, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.valid) {
          // Email bilgisini güncelle
          if (response.data.email) {
            const email = response.data.email;
            dispatch(setEmail(email));

            // Email'i storage'a kaydet
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem("userEmail", email);
          }

          // Rol bilgisini güncelle
          if (response.data.role) {
            dispatch(setUserRole(response.data.role));
          }

          // Status bilgisini güncelle
          if (response.data.status) {
            dispatch(setUserStatus(response.data.status));
          }
        }
      } catch (validationError) {
        console.error("Token doğrulama hatası:", validationError);
        // Doğrulama hatası olsa bile devam et
      }

      // Kullanıcı profilini getir
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
    // Tüm depolamaları temizle
    if (typeof window !== "undefined") {
      // localStorage'dan temizle
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");

      // Supabase token'ını da temizle
      localStorage.removeItem("sb-nslkxjzddnjpouzkevii-auth-token");

      // sessionStorage'dan temizle
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userEmail");

      // "Beni hatırla" tercihini koru, ama default false yap
      localStorage.setItem("rememberMe", "false");
    }

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
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("sb-nslkxjzddnjpouzkevii-auth-token");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userEmail");
      }
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
        // Önce local storage'da token var mı kontrol et
        const storage =
          localStorage.getItem("rememberMe") === "true"
            ? localStorage
            : sessionStorage;
        const token = storage.getItem("token");

        if (!token) {
          console.log("Token bulunamadı, oturum sonlandırılıyor");
          dispatch(clearUserData());
          return false;
        }

        // Token doğrulama
        try {
          instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Birleştirilmiş token doğrulama isteği
          const response = await instance.post("/auth/validate-token", null, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.data || !response.data.valid) {
            console.log("Token geçersiz");
            dispatch(clearUserData());
            return false;
          }

          // Email bilgisini güncelle
          if (response.data.email) {
            dispatch(setEmail(response.data.email));
            storage.setItem("userEmail", response.data.email);
          }

          // Rol bilgisini güncelle
          if (response.data.role) {
            dispatch(setUserRole(response.data.role));
          }

          // Status bilgisini güncelle
          if (response.data.status) {
            dispatch(setUserStatus(response.data.status));
          }
        } catch (error) {
          console.error("Token doğrulama hatası:", error);
          dispatch(clearUserData());
          return false;
        }

        // Oturum durumunu güncelle
        dispatch(setIsLogin(true));
        dispatch(setRememberMe(localStorage.getItem("rememberMe") === "true"));

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

    // API endpointine istek gönder
    const response = await instance.get(`/auth/verify?token=${token}`);
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
      const rememberMe = localStorage.getItem("rememberMe") === "true";
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("userEmail", updatedUserData.email);
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
      // API endpoint'i düzeltildi
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
