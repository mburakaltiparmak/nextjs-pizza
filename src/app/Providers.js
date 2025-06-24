"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store/store";
import { AuthProvider } from "@/lib/context/authContext";
import { ToastProvider } from "@/lib/providers/toast-provider";

export default function Providers({ children }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Provider store={store}>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </Provider>
  );
}