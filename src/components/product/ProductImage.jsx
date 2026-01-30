"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export const ProductImage = ({ product }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center rounded-xl overflow-hidden bg-transparent relative"
        >
            {product.img ? (
                <Image
                    src={product.img}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="object-cover"
                />
            ) : (
                <div className="w-full h-full min-h-52 flex items-center justify-center bg-lightgray2">
                    <span className="text-gray text-xl font-Barlow">
                        Görsel yok
                    </span>
                </div>
            )}
            {product.stock < 10 && product.stock > 0 && (
                <div className="absolute top-4 right-4 bg-red text-lightgray text-sm font-bold px-4 py-2 rounded-full font-Barlow">
                    Son {product.stock} Ürün
                </div>
            )}
        </motion.div>
    );
};
