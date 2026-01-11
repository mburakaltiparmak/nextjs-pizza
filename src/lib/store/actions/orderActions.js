// orderActions.js
import { instance } from "@/lib/hooks";
import { cartStorage } from "@/lib/utils/cartPersistence";
import { paymentRecovery } from "@/lib/utils/paymentRecovery";
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
// Local storage helpers removed - using cartStorage utility

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
  const savedCart = cartStorage.load();
  if (savedCart && savedCart.length > 0) {
    console.log(`🛒 Cart loaded from storage: ${savedCart.length} items`);
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
      cartStorage.save(updatedCart);

      return { success: true };
    };

// Remove product from cart
export const removeFromCart = (itemId) => (dispatch, getState) => {
  dispatch(removeFromCartAction(itemId));
  dispatch(setSuccess("Ürün sepetten kaldırıldı"));

  // localStorage'a kaydet
  const updatedCart = getState().order.cart;
  cartStorage.save(updatedCart);

  return { success: true };
};

// Update cart item quantity
export const updateCartItem = (itemId, count) => (dispatch, getState) => {
  dispatch(updateCartItemAction(itemId, count));

  // localStorage'a kaydet
  const updatedCart = getState().order.cart;
  cartStorage.save(updatedCart);

  return { success: true };
};

// Clear cart
export const clearCart = () => (dispatch) => {
  dispatch(clearCartAction());

  // localStorage'dan da temizle
  cartStorage.clear();

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

// orderActions.js - createOrder fonksiyonunun düzeltilmiş kısmı

export const createOrder =
  ({ orderData, paymentData }) =>
    async (dispatch) => {
      dispatch(setLoading(true));
      try {
        // Sipariş öğelerini hazırla - Backend sadece productId ve quantity bekliyor
        const processedItems = orderData.items.map((item) => {
          return {
            productId: item.product.id,  // Backend'in ihtiyaç duyduğu ID
            quantity: item.quantity || item.count, // quantity veya count field'ı destekle
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
            // Backend için email alanı - Misafir kullanıcılar için zorunlu
            email: orderData.newAddress.email || null,
          };
          console.log("Yeni adres kullanılıyor:", requestData.newAddress);

          // NEW: Log warning if email is missing for potential guest order
          if (!requestData.newAddress.email) {
            console.warn("⚠️ Warning: Email is missing in newAddress - guest order may fail!");
          }
        }

        console.log(
          "Backend'e gönderilen sipariş verisi:",
          JSON.stringify(requestData, null, 2)
        );

        // İsteği gönder
        const response = await instance.post("/orders", requestData);

        if (!response.data || !response.data.id) {
          throw new Error("Sipariş oluşturuldu fakat ID alınamadı.");
        }

        const orderId = response.data.id;
        console.log(`Sipariş başarıyla oluşturuldu: ID ${orderId}`);

        // Sipariş detaylarını Redux state'ine kaydet
        dispatch(setOrderDetail(response.data));

        // Ödeme işlemini yap
        // Ödeme işlemini yap
        try {
          if (orderData.paymentMethod === "ONLINE_CREDIT_CARD") {
            // Online kredi kartı ödemesi (Iyzico Hosted Checkout Başlatma)
            const paymentEndpoint = `/payment/checkout/init/${orderId}`;

            console.log(`Iyzico ödeme sayfası başlatılıyor: ${paymentEndpoint}`);
            const initResponse = await instance.post(paymentEndpoint);

            const { status, paymentPageUrl, errorMessage } = initResponse.data;

            if (status === "PENDING_CHECKOUT" && paymentPageUrl) {
              console.log("Ödeme sayfası URL'i alındı, yönlendiriliyor: " + paymentPageUrl);

              // 3D Secure öncesi state'i kaydet
              paymentRecovery.saveState(
                orderId,
                initResponse.data.paymentId || "unknown_payment_id",
                orderData.totalAmount || 0,
                initResponse.data.uuid // UUID Backend'den gelmeli (updates.txt)
              );

              // Kullanıcıyı Iyzico ödeme sayfasına yönlendir
              window.location.href = paymentPageUrl;
              return; // İşlemi burada kes, yönlendirme yapılacak
            } else {
              throw new Error(errorMessage || "Ödeme sayfası oluşturulamadı.");
            }
          } else if (orderData.paymentMethod === "CASH") {
            console.log("Nakit ödeme (Kapıda) seçildi. Sipariş beklemede.");
            // Ekstra API çağrısı gerekmez.
          } else if (orderData.paymentMethod === "CREDIT_CARD") {
            console.log("Kredi Kartı (Kapıda) seçildi. Sipariş beklemede.");
            // Ekstra API çağrısı gerekmez.
          } else if (orderData.paymentMethod === "GIFT_CARD") {
            console.log("Hediye Kartı (Kapıda) seçildi. Sipariş beklemede.");
            // Ekstra API çağrısı gerekmez.
          }
        } catch (paymentError) {
          console.error("Ödeme işlemi sırasında hata:", paymentError);
          // Ödeme hatası olsa bile sipariş ID oluştuğu için başarılı sayabiliriz veya iptal edebiliriz.
          // Şimdilik sadece uyarı veriyoruz.
          dispatch(
            setSuccess(
              "Siparişiniz oluşturuldu fakat ödeme işlemi sırasında bir hata oluştu"
            )
          );
        }

        // Sipariş ve ödeme bilgileri Redux'a kaydedildi
        dispatch(setOrderFetchState(fetchStates.FETCHED)); // Loading state'ini kapat
        dispatch(setLoading(false));

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
