"use client";

import React, { useState } from 'react';
import { ToastContext } from '@/hooks/use-toast';
import { ToastContainer } from '@/components/ui/toast';

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toastData) => {
    const id = Date.now() + Math.random();
    const toast = { id, ...toastData };
    
    setToasts(prev => [...prev, toast]);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};