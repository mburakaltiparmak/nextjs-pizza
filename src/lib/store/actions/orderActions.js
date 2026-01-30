import { cartStorage } from "@/lib/utils/cartPersistence";
import { paymentRecovery } from "@/lib/utils/paymentRecovery";
import { setError, setLoading, setSuccess } from "./globalActions";
import { fetchStates } from "../constants";
import OrderService from "@/lib/services/OrderService";
import PromoCodeService from "@/lib/services/PromoCodeService";
import cache from "@/lib/utils/cacheManager";
import { instance } from "@/lib/hooks"; // Still needed for payment checkout init if not in service
import debounce from 'lodash/debounce';

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
  LOAD_CART_FROM_STORAGE: "LOAD_CART_FROM_STORAGE",
  SET_PROMO_CODE: "SET_PROMO_CODE",
  REMOVE_PROMO_CODE: "REMOVE_PROMO_CODE",
  SET_GUEST_TOKEN: "SET_GUEST_TOKEN",
};

// ========================================
// CACHE KEYS
// ========================================
const CACHE_KEYS = {
  USER_ORDERS: 'user_orders',
  ORDER_DETAIL: (id) => `order_${id}`,
};

const CACHE_DURATION = 5 * 60 * 1000;

const invalidateOrderCache = () => {
    cache.clearPattern('user_orders');
    cache.clearPattern('order_');
    cache.clearPattern('dashboard');
};

// ... (Keep existing simple action creators)
export const setSelectedAddress = (address) => ({ type: orderActions.SET_SELECTED_ADDRESS, payload: address });
export const addToCartAction = (item) => ({ type: orderActions.ADD_TO_CART, payload: item });
export const removeFromCartAction = (itemId) => ({ type: orderActions.REMOVE_FROM_CART, payload: itemId });
export const updateCartItemAction = (itemId, quantity) => ({ type: orderActions.UPDATE_CART_ITEM, payload: { id: itemId, quantity } });
export const clearCartAction = () => ({ type: orderActions.CLEAR_CART });
export const loadCartFromStorageAction = (cart) => ({ type: orderActions.LOAD_CART_FROM_STORAGE, payload: cart });
export const setUserOrders = (orders) => ({ type: orderActions.SET_USER_ORDERS, payload: orders });
export const setOrderDetail = (order) => ({ type: orderActions.SET_ORDER_DETAIL, payload: order });
export const setOrderFetchState = (state) => ({ type: orderActions.SET_FETCH_STATE, payload: state });
export const setOrderError = (error) => ({ type: orderActions.SET_ERROR, payload: error });
export const setUserData = (userData) => ({ type: orderActions.SET_USER_DATA, payload: userData });
export const setPaymentData = (paymentData) => ({ type: orderActions.SET_PAYMENT_DATA, payload: paymentData });
export const setPaymentMethod = (method) => ({ type: orderActions.SET_PAYMENT_METHOD, payload: method });
export const setOrderData = (orderData) => ({ type: orderActions.SET_ORDER_DATA, payload: orderData });
export const setPromoCode = (code, discountAmount) => ({ type: orderActions.SET_PROMO_CODE, payload: { code, discountAmount } });
export const removePromoCode = () => ({ type: orderActions.REMOVE_PROMO_CODE });


// Thunk Actions

// localStorage'dan sepeti yükle
export const initializeCart = () => (dispatch) => {
  const savedCart = cartStorage.load();
  if (savedCart && savedCart.length > 0) {
    dispatch(loadCartFromStorageAction(savedCart));
  }
};

export const addToCart = (product, count = 1) => (dispatch, getState) => {
  const cartItem = { id: product.id, product: product, count: count };
  dispatch(addToCartAction(cartItem));
  dispatch(setSuccess("Ürün sepete eklendi"));
  cartStorage.save(getState().order.cart);
  return { success: true };
};

export const removeFromCart = (itemId) => (dispatch, getState) => {
  dispatch(removeFromCartAction(itemId));
  dispatch(setSuccess("Ürün sepetten kaldırıldı"));
  cartStorage.save(getState().order.cart);
  return { success: true };
};

export const updateCartItem = (itemId, count) => (dispatch, getState) => {
  dispatch(updateCartItemAction(itemId, count));
  cartStorage.save(getState().order.cart);
  return { success: true };
};

export const clearCart = () => (dispatch) => {
  dispatch(clearCartAction());
  cartStorage.clear();
  return { success: true };
};

// Fetch user orders with Cache
export const fetchUserOrders = (forceRefresh = false) => async (dispatch) => {
  const cacheKey = CACHE_KEYS.USER_ORDERS;

  if (!forceRefresh) {
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('✅ Cache hit (User Orders)');
      dispatch(setUserOrders(cached));
      dispatch(setOrderFetchState(fetchStates.FETCHED));
      return cached;
    }
  }

  dispatch(setOrderFetchState(fetchStates.FETCHING));

  try {
    const response = await OrderService.fetchUserOrders();
    // API returns the list directly or inside data? Phase 1 says "return this.get(...)" which is Axios response. 
    // Usually response.data is the payload.
    const orders = response.data;

    dispatch(setUserOrders(orders));
    dispatch(setOrderFetchState(fetchStates.FETCHED));
    
    cache.set(cacheKey, orders, CACHE_DURATION);

    return orders;
  } catch (err) {
    dispatch(setOrderFetchState(fetchStates.FAILED));
    let errorMessage = "Siparişler yüklenemedi";
    if (err.response) errorMessage = err.response.data?.message || errorMessage;
    dispatch(setOrderError(errorMessage));
    return { error: errorMessage };
  }
};

// Fetch order detail with Cache
export const fetchOrderDetail = (orderId) => async (dispatch) => {
  const cacheKey = CACHE_KEYS.ORDER_DETAIL(orderId);
  const cached = cache.get(cacheKey);
  
  if (cached) {
      dispatch(setOrderDetail(cached));
      dispatch(setOrderFetchState(fetchStates.FETCHED));
      return cached;
  }

  dispatch(setOrderFetchState(fetchStates.FETCHING));

  try {
    const response = await OrderService.fetchById(orderId);
    dispatch(setOrderDetail(response.data));
    dispatch(setOrderFetchState(fetchStates.FETCHED));
    
    cache.set(cacheKey, response.data, CACHE_DURATION);

    return response.data;
  } catch (err) {
    dispatch(setOrderFetchState(fetchStates.FAILED));
    let errorMessage = "Sipariş detayı yüklenemedi";
    if (err.response) errorMessage = err.response.data?.message || errorMessage;
    dispatch(setOrderError(errorMessage));
    return { error: errorMessage };
  }
};

// Misafir siparişi detayını getir
export const fetchGuestOrderDetail = (orderId, email) => async (dispatch) => {
  dispatch(setOrderFetchState(fetchStates.FETCHING));

  try {
    const response = await OrderService.fetchGuestOrder(orderId, email);

    dispatch(setOrderDetail(response.data));
    dispatch(setOrderFetchState(fetchStates.FETCHED));

    return response.data;
  } catch (err) {
    dispatch(setOrderFetchState(fetchStates.FAILED));
    let errorMessage = "Sipariş detayı yüklenemedi";
    if (err.response) errorMessage = err.response.data?.message || errorMessage;
    dispatch(setOrderError(errorMessage));
    return { error: errorMessage };
  }
};

export const createOrder = ({ orderData, paymentData }) => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    const { promoCode } = getState().order;
    
    const processedItems = orderData.items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity || item.count,
    }));

    const requestData = {
      items: processedItems,
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes || "",
      promoCode: promoCode || null,
    };

    if (orderData.addressId) {
      requestData.addressId = orderData.addressId;
    } else if (orderData.newAddress) {
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
        email: orderData.newAddress.email || null,
      };
      
      if (!requestData.newAddress.email) {
        console.warn("⚠️ Warning: Email is missing in newAddress - guest order may fail!");
      }
    }

    const response = await OrderService.create(requestData);

    if (!response.data || !response.data.uuid) {
      throw new Error("Sipariş oluşturuldu fakat UUID alınamadı.");
    }

    const orderUuid = response.data.uuid;
    const orderId = response.data.id;
    
    // Invalidate cache
    invalidateOrderCache();

    dispatch(setOrderDetail(response.data));

    // Handle Payment
    try {
      if (orderData.paymentMethod === "ONLINE_CREDIT_CARD") {
        // This part deals with external redirection, so we might keep instance usage or move to a PaymentService later.
        // For now, let's keep it here or use a generic service method if available.
        // Phase 1 didn't explicitly create PaymentService, but we can do a direct call or add to OrderService if related.
        // Let's use direct instance for now as it's specific.
        
        const paymentEndpoint = `/payment/checkout/init/${orderUuid}`;
        const initResponse = await instance.post(paymentEndpoint);
        const { status, paymentPageUrl, errorMessage } = initResponse.data;

        if (status === "PENDING_CHECKOUT" && paymentPageUrl) {
          paymentRecovery.saveState(orderId, initResponse.data.paymentId || "unknown", orderData.totalAmount || 0, orderUuid);
          window.location.href = paymentPageUrl;
          return;
        } else {
          throw new Error(errorMessage || "Ödeme sayfası oluşturulamadı.");
        }
      } 
      // Other methods (CASH, CREDIT_CARD at door) don't need extra steps
    } catch (paymentError) {
      console.error("Ödeme işlemi hatası:", paymentError);
      dispatch(setSuccess("Siparişiniz oluşturuldu fakat ödeme işlemi sırasında bir hata oluştu"));
    }

    dispatch(setOrderFetchState(fetchStates.FETCHED));
    dispatch(setLoading(false));

    return response.data;
  } catch (err) {
    let errorMessage = "Sipariş oluşturulamadı";
    if (err.response) errorMessage = err.response.data?.message || errorMessage;
    else if (err.message) errorMessage = err.message;

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    dispatch(setOrderFetchState(fetchStates.FAILED));

    return { error: errorMessage };
  }
};

export const cancelOrder = (uuid) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await OrderService.cancel(uuid);
    
    invalidateOrderCache();
    dispatch(fetchUserOrders(true)); // Refresh list

    dispatch(setLoading(false));
    dispatch(setSuccess("Siparişiniz iptal edildi"));
    return response.data;
  } catch (err) {
    let errorMessage = "Sipariş iptal edilemedi";
    if (err.response) errorMessage = err.response.data?.message || errorMessage;
    
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

export const cancelGuestOrder = (uuid, email) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await OrderService.cancelGuest(uuid, email);

    dispatch(setLoading(false));
    dispatch(setSuccess("Siparişiniz iptal edildi"));
    return response.data;
  } catch (err) {
    let errorMessage = "Sipariş iptal edilemedi";
    if (err.response) errorMessage = err.response.data?.message || errorMessage;
    
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

/**
 * Helper to reuse format logic
 */
const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
};

// Core verify function
export const verifyPromoCode = (code) => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    const { cart } = getState().order;
    const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.count, 0);

    const response = await PromoCodeService.validate(code, totalAmount);
    
    const { valid, discountAmount, code: validCode, message } = response.data;

    if (valid) {
        dispatch(setPromoCode(validCode, discountAmount));
        dispatch(setSuccess(`Promo kod uygulandı: ${formatPrice(discountAmount)} indirim`));
        dispatch(setLoading(false));
        return { success: true, discountAmount };
    } else {
        throw new Error(message || "Geçersiz promo kod");
    }

  } catch (err) {
    let errorMessage = "Promo kod doğrulanamadı";
    if (err.response) errorMessage = err.response.data?.message || errorMessage;
    else if (err.message) errorMessage = err.message;

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

/**
 * Debounced promo code validation
 */
export const debouncedVerifyPromoCode = debounce(
  (code) => async (dispatch, getState) => {
    if (!code || code.trim() === '') return;
    return await dispatch(verifyPromoCode(code));
  },
  500
);
