// src/components/cart-button/CartItemCard.jsx
"use client";
import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";

export const CartItemCard = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
      <div className="flex items-center space-x-3">
        {/* Product Image */}
        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
          {item.product.img ? (
            <img
              src={item.product.img}
              alt={item.product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-500 text-xs">Görsel yok</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="font-medium text-gray-800 text-sm">
            {item.product.name}
          </p>
          
          {/* Quantity Controls */}
          <div className="flex items-center space-x-2 mt-1">
            <button
              onClick={() => onUpdateQuantity(item.id, item.count, "decrease")}
              className="text-gray-500 hover:text-red disabled:text-gray-300 transition-colors"
              disabled={item.count <= 1}
              aria-label="Azalt"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm font-medium min-w-[20px] text-center">
              {item.count}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.count, "increase")}
              className="text-gray-500 hover:text-red transition-colors"
              aria-label="Arttır"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Price and Remove Button */}
      <div className="flex items-center space-x-3">
        <p className="font-medium text-gray-800 text-sm">
          {(item.product.price * item.count).toFixed(2)} ₺
        </p>
        <button
          onClick={() => onRemove(item.id)}
          className="text-gray-500 hover:text-red transition-colors"
          aria-label="Kaldır"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};