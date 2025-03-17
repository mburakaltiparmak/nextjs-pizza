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

// Login işlemi
export const login = (formData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const res = await instance.post("/auth/login", {
      username: formData.username || formData.email,
      password: formData.password,
    });

    // Yanıtı doğrula
    if (!res || !res.data) {
      throw new Error("Sunucudan geçersiz yanıt alındı");
    }

    // Token kontrolü
    const token = res.data.token;
    if (!token) {
      throw new Error("Kimlik doğrulama başarısız");
    }

    dispatch(setToken(token));
    dispatch(setIsLogin(true));

    // LocalStorage'a token kaydet
    localStorage.setItem("token", token);

    if (formData.rememberMe) {
      dispatch(setRememberMe(true));
    }

    // Kullanıcı bilgilerini kaydet
    const userIdentifier = formData.email || formData.username;
    dispatch(setEmail(userIdentifier));
    localStorage.setItem("userEmail", userIdentifier);

    dispatch(setLoading(false));
    dispatch(setSuccess("Giriş başarılı"));
    return { token };
  } catch (err) {
    // Hata işleme kodu...
    let errorMessage = "Giriş başarısız oldu";

    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    } else if (err.request) {
      errorMessage = "Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.";
    } else {
      errorMessage = err.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

// Çıkış yapma işlemi
export const logout = () => (dispatch) => {
  // Token ve login durumunu temizle
  dispatch(clearUserData());

  // LocalStorage'dan verileri kaldır
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");

  dispatch(setSuccess("Başarıyla çıkış yapıldı"));
  return { success: true };
};

// Kullanıcı giriş durumunu kontrol et
export const checkAuthStatus = () => (dispatch) => {
  const token = localStorage.getItem("token");

  if (token) {
    // Token varsa, kullanıcıyı giriş yapmış olarak işaretle
    dispatch(setToken(token));
    dispatch(setIsLogin(true));

    // Axios instance'ına token ekle
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Kullanıcı email bilgisini de al
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      dispatch(setEmail(savedEmail));
    }

    return true;
  }

  return false;
};

// Kullanıcı kaydı
export const registerUser = (userData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    // Request verilerini konsolda göster (debug için)
    console.log("Backend'e gönderilecek kayıt verisi:", userData);
    
    // Telefon numarası alanını kontrol et
    if (!userData.phoneNumber || userData.phoneNumber.trim() === "") {
      throw new Error("Telefon numarası boş olamaz");
    }
    
    // Tüm gerekli alanların dolu olduğundan emin ol
    const requiredFields = ['username', 'password', 'name', 'surname', 'email', 'phoneNumber'];
    for (const field of requiredFields) {
      if (!userData[field] || userData[field].trim() === "") {
        throw new Error(`${field} alanı boş olamaz`);
      }
    }

    // API isteğini yap
    const response = await instance.post("/auth/register", userData);
    
    dispatch(setLoading(false));
    dispatch(setSuccess("Kayıt başarılı! Admin onayı bekleniyor."));
    return response.data;
  } catch (err) {
    let errorMessage = "Kayıt işlemi başarısız oldu";

    if (err.response) {
      // Backend'den gelen hata mesajı
      errorMessage = err.response.data || errorMessage;
      
      // Eğer backend detaylı hata döndürdüyse
      if (typeof err.response.data === 'object' && err.response.data.errors) {
        const errors = err.response.data.errors;
        errorMessage = Object.values(errors).join(', ');
      }
    } else if (err.request) {
      errorMessage = "Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.";
    } else {
      errorMessage = err.message || errorMessage;
    }

    console.error("Kayıt hatası:", err);
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
    await instance.put("/user/password", passwordData);
    
    dispatch(setLoading(false));
    dispatch(setSuccess("Şifreniz başarıyla değiştirildi"));

    return { success: true };
  } catch (err) {
    let errorMessage = "Şifre değiştirilemedi";

    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    } else if (err.request) {
      errorMessage = "Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.";
    } else {
      errorMessage = err.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};