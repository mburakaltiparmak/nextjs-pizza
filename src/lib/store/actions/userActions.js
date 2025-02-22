import { instance } from "@/lib/hooks";
import { userActions } from "../reducers/userReducer";
import { setLoading } from "./productActions";

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
    
    try {
        const res = await instance.post("/auth/login", {
            username: formData.email,
            password: formData.password
        });
        
        console.log("API Response:", res); // Debug için

        if (res?.data?.token) {
            // Token'ı store'a kaydet
            dispatch(setToken(res.data.token));
            // Login durumunu güncelle
            dispatch(setIsLogin(true));
            
            // Token'ı localStorage'a kaydet ve header'a ekle
            localStorage.setItem("token", res.data.token);
            instance.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

            if (formData.rememberMe) {
                dispatch(setRememberMe(true));
            }

            // Kullanıcı email'ini kaydet
            if (formData.email) {
                dispatch(setEmail(formData.email));
            }

            return res; // Önemli: Tüm response'u dön
        }
        
        throw new Error("Token alınamadı");
    } catch (err) {
        console.error("Login action error:", err); // Debug için
        dispatch(setIsLogin(false));
        localStorage.removeItem("token");
        delete instance.defaults.headers.common['Authorization'];
        throw err;
    } finally {
        dispatch(setLoading(false));
    }
};