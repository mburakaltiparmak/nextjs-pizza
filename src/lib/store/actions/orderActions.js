import { orderActions } from "../reducers/orderReducer";
import { setError, setLoading, setSuccess } from "./globalActions";
import { instance } from "@/lib/hooks";
import { fetchStates } from "../constants";

export const addToCartAction = (item) => ({
  type: orderActions.ADD_TO_CART,
  payload: item
});

export const removeFromCartAction = (itemId) => ({
  type: orderActions.REMOVE_FROM_CART,
  payload: itemId
});

export const updateCartItemAction = (itemId, quantity) => ({
  type: orderActions.UPDATE_CART_ITEM,
  payload: { id: itemId, quantity }
});

export const clearCartAction = () => ({
  type: orderActions.CLEAR_CART
});

export const setUserOrders = (orders) => ({
  type: orderActions.SET_USER_ORDERS,
  payload: orders
});

export const setOrderDetail = (order) => ({
  type: orderActions.SET_ORDER_DETAIL,
  payload: order
});

export const setOrderFetchState = (state) => ({
  type: orderActions.SET_FETCH_STATE,
  payload: state
});

export const setOrderError = (error) => ({
  type: orderActions.SET_ERROR,
  payload: error
});

// Sepete ürün ekle
export const addToCart = (product, quantity = 1) => (dispatch) => {
  const cartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    img: product.img,
    quantity: quantity
  };
  
  dispatch(addToCartAction(cartItem));
  dispatch(setSuccess("Ürün sepete eklendi"));
  
  return { success: true };
};

// Sepetten ürün çıkar
export const removeFromCart = (itemId) => (dispatch) => {
  dispatch(removeFromCartAction(itemId));
  dispatch(setSuccess("Ürün sepetten kaldırıldı"));
  
  return { success: true };
};

// Sepetteki ürün miktarını güncelle
export const updateCartItem = (itemId, quantity) => (dispatch) => {
  dispatch(updateCartItemAction(itemId, quantity));
  
  return { success: true };
};

// Sepeti temizle
export const clearCart = () => (dispatch) => {
  dispatch(clearCartAction());
  
  return { success: true };
};

// Kullanıcının siparişlerini getir
export const fetchUserOrders = () => async (dispatch) => {
  dispatch(setOrderFetchState(fetchStates.FETCHING));
  
  try {
    const response = await instance.get("/order/user");
    
    dispatch(setUserOrders(response.data));
    dispatch(setOrderFetchState(fetchStates.FETCHED));
    
    return response.data;
  } catch (err) {
    dispatch(setOrderFetchState(fetchStates.FAILED));
    
    let errorMessage = "Siparişler yüklenemedi";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }
    
    dispatch(setOrderError(errorMessage));
    return { error: errorMessage };
  }
};

// Sipariş detayını getir
export const fetchOrderDetail = (orderId) => async (dispatch) => {
  dispatch(setOrderFetchState(fetchStates.FETCHING));
  
  try {
    const response = await instance.get(`/order/${orderId}`);
    
    dispatch(setOrderDetail(response.data));
    dispatch(setOrderFetchState(fetchStates.FETCHED));
    
    return response.data;
  } catch (err) {
    dispatch(setOrderFetchState(fetchStates.FAILED));
    
    let errorMessage = "Sipariş detayı yüklenemedi";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }
    
    dispatch(setOrderError(errorMessage));
    return { error: errorMessage };
  }
};

// Sipariş oluştur
export const createOrder = (orderData) => async (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    const response = await instance.post("/order", orderData);
    
    dispatch(clearCartAction());
    dispatch(setLoading(false));
    dispatch(setSuccess("Siparişiniz başarıyla oluşturuldu"));
    
    return response.data;
  } catch (err) {
    let errorMessage = "Sipariş oluşturulamadı";
    
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }
    
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    
    return { error: errorMessage };
  }
};
