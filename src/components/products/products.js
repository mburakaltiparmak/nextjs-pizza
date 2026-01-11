"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addToCart } from "@/lib/store/actions/orderActions";
import { useMemo } from "react";
import { useToast } from "@/lib/hooks/useToast";
import RatingStars from "../admin/ratingStars";
import Link from "next/link";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Pagination } from "@/components/ui/Pagination";
import { ShoppingCart } from "lucide-react";

const Products = ({ categoryFilter = "", onPageChange }) => {
  const dispatch = useAppDispatch();
  const { cartNotification } = useToast(); // useToast'dan cartNotification metodunu al

  // Redux state
  const products = useAppSelector((state) => state.product.products);
  const pagination = useAppSelector((state) => state.product.pagination);
  const globalLoading = useAppSelector((state) => state.global.loading);

  const handleAddToCart = (product, e) => {
    e.preventDefault(); // Link tıklamasını önle
    dispatch(addToCart(product));

    // Yeni toast bildirimi kullan
    cartNotification(product, {
      duration: 3000,
    });
  };

  // Ürünler yüklenene kadar loading göster
  if (globalLoading || !products) {
    return <LoadingSpinner size="small" />;
  }

  // Ürün bulunamadı durumu
  if (!products || products.length === 0) {
    return (
      <div className="w-full text-center py-12">
        <p className="text-gray-500 font-Barlow text-xl">Ürün bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div
        id="product-field"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-md:py-6 w-full"
      >
        {products.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group"
          >
            <Link href={`/products/${item.id}`}>
              <div className="relative bg-white rounded-xl overflow-hidden drop-shadow-md hover:drop-shadow-xl transition-all duration-300 border border-lightgray z-50">
                {/* Image Container */}
                <div className="flex items-center justify-center py-8">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="object-cover group-hover:scale-110 transition-transform duration-500 h-36"
                  />
                  {/* Stock Badge */}
                  {item.stock < 10 && item.stock > 0 && (
                    <div className="absolute top-3 right-3 bg-red text-white text-xs font-bold px-3 py-1 rounded-full">
                      Son {item.stock} Ürün
                    </div>
                  )}
                  {/* Out of Stock */}
                  {item.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        Stokta Yok
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="font-Barlow font-bold text-lg text-black mb-2 line-clamp-2">
                    {item.name}
                  </h3>

                  <div className="flex items-center mb-4">
                    <RatingStars rating={item.rating} />
                  </div>

                  <p className="text-sm text-black line-clamp-2 mb-4 font-Barlow">
                    {item.description || "Ürün açıklaması yakında..."}
                  </p>

                  {/* Price & Add to Cart */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-Barlow text-2xl font-bold text-black">
                        {item.price} ₺
                      </span>
                      {item.stock > 0 && (
                        <span className="text-xs font-Barlow text-green-600 font-medium">
                          Stokta: {item.stock}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(item, e)}
                      disabled={item.stock === 0}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 font-Barlow flex items-center gap-2
                        ${item.stock === 0
                          ? "bg-red text-white cursor-not-allowed"
                          : "bg-yellow text-red hover:bg-red hover:text-yellow hover:scale-105 active:scale-95"
                        }`}
                    >
                      <ShoppingCart size={16} />
                      {item.stock === 0 ? "Tükendi" : "Sepete Ekle"}
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <Pagination
        currentPage={pagination?.page || 0}
        totalPages={pagination?.totalPages || 0}
        onPageChange={(page) => onPageChange(page)}
      />
    </div>
  );
};

export default Products;
