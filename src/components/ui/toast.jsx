"use client";

import React, { useEffect } from 'react';
import { Check, X, AlertCircle, Info, ShoppingBag } from 'lucide-react';

// Toast tiplerine göre stiller ve ikonlar - Proje renkleriyle uyumlu
const toastConfig = {
  success: {
    icon: Check,
    className: 'bg-gradient-to-r from-green-50 to-lightgray border border-green-300 text-green-800 shadow-lg',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100'
  },
  error: {
    icon: X,
    className: 'bg-gradient-to-r from-red-50 to-lightgray border border-red text-red shadow-lg',
    iconColor: 'text-red',
    iconBg: 'bg-red-100'
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-gradient-to-r from-yellow-50 to-lightgray border border-yellow text-darkgray shadow-lg',
    iconColor: 'text-yellow',
    iconBg: 'bg-yellow'
  },
  info: {
    icon: Info,
    className: 'bg-gradient-to-r from-blue-50 to-lightgray border border-blue-300 text-blue-800 shadow-lg',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100'
  },
  cart: {
    icon: ShoppingBag,
    className: 'bg-gradient-to-r from-yellow to-lightyellow border border-yellow text-red shadow-lg',
    iconColor: 'text-red',
    iconBg: 'bg-lightyellow'
  }
};

// Toast bileşeni
export const ToastItem = ({ toast, onRemove }) => {
  const config = toastConfig[toast.type] || toastConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div className={`
      relative flex items-start gap-4 p-4 rounded-xl border-2
      transform transition-all duration-300 ease-in-out
      animate-in slide-in-from-top-2 fade-in-0
      max-w-sm w-full font-Barlow backdrop-blur-sm
      hover:scale-105 hover:shadow-xl
      ${config.className}
    `}>
      {/* Ürün resmi veya ikon */}
      {toast.product?.img ? (
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              src={toast.product.img}
              alt={toast.product.name}
              className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-md"
            />
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${config.iconBg} flex items-center justify-center border-2 border-white`}>
              <ShoppingBag className={`w-3 h-3 ${config.iconColor}`} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center border-2 border-white shadow-md`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
        </div>
      )}

      {/* İçerik */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-bold text-base leading-tight mb-1">
            {toast.title}
          </p>
        )}
        {toast.message && (
          <p className="text-sm opacity-90 leading-relaxed">
            {toast.message}
          </p>
        )}
        {toast.product && !toast.message && (
          <div>
            <p className="font-bold text-base leading-tight mb-1">
              Sepete Eklendi!
            </p>
            <p className="text-sm opacity-90">
              <span className="font-semibold">{toast.product.name}</span> başarıyla eklendi
            </p>
          </div>
        )}

        {/* Sepete git butonu - sadece cart toastlarda */}
        {toast.type === 'cart' && (
          <button
            onClick={() => {
              // Sepet açma eventi
              const event = new CustomEvent('open_floating_cart');
              window.dispatchEvent(event);
              onRemove(toast.id);
            }}
            className="mt-3 w-full py-2 bg-red text-yellow rounded-lg text-sm font-bold hover:bg-darkred hover:text-lightyellow transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingBag size={16} />
              Sepete Git
            </div>
          </button>
        )}
      </div>

      {/* Kapatma butonu */}
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-2 rounded-lg hover:bg-darkgray hover:bg-opacity-10 transition-all duration-200 group"
      >
        <X className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
};

// Toast Container - Konumlandırma güncellendi
export const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};