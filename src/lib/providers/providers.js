"use client";

import { Provider } from "react-redux";
import { useEffect, useRef } from "react";
import { store } from "@/lib/store/store";
import { cartStorage } from "@/lib/utils/cartPersistence";
import { paymentRecovery } from "@/lib/utils/paymentRecovery";
import { loadCartFromStorageAction } from "@/lib/store/actions/orderActions";
import { instance } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/hooks/useToast";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { ToastProvider } from "./toast-provider";
import { SocketProvider } from "./SocketProvider";

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <AppInitializer />
            {children}
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </Provider>
  );
}

function AppInitializer() {
  const router = useRouter();
  const { toast } = useToast();

  // 1. Cart Synchronization (Multi-tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'cart_sync') {
        const syncedCart = cartStorage.load();
        const localCart = store.getState().order.cart;

        // Merge carts
        const mergedCart = cartStorage.merge(localCart, syncedCart);

        // Update Redux
        store.dispatch(loadCartFromStorageAction(mergedCart));

        console.log('🔄 Cart synced across tabs');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 2. Payment Recovery Check
  // 2. Payment Recovery Check
  const checkedPaymentRef = useRef(false);

  useEffect(() => {
    const checkPayment = async () => {
      // Prevent double checks
      if (checkedPaymentRef.current) return;
      checkedPaymentRef.current = true;

      // Avoid checking if we are already on the success page to prevent loop/redundancy
      if (window.location.pathname.includes('/payment/success')) {
        return;
      }

      const recovery = await paymentRecovery.checkIncompletePayment(instance);

      if (recovery) {
        if (recovery.type === 'SUCCESS') {
          router.push(`/payment/success?orderId=${recovery.orderId}`);
          toast({
            title: "Ödeme Başarılı",
            description: "Ödemeniz başarıyla tamamlandı!",
            variant: "default",
            className: "bg-green-50 border-green-200 text-green-900"
          });
        } else if (recovery.type === 'FAILED') {
          toast({
            title: "Ödeme Başarısız",
            description: recovery.error || "Ödeme işlemi tamamlanamadı.",
            variant: "destructive"
          });
        }
        // PENDING/TIMEOUT: Do nothing or show info
      }
    };

    // Small delay to ensure client side is ready?
    checkPayment();
  }, []); // Run once on mount

  return null;
}