"use client";

import React from "react";
import { RatingStars } from "@/components/admin/common";

export const ProductInfo = ({ product }) => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-darkgray mb-2 font-Barlow">
                {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-4">
                <RatingStars rating={product.rating} />
                <span className="text-gray font-medium font-Barlow">
                    {product.rating?.toFixed(1) || "0.0"} / 5.0
                </span>
            </div>

            <p className="text-gray mb-8 font-Barlow">
                {product.description ||
                    "Bu ürün için detaylı açıklama henüz eklenmemiş."}
            </p>

            {/* Price and Stock */}
            <div className="border-t border-b border-lightgray2 py-6 mb-6">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-sm text-gray mb-1 font-Barlow">
                            Fiyat
                        </p>
                        <p className="text-4xl font-bold text-darkgray font-Barlow">
                            {product.price} ₺
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray mb-1 font-Barlow">
                            Stok Durumu
                        </p>
                        <p
                            className={`font-semibold font-Barlow ${product.stock > 0 ? "text-green-600" : "text-red"
                                }`}
                        >
                            {product.stock > 0
                                ? `${product.stock} adet`
                                : "Stokta yok"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
