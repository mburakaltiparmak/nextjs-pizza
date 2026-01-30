"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import { PAYMENT_METHOD } from "@/lib/constants";
import { AddressSummary } from "@/components/common";
import DOMPurify from "dompurify";

const PaymentForm = ({ 
  onSubmit, 
  onBack, 
  isSubmitting, 
  paymentMethod,
  selectedAddress,
  isAuthenticated,
  userData
}) => {
  
  // Basit schema - sadece not alanı
  const formSchema = z.object({
    notes: z.string().optional().transform(val => val ? DOMPurify.sanitize(val) : val)
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: ""
    },
  });

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

  const renderDeliveryInfo = () => {
    if (selectedAddress) {
      return (
        <div className="mt-6">
             <h3 className="font-medium text-gray-800 mb-2">Teslimat Bilgileri</h3>
             <AddressSummary address={selectedAddress} />
        </div>
      );
    }

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
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md overflow-hidden font-Barlow">
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

export default PaymentForm;
