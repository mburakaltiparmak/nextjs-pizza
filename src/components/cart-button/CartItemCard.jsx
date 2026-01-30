"use client";
import React from "react";
import Image from "next/image";
import { Plus, Minus, Trash2 } from "lucide-react";

export const CartItemCard = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  return (
    <div className="flex items-center justify-between p-3 mb-3 bg-white border-b border-gray shadow-md rounded-lg transition-all hover:shadow-lg">
      <div className="flex items-center space-x-4 w-full">
        {/* Product Image */}
        <div className="w-16 h-16 rounded-md overflow-hidden bg-lightgray flex-shrink-0 relative">
          {item.product.img ? (
            <Image
              src={item.product.img}
              alt={item.product.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-500 text-xs font-Barlow text-center p-1 leading-tight">Görsel Yok</span>
            </div>
          )}
        </div>

        {/* Product Info & Controls Container */}
        <div className="flex flex-1 flex-col justify-between h-full gap-2">

          {/* Header Row: Name & Remove */}
          <div className="flex justify-between items-start">
            <p className="font-bold text-darkgray font-Barlow text-base leading-tight pr-2 line-clamp-2">
              {item.product.name}
            </p>
            <button
              onClick={() => onRemove(item.id)}
              className="text-gray-400 hover:text-red transition-colors p-1 -mr-2 -mt-2"
              aria-label="Kaldır"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Footer Row: Controls & Price */}
          <div className="flex items-center justify-between">
            {/* Quantity Controls */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
              <button
                onClick={() => onUpdateQuantity(item.id, item.count, "decrease")}
                className="w-6 h-6 flex items-center justify-center bg-white text-darkgray rounded hover:bg-gray-200 disabled:opacity-50 transition-colors shadow-sm"
                disabled={item.count <= 1}
                aria-label="Azalt"
              >
                <Minus size={12} strokeWidth={3} />
              </button>
              <span className="w-6 text-center text-sm font-bold font-Barlow text-darkgray">
                {item.count}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.count, "increase")}
                className="w-6 h-6 flex items-center justify-center bg-white text-darkgray rounded hover:bg-green-100 hover:text-green-600 transition-colors shadow-sm"
                aria-label="Arttır"
              >
                <Plus size={12} strokeWidth={3} />
              </button>
            </div>

            {/* Price */}
            <div className="font-bold text-darkgray font-Barlow text-lg">
              {(item.product.price * item.count).toFixed(2)} ₺
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};