"use client";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { addToCart } from "@/lib/store/actions/orderActions";
import { fetchProductById } from "@/lib/store/actions/productActions";
import { useToast } from "@/lib/hooks/useToast";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import NotFound from "@/app/not-found";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductInfo } from "@/components/product/ProductInfo";
import { AddToCartSection } from "@/components/product/AddToCartSection";

export default function ProductDetailClient() {
    const params = useParams();
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const [quantity, setQuantity] = useState(1);

    // Sayfa durumunu takip et
    const [pageState, setPageState] = useState("loading"); // "loading", "error", "ready"
    const fetchStartedRef = useRef(false);

    // Redux state
    const product = useAppSelector((state) =>
        state.product.products.find((p) => p.id.toString() === params.id)
    );

    // Sayfa yüklendiğinde veya yenilendiğinde ürünü getir
    useEffect(() => {
        // Önce ürün mevcut mu kontrol et
        if (product) {
            setPageState("ready");
            return; // Ürün zaten mevcutsa API çağrısı yapma
        }

        // Daha önce isteği başlatmadıysak, ürünü getir
        if (!fetchStartedRef.current) {
            const fetchProduct = async () => {
                try {
                    fetchStartedRef.current = true;

                    // Action'ı dispatch et ve sonucu bekle
                    const result = await dispatch(fetchProductById(params.id));

                    // Sonucu kontrol et
                    if (result?.error) {
                        console.error("Ürün getirme hatası:", result.error);
                        setPageState("error");
                    } else if (result) {
                        setPageState("ready");
                    }
                } catch (error) {
                    console.error("Ürün getirme işleminde beklenmeyen hata:", error);
                    setPageState("error");
                }
            };

            fetchProduct();
        }

        // Cleanup function
        return () => {
            fetchStartedRef.current = false;
        };
    }, [dispatch, params.id, product]);

    // Yükleme durumu ve hata durumunu Redux'tan değil kendi state'imizden yönet
    if (pageState === "loading") {
        return <LoadingSpinner size="fullPage" />;
    }

    if (pageState === "error" || !product) {
        return <NotFound />;
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
                            width={48}
                            height={48}
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 bg-lightgray2 rounded flex items-center justify-center">
                            <span className="text-gray text-xs font-Barlow">Yok</span>
                        </div>
                    )}
                    <span className="font-Barlow">
                        {quantity} adet {product.name} sepete eklendi
                    </span>
                </div>
            ),
            duration: 3000,
        });
    };

    // Ürün içeriğini render et
    return (
        <div className="min-h-screen">
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
                            <ProductImage product={product} />

                            {/* Product Info */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col justify-between"
                            >
                                <ProductInfo product={product} />

                                {/* Quantity Selector and Add to Cart */}
                                <AddToCartSection 
                                    product={product} 
                                    quantity={quantity} 
                                    setQuantity={setQuantity} 
                                    handleAddToCart={handleAddToCart} 
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

