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
// Kullanıcı giriş durumunu kontrol et
export const checkAuthStatus = () => async (dispatch) => {
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

    try {
      // Kullanıcı profil bilgilerini getir
      const response = await instance.get("/user/profile");
      
      if (response && response.data) {
        // Kullanıcı bilgilerini Redux store'a kaydet
        dispatch(setUserProfile(response.data));
        
        // Kullanıcının rol ve durumunu da güncelle
        if (response.data.role) {
          dispatch(setUserRole(response.data.role));
        }
        
        if (response.data.status) {
          dispatch(setUserStatus(response.data.status));
        }
      }
    } catch (error) {
      console.error("Profil bilgisi çekilirken hata:", error);
      
      // Token geçersiz olabilir, kontrol et
      if (error.response && error.response.status === 401) {
        // Token geçersiz, çıkış yap
        dispatch(logout());
        return false;
      }
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
    dispatch(setSuccess("Kayıt başarılı! Lütfen e-posta adresinize gönderilen doğrulama bağlantısına tıklayın."));
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
    await instance.post("/user/password", passwordData);
    
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

// Kullanıcı profil bilgilerini getir
export const fetchUserProfile = () => async (dispatch) => {
  dispatch(setUserFetchState(fetchStates.FETCHING));

  try {
    const response = await instance.get("/user/profile");
    
    if (!response || !response.data) {
      throw new Error("Profil bilgileri alınamadı");
    }
    
    const userData = response.data;
    
    // Kullanıcı bilgilerini Redux store'a kaydet
    dispatch(setUserProfile(userData));
    
    // Kullanıcının rol ve durumunu da güncelle
    if (userData.role) {
      dispatch(setUserRole(userData.role));
    }
    
    if (userData.status) {
      dispatch(setUserStatus(userData.status));
    }
    
    dispatch(setUserFetchState(fetchStates.FETCHED));
    return userData;
  } catch (err) {
    let errorMessage = "Profil bilgileri yüklenemedi";

    if (err.response) {
      if (err.response.status === 401) {
        // Token geçersiz, çıkış yap
        dispatch(logout());
        errorMessage = "Oturumunuz sona erdi, lütfen tekrar giriş yapın";
      } else {
        errorMessage = err.response.data?.message || errorMessage;
      }
    } else if (err.request) {
      errorMessage = "Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.";
    } else {
      errorMessage = err.message || errorMessage;
    }

    dispatch(setUserFetchState(fetchStates.FAILED));
    dispatch(setError(errorMessage));
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
      errorMessage = "Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.";
    } else {
      errorMessage = err.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};