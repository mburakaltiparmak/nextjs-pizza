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

// Toast Hook
export function useToast() {
  // Özelleştirilmiş toast tasarımı
  const toast = ({
    title,
    description,
    icon,
    product,
    type = "info",
    duration = 3000,
  }) => {
    return toastify(
      ({ closeToast }) => (
        <div className="flex flex-row items-center justify-between gap-3 p-1 font-Barlow">
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

          {/* Sağ taraf: Kapat butonu */}
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
        closeButton: false,
        icon: false,
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
  };
}

export default useToast;
