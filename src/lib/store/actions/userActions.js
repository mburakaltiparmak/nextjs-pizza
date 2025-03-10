import { instance } from "@/lib/hooks";
import { userActions } from "../reducers/userReducer";
import { setError, setLoading } from "./globalActions";

export const setEmail = (email) => ({
    type: userActions.setEmail,
    payload: email,
});

export const setRememberMe = (rememberMe) => ({
    type: userActions.setRememberMe,
    payload: rememberMe,
});

export const setIsLogin = (isLogin) => ({
    type: userActions.setIsLogin,
    payload: isLogin,
});

export const setToken = (token) => ({
    type: userActions.setToken,
    payload: token,
});

export const login = (formData) => async (dispatch) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    try {
        const res = await instance.post("/auth/login", {
            username: formData.username || formData.email, // Make sure username is correctly sent
            password: formData.password
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
        
        localStorage.setItem("token", token);
        instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        if (formData.rememberMe) {
            dispatch(setRememberMe(true));
        }

        // Kullanıcı bilgilerini kaydet
        const userIdentifier = formData.email || formData.username;
        
        // Redux store'a kaydet
        dispatch(setEmail(userIdentifier));
        
        // localStorage'a da kaydet - checkAuthStatus için gerekli
        localStorage.setItem("userEmail", userIdentifier);
        
        dispatch(setLoading(false));
        return { token };
        
    } catch (err) {
        // Hata işleme...
        dispatch(setIsLogin(false));
        dispatch(setToken(null));
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail"); // Email bilgisini de kaldır
        delete instance.defaults.headers.common['Authorization'];
        
        // Hata mesajını belirle...
        let errorMessage = "Kullanıcı adı veya şifre hatalı";
        
        // Diğer hata işleme kodları...
        
        dispatch(setError(errorMessage));
        dispatch(setLoading(false));
        return { error: errorMessage };
    }
};
export const logout = () => (dispatch) => {
    // Token ve login durumunu temizle
    dispatch(setToken(null));
    dispatch(setIsLogin(false));
    
    // LocalStorage'dan token'ı kaldır
    localStorage.removeItem("token");
    
    // Axios instance header'ındaki Authorization'ı temizle
    delete instance.defaults.headers.common['Authorization'];
    
    return { success: true };
};

export const checkAuthStatus = () => (dispatch) => {
    const token = localStorage.getItem("token");
    
    if (token) {
        // Token varsa, kullanıcıyı giriş yapmış olarak işaretle
        dispatch(setToken(token));
        dispatch(setIsLogin(true));
        
        // Axios instance'ına token ekle
        instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Önemli: Ayrıca kullanıcı email/username bilgisini de al
        const savedEmail = localStorage.getItem("userEmail");
        if (savedEmail) {
            dispatch(setEmail(savedEmail));
        }
        
        return true;
    }
    
    return false;
};