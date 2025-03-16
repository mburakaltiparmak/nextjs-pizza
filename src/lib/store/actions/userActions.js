import { instance } from "@/lib/hooks";
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

const userInstance = axios.create({
  baseURL: "http://localhost:9000/pizza/admin/users",
});
// Login işlemi
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

    // instance.defaults satırını kaldırın - interceptor ile yönetiyoruz
    // instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    if (formData.rememberMe) {
      dispatch(setRememberMe(true));
    }

    // Kullanıcı bilgilerini kaydet
    const userIdentifier = formData.email || formData.username;
    dispatch(setEmail(userIdentifier));
    localStorage.setItem("userEmail", userIdentifier);

    // Kullanıcı profil bilgilerini al
    dispatch(fetchUserProfile());

    dispatch(setLoading(false));
    dispatch(setSuccess("Giriş başarılı"));
    return { token };
  } catch (err) {
    // Hata işleme kodu...
  }
};

// Çıkış yapma işlemi
// Çıkış yapma işlemi
export const logout = () => (dispatch) => {
  // Token ve login durumunu temizle
  dispatch(clearUserData());

  // LocalStorage'dan verileri kaldır
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");

  // instance.defaults satırını kaldırın - interceptor ile yönetiyoruz
  // delete instance.defaults.headers.common["Authorization"];

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

    // Kullanıcı profil bilgilerini getir
    dispatch(fetchUserProfile());

    return true;
  }

  return false;
};

// Kullanıcı kaydı
export const registerUser = (userData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await instance.post("/auth/register", userData);

    dispatch(setLoading(false));
    dispatch(setSuccess("Kayıt başarılı! Admin onayı bekleniyor."));
    return response.data;
  } catch (err) {
    let errorMessage = "Kayıt işlemi başarısız oldu";

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
export const fetchUserProfile = () => async (dispatch) => {
  dispatch(setUserFetchState(fetchStates.FETCHING));

  try {
    const response = await userInstance.get();

    dispatch(setUserProfile(response.data));
    dispatch(setUserStatus(response.data.status));
    dispatch(setUserRole(response.data.role));
    dispatch(setUserFetchState(fetchStates.FETCHED));

    return response.data;
  } catch (err) {
    dispatch(setUserFetchState(fetchStates.FAILED));

    // Eğer 401 hatası alırsak, kullanıcı girişini sonlandır
    if (err.response && err.response.status === 401) {
      dispatch(logout());
    }

    let errorMessage = "Profil bilgileri alınamadı";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    return { error: errorMessage };
  }
};

// Kullanıcı profil bilgilerini güncelle
export const updateUserProfile = (userData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await userInstance.put(`/role/${userData.id}`, userData);

    dispatch(setUserProfile(response.data));
    dispatch(setLoading(false));
    dispatch(setSuccess("Profil başarıyla güncellendi"));

    return response.data;
  } catch (err) {
    let errorMessage = "Profil güncellenemedi";

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
