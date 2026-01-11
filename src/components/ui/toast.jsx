"use client";

import React, { useEffect } from 'react';
import { Check, X, AlertCircle, Info, ShoppingBag, ArrowRight } from 'lucide-react';

/* 
  TOAST UI SYSTEM
  ---------------------------------
  Distinct UIs for different contexts.
*/

// --- 1. SUCCESS TOAST ---
const SuccessToast = ({ toast, onRemove }) => (
  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-green-100 shadow-lg shadow-green-900/5 group relative overflow-hidden">
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
    <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
      <Check className="w-5 h-5 text-green-600" strokeWidth={3} />
    </div>
    <div className="flex-1 min-w-0">
      {toast.title && <h4 className="font-bold text-darkgray text-sm">{toast.title}</h4>}
      <p className="text-sm text-gray font-medium leading-tight">{toast.message}</p>
    </div>
    <button onClick={() => onRemove(toast.id)} className="text-gray/40 hover:text-darkgray transition-colors">
      <X size={16} />
    </button>
  </div>
);

// --- 2. ERROR TOAST ---
const ErrorToast = ({ toast, onRemove }) => (
  <div className="flex items-start gap-4 bg-white p-4 rounded-xl border border-red/10 shadow-lg shadow-red/5 group relative overflow-hidden">
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red"></div>
    <div className="flex-shrink-0 w-10 h-10 bg-red/10 rounded-full flex items-center justify-center mt-0.5">
      <X className="w-5 h-5 text-red" strokeWidth={3} />
    </div>
    <div className="flex-1 min-w-0">
      {toast.title && <h4 className="font-bold text-red text-sm mb-0.5">{toast.title}</h4>}
      <p className="text-sm text-darkgray font-medium leading-relaxed">{toast.message}</p>
    </div>
    <button onClick={() => onRemove(toast.id)} className="text-gray/40 hover:text-darkgray transition-colors -mt-1 -mr-1">
      <X size={16} />
    </button>
  </div>
);

// --- 3. WARNING TOAST ---
const WarningToast = ({ toast, onRemove }) => (
  <div className="flex items-center gap-4 bg-yellow/5 p-4 rounded-xl border border-yellow/20 shadow-lg shadow-yellow/5 group relative">
    <div className="flex-shrink-0 w-10 h-10 bg-yellow/20 rounded-full flex items-center justify-center">
      <AlertCircle className="w-5 h-5 text-yellow-700" strokeWidth={2.5} />
    </div>
    <div className="flex-1 min-w-0">
      {toast.title && <h4 className="font-bold text-yellow-800 text-sm">{toast.title}</h4>}
      <p className="text-sm text-yellow-900/80 font-medium leading-tight">{toast.message}</p>
    </div>
    <button onClick={() => onRemove(toast.id)} className="text-yellow-700/40 hover:text-yellow-800 transition-colors">
      <X size={16} />
    </button>
  </div>
);

// --- 4. INFO TOAST ---
const InfoToast = ({ toast, onRemove }) => (
  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xl shadow-gray-200/50 group relative">
    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
      <Info className="w-5 h-5 text-darkgray" strokeWidth={2.5} />
    </div>
    <div className="flex-1 min-w-0">
      {toast.title && <h4 className="font-bold text-darkgray text-sm">{toast.title}</h4>}
      <p className="text-sm text-gray font-medium leading-tight">{toast.message}</p>
    </div>
    <button onClick={() => onRemove(toast.id)} className="text-gray/40 hover:text-darkgray transition-colors">
      <X size={16} />
    </button>
  </div>
);

// --- 5. CART TOAST (RICH UI) ---
const CartToast = ({ toast, onRemove }) => (
  <div className="flex flex-col bg-white rounded-2xl border border-lightgray shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden w-full max-w-[340px]">
    {/* Header */}
    <div className="flex items-center justify-between p-3 bg-lightgray/50 border-b border-lightgray">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-yellow rounded-full flex items-center justify-center">
          <ShoppingBag size={12} className="text-darkgray" />
        </div>
        <span className="text-xs font-bold text-darkgray uppercase tracking-wider">Sepete Eklendi</span>
      </div>
      <button onClick={() => onRemove(toast.id)} className="text-gray hover:text-darkgray transition-colors">
        <X size={14} />
      </button>
    </div>

    {/* Body */}
    <div className="flex items-start gap-4 p-4">
      {toast.product?.img ? (
        <div className="w-16 h-16 rounded-lg bg-lightgray overflow-hidden flex-shrink-0 border border-lightgray2">
          <img src={toast.product.img} alt={toast.product.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-lg bg-lightgray flex items-center justify-center text-gray flex-shrink-0">
          <ShoppingBag size={24} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-darkgray text-sm leading-tight line-clamp-2">{toast.product?.name}</h4>
        <p className="text-xs text-gray mt-1 line-clamp-1">{toast.product?.description || "Lezzetli seçim!"}</p>
        <div className="mt-2 text-sm font-bold text-red">{toast.product?.price} ₺</div>
      </div>
    </div>

    {/* Action */}
    <button
      onClick={() => {
        const event = new CustomEvent('open_floating_cart');
        window.dispatchEvent(event);
        onRemove(toast.id);
      }}
      className="w-full py-3 bg-yellow hover:bg-black hover:text-yellow transition-colors text-darkgray text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
    >
      Sepeti Görüntüle
      <ArrowRight size={14} />
    </button>
  </div>
);


// --- 6. VALIDATION TOAST (Action Required) ---
const ValidationToast = ({ toast, onRemove }) => (
  <div className="flex items-start gap-4 bg-orange-50 p-4 rounded-xl border border-orange-200 shadow-lg shadow-orange-500/5 group relative">
    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
      <AlertCircle className="w-5 h-5 text-orange-600" strokeWidth={2.5} />
    </div>
    <div className="flex-1 min-w-0">
      {toast.title && <h4 className="font-bold text-orange-800 text-sm mb-1">{toast.title}</h4>}
      <p className="text-sm text-orange-900/80 font-medium leading-relaxed">{toast.message}</p>
    </div>
    <button onClick={() => onRemove(toast.id)} className="text-orange-400 hover:text-orange-700 transition-colors -mt-1 -mr-1">
      <X size={16} />
    </button>
  </div>
);


// --- MAIN COMPONENT ---
export const ToastItem = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div className="animate-in slide-in-from-right-10 fade-in-0 duration-300 font-Barlow">
      {toast.type === 'success' && <SuccessToast toast={toast} onRemove={onRemove} />}
      {toast.type === 'error' && <ErrorToast toast={toast} onRemove={onRemove} />}
      {toast.type === 'warning' && <WarningToast toast={toast} onRemove={onRemove} />}
      {toast.type === 'info' && <InfoToast toast={toast} onRemove={onRemove} />}
      {toast.type === 'cart' && <CartToast toast={toast} onRemove={onRemove} />}
      {toast.type === 'validation' && <ValidationToast toast={toast} onRemove={onRemove} />}
    </div>
  );
};

export const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-[360px] items-end">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};