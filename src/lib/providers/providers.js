"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store/store";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { ToastProvider } from "./toast-provider";


export default function Providers({ children }) {

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