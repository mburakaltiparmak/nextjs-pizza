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
import { ChevronLeft } from "lucide-react"; // Still used in ThirdStep? No, used in PaymentForm. 
// Wait, ChevronLeft is used in PaymentForm, but is it used in ThirdStep? 
// No, the buttons are in PaymentForm now.
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import DOMPurify from "dompurify";
import { selectOrderUserData, selectSelectedAddress, selectCartItems, selectPaymentMethod } from "@/lib/store/selectors/orderSelectors";
import { selectIsAuthenticated, selectUserRole } from "@/lib/store/selectors/userSelectors";
import { selectGuestData } from "@/lib/store/selectors/guestSelectors";
import { PAYMENT_METHOD } from "@/lib/constants";

// Diğer ödeme yöntemleri için component - Sadece not alanı
import PaymentForm from "./PaymentForm";

const ThirdStep = ({ onSuccess, onBack }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false); // Başarılı işlem durumu

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

  if (isSubmitting || isSuccess) { // Success durumunda da loading göster
    return <LoadingSpinner text={isSuccess ? "Yönlendiriliyorsunuz..." : "Siparişiniz Alınıyor"} size="fullPage" />;
  }

  const submitOrder = async (formData) => {
    // console.log("Form verileri:", formData);

    try {
      // Backup cart before starting the process
      cartStorage.backup();

      // Adres kontrolü
      if (!selectedAddress) {
        throw new Error("Lütfen bir teslimat adresi seçin veya ekleyin.");
      }

      // Sipariş verisini hazırla
      const orderRequest = {
        // Backend'in beklediği format
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
        // Yeni adres objesini oluştur
        orderRequest.newAddress = {
          fullAddress: selectedAddress.fullAddress,
          city: selectedAddress.city,
          district: selectedAddress.district,
          postalCode: selectedAddress.postalCode || "",
          addressTitle: selectedAddress.addressTitle || "Yeni Adres",
          phoneNumber: selectedAddress.phoneNumber || "",
          recipientName: selectedAddress.recipientName || userData.fullname || "",
          saveAddress: selectedAddress.saveAddress === true,
          isDefault: selectedAddress.isDefault === true,
          // Email önceliği: Misafir Guest Data > Adres Email > User Guest Email
          email: isGuest && guestData?.email
            ? guestData.email
            : selectedAddress.email || userData.guestEmail || null
        };
      }

      // Sipariş oluştur
      const result = await dispatch(createOrder({
        orderData: orderRequest,
        paymentData: null, // Iyzico için null
      }));

      // 1. Durum: Redirect işlemi (Iyzico Hosted Checkout)
      // Result undefined dönerse, action içinde window.location.href yapılmıştır.
      if (!result) {
        // Redirecting...
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
        setIsSuccess(true); // Loading ekranını tetikle

        // Parent component'e başarili olduğunu bildir (redirect'i engellemesi için)
        if (onSuccess) onSuccess();

        // Sepeti temizle
        dispatch(clearCart());

        // Başarılı toast
        toast.success("Teşekkür ederiz, siparişiniz alındı.", {
          title: "Siparişiniz Oluşturuldu!"
        });

        // Başarı sayfasına yönlendir (Order UUID ile)
        router.push(`/payment/success?orderId=${result.uuid || result.id}`);
      }

    } catch (error) {
      console.error("Sipariş işlem hatası:", error);
      toast.error(error.message || "Beklenmeyen bir hata oluştu.", {
        title: "İşlem Başarısız"
      });
      setIsSuccess(false); // Hata durumunda loading'i kapat
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
      // errors prop is not strictly used in the extracted form for fields other than notes (handled by Controller), 
      // but if we extend it we might need it. For now it's fine.
      control={control}
      paymentMethod={paymentMethod}
      userData={userData}
      selectedAddress={selectedAddress}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default ThirdStep;