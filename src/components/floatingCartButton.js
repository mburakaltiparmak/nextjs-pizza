"use client";
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const FloatingCartButton = () => {
  const cart = useAppSelector((state) => state.order.cart);
  const router = useRouter();
  console.log("cart :",cart);
  
  const totalItems = cart.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.count), 0);

  const handleCheckout = () => {
    router.push('/create-order');
  };

  return (
    <div className="fixed top-2 right-4 z-50 ">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="bg-yellow text-red p-4 rounded-full shadow-lg flex items-center justify-center hover:bg-red hover:text-yellow transition-colors duration-200">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                {totalItems}
              </span>
            )}
          </button>
        </AlertDialogTrigger>
        
        <AlertDialogContent className="bg-white font-Barlow">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-gray-800">Sepetiniz</AlertDialogTitle>
            {cart.length > 0 ? (
              <AlertDialogDescription>
                Sepetinizde {totalItems} ürün bulunmaktadır.
              </AlertDialogDescription>
            ) : (
              <AlertDialogDescription>
                Sepetiniz boş.
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          
          {/* Cart Items */}
          <div className="max-h-64 overflow-y-auto py-2">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Sepetinizde ürün bulunmuyor</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                        <img 
                          src={item.product.img} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.product.name}</p>
                        <p className="text-sm text-gray-500">{item.count} adet</p>
                      </div>
                    </div>
                    <p className="font-medium text-gray-800">{(item.product.price * item.count).toFixed(2)} ₺</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Total Amount */}
          {cart.length > 0 && (
            <div className="py-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">Toplam:</span>
                <span className="font-bold text-red">{totalAmount.toFixed(2)} ₺</span>
              </div>
            </div>
          )}
          
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel className="bg-gray-100 text-gray-800 hover:bg-gray-200">
              Kapat
            </AlertDialogCancel>
            {cart.length > 0 && (
              <AlertDialogAction 
                onClick={handleCheckout}
                className="bg-yellow text-red hover:bg-red hover:text-yellow transition-colors"
              >
                Siparişi Tamamla
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FloatingCartButton;