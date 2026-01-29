// src/components/cart-button/CartItemCard.jsx
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
    <div className="flex items-center justify-between p-3 mb-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center space-x-4 w-full">
        {/* Product Image */}
        <div className="w-16 h-16 border-2 border-black rounded-md overflow-hidden bg-lightgray flex-shrink-0 relative">
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
              <span className="text-gray-500 text-[10px] font-Barlow text-center p-1 leading-tight">Görsel Yok</span>
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
            <div className="flex items-center bg-lightgray rounded border border-black">
              <button
                onClick={() => onUpdateQuantity(item.id, item.count, "decrease")}
                className="w-7 h-7 flex items-center justify-center text-darkgray hover:bg-red hover:text-white border-r border-black disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-darkgray transition-colors"
                disabled={item.count <= 1}
                aria-label="Azalt"
              >
                <Minus size={12} strokeWidth={3} />
              </button>
              <span className="w-8 text-center text-sm font-bold font-Barlow text-darkgray">
                {item.count}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.count, "increase")}
                className="w-7 h-7 flex items-center justify-center text-darkgray hover:bg-green-600 hover:text-white border-l border-black transition-colors"
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