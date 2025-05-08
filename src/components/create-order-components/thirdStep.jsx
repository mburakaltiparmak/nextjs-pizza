"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { createOrder } from "@/lib/store/actions/orderActions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ChevronLeft, CreditCard } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Online Kredi Kartı component'i - Kart bilgileri formu
const OnlineCardPaymentForm = ({ onSubmit, onBack, isSubmitting, errors, control }) => {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-md overflow-hidden font-Barlow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Online Ödeme Bilgileri</h2>
        <p className="text-gray-500 text-sm mb-6">
          Siparişinizi tamamlamak için kart bilgilerinize ihtiyacımız var.
        </p>
        
        <div className="space-y-6">
          <Controller
            name="cardNumber"
            control={control}
            render={({ field }) => (
              <div>
                <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">
                  Kart Numarası
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    {...field}
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red focus:border-red"
                  />
                </div>
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-red">{errors.cardNumber.message}</p>
                )}
              </div>
            )}
          />
          
          <Controller
            name="nameOnCard"
            control={control}
            render={({ field }) => (
              <div>
                <label htmlFor="card-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Kart Üzerindeki İsim
                </label>
                <input
                  {...field}
                  id="card-name"
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red focus:border-red"
                />
                {errors.nameOnCard && (
                  <p className="mt-1 text-sm text-red">{errors.nameOnCard.message}</p>
                )}
              </div>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiration-date" className="block text-sm font-medium text-gray-700 mb-1">
                Son Kullanma Tarihi
              </label>
              <div className="flex gap-2">
                <Controller
                  name="expirationMonth"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red focus:border-red"
                    >
                      <option value="">Ay</option>
                      {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                  )}
                />
                
                <Controller
                  name="expirationYear"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red focus:border-red"
                    >
                      <option value="">Yıl</option>
                      {Array.from({ length: 10 }, (_, i) => (i + new Date().getFullYear()).toString().slice(2)).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
              {(errors.expirationMonth || errors.expirationYear) && (
                <p className="mt-1 text-sm text-red">
                  Son kullanma tarihi gereklidir.
                </p>
              )}
            </div>
            
            <Controller
              name="cvc"
              control={control}
              render={({ field }) => (
                <div>
                  <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                    CVC
                  </label>
                  <input
                    {...field}
                    id="cvc"
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red focus:border-red"
                  />
                  {errors.cvc && (
                    <p className="mt-1 text-sm text-red">{errors.cvc.message}</p>
                  )}
                </div>
              )}
            />
          </div>

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
          {isSubmitting ? "İşleniyor..." : "SİPARİŞİ TAMAMLA"}
        </button>
      </div>
    </form>
  );
};
// Diğer ödeme yöntemleri için component - Sadece not alanı
const OtherPaymentForm = ({ onSubmit, onBack, isSubmitting, errors, control, paymentMethod }) => {
  // Ödeme yöntemine göre başlık ve açıklama
  const getPaymentTitle = () => {
    switch(paymentMethod) {
      case "CREDIT_CARD": return "Kapıda Kredi Kartı";
      case "CASH": return "Kapıda Nakit Ödeme";
      case "GIFT_CARD": return "Hediye Kartı ile Ödeme";
      default: return "Ödeme Bilgileri";
    }
  };
  
  const getPaymentDescription = () => {
    switch(paymentMethod) {
      case "CREDIT_CARD": 
        return "Siparişiniz teslim edilirken kredi kartı ile ödeme yapabilirsiniz.";
      case "CASH": 
        return "Siparişiniz teslim edilirken nakit ödeme yapabilirsiniz.";
      case "GIFT_CARD": 
        return "Siparişiniz teslim edilirken hediye kartı ile ödeme yapabilirsiniz.";
      default: 
        return "Siparişiniz teslim edilirken ödeme yapabilirsiniz.";
    }
  };

  // Kullanıcı verileri ve teslimat bilgileri
  const userData = useAppSelector((state) => state.order.userData);
  const selectedAddress = useAppSelector((state) => state.order.selectedAddress);
  const isAuthenticated = useAppSelector((state) => state.user?.isLogin) || false;
  const role = useAppSelector((state) => state.user.role);

  
  console.log("userData", userData);
  console.log("selectedAddress", selectedAddress);

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

  // Misafir bilgilerini görüntüle
  

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
          
          {/* Misafir Bilgileri Özeti */}
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
          {isSubmitting ? "İşleniyor..." : "SİPARİŞİ TAMAMLA"}
        </button>
      </div>
    </form>
  );
};

const ThirdStep = ({ setCurrentStep, setStep3 }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const router = useRouter();

  // Redux state'inden ödeme yöntemini ve diğer bilgileri al
  const userData = useAppSelector((state) => state.order.userData);
  const selectedAddress = useAppSelector((state) => state.order.selectedAddress);
  const cartData = useAppSelector((state) => state.order.cart);
  const paymentMethod = useAppSelector((state) => state.order.paymentMethod);
  const isAuthenticated = useAppSelector((state) => state.user?.isLogin) || false;
  const role = useAppSelector((state) => state.user.role);
  
  // Misafir bilgilerini al
  
  // Online kart ödemesi için validation schema
  const onlineCardSchema = z.object({
    cardNumber: z.string().min(16, { message: "Kredi Kartı numarası 16 haneli olmalıdır." }),
    nameOnCard: z.string().min(1, { message: "İsminiz gereklidir." }),
    expirationMonth: z.string().min(1, { message: "Son kullanma tarihi gereklidir." }),
    expirationYear: z.string().min(1, { message: "Son kullanma tarihi gereklidir." }),
    cvc: z.string().min(3, { message: "CVC 3 haneli olmalıdır." }),
    notes: z.string().optional()
  });
  
  // Diğer ödeme yöntemleri için basit schema
  const otherPaymentSchema = z.object({
    notes: z.string().optional()
  });
  
  // Ödeme yöntemine göre schema seç
  const formSchema = paymentMethod === "ONLINE_CREDIT_CARD" ? onlineCardSchema : otherPaymentSchema;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardNumber: "",
      nameOnCard: "",
      expirationMonth: "",
      expirationYear: "",
      cvc: "",
      notes: ""
    },
  });

  const submitOrder = async (formData) => {
    console.log("Form verileri:", formData);
    console.log("Adres bilgileri:", selectedAddress);
    console.log("Sepet içeriği:", cartData);
    console.log("Kullanıcı bilgileri:", userData);
  
    try {
      setStep3(true);
    
      toast({
        title: "Siparişiniz alınıyor...",
      });
      
      // Adres bilgilerini kontrol et
      if (!selectedAddress) {
        throw new Error("Lütfen bir teslimat adresi seçin veya ekleyin.");
      }
      
      // Sipariş verisini hazırla
      const orderRequest = {
        // Sepet öğeleri
        items: cartData.map(item => ({
          quantity: item.count,
          product: {
            name: item.product.name,
            price: item.product.price,
            image: item.product.img,
            description: item.product.description,
          },
          unitPrice: item.product.price
        })),
        
        // Ödeme bilgileri
        paymentMethod: paymentMethod,
        notes: formData.notes || ""
      };
        // Kullanıcı giriş yapmış ve kayıtlı adresi seçilmiş
        if (isAuthenticated && selectedAddress.id) {
          orderRequest.addressId = selectedAddress.id;
        }
        // Yeni adres girilmiş
        else {
          // Backend'in beklediği formatta yeni adres bilgilerini gönder
          orderRequest.newAddress = {
            fullAddress: selectedAddress.fullAddress,
            city: selectedAddress.city,
            district: selectedAddress.district,
            postalCode: selectedAddress.postalCode || "",
            addressTitle: selectedAddress.addressTitle || "Yeni Adres",
            phoneNumber: selectedAddress.phoneNumber || "",
            recipientName: selectedAddress.recipientName || userData.fullname || "",
            saveAddress: selectedAddress.saveAddress === true,
            isDefault: selectedAddress.isDefault === true
          };
        
      }
      
      // Ödeme bilgileri (sadece online kart ödemesi için)
      const paymentData = paymentMethod === "ONLINE_CREDIT_CARD" ? {
        cardNumber: formData.cardNumber,
        nameOnCard: formData.nameOnCard,
        expirationMonth: formData.expirationMonth,
        expirationYear: formData.expirationYear,
        cvc: formData.cvc
      } : null;
      
      console.log("Backend'e gönderilecek sipariş verisi:", JSON.stringify(orderRequest, null, 2));
      
      // Sipariş oluşturma işlemini çağır
      const result = await dispatch(createOrder({
        orderData: orderRequest,
        paymentData: paymentData,
      }));
      
      // Hata durumunu kontrol et
      if (result.error) {
        console.error("Sipariş oluşturma hatası:", result.error);
        toast({
          title: "Sipariş oluşturulurken bir hata oluştu.",
          description: result.error,
          variant: "destructive",
        });
        setStep3(false);
        return;
      }
  
      // Başarılı ise
      toast({
        title: "Siparişiniz başarıyla oluşturuldu!",
        description: "Teşekkür ederiz, siparişiniz alındı."
      });
      
      // Başarı sayfasına yönlendir
      // Kısa bir gecikme ekleyerek toast mesajının görülmesini sağla
      setTimeout(() => {
        router.push("/success");
      }, 1000);
      
    } catch (error) {
      console.error("Sipariş oluşturma işlemi sırasında beklenmeyen bir hata oluştu:", error);
      toast({
        title: "Sipariş oluşturulurken bir hata oluştu.",
        description: error.message,
        variant: "destructive",
      });
      setStep3(false);
    }
  };
  
  const handleBack = () => {
    setCurrentStep(2);
    setStep3(false);
  };

  // Ödeme yöntemine göre farklı component göster
  return paymentMethod === "ONLINE_CREDIT_CARD" ? (
    <OnlineCardPaymentForm 
      onSubmit={handleSubmit(submitOrder)}
      onBack={handleBack}
      isSubmitting={isSubmitting}
      errors={errors}
      control={control}
    />
  ) : (
    <OtherPaymentForm 
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