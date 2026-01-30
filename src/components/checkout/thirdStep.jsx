"use client";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { createOrder, clearCart } from "@/lib/store/actions/orderActions";
import { cartStorage } from "@/lib/utils/cartPersistence";
import { useToast } from "@/lib/hooks/useToast";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import DOMPurify from "dompurify";
import { selectOrderUserData, selectSelectedAddress, selectCartItems, selectPaymentMethod } from "@/lib/store/selectors/orderSelectors";
import { selectIsAuthenticated, selectUserRole } from "@/lib/store/selectors/userSelectors";
import { selectGuestData } from "@/lib/store/selectors/guestSelectors";
import { PAYMENT_METHOD } from "@/lib/constants";

// Diğer ödeme yöntemleri için component - Sadece not alanı
const PaymentForm = ({ onSubmit, onBack, isSubmitting, errors, control, paymentMethod }) => {
  // Ödeme yöntemine göre başlık ve açıklama
  const getPaymentTitle = () => {
    switch (paymentMethod) {
      case PAYMENT_METHOD.CREDIT_CARD: return "Kapıda Kredi Kartı";
      case PAYMENT_METHOD.ONLINE_CREDIT_CARD: return "Online Kredi Kartı (Güvenli Ödeme Sayfası)";
      case PAYMENT_METHOD.CASH: return "Kapıda Nakit Ödeme";
      case PAYMENT_METHOD.GIFT_CARD: return "Hediye Kartı ile Ödeme";
      default: return "Ödeme Bilgileri";
    }
  };

  const getPaymentDescription = () => {
    switch (paymentMethod) {
      case PAYMENT_METHOD.CREDIT_CARD:
        return "Siparişiniz teslim edilirken kredi kartı ile ödeme yapabilirsiniz.";
      case PAYMENT_METHOD.ONLINE_CREDIT_CARD:
        return "Siparişinizi tamamlamak için güvenli ödeme sayfasına yönlendirileceksiniz.";
      case PAYMENT_METHOD.CASH:
        return "Siparişiniz teslim edilirken nakit ödeme yapabilirsiniz.";
      case PAYMENT_METHOD.GIFT_CARD:
        return "Siparişiniz teslim edilirken hediye kartı ile ödeme yapabilirsiniz.";
      default:
        return "Siparişiniz teslim edilirken ödeme yapabilirsiniz.";
    }
  };

  // Kullanıcı verileri ve teslimat bilgileri
  const userData = useAppSelector(selectOrderUserData);
  const selectedAddress = useAppSelector(selectSelectedAddress);
  const isAuthenticated = useAppSelector(selectIsAuthenticated) || false;

  // Teslimat bilgilerini görüntüle
  const renderDeliveryInfo = () => {
    // Seçilen adres varsa göster
    if (selectedAddress) {
      return (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium text-gray-800 mb-2">Teslimat Bilgileri</h3>
          <div className="space-y-2 text-sm">
            {selectedAddress.addressTitle && (
              <p><span className="font-medium">Adres Başlığı:</span> {selectedAddress.addressTitle}</p>
            )}
            <p><span className="font-medium">Alıcı:</span> {selectedAddress.recipientName}</p>
            <p><span className="font-medium">Adres:</span> {selectedAddress.fullAddress}</p>
            <p><span className="font-medium">Konum:</span> {selectedAddress.district}, {selectedAddress.city}</p>
            {selectedAddress.phoneNumber && (
              <p><span className="font-medium">Telefon:</span> {selectedAddress.phoneNumber}</p>
            )}
          </div>
        </div>
      );
    }

    // Kullanıcı giriş yapmış ve sadece addressId varsa
    if (isAuthenticated && userData?.addressId) {
      return (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium text-gray-800 mb-2">Teslimat Bilgileri</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Adres ID:</span> {userData.addressId}</p>
            <p className="text-gray-500 italic">Seçili kayıtlı adres kullanılacak</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-md overflow-hidden font-Barlow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">{getPaymentTitle()}</h2>
        <p className="text-gray-500 text-sm mb-6">
          {getPaymentDescription()}
        </p>

        <div className="space-y-6">
          {/* Sipariş Notu Alanı */}
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <div>
                <Label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Sipariş Notu
                </Label>
                <Textarea
                  {...field}
                  id="notes"
                  placeholder="Siparişinizle ilgili eklemek istediğiniz not var mı? (Tercihen kapı kodu, adres tarifi, vb.)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red focus:border-red"
                  rows={3}
                />
              </div>
            )}
          />

          {/* Teslimat Bilgileri Özeti */}
          {renderDeliveryInfo()}
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center font-semibold gap-2 px-6 py-2 rounded-md border border-darkgray bg-white text-darkgray shadow-md hover:shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
          GERİ
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center font-semibold gap-2 px-6 py-2 rounded-md bg-yellow text-red hover:bg-red hover:text-yellow border border-transparent hover:border-yellow"
        >
          SİPARİŞİ TAMAMLA
        </button>
      </div>
    </form>
  );
};

const ThirdStep = ({ setCurrentStep, setStep3, onSuccess }) => {
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
      setStep3(true);
      // Backup cart before starting the process
      cartStorage.backup();

      // Adres kontrolü
      if (!selectedAddress) {
        throw new Error("Lütfen bir teslimat adresi seçin veya ekleyin.");
      }

      // Sipariş verisini hazırla
      const orderRequest = {
        // Backend'in beklediği format
        items: cartData.map(item => ({
          quantity: item.count,
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.img,
            description: item.product.description,
          },
          unitPrice: item.product.price
        })),
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
        setStep3(false);
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
      setStep3(false);
      setIsSuccess(false); // Hata durumunda loading'i kapat
    }
  };

  const handleBack = () => {
    setCurrentStep(2);
    setStep3(false);
  };

  return (
    <PaymentForm
      onSubmit={handleSubmit(submitOrder)}
      onBack={handleBack}
      isSubmitting={isSubmitting}
      errors={errors}
      control={control}
      paymentMethod={paymentMethod}
    />
  );
};

export default ThirdStep;