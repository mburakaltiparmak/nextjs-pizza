'use client';

import { toast as toastify } from 'react-toastify';

// React-toastify'ı sarmalayan bir hook
export function useToast() {
  // Özel içerikli toast bildirimi
  const customToast = ({ title, description, type = 'info', duration = 5000 }) => {
    return toastify(
      <div>{title || description}</div>,
      {
        autoClose: duration,
        type: type,
      }
    );
  };

  // Standart toast fonksiyonunu kullanmak için
  const toast = (message, type = 'info', options = {}) => {
    if (typeof message === 'object') {
      // Nesne olarak geçilirse özel içerikli toast olarak ele alınır
      return customToast(message);
    }

    // Normal string mesajı olarak kullanım
    return toastify[type](message, options);
  };

  // Toast'ı kapatmak için
  const dismiss = (toastId) => {
    toastify.dismiss(toastId);
  };

  // React-toastify kütüphanesinin tüm fonksiyonlarını da dışarı ver
  return {
    toast,
    dismiss,
    success: (message, options) => toastify.success(message, options),
    error: (message, options) => toastify.error(message, options),
    info: (message, options) => toastify.info(message, options),
    warning: (message, options) => toastify.warning(message, options),
  };
}

export default useToast;