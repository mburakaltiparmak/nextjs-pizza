"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { createOrder, clearCart } from "@/lib/store/actions/orderActions";
import { cartStorage } from "@/lib/utils/cartPersistence";
import { useToast } from "@/lib/hooks/useToast";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import DOMPurify from "dompurify";
import { selectOrderUserData, selectSelectedAddress, selectCartItems, selectPaymentMethod } from "@/lib/store/selectors/orderSelectors";
import { selectIsAuthenticated, selectUserRole } from "@/lib/store/selectors/userSelectors";
import { selectGuestData } from "@/lib/store/selectors/guestSelectors";
import { PAYMENT_METHOD } from "@/lib/constants";

import PaymentForm from "./PaymentForm";

const ThirdStep = ({ onSuccess, onBack }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  // Redux state
  const userData = useAppSelector(selectOrderUserData);
  const selectedAddress = useAppSelector(selectSelectedAddress);
  const cartData = useAppSelector(selectCartItems);
  const paymentMethod = useAppSelector(selectPaymentMethod);
  const isAuthenticated = useAppSelector(selectIsAuthenticated) || false;
  const role = useAppSelector(selectUserRole);

  const isGuest = role === "GUEST";
  const guestData = useAppSelector(selectGuestData);

  // Basit schema - sadece not alanı
  const formSchema = z.object({
    notes: z.string().optional().transform(val => val ? DOMPurify.sanitize(val) : val)
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: ""
    },
  });

  if (isSubmitting || isSuccess) {
    return <LoadingSpinner text={isSuccess ? "Yönlendiriliyorsunuz..." : "Siparişiniz Alınıyor"} size="fullPage" />;
  }

  const submitOrder = async (formData) => {
    try {
      // Backup cart before starting the process
      cartStorage.backup();

      // Adres kontrolü
      if (!selectedAddress) {
        throw new Error("Lütfen bir teslimat adresi seçin veya ekleyin.");
      }

      // ✅ FIX: Guest/unauthenticated kullanıcılar için email null guard
      if (!isAuthenticated) {
        const resolvedEmail = guestData?.email || selectedAddress?.email || userData?.guestEmail;
        if (!resolvedEmail) {
          toast.error("Sipariş verebilmek için e-posta adresiniz gereklidir. Lütfen önceki adıma dönüp bilgilerinizi tamamlayın.", {
            title: "E-posta Eksik"
          });
          return;
        }
      }

      // Sipariş verisini hazırla
      const orderRequest = {
        items: cartData.map(item => {
          if (!item.product.id) throw new Error("Sepetinizde geçersiz bir ürün bulunuyor: " + item.product.name);
          return {
            quantity: item.count,
            product: {
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              image: item.product.img,
              description: item.product.description,
            },
            unitPrice: item.product.price
          };
        }),
        paymentMethod: paymentMethod,
        notes: formData.notes || ""
      };

      // Adres bilgilerini ekle
      if (isAuthenticated && selectedAddress.id) {
        orderRequest.addressId = selectedAddress.id;
      } else {
        // Yeni adres objesini oluştur — email fallback zinciri güçlendirildi
        const resolvedEmail = (isGuest && guestData?.email)
          ? guestData.email
          : selectedAddress?.email || userData?.guestEmail || null;

        orderRequest.newAddress = {
          fullAddress: selectedAddress.fullAddress,
          city: selectedAddress.city,
          district: selectedAddress.district,
          postalCode: selectedAddress.postalCode || "",
          addressTitle: selectedAddress.addressTitle || "Yeni Adres",
          phoneNumber: selectedAddress.phoneNumber || "",
          recipientName: selectedAddress.recipientName || userData?.fullname || "",
          saveAddress: selectedAddress.saveAddress === true,
          isDefault: selectedAddress.isDefault === true,
          email: resolvedEmail
        };
      }

      // Sipariş oluştur
      const result = await dispatch(createOrder({
        orderData: orderRequest,
        paymentData: null,
      }));

      // 1. Durum: Redirect işlemi (Iyzico Hosted Checkout)
      if (!result) {
        return;
      }

      // 2. Durum: Hata
      if (result.error) {
        console.error("Sipariş oluşturma hatası:", result.error);
        toast.error(result.error || "Sipariş oluşturulamadı.", {
          title: "Hata"
        });
        return;
      }

      // 3. Durum: Başarılı (Nakit / Gift Card)
      if (result && result.id) {
        setIsSuccess(true);

        if (onSuccess) onSuccess();

        dispatch(clearCart());

        toast.success("Teşekkür ederiz, siparişiniz alındı.", {
          title: "Siparişiniz Oluşturuldu!"
        });

        router.push(`/payment/success?orderId=${result.uuid || result.id}`);
      }

    } catch (error) {
      console.error("Sipariş işlem hatası:", error);
      toast.error(error.message || "Beklenmeyen bir hata oluştu.", {
        title: "İşlem Başarısız"
      });
      setIsSuccess(false);
    }
  };

  const handleBack = () => {
    if (onBack) onBack();
  };

  return (
    <PaymentForm
      onSubmit={handleSubmit(submitOrder)}
      onBack={handleBack}
      isSubmitting={isSubmitting}
      control={control}
      paymentMethod={paymentMethod}
      userData={userData}
      selectedAddress={selectedAddress}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default ThirdStep;