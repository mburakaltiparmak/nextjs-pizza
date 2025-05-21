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
  SET_SELECTED_ADDRESS: "SET_SELECTED_ADDRESS",
  LOAD_CART_FROM_STORAGE: "LOAD_CART_FROM_STORAGE", // Yeni action type ekle
};

// localStorage yardımcı fonksiyonları
export const saveCartToStorage = (cart) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Cart localStorage kaydetme hatası:", error);
    }
  }
};

const loadCartFromStorage = () => {
  if (typeof window !== "undefined") {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Cart localStorage okuma hatası:", error);
      return [];
    }
  }
  return [];
};

// Seçilen adresi kaydetmek için action creator
export const setSelectedAddress = (address) => ({
  type: orderActions.SET_SELECTED_ADDRESS,
  payload: address,
});

// Action Creators
export const addToCartAction = (item) => ({
  type: orderActions.ADD_TO_CART,
  payload: item,
});

export const removeFromCartAction = (itemId) => ({
  type: orderActions.REMOVE_FROM_CART,
  payload: itemId,
});

export const updateCartItemAction = (itemId, quantity) => ({
  type: orderActions.UPDATE_CART_ITEM,
  payload: { id: itemId, quantity },
});

export const clearCartAction = () => ({
  type: orderActions.CLEAR_CART,
});

export const loadCartFromStorageAction = (cart) => ({
  type: orderActions.LOAD_CART_FROM_STORAGE,
  payload: cart,
});

export const setUserOrders = (orders) => ({
  type: orderActions.SET_USER_ORDERS,
  payload: orders,
});

export const setOrderDetail = (order) => ({
  type: orderActions.SET_ORDER_DETAIL,
  payload: order,
});

export const setOrderFetchState = (state) => ({
  type: orderActions.SET_FETCH_STATE,
  payload: state,
});

export const setOrderError = (error) => ({
  type: orderActions.SET_ERROR,
  payload: error,
});

export const setUserData = (userData) => ({
  type: orderActions.SET_USER_DATA,
  payload: userData,
});

export const setPaymentData = (paymentData) => ({
  type: orderActions.SET_PAYMENT_DATA,
  payload: paymentData,
});

export const setPaymentMethod = (method) => ({
  type: orderActions.SET_PAYMENT_METHOD,
  payload: method,
});

export const setOrderData = (orderData) => ({
  type: orderActions.SET_ORDER_DATA,
  payload: orderData,
});

// Thunk Actions

// localStorage'dan sepeti yükle
export const initializeCart = () => (dispatch) => {
  const savedCart = loadCartFromStorage();
  if (savedCart && savedCart.length > 0) {
    dispatch(loadCartFromStorageAction(savedCart));
  }
};

// Add product to cart
export const addToCart =
  (product, count = 1) =>
  (dispatch, getState) => {
    const cartItem = {
      id: product.id,
      product: product,
      count: count,
    };

    dispatch(addToCartAction(cartItem));
    dispatch(setSuccess("Ürün sepete eklendi"));

    // localStorage'a kaydet
    const updatedCart = getState().order.cart;
    saveCartToStorage(updatedCart);

    return { success: true };
  };

// Remove product from cart
export const removeFromCart = (itemId) => (dispatch, getState) => {
  dispatch(removeFromCartAction(itemId));
  dispatch(setSuccess("Ürün sepetten kaldırıldı"));

  // localStorage'a kaydet
  const updatedCart = getState().order.cart;
  saveCartToStorage(updatedCart);

  return { success: true };
};

// Update cart item quantity
export const updateCartItem = (itemId, count) => (dispatch, getState) => {
  dispatch(updateCartItemAction(itemId, count));

  // localStorage'a kaydet
  const updatedCart = getState().order.cart;
  saveCartToStorage(updatedCart);

  return { success: true };
};

// Clear cart
export const clearCart = () => (dispatch) => {
  dispatch(clearCartAction());

  // localStorage'dan da temizle
  saveCartToStorage([]);

  return { success: true };
};

// Fetch user orders
export const fetchUserOrders = () => async (dispatch) => {
  dispatch(setOrderFetchState(fetchStates.FETCHING));

  try {
    const response = await instance.get("/orders/my-orders");

    dispatch(setUserOrders(response.data));
    dispatch(setOrderFetchState(fetchStates.FETCHED));
    console.log("order res", response.data);
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
      params: { email },
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

const createCustomPizzaProduct = async (pizzaData) => {
  try {
    const response = await instance.post("/product/custom-pizza", {
      totalPrice: pizzaData.price,
      customDetails: pizzaData.description,
    });
    return response.data;
  } catch (error) {
    console.error("Custom pizza oluşturulamadı:", error);
    throw error;
  }
};

export const createOrder =
  ({ orderData, paymentData }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      // Sipariş öğelerini hazırla
      const processedItems = orderData.items.map((item) => {
        return {
          // Sadece gerekli ürün bilgilerini gönderiyoruz (ID ve kategori bilgisi olmadan)
          product: {
            name: item.product.name,
            price: item.product.price,
            image: item.product.img,
            description: item.product.description,
            isCustom: isCustomProduct(item.product),
          },
          quantity: item.quantity,
          unitPrice: item.product.price,
        };
      });

      // Backend'e gönderilecek isteği güncelle
      const requestData = {
        items: processedItems,
        paymentMethod: orderData.paymentMethod,
        notes: orderData.notes || "",
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
          isDefault: orderData.newAddress.isDefault === true,
        };
        console.log("Yeni adres kullanılıyor:", requestData.newAddress);
      }

      console.log(
        "Backend'e gönderilen sipariş verisi:",
        JSON.stringify(requestData, null, 2)
      );

      // İsteği gönder - api prefix'ini doğru şekilde kullan
      const response = await instance.post("/orders", requestData);

      if (!response.data || !response.data.id) {
        throw new Error("Sipariş oluşturuldu fakat ID alınamadı.");
      }

      const orderId = response.data.id;
      console.log(`Sipariş başarıyla oluşturuldu: ID ${orderId}`);

      // Sipariş detaylarını Redux state'ine kaydet
      dispatch(setOrderDetail(response.data));

      // Ödeme işlemini yap
      try {
        if (orderData.paymentMethod === "ONLINE_CREDIT_CARD" && paymentData) {
          // Online kredi kartı ödemesi - api prefix'ini doğru şekilde kullan
          const paymentEndpoint = `/orders/${orderId}/pay/card`;

          const paymentRequest = {
            cardNumber: paymentData.cardNumber,
            nameOnCard: paymentData.nameOnCard,
            expirationMonth: paymentData.expirationMonth,
            expirationYear: paymentData.expirationYear,
            cvc: paymentData.cvc,
          };

          console.log(`Kredi kartı ödemesi yapılıyor: ${paymentEndpoint}`);
          const paymentResponse = await instance.post(
            paymentEndpoint,
            paymentRequest
          );

          // Ödeme bilgilerini de Redux'a ekle
          if (paymentResponse && paymentResponse.data) {
            const updatedOrderResponse = await instance.get(
              `/orders/${orderId}`
            );
            if (updatedOrderResponse && updatedOrderResponse.data) {
              dispatch(setOrderDetail(updatedOrderResponse.data));
            }
          }
        } else if (orderData.paymentMethod === "CASH") {
          // Nakit ödeme - api prefix'ini doğru şekilde kullan
          const paymentEndpoint = `/orders/${orderId}/pay/cash`;

          console.log(`Nakit ödeme işaretleniyor: ${paymentEndpoint}`);
          const paymentResponse = await instance.post(paymentEndpoint);

          // Ödeme sonrası sipariş bilgilerini güncelle
          if (paymentResponse && paymentResponse.data) {
            const updatedOrderResponse = await instance.get(
              `/orders/${orderId}`
            );
            if (updatedOrderResponse && updatedOrderResponse.data) {
              dispatch(setOrderDetail(updatedOrderResponse.data));
            }
          }
        } else if (orderData.paymentMethod === "CREDIT_CARD") {
          // Kapıda kredi kartı ödemesi için backend'e bildirim gerekiyorsa
          console.log("Kapıda kredi kartı ödemesi seçildi");
        }
      } catch (paymentError) {
        console.error("Ödeme işlemi sırasında hata:", paymentError);
        dispatch(
          setSuccess(
            "Siparişiniz oluşturuldu fakat ödeme işlemi sırasında bir hata oluştu"
          )
        );
        // Ödeme hatası olsa bile siparişi başarılı sayıyoruz
      }

      // Sipariş ve ödeme bilgileri Redux'a kaydedildi
      dispatch(setOrderFetchState(fetchStates.FETCHED)); // Loading state'ini kapat
      dispatch(setLoading(false));

      /*
    dispatch(clearCartAction());
    saveCartToStorage([]); // localStorage'ı da temizle
    */

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
      dispatch(setOrderFetchState(fetchStates.FAILED)); // Error durumunu ayarla

      return { error: errorMessage };
    }
  };

// Custom pizza kontrolü için yardımcı fonksiyon
function isCustomProduct(product) {
  try {
    if (!product.description) return false;

    const description =
      typeof product.description === "string"
        ? JSON.parse(product.description)
        : product.description;

    return description.isCustom === true;
  } catch (e) {
    return false;
  }
}
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
    const response = await instance.post(`/orders/${orderId}/cancel`, {
      email,
    });

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
