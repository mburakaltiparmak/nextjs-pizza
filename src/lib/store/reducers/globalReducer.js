const initialState = {
    loading : false,
    error : "",
};
export const globalActions = {
    setLoading : "SET_LOADING",
    setError : "SET_ERROR"
};
const globalReducer = (state = initialState, action) => {
    switch (action.type) {
        case globalActions.setLoading:
            return {
                ...state,
                loading : action.payload,
            };
        case globalActions.setError:
            return {
                ...state,
                error : action.payload,
            };
            default:
                return state;
    }
}
export default globalReducer;

