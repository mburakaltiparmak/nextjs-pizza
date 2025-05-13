import { instance, userInstance } from "@/lib/hooks";
import { userActions } from "../reducers/userReducer";
import { setError, setLoading, setSuccess } from "./globalActions";
import { fetchStates } from "../constants";
import { supabase } from "@/lib/supabase";
import axios from "axios";

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
};

// Login işlemi - sadece backend kullanacak şekilde güncellendi
export const login = (formData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    console.log("Login formData received:", formData);

    // Backend ile login
    const response = await instance.post("/auth/login", {
      email: formData.username,
      password: formData.password
    });

    if (!response.data || !response.data.token) {
      throw new Error("Token alınamadı");
    }

    const token = response.data.token;

    // Redux store'u güncelle
    dispatch(setToken(token));
    dispatch(setIsLogin(true));
    dispatch(setAuthProvider("backend"));
    dispatch(setRememberMe(formData.rememberMe));

    // Token ve email bilgilerini uygun storage'a kaydet
    storeToken(token, formData.username, formData.rememberMe);
    
    // Authorization header'ı güncelle
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

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

export const initiateGoogleLogin = () => async () => {
  try {
    console.log("Google login başlatılıyor...");

    // Mevcut URL'i kaydet (geri dönüş için)
    const returnUrl = window.location.pathname;
    localStorage.setItem("authReturnUrl", returnUrl);
    console.log("Geri dönüş URL'i kaydedildi:", returnUrl);

    // Beni Hatırla tercihini geçici olarak sakla
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    localStorage.setItem("tempRememberMe", rememberMe ? "true" : "false");
    console.log("RememberMe durumu kaydedildi:", rememberMe);

    // Start Supabase Google OAuth login with explicit redirect
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/oauth2/callback",
      },
    });

    if (error) {
      console.error("Google OAuth başlatma hatası:", error);
      throw error;
    }

    console.log("Supabase OAuth başlatma başarılı:", data);
    // The browser will now be redirected to Google
  } catch (error) {
    console.error("Google login başlatma hatası:", error);
  }
};

// OAuth login sürecini tamamla (callback sayfasında kullanılır)
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

      // Token bilgisini kaydet (Google giriş için varsayılan olarak rememberMe true)
      storeToken(token, "", rememberMe);

      try {
        // Profil bilgilerini getir
        const userData = await dispatch(fetchUserProfile());

        // Email bilgisini kaydet
        if (userData && userData.email) {
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem("userEmail", userData.email);
          dispatch(setEmail(userData.email));
        }
      } catch (profileError) {
        console.error("Profil bilgileri alınamadı:", profileError);
        // Profil bilgileri alınamazsa bile temel giriş başarılı sayalım
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
    // Sign out from Supabase
    await supabase.auth.signOut();

    // Continue with the rest of your logout logic
    if (typeof window !== "undefined") {
      // localStorage'dan temizle
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");

      // sessionStorage'dan temizle
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userEmail");

      // "Beni hatırla" tercihini koru ama default olarak false yap
      localStorage.setItem("rememberMe", "false");
    }

    // 2. Axios header'larını temizle
    if (
      typeof instance !== "undefined" &&
      instance.defaults &&
      instance.defaults.headers
    ) {
      delete instance.defaults.headers.common["Authorization"];
    }

    // 3. Redux store temizliği
    dispatch(clearUserData());

    return { success: true };
  } catch (error) {
    console.error("Logout hatası:", error);

    // Try cleanup anyway
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
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

// lib/store/actions/userActions.js içinde

// İstek kontrolü için değişkenler
let authCheckInProgress = false;
let authCheckPromise = null;
let lastAuthCheckTime = 0;
const AUTH_CACHE_TIME = 2000; // 2 saniye (ms cinsinden) - OAuth callback için kısa tutuyoruz

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
        const storage = localStorage.getItem("rememberMe") === "true" ? localStorage : sessionStorage;
        const token = storage.getItem("token");
        const authProvider = storage.getItem("authProvider") || "backend";
        
        if (!token) {
          console.log("Token bulunamadı, oturum sonlandırılıyor");
          dispatch(clearUserData());
          return false;
        }

        // Token türüne göre doğrulama yap
        if (authProvider === "supabase" || authProvider === "google") {
          // Supabase session kontrolü (Google OAuth2 veya Supabase login için)
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError || !session) {
            console.log("Supabase oturumu geçersiz veya sona ermiş");
            dispatch(clearUserData());
            return false;
          }

          // Supabase token kullan
          const supabaseToken = session.access_token;
          instance.defaults.headers.common["Authorization"] = `Bearer ${supabaseToken}`;
          
          dispatch(setToken(supabaseToken));
          
          // Email bilgisini güncelle
          if (session.user && session.user.email) {
            dispatch(setEmail(session.user.email));
            storage.setItem("userEmail", session.user.email);
          }
        } else {
          // Backend token doğrulama
          try {
            instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            
            // Backend'e token doğrulama isteği gönder
            const response = await instance.post("/auth/validate-token", null, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!response.data || !response.data.valid) {
              console.log("Backend token geçersiz");
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
          } catch (error) {
            console.error("Token doğrulama hatası:", error);
            dispatch(clearUserData());
            return false;
          }
        }
        
        // Oturum durumunu güncelle
        dispatch(setIsLogin(true));
        dispatch(setRememberMe(localStorage.getItem("rememberMe") === "true"));
        
        // OAuth callback sırasında gereksiz profil yüklemelerini engelle
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
    return response.data;
  } catch (err) {
    let errorMessage = "Kayıt işlemi başarısız oldu";

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

// Şifre değiştir
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

// Kullanıcı profil bilgilerini getir
export const fetchUserProfile = () => async (dispatch, getState) => {
  try {
    console.log("Kullanıcı profili alınıyor...");
    const token = getState().user.token;

    if (!token) {
      console.error("Token bulunamadı");
      return null;
    }

    console.log("Kullanıyor token:", token.substring(0, 10) + "...");
    console.log(
      "Authorization header:",
      instance.defaults.headers.common["Authorization"]
    );

    // Double-check auth header is set properly
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Use instance directly
    try {
      const response = await instance.get("/user/profile");

      const userData = response.data;
      console.log("Kullanıcı profili alındı:", userData);

      dispatch({
        type: "SET_USER_PROFILE",
        payload: userData,
      });

      return userData;
    } catch (error) {
      console.error("API request error:", error);
      console.error("Error status:", error.response?.status);
      console.error("Error details:", error.response?.data);
      throw error;
    }
  } catch (error) {
    console.error("Kullanıcı profili alma hatası:", error);
    throw error;
  }
};
// userActions.js dosyasına eklenecek kod

// Kullanıcı email doğrulama fonksiyonu
export const verifyEmail = (token) => async (dispatch) => {
  try {
    console.log("verifyEmail çağrıldı, token:", token);
    dispatch(setLoading(true));
    dispatch(setError(null));

    // instance kullanarak API endpointine istek gönder
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
// Kullanıcı profil bilgilerini güncelle
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

    if (updatedUserData.email) {
      dispatch(setEmail(updatedUserData.email));
      localStorage.setItem("userEmail", updatedUserData.email);
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

// Kullanıcı adreslerini getir - hata yönetimi iyileştirildi
export const fetchUserAddresses = () => async (dispatch) => {
  dispatch(setUserFetchState(fetchStates.FETCHING));

  try {
    const response = await instance.get("/user/addresses");

    dispatch(setUserAddresses(response.data || [])); // Boş dizi varsayılanı
    dispatch(setUserFetchState(fetchStates.FETCHED));

    return response.data || [];
  } catch (err) {
    console.error("Adresler yüklenirken hata:", err);

    // Hata durumunda boş dizi ile devam et
    dispatch(setUserAddresses([]));
    dispatch(setUserFetchState(fetchStates.FAILED));

    // Hatayı fırlat ama state'i güncelle
    throw err;
  }
};

// Yeni adres ekle
export const createAddress = (addressData) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const response = await instance.post("/user/addresses", addressData);

    if (!response || !response.data) {
      throw new Error("Adres eklenirken bir hata oluştu");
    }

    dispatch(addUserAddress(response.data));
    dispatch(setSuccess("Adres başarıyla eklendi"));
    dispatch(setLoading(false));

    return response.data;
  } catch (err) {
    console.error("Adres eklenirken hata:", err);

    let errorMessage = "Adres eklenemedi";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));

    return { error: errorMessage };
  }
};

// Adres güncelle
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

    dispatch(updateUserAddress(response.data));
    dispatch(setSuccess("Adres başarıyla güncellendi"));
    dispatch(setLoading(false));

    return response.data;
  } catch (err) {
    console.error("Adres güncellenirken hata:", err);

    let errorMessage = "Adres güncellenemedi";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));

    return { error: errorMessage };
  }
};

// Adres sil
export const deleteAddress = (addressId) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    await instance.delete(`/user/addresses/${addressId}`);

    dispatch(removeUserAddress(addressId));
    dispatch(setSuccess("Adres başarıyla silindi"));
    dispatch(setLoading(false));

    return { success: true };
  } catch (err) {
    console.error("Adres silinirken hata:", err);

    let errorMessage = "Adres silinemedi";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));

    return { error: errorMessage };
  }
};

// Varsayılan adres ayarla
export const setAddressAsDefault = (addressId) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const response = await instance.put(
      `/user/addresses/${addressId}/set-default`
    );

    if (!response || !response.data) {
      throw new Error("Varsayılan adres ayarlanırken bir hata oluştu");
    }

    dispatch(setDefaultAddress(addressId));
    dispatch(setSuccess("Varsayılan adres ayarlandı"));
    dispatch(setLoading(false));

    // Tüm adresleri yeniden yükle
    dispatch(fetchUserAddresses());

    return response.data;
  } catch (err) {
    console.error("Varsayılan adres ayarlanırken hata:", err);

    let errorMessage = "Varsayılan adres ayarlanamadı";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));

    return { error: errorMessage };
  }
};
