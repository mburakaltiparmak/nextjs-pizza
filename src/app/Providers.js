'use client';

import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/lib/store/store';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Providers({ children }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Provider store={store}>
      {children}
      
      {/* ToastContainer'ı client-side mount olduktan sonra render et */}
      {isMounted && (
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      )}
    </Provider>
  );
}