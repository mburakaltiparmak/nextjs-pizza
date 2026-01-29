"use client";
import { useAppDispatch } from "@/lib/hooks";
import { addToCart } from "@/lib/store/actions/orderActions";
import { useToast } from "@/lib/hooks/useToast";
import { RatingStars } from "@/components/admin/common";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { ProductCardSkeleton } from "@/components/ui/skeletons/ProductCardSkeleton";
import Image from "next/image";

// Products component is now strictly presentational (Dumb Component)
const Products = ({ 
  products = [], 
  loading = false 
}) => {
  const dispatch = useAppDispatch();
  const { cartNotification } = useToast(); 

  const handleAddToCart = (product, e) => {
    e.preventDefault(); // Link tıklamasını önle
    dispatch(addToCart(product));

    // Yeni toast bildirimi kullan
    cartNotification(product, {
      duration: 3000,
    });
  };

  // Ürünler yüklenene kadar loading göster
  if (loading || !products) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-md:py-6 w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <div className="relative w-full h-36">
                    <Image
                      src={item.img}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      priority={index < 4}
                    />
                  </div>
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
    </div>
  );
};

export default Products;
