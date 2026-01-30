"use client";

import React from "react";

export const AddToCartSection = ({ product, quantity, setQuantity, handleAddToCart }) => {
    return (
        <div className="space-y-4">
            {product.stock > 0 && (
                <div className="flex items-center gap-4 font-Barlow">
                    <label className="text-darkgray font-medium font-Barlow">
                        Adet:
                    </label>
                    <div className="flex items-center border border-lightgray2 rounded-lg">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-4 py-2 transition font-Barlow text-darkgray"
                            aria-label="Ürün miktarını azalt"
                        >
                            -
                        </button>
                        <span className="px-4">{quantity}</span>
                        <button
                            onClick={() =>
                                setQuantity(Math.min(product.stock, quantity + 1))
                            }
                            className="px-4 py-2 transition font-Barlow text-darkgray"
                            aria-label="Ürün miktarını artır"
                        >
                            +
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 font-Barlow
            ${product.stock === 0
                        ? "bg-lightgray2 text-gray cursor-not-allowed"
                        : "bg-yellow text-darkgray hover:bg-lightyellow hover:scale-[1.02] active:scale-[0.98]"
                    }`}
            >
                {product.stock === 0 ? "Stokta Yok" : "Sepete Ekle"}
            </button>
        </div>
    );
};
