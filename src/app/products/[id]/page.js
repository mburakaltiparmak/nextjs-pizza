// app/products/[id]/page.js
"use client";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addToCart } from "@/lib/store/actions/orderActions";
import { useToast } from "@/hooks/use-toast";
import RatingStars from "@/components/admin/ratingStars";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import Footer from "@/components/footer";
import Header from "@/components/header";

export default function ProductDetail() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const product = useAppSelector((state) =>
    state.product.products.find((p) => p.id.toString() === params.id)
  );

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-darkgray mb-4 font-Quattrocento_Sans">
            Ürün bulunamadı
          </h2>
          <Link
            href="/"
            className="text-red hover:text-darkred font-medium font-Barlow"
          >
            Anasayfaya geri dön
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart(product));
    }
    toast({
      description: (
        <div className="flex flex-row gap-4 items-center">
          {product.img ? (
            <Image
              src={product.img}
              alt={product.name}
              width={16}
              height={16}
              className="object-cover rounded"
            />
          ) : (
            <div className="w-8 h-8 bg-lightgray2 rounded flex items-center justify-center">
              <span className="text-gray text-xs font-Barlow">Yok</span>
            </div>
          )}
          <p className="font-Barlow">
            {quantity} adet {product.name} sepete eklendi
          </p>
        </div>
      ),
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="bg-lightgray py-6">
        <div className="container mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center text-gray hover:text-darkgray mb-8 font-Barlow"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Anasayfaya Geri Dön
          </Link>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-8">
              {/* Product Image */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center rounded-xl overflow-hidden bg-transparent"
              >
                {product.img ? (
                  //düzelt
                  <img
                    src={product.img}
                    alt={product.name}
                    fill="true"
                    className="object-cover h-[200px]"
                    priority="true"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-lightgray2">
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

              {/* Product Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col justify-between"
              >
                <div>
                  <h1 className="text-3xl font-bold text-darkgray mb-2 font-Quattrocento_Sans">
                    {product.name}
                  </h1>

                  <div className="flex items-center gap-4 mb-4">
                    <RatingStars rating={product.rating} />
                    <span className="text-gray font-medium font-Barlow">
                      {product.rating.toFixed(1)} / 5.0
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
                        <p className="text-4xl font-bold text-darkgray font-Quattrocento_Sans">
                          {product.price} ₺
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray mb-1 font-Barlow">
                          Stok Durumu
                        </p>
                        <p
                          className={`font-semibold font-Barlow ${
                            product.stock > 0 ? "text-green-600" : "text-red"
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

                {/* Quantity Selector and Add to Cart */}
                <div className="space-y-4">
                  {product.stock > 0 && (
                    <div className="flex items-center gap-4 font-Barlow">
                      <label className="text-darkgray font-medium font-Barlow">
                        Adet:
                      </label>
                      <div className="flex items-center border border-lightgray2 rounded-lg">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-2  transition font-Barlow text-darkgray"
                        >
                          -
                        </button>
                        {quantity}
                        <button
                          onClick={() =>
                            setQuantity(Math.min(product.stock, quantity + 1))
                          }
                          className="px-4 py-2 transition font-Barlow text-darkgray"
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
                    ${
                      product.stock === 0
                        ? "bg-lightgray2 text-gray cursor-not-allowed"
                        : "bg-yellow text-darkgray hover:bg-lightyellow hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    {product.stock === 0 ? "Stokta Yok" : "Sepete Ekle"}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
