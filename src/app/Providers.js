"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/lib/context/authContext";

// Custom CSS
const toastifyStyles = `
  /* Toast çerçeve ve gölge */
  .Toastify__toast {
    margin-bottom: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    min-height: auto;
    padding: 0.5rem;
    overflow: hidden;
  }

  /* İlerleme çubuğu */
  .Toastify__progress-bar {
    height: 4px;
  }
  
  /* Hover efekti */
  .Toastify__toast:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
    transition: all 0.2s ease;
  }
  
  /* Success toast */
  .Toastify__toast--success .Toastify__progress-bar {
    background-color: #10b981;
  }
  
  /* Error toast */
  .Toastify__toast--error .Toastify__progress-bar {
    background-color: #ef4444;
  }
  
  /* Ürün sepete eklenme animasyonu */
  @keyframes cartPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .border-l-yellow {
    border-color: #facc15;
  }
  
  .border-l-yellow .Toastify__progress-bar {
    background-color: #facc15;
  }
  
  .text-yellow {
    color: #facc15;
  }
  
  .border-l-yellow:not(:hover) {
    animation: cartPulse 0.5s ease-in-out;
  }
`;

export default function Providers({ children }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Provider store={store}>
      {/* AuthProvider eklendi - Redux Provider'ın altında  */}
      <AuthProvider>{children}</AuthProvider>

      {/* Custom styles */}
      <style jsx global>
        {toastifyStyles}
      </style>

      {/* ToastContainer'ı client-side mount olduktan sonra render et */}
      {isMounted && (
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          limit={3}
        />
      )}
    </Provider>
  );
}
