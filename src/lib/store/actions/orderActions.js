import { useAppSelector, useAppDispatch, useAppStore } from "@/lib/hooks";
import { orderActions } from "../reducers/orderReducer";
import { useToast } from "@/hooks/use-toast";

export const addCart = (product) => ({
  type: orderActions.addCart,
  payload: { product },
});

export const removeFromCart = (index) => ({
  type: orderActions.removeFromCart,
  payload: index,
});

export const updateCart = (id, newCount) => ({
  type: orderActions.updateCart,
  payload: { id, newCount },
});

export const clearCart = () => ({
  type: orderActions.clearCart,
});

export const setUserData = (userData) => ({
  type: orderActions.setUserData,
  payload: userData,
});

export const setPaymentData = (paymentData) => ({
  type: orderActions.setPaymentData,
  payload: paymentData,
});

export const createOrder = () => (useAppSelector) => {
  const userData = useAppSelector((store) => store.order.userData);
  const paymentData = useAppSelector((store) => store.order.paymentData);
  const cartData = useAppSelector((store) => store.order.cart);

  /*
  const userData = useAppSelector((useAppStore) => useAppStore.order.userData);
  const paymentData = useAppSelector(
    (useAppStore) => useAppStore.order.paymentData
  );
  const cartData = useAppSelector((useAppStore) => useAppStore.order.cart);

  console.log("test1", userData);
  console.log("test2", paymentData);
  console.log("test3", cartData);
*/
  // Gerekli verilerin varlığını kontrol ediyoruz
  /*
  if (userData.length === 0 || paymentData.length === 0 || cart.length === 0) {
    console.error("Missing required data for order creation", {
      userData,
      paymentData,
      cart,
    });
    
    // Hata durumunu işlemek için yeni bir action dispatch edebilirsiniz
    return dispatch({
      type: "ORDER_ERROR",
      payload: "Missing user data, payment data, or cart is empty",
    });
  }
*/
  // Burada normalde bir API çağrısı yapılırdı
  // Şimdilik sadece bir simülasyon yapıyoruz
  /*
  setTimeout(() => {
    dispatch({
      type: orderActions.createOrder,
      payload: orderData,
    });

    // Sipariş oluşturulduktan sonra sepeti temizliyoruz
    dispatch({ type: orderActions.clearCart });

    // Kullanıcı ve ödeme verilerini temizliyoruz
    dispatch({ type: orderActions.setUserData, payload: [] });
    dispatch({ type: orderActions.setPaymentData, payload: [] });
  }, 1000); // 1 saniyelik gecikme ile simüle ediyoruz
  */
};
