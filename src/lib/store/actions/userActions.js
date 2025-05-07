import { instance, userInstance } from "@/lib/hooks";
import { userActions } from "../reducers/userReducer";
import { setError, setLoading, setSuccess } from "./globalActions";
import { fetchStates } from "../constants";
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

// Login işlemi
export const login = (formData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    console.log("Login formData received:", formData);

    // Request payload hazırla
    const payload = {
      email: formData.username,
      password: formData.password,
    };
    console.log("FORM DATA", formData);

    console.log("Login request payload being sent to backend:", payload);

    // Adım 1: Login isteğini gönder
    const res = await instance.post("/auth/login", payload);

    console.log("Login response:", res);

    // Yanıtı doğrula
    if (!res || !res.data) {
      throw new Error("Sunucudan geçersiz yanıt alındı");
    }

    // Token kontrolü
    const token = res.data.token;
    if (!token) {
      throw new Error("Kimlik doğrulama başarısız");
    }

    // Redux store'u güncelle
    dispatch(setToken(token));
    dispatch(setIsLogin(true));
    dispatch(setAuthProvider("email"));

    // rememberMe durumunu store'a kaydet
    dispatch(setRememberMe(formData.rememberMe));

    // Token ve email bilgilerini uygun storage'a kaydet
    storeToken(token, formData.username, formData.rememberMe);

    dispatch(setLoading(false));
    dispatch(setSuccess("Giriş başarılı"));
    return { token };
  } catch (err) {
    // Hata detayları
    console.error("Login error full details:", err);

    // Hata yanıtını incele
    if (err.response) {
      console.error("Login error response:", err.response);
      console.error("Login error response data:", err.response.data);
      console.error("Login error response status:", err.response.status);
    }

    // Hata işleme kodu...
    let errorMessage = "Giriş başarısız oldu";

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

export const initiateGoogleLogin = () => () => {
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

    // API_BASE_URL'i env değişkenlerinden veya varsayılan değerden al
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "https://pizza-backend.fly.dev";
    const authUrl = `${API_BASE_URL}/pizza/api/auth/oauth2/authorize/google`;

    console.log("Yönlendiriliyor:", authUrl);

    // Tarayıcıyı backend'in OAuth endpoint'ine yönlendir
    window.location.href = authUrl;
  } catch (error) {
    console.error("Google login başlatma hatası:", error);
    // Hata durumunda global hata state'i güncellenebilir
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

// Geliştirilmiş logout fonksiyonu
export const logout = () => async (dispatch) => {
  try {
    // 1. Tüm storage'dan kimlik bilgilerini temizle
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

    // Hata durumunda yine de temizlik yapmaya çalış
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

// checkAuthStatus fonksiyonu - Network hataları için geliştirilmiş
export const checkAuthStatus = () => async (dispatch) => {
  // Ağ hatalarına karşı bir zaman aşımı ayarla
  const AUTH_TIMEOUT = 5000; // 5 saniye

  try {
    // Önce localStorage'da token ara, yoksa sessionStorage'a bak
    let token = localStorage.getItem("token");
    let storage = localStorage;

    // localStorage'da token yoksa, sessionStorage'a bak
    if (!token) {
      token = sessionStorage.getItem("token");
      storage = sessionStorage;
    }

    // Token yoksa, sessiz bir şekilde çık
    if (!token) {
      // Store'u temizle
      dispatch(clearUserData());
      return false;
    }

    // "Beni hatırla" durumunu kontrol et
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    dispatch(setRememberMe(rememberMe));

    // Token varsa, Axios başlığına ekle ve giriş yapmış olarak işaretle
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    dispatch(setToken(token));
    dispatch(setIsLogin(true));

    // Kullanıcı email bilgisini al
    const savedEmail = storage.getItem("userEmail");
    if (savedEmail) {
      dispatch(setEmail(savedEmail));
    }

    try {
      // Timeout ile API çağrısı - ağ hatalarında takılıp kalmaması için
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Profil bilgileri zaman aşımına uğradı")),
          AUTH_TIMEOUT
        )
      );

      // Profil bilgilerini çekmeyi dene
      const profilePromise = instance.get("/user/profile");

      // Hangisi önce tamamlanırsa
      const response = await Promise.race([profilePromise, timeoutPromise]);

      if (response && response.data) {
        // Kullanıcı bilgilerini Redux store'a kaydet
        dispatch(setUserProfile(response.data));

        // Kullanıcının rol ve durumunu güncelle
        if (response.data.role) {
          dispatch(setUserRole(response.data.role));
        }

        if (response.data.status) {
          dispatch(setUserStatus(response.data.status));
        }

        // OAuth provider bilgisini kontrol et
        if (response.data.oauthProvider) {
          dispatch(setAuthProvider(response.data.oauthProvider));
        } else {
          dispatch(setAuthProvider("email"));
        }

        // Adres bilgilerini yüklemeyi dene, ama bir sorun çıkarsa devam et
        try {
          const addressTimeout = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Adres bilgileri zaman aşımına uğradı")),
              AUTH_TIMEOUT
            )
          );

          await Promise.race([dispatch(fetchUserAddresses()), addressTimeout]);
        } catch (addressError) {
          console.error("Adres bilgileri yüklenirken hata:", addressError);
          // Adres hatası kritik değil, devam et
        }

        return true;
      }

      // Profil bilgileri alınamadı ama token var, kullanıcıyı giriş yapmış kabul et
      return true;
    } catch (error) {
      console.error("Profil bilgisi çekilirken hata:", error);

      // Network hatası olup olmadığını kontrol et
      if (
        error.message === "Network Error" ||
        error.message.includes("zaman aşımı")
      ) {
        console.warn("Ağ hatası oluştu ama kullanıcı girişi kabul ediliyor");
        // Ağ hatası durumunda bile kullanıcıyı giriş yapmış olarak kabul et
        // Böylece ürünleri ve kategorileri görüntüleyebilir
        return true;
      }

      // Token geçersiz olabilir, kontrol et
      if (error.response && error.response.status === 401) {
        // Token geçersiz, temizle ve çıkış yap
        await dispatch(logout());
        return false;
      }

      // Diğer hata durumlarında kullanıcının giriş yapmış sayılmasını sağla
      return true;
    }
  } catch (error) {
    console.error("Kimlik doğrulama kontrolü hatası:", error);

    // Herhangi bir hata durumunda oturum bilgilerini sil ve çık
    await dispatch(logout());
    return false;
  }
};
// Kullanıcı kaydı
export const registerUser = (userData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    // Destructure to remove confirmPassword
    const { confirmPassword, ...registrationData } = userData;

    // Telefon numarası alanını kontrol et
    if (
      !registrationData.phoneNumber ||
      registrationData.phoneNumber.trim() === ""
    ) {
      throw new Error("Telefon numarası boş olamaz");
    }

    // Tüm gerekli alanların dolu olduğundan emin ol
    const requiredFields = [
      "email",
      "password",
      "name",
      "surname",
      "phoneNumber",
    ];
    for (const field of requiredFields) {
      if (!registrationData[field] || registrationData[field].trim() === "") {
        throw new Error(`${field} alanı boş olamaz`);
      }
    }

    // API isteğini yap
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

    if (err.response) {
      // Backend'den gelen hata mesajı
      if (err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (
        typeof err.response.data === "object" &&
        err.response.data.errors
      ) {
        const errors = err.response.data.errors;
        errorMessage = Object.values(errors).join(", ");
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

    // API_BASE_URL'i env değişkenlerinden veya varsayılan değerden al
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "https://pizza-backend.fly.dev";

    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP hata! Durum: ${response.status}`);
    }

    const userData = await response.json();
    console.log("Kullanıcı profili alındı:", userData);

    dispatch({
      type: "SET_USER_PROFILE",
      payload: userData,
    });

    return userData;
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
