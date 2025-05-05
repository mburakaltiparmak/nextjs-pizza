"use client";

import { toast as toastify, ToastOptions } from "react-toastify";
import Image from "next/image";
import { ShoppingBag, Check, AlertCircle, Info, X } from "lucide-react";

// Toast türleri için ikonlar
const ToastIcons = {
  success: <Check className="text-green-500" size={20} />,
  error: <AlertCircle className="text-red-500" size={20} />,
  info: <Info className="text-blue-500" size={20} />,
  warning: <AlertCircle className="text-yellow-500" size={20} />,
  cart: <ShoppingBag className="text-yellow" size={20} />,
};

// Varsayılan timeout süresi (ms)
const DEFAULT_TIMEOUT = 3000;

// Sepet butonu için özel event
const OPEN_CART_EVENT = "open_floating_cart";

// Toast Hook
export function useToast() {
  // Özelleştirilmiş toast tasarımı
  const toast = ({
    title,
    description,
    icon,
    product,
    type = "info",
    duration = DEFAULT_TIMEOUT,
  }) => {
    return toastify(
      ({ closeToast }) => (
        <div className="flex flex-col font-Barlow">
          <div className="flex flex-row items-center justify-between gap-3 p-1">
            {/* Sol taraf: İkon veya ürün resmi */}
            <div className="">
              {product?.img ? (
                <div className="w-12 h-12 rounded bg-gray-50 p-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.img}
                    alt={product.name || "Ürün"}
                    className="object-contain w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                  {icon || ToastIcons[type] || ToastIcons.info}
                </div>
              )}
            </div>
            {/* Orta kısım: Başlık ve açıklama */}
            <div className="flex-1 pt-1">
              {title && (
                <h4 className="font-bold text-gray-800 mb-0.5">{title}</h4>
              )}
              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
              {product && !description && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{product.name}</span> sepete
                  eklendi
                </p>
              )}
            </div>
          </div>

          {/* Sepete Git butonu - sadece cart tipi toastlarda göster */}
          {type === "cart" && (
            <div className="mt-2 mb-1">
              <button
                onClick={() => {
                  // Custom event oluştur ve dispatch et
                  const event = new CustomEvent(OPEN_CART_EVENT);
                  window.dispatchEvent(event);

                  // Toast'u kapat
                  closeToast();
                }}
                className="w-full py-1.5 bg-yellow text-red hover:bg-red hover:text-yellow transition-colors duration-200 rounded-md font-semibold text-sm flex items-center justify-center"
              >
                <ShoppingBag size={16} className="mr-1" />
                Sepete Git
              </button>
            </div>
          )}
        </div>
      ),
      {
        autoClose: duration,
        className: `${
          type === "success"
            ? "border-l-4 border-l-green-500"
            : type === "error"
            ? "border-l-4 border-l-red-500"
            : type === "warning"
            ? "border-l-4 border-l-yellow-500"
            : type === "cart"
            ? "border-l-4 border-l-yellow"
            : "border-l-4 border-l-blue-500"
        }`,
        hideProgressBar: false,
        closeButton: true, // React-toastify'ın kendi kapatma butonu
        icon: false,
        pauseOnHover: true, // Hover durumunda timeout'u durdur
        draggable: false,
      }
    );
  };

  // Sepete ekleme bildirimi için özel fonksiyon
  const cartNotification = (product, options = {}) => {
    return toast({
      type: "cart",
      product,
      ...options,
    });
  };

  // Genel toast yapılandırmasını değiştir
  const updateToastConfig = (config = {}) => {
    // Toast konfigürasyonunu güncelle
    toastify.configure({
      autoClose: config.duration || DEFAULT_TIMEOUT,
      position: config.position || "top-right",
      ...config,
    });
  };

  // Tüm toast tiplerini dışa aktar
  return {
    toast,
    cartNotification,
    success: (message, options = {}) =>
      toast({
        description: message,
        type: "success",
        ...options,
      }),
    error: (message, options = {}) =>
      toast({
        description: message,
        type: "error",
        ...options,
      }),
    info: (message, options = {}) =>
      toast({
        description: message,
        type: "info",
        ...options,
      }),
    warning: (message, options = {}) =>
      toast({
        description: message,
        type: "warning",
        ...options,
      }),
    dismiss: toastify.dismiss,
    updateToastConfig, // Konfigürasyon güncelleme fonksiyonunu ekledik
  };
}

export default useToast;
