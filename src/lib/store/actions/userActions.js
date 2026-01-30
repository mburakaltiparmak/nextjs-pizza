import { instance } from "@/lib/hooks";
import { getTokenExpiration } from "@/lib/utils/tokenUtils";
import { setTokens, clearTokens, getAccessToken, getRefreshToken, getRememberMe, setRememberMe as setRememberMeStorage } from "@/lib/utils/tokenStorage";
import { tokenRefreshManager } from "@/lib/utils/tokenRefreshManager";
import { setError, setLoading, setSuccess } from "./globalActions";
import { fetchStates } from "../constants";
import { initializeAuth } from "./initAuth";
import { supabase } from "@/lib/supabase";
import UserService from "@/lib/services/UserService";
import cache from "@/lib/utils/cacheManager";

// Action Types
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

// ========================================
// CACHE KEYS
// ========================================
const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  USER_ADDRESSES: 'user_addresses',
};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const invalidateUserCache = () => {
    cache.clear(CACHE_KEYS.USER_PROFILE);
    cache.clear(CACHE_KEYS.USER_ADDRESSES);
    cache.clearPattern('dashboard');
};

// Simple Action Creators
export const setEmail = (email) => ({ type: userActions.SET_EMAIL, payload: email });
export const setRememberMe = (rememberMe) => {
  setRememberMeStorage(rememberMe);
  return { type: userActions.SET_REMEMBER_ME, payload: rememberMe };
};
export const setIsLogin = (isLogin) => ({ type: userActions.SET_IS_LOGIN, payload: isLogin });
export const setToken = (token) => ({ type: userActions.SET_TOKEN, payload: token });
export const setUserProfile = (profile) => ({ type: userActions.SET_USER_PROFILE, payload: profile });
export const setUserStatus = (status) => ({ type: userActions.SET_USER_STATUS, payload: status });
export const setUserRole = (role) => ({ type: userActions.SET_USER_ROLE, payload: role });
export const setUserFetchState = (fetchState) => ({ type: userActions.SET_FETCH_STATE, payload: fetchState });
export const clearUserData = () => ({ type: userActions.CLEAR_USER_DATA });
export const setAuthProvider = (provider) => ({ type: userActions.SET_AUTH_PROVIDER, payload: provider });
export const setUserAddresses = (addresses) => ({ type: userActions.SET_USER_ADDRESSES, payload: addresses });
export const addUserAddress = (address) => ({ type: userActions.ADD_USER_ADDRESS, payload: address });
export const updateUserAddress = (address) => ({ type: userActions.UPDATE_USER_ADDRESS, payload: address });
export const removeUserAddress = (addressId) => ({ type: userActions.REMOVE_USER_ADDRESS, payload: addressId });
export const setDefaultAddress = (addressId) => ({ type: userActions.SET_DEFAULT_ADDRESS, payload: addressId });
export const setTokenExpiration = (expiresAt, expiresIn) => ({ type: userActions.SET_TOKEN_EXPIRATION, payload: { expiresAt, expiresIn } });

// Thunk Actions

// Login
export const login = (formData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await instance.post("/auth/login", {
      email: formData.username,
      password: formData.password,
    });

    if (!response.data || !response.data.accessToken) {
      throw new Error("Access token alınamadı");
    }

    const { accessToken, refreshToken, user } = response.data;

    dispatch(setToken(accessToken));
    dispatch(setIsLogin(true));
    dispatch(setAuthProvider("email"));
    dispatch(setRememberMe(formData.rememberMe));

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
      // Cache the initial profile loaded during login
      cache.set(CACHE_KEYS.USER_PROFILE, user, CACHE_DURATION);
    }

    setTokens(accessToken, refreshToken, user?.email || formData.username, formData.rememberMe);
    instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    const expiresAt = getTokenExpiration(accessToken);
    const expiresIn = response.data.expiresIn || (expiresAt ? Math.floor((expiresAt - Date.now()) / 1000) : null);
    dispatch(setTokenExpiration(expiresAt, expiresIn));

    dispatch(setLoading(false));
    dispatch(setSuccess("Giriş başarılı"));
    return { accessToken, user };
  } catch (err) {
    console.error("Login error:", err);
    let errorMessage = "Giriş başarısız oldu";
    if (err.response && err.response.data) errorMessage = err.response.data.message || errorMessage;
    else if (err.message) errorMessage = err.message;

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

// Initiate Google Login
export const initiateGoogleLogin = () => async () => {
    // ... (Keep existing implementation)
    try {
        const returnUrl = window.location.pathname;
        localStorage.setItem("authReturnUrl", returnUrl);
        const rememberMe = getRememberMe();
        setRememberMeStorage(rememberMe);
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${window.location.origin}/oauth2/callback` },
        });
      } catch (error) {
        console.error("Google login başlatma hatası:", error);
      }
};

// Handle OAuth Callback
export const handleOAuthCallback = (token, rememberMe = true) => async (dispatch) => {
    // ... (Refactor slightly to use cache/service if applicable, mostly logic stays)
    if (!token) return { error: "Token bulunamadı" };
    try {
        dispatch(setLoading(true));
        dispatch(setToken(token));
        dispatch(setIsLogin(true));
        dispatch(setAuthProvider("google"));
        dispatch(setRememberMe(rememberMe));
        
        setTokens(token, "", "", rememberMe);
        instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
        const expiresAt = getTokenExpiration(token);
        const expiresIn = expiresAt ? Math.floor((expiresAt - Date.now()) / 1000) : null;
        dispatch(setTokenExpiration(expiresAt, expiresIn));

        // Fetch Profile
        try {
          await dispatch(fetchUserProfile());
        } catch (profileError) {
           console.error("Profil bilgisi alınamadı:", profileError);
        }

        dispatch(setLoading(false));
        dispatch(setSuccess("Google ile giriş başarılı"));
        return { success: true };
    } catch (error) {
        dispatch(setError("OAuth ile giriş yapılamadı"));
        dispatch(setLoading(false));
        return { error: "OAuth callback failed" };
    }
};

// Logout
export const logout = () => async (dispatch) => {
    try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
            await instance.post("/auth/logout", { refreshToken }).catch(() => {});
        }
        clearTokens();
        tokenRefreshManager.reset();
        
        if (instance?.defaults?.headers) {
             delete instance.defaults.headers.common["Authorization"];
        }
        
        dispatch(clearUserData());
        invalidateUserCache(); // Clear user cache on logout

        return { success: true };
    } catch (error) {
        // Force cleanup
        clearTokens();
        tokenRefreshManager.reset();
        dispatch(clearUserData());
        return { error: "Çıkış yapılamadı", success: false };
    }
};

// Check Auth Status (Keep existing unified logic, add cache check?)
// Note: Auth status check connects to profile fetch, which we will optimize.
let authCheckInProgress = false;
let authCheckPromise = null;
let lastAuthCheckTime = 0;
const AUTH_CACHE_TIME = 2000;

export const checkAuthStatus = () => async (dispatch) => {
  if (authCheckInProgress && authCheckPromise) return authCheckPromise;
  if (Date.now() - lastAuthCheckTime < AUTH_CACHE_TIME) return Promise.resolve(true);

  try {
    authCheckInProgress = true;
    authCheckPromise = (async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          dispatch(clearUserData());
          return false;
        }

        instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        dispatch(setToken(token));
        dispatch(setIsLogin(true));
        dispatch(setRememberMe(getRememberMe()));

        if (window.location.pathname.includes("/oauth2/callback")) return true;

        try {
          await dispatch(fetchUserProfile());
        } catch (e) { console.error("Profile check failed", e); }
        
        return true;
      } catch (error) {
        await dispatch(logout());
        return false;
      }
    })();
    const result = await authCheckPromise;
    lastAuthCheckTime = Date.now();
    return result;
  } finally {
    setTimeout(() => { authCheckInProgress = false; authCheckPromise = null; }, 100);
  }
};

// Register (Auth)
export const registerUser = (userData) => async (dispatch) => {
    // Keep existing implementation
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
        const { confirmPassword, ...registrationData } = userData;
        const response = await instance.post("/auth/register", registrationData);
        dispatch(setLoading(false));
        dispatch(setSuccess("Kayıt başarılı! Lütfen e-posta adresinize gönderilen doğrulama bağlantısına tıklayın."));
        return { success: true, data: response.data };
    } catch (err) {
        if (err.code === "ECONNABORTED") {
             dispatch(setLoading(false));
             dispatch(setSuccess("Kayıt işlemi muhtemelen başarılı! Lütfen e-posta kutunuzu kontrol edin."));
             return { success: true, timeout: true };
        }
        let errorMessage = "Kayıt işlemi başarısız oldu";
        if (err.response && err.response.data) errorMessage = err.response.data.message || errorMessage;
        else if (err.message) errorMessage = err.message;
        dispatch(setError(errorMessage));
        dispatch(setLoading(false));
        return { error: errorMessage };
    }
};

// Fetch User Profile with Cache and Service
export const fetchUserProfile = () => async (dispatch, getState) => {
  // Check Cache
  const cached = cache.get(CACHE_KEYS.USER_PROFILE);
  if (cached) {
      dispatch(setUserProfile(cached));
      if (cached.role) dispatch(setUserRole(cached.role));
      if (cached.status) dispatch(setUserStatus(cached.status));
      dispatch(setUserFetchState(fetchStates.FETCHED));
      return cached;
  }

  // Ensure token availability
  let { user: { token } } = getState();
  if (!token) {
      await dispatch(initializeAuth());
      token = getState().user.token;
      if (!token) return null;
  }
  instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  try {
    const response = await UserService.fetchProfile();
    const userData = response.data;
    
    dispatch(setUserProfile(userData));
    if (userData.role) dispatch(setUserRole(userData.role));
    if (userData.status) dispatch(setUserStatus(userData.status));
    
    dispatch(setUserFetchState(fetchStates.FETCHED));
    
    // Set Cache
    cache.set(CACHE_KEYS.USER_PROFILE, userData, CACHE_DURATION);

    return userData;
  } catch (error) {
    if (error.response && error.response.status === 401) {
        dispatch(clearUserData());
    }
    throw error;
  }
};

export const updateUserProfile = (userData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await UserService.updateProfile(userData);
    const updatedUserData = response.data;

    dispatch(setUserProfile(updatedUserData));
    if (updatedUserData.email) {
      dispatch(setEmail(updatedUserData.email));
      const rememberMe = getRememberMe();
      setTokens(getAccessToken(), getRefreshToken(), updatedUserData.email, rememberMe);
    }

    dispatch(setLoading(false));
    dispatch(setSuccess("Profiliniz başarıyla güncellendi"));
    
    // Invalidate Cache to force refresh next time (or update cache)
    // Here we updated store, but cache might be stale? We can update cache too.
    cache.set(CACHE_KEYS.USER_PROFILE, updatedUserData, CACHE_DURATION);

    return updatedUserData;
  } catch (err) {
    let errorMessage = "Profil güncellenemedi";
    if (err.response) {
         if (err.response.status === 401) { dispatch(logout()); errorMessage = "Oturumunuz sona erdi"; }
         else errorMessage = err.response.data?.message || errorMessage;
    }
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

export const changePassword = (passwordData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));
  try {
    await UserService.changePassword(passwordData);
    dispatch(setLoading(false));
    dispatch(setSuccess("Şifreniz başarıyla değiştirildi"));
    return { success: true };
  } catch (err) {
    let errorMessage = "Şifre değiştirilemedi";
    if (err.response) errorMessage = err.response.data?.message || errorMessage;
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

export const fetchUserAddresses = () => async (dispatch, getState) => {
  const cached = cache.get(CACHE_KEYS.USER_ADDRESSES);
  if (cached) {
      dispatch(setUserAddresses(cached));
      dispatch(setUserFetchState(fetchStates.FETCHED));
      return cached;
  }
  
  dispatch(setUserFetchState(fetchStates.FETCHING));

  try {
    // Rely on interceptor for token
    const response = await UserService.fetchAddresses();
    const data = response.data || [];
    
    dispatch(setUserAddresses(data));
    dispatch(setUserFetchState(fetchStates.FETCHED));
    
    cache.set(CACHE_KEYS.USER_ADDRESSES, data, CACHE_DURATION);
    
    return data;
  } catch (err) {
    dispatch(setUserAddresses([]));
    dispatch(setUserFetchState(fetchStates.FETCHED)); // Don't block UI with error state for addresses?
    return [];
  }
};

export const createAddress = (addressData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await UserService.createAddress(addressData);
    
    dispatch(setUserAddresses(response.data)); 
    dispatch(setSuccess("Adres başarıyla eklendi"));
    dispatch(setLoading(false));
    
    cache.set(CACHE_KEYS.USER_ADDRESSES, response.data, CACHE_DURATION);
    
    return response.data;
  } catch (err) {
    let errorMessage = "Adres eklenemedi";
    if (err.response) {
        if(err.response.status === 401) dispatch(logout());
        else errorMessage = err.response.data?.message || errorMessage;
    }
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

export const updateAddress = (addressId, addressData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await UserService.updateAddress(addressId, addressData);
    
    dispatch(setUserAddresses(response.data));
    dispatch(setSuccess("Adres başarıyla güncellendi"));
    dispatch(setLoading(false));
    
    cache.set(CACHE_KEYS.USER_ADDRESSES, response.data, CACHE_DURATION);
    
    return response.data;
  } catch (err) {
    let errorMessage = "Adres güncellenemedi";
    if (err.response) {
        if(err.response.status === 401) dispatch(logout());
        else errorMessage = err.response.data?.message || errorMessage;
    }
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

export const deleteAddress = (addressId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await UserService.deleteAddress(addressId);
    
    if (response && response.data) {
       dispatch(setUserAddresses(response.data));
       cache.set(CACHE_KEYS.USER_ADDRESSES, response.data, CACHE_DURATION);
    } else {
       await dispatch(fetchUserAddresses());
    }
    
    dispatch(setSuccess("Adres başarıyla silindi"));
    dispatch(setLoading(false));
    return { success: true };
  } catch (err) {
    let errorMessage = "Adres silinemedi";
    if (err.response) {
        if(err.response.status === 401) dispatch(logout());
        else errorMessage = err.response.data?.message || errorMessage;
    }
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

export const setAddressAsDefault = (addressId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    // Using put on UserService (inheriting from BaseService)
    const response = await UserService.put(`/addresses/${addressId}/set-default`);
    
    dispatch(setUserAddresses(response.data));
    dispatch(setSuccess("Varsayılan adres ayarlandı"));
    dispatch(setLoading(false));

    cache.set(CACHE_KEYS.USER_ADDRESSES, response.data, CACHE_DURATION);

    return response.data;
  } catch (err) {
     let errorMessage = "Varsayılan adres ayarlanamadı";
    if (err.response) {
        if(err.response.status === 401) dispatch(logout());
        else errorMessage = err.response.data?.message || errorMessage;
    }
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

export const verifyEmail = (token) => async (dispatch) => {
    // Keep existing
    try {
        dispatch(setLoading(true));
        const response = await instance.get(`/auth/verify-email?token=${token}`);
        dispatch(setSuccess("Email adresiniz başarıyla doğrulandı."));
        dispatch(setLoading(false));
        return { success: true, data: response.data };
    } catch (error) {
        let errorMessage = "Email doğrulama işlemi başarısız oldu";
        if (error.response) errorMessage = error.response.data?.message || errorMessage;
        dispatch(setError(errorMessage));
        dispatch(setLoading(false));
        return { error: errorMessage };
    }
};

export const forgotPassword = (email) => async (dispatch) => {
   // Keep existing
   dispatch(setLoading(true));
   dispatch(setError(null));
   try {
       await instance.post("/auth/forgot-password", { email });
       dispatch(setLoading(false));
       dispatch(setSuccess("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi"));
       return { success: true };
   } catch (err) {
       let errorMessage = "Şifre sıfırlama işlemi başarısız oldu";
       if (err.response) errorMessage = err.response.data?.message || errorMessage;
       dispatch(setError(errorMessage));
       dispatch(setLoading(false));
       return { error: errorMessage };
   }
};

export const resetPassword = (token, newPassword) => async (dispatch) => {
   // Keep existing
   dispatch(setLoading(true));
   dispatch(setError(null));
   try {
       await instance.post("/auth/reset-password", { token, newPassword });
       dispatch(setLoading(false));
       dispatch(setSuccess("Şifreniz başarıyla sıfırlandı. Lütfen giriş yapın."));
       return { success: true };
   } catch (err) {
       let errorMessage = "Şifre sıfırlama işlemi başarısız oldu";
       if (err.response) errorMessage = err.response.data?.message || errorMessage;
       dispatch(setError(errorMessage));
       dispatch(setLoading(false));
       return { error: errorMessage };
   }
};
