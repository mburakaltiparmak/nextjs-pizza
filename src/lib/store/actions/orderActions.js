// orderActions.js
import { instance } from "@/lib/hooks";
import { setError, setLoading, setSuccess } from "./globalActions";
import { fetchStates } from "../constants";

// Action Types
export const orderActions = {
  ADD_TO_CART: "ADD_TO_CART",
  REMOVE_FROM_CART: "REMOVE_FROM_CART",
  UPDATE_CART_ITEM: "UPDATE_CART_ITEM",
  CLEAR_CART: "CLEAR_CART",
  SET_USER_ORDERS: "SET_USER_ORDERS",
  SET_ORDER_DETAIL: "SET_ORDER_DETAIL",
  SET_FETCH_STATE: "SET_ORDER_FETCH_STATE",
  SET_ERROR: "SET_ORDER_ERROR",
  SET_USER_DATA: "SET_USER_DATA",
  SET_PAYMENT_DATA: "SET_PAYMENT_DATA",
  SET_PAYMENT_METHOD: "SET_PAYMENT_METHOD",
  SET_ORDER_DATA: "SET_ORDER_DATA",
  SET_SELECTED_ADDRESS: "SET_SELECTED_ADDRESS" // Yeni action type ekle
};

// Seçilen adresi kaydetmek için action creator
export const setSelectedAddress = (address) => ({
  type: orderActions.SET_SELECTED_ADDRESS,
  payload: address
});

// Action Creators
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

export const setUserData = (userData) => ({
  type: orderActions.SET_USER_DATA,
  payload: userData
});

export const setPaymentData = (paymentData) => ({
  type: orderActions.SET_PAYMENT_DATA,
  payload: paymentData
});

export const setPaymentMethod = (method) => ({
  type: orderActions.SET_PAYMENT_METHOD,
  payload: method
});

export const setOrderData = (orderData) => ({
  type: orderActions.SET_ORDER_DATA,
  payload: orderData
});
// Thunk Actions

// Add product to cart
export const addToCart = (product, count = 1) => (dispatch) => {
  const cartItem = {
    id: product.id,
    product: product,
    count: count
  };
  
  dispatch(addToCartAction(cartItem));
  dispatch(setSuccess("Ürün sepete eklendi"));
  
  return { success: true };
};

// Remove product from cart
export const removeFromCart = (itemId) => (dispatch) => {
  dispatch(removeFromCartAction(itemId));
  dispatch(setSuccess("Ürün sepetten kaldırıldı"));
  
  return { success: true };
};

// Update cart item quantity
export const updateCartItem = (itemId, count) => (dispatch) => {
  dispatch(updateCartItemAction(itemId, count));
  
  return { success: true };
};

// Clear cart
export const clearCart = () => (dispatch) => {
  dispatch(clearCartAction());
  
  return { success: true };
};

// Fetch user orders
export const fetchUserOrders = () => async (dispatch) => {
  dispatch(setOrderFetchState(fetchStates.FETCHING));
  
  try {
    const response = await instance.get("/orders/my-orders");
    
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

// Fetch order detail
export const fetchOrderDetail = (orderId) => async (dispatch) => {
  dispatch(setOrderFetchState(fetchStates.FETCHING));
  
  try {
    const response = await instance.get(`/orders/${orderId}`);
    
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

// Misafir siparişi detayını getir
export const fetchGuestOrderDetail = (orderId, email) => async (dispatch) => {
  dispatch(setOrderFetchState(fetchStates.FETCHING));
  
  try {
    const response = await instance.get(`/orders/${orderId}`, {
      params: { email }
    });
    
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
// createOrder fonksiyonu - Hem normal kullanıcı hem misafir siparişleri için
export const createOrder = ({ orderData, paymentData, isGuest = false }) => async (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    // Sipariş öğelerini kontrol et
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error("Sepetinizde ürün bulunmuyor.");
    }
    
    // Adres bilgilerini kontrol et
    if (!orderData.addressId && !orderData.newAddress) {
      throw new Error("Teslimat adresi bilgisi eksik.");
    }
    
    // Backend'e gönderilecek isteği oluştur
    const requestData = {
      items: orderData.items,
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes || ""
    };
    
    // Adres bilgilerini ekle
    if (orderData.addressId) {
      requestData.addressId = orderData.addressId;
      console.log(`Kayıtlı adres kullanılıyor: ID ${orderData.addressId}`);
    } else if (orderData.newAddress) {
      // Backend AddressDto formatına uygun şekilde yeni adres ekle
      requestData.newAddress = {
        fullAddress: orderData.newAddress.fullAddress,
        city: orderData.newAddress.city,
        district: orderData.newAddress.district,
        postalCode: orderData.newAddress.postalCode || "",
        addressTitle: orderData.newAddress.addressTitle || "",
        phoneNumber: orderData.newAddress.phoneNumber || "",
        recipientName: orderData.newAddress.recipientName || "",
        saveAddress: orderData.newAddress.saveAddress === true,
        isDefault: orderData.newAddress.isDefault === true
      };
      console.log("Yeni adres kullanılıyor:", requestData.newAddress);
    }
    
    // Misafir siparişi ise gerekli bilgileri ekle
    if (isGuest) {
      // isGuestOrder flag'ini ayarla
      requestData.isGuestOrder = true;
      
      // Misafir bilgilerini kontrol et
      if (!orderData.guestName || !orderData.guestSurname) {
        throw new Error("Misafir siparişi için ad ve soyad gereklidir.");
      }
      
      if (!orderData.guestEmail || !orderData.guestPhone) {
        throw new Error("Misafir siparişi için e-posta ve telefon gereklidir.");
      }
      
      // Tüm misafir bilgilerini ekle
      requestData.guestName = orderData.guestName;
      requestData.guestSurname = orderData.guestSurname;
      requestData.guestEmail = orderData.guestEmail;
      requestData.guestPhone = orderData.guestPhone;
      
      console.log("Misafir siparişi oluşturuluyor:", 
        requestData.guestName, 
        requestData.guestSurname, 
        requestData.guestEmail);
    }
    
    console.log("Backend'e gönderilen sipariş verisi:", JSON.stringify(requestData, null, 2));
    
    // İsteği gönder - api prefix'ini doğru şekilde kullan
    const endpoint = "/orders";
    const response = await instance.post(endpoint, requestData);
    
    if (!response.data || !response.data.id) {
      throw new Error("Sipariş oluşturuldu fakat ID alınamadı.");
    }
    
    const orderId = response.data.id;
    console.log(`Sipariş başarıyla oluşturuldu: ID ${orderId}`);
    
    // Ödeme işlemini yap
    try {
      if (orderData.paymentMethod === "ONLINE_CREDIT_CARD" && paymentData) {
        // Online kredi kartı ödemesi - api prefix'ini doğru şekilde kullan
        const paymentEndpoint = `/api/orders/${orderId}/pay/card`;
        
        const paymentRequest = {
          cardNumber: paymentData.cardNumber,
          nameOnCard: paymentData.nameOnCard,
          expirationMonth: paymentData.expirationMonth,
          expirationYear: paymentData.expirationYear,
          cvc: paymentData.cvc
        };
        
        console.log(`Kredi kartı ödemesi yapılıyor: ${paymentEndpoint}`);
        await instance.post(paymentEndpoint, paymentRequest);
      } 
      else if (orderData.paymentMethod === "CASH") {
        // Nakit ödeme - api prefix'ini doğru şekilde kullan
        const paymentEndpoint = `/api/orders/${orderId}/pay/cash`;
        
        console.log(`Nakit ödeme işaretleniyor: ${paymentEndpoint}`);
        await instance.post(paymentEndpoint);
      }
      else if (orderData.paymentMethod === "CREDIT_CARD") {
        // Kapıda kredi kartı ödemesi için backend'e bildirim gerekiyorsa
        console.log("Kapıda kredi kartı ödemesi seçildi");
      }
    } catch (paymentError) {
      console.error("Ödeme işlemi sırasında hata:", paymentError);
      dispatch(setSuccess("Siparişiniz oluşturuldu fakat ödeme işlemi sırasında bir hata oluştu"));
      // Ödeme hatası olsa bile siparişi başarılı sayıyoruz
    }
    
    // Sepeti temizle ve sipariş detayını kaydet
    dispatch(clearCartAction());
    dispatch(setOrderDetail(response.data));
    dispatch(setLoading(false));
    dispatch(setSuccess("Siparişiniz başarıyla oluşturuldu"));
    
    return response.data;
  } catch (err) {
    let errorMessage = "Sipariş oluşturulamadı";
    
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
      console.error("Backend hata detayı:", err.response);
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    
    return { error: errorMessage };
  }
};
// Cancel order
export const cancelOrder = (orderId) => async (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    const response = await instance.post(`/orders/${orderId}/cancel`);
    
    // Refresh orders after cancellation
    dispatch(fetchUserOrders());
    
    dispatch(setLoading(false));
    dispatch(setSuccess("Siparişiniz iptal edildi"));
    
    return response.data;
  } catch (err) {
    let errorMessage = "Sipariş iptal edilemedi";
    
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }
    
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    
    return { error: errorMessage };
  }
};

// Misafir sipariş iptali
export const cancelGuestOrder = (orderId, email) => async (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    const response = await instance.post(`/orders/${orderId}/cancel`, { email });
    
    dispatch(setLoading(false));
    dispatch(setSuccess("Siparişiniz iptal edildi"));
    
    return response.data;
  } catch (err) {
    let errorMessage = "Sipariş iptal edilemedi";
    
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }
    
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    
    return { error: errorMessage };
  }
};