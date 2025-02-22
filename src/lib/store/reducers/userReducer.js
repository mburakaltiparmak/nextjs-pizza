export const userActions = {
    setEmail: "SET_EMAIL",
    setRememberMe: "SET_REMEMBER_ME",
    setIsLogin: "SET_IS_LOGIN",
    setToken: "SET_TOKEN"
};

const initialState = {
    email: "",
    rememberMe: false,
    isLogin: false,
    token: null
};

export const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case userActions.setEmail:
            return {
                ...state,
                email: action.payload
            };
        case userActions.setRememberMe:
            return {
                ...state,
                rememberMe: action.payload
            };
        case userActions.setIsLogin:
            return {
                ...state,
                isLogin: action.payload
            };
        case userActions.setToken:
            return {
                ...state,
                token: action.payload
            };
        default:
            return state;
    }
};