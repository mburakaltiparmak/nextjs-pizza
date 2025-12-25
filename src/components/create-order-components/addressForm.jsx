"use client";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { instance } from "@/lib/hooks";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Phone, MapPin, Building, Mail, Star, Save, Loader2 } from "lucide-react";

const addressSchema = z.object({
  fullAddress: z.string().min(5, { message: "Adres en az 5 karakter olmalıdır" }),
  city: z.string().min(2, { message: "Şehir gereklidir" }),
  district: z.string().min(2, { message: "İlçe gereklidir" }),
  postalCode: z.string().optional(),
  addressTitle: z.string().optional(),
  phoneNumber: z.string().optional(),
  recipientName: z.string().min(3, { message: "Alıcı adı gereklidir" }),
  saveAddress: z.boolean().optional(),
  isDefault: z.boolean().optional()
});

const AddressForm = ({
  onSubmit,
  isGuest = false,
  initialData = {},
  submitText = "Adresi Kaydet",
  existingAddressId = null
}) => {
  const { success, error } = useToast();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.user?.isLogin) || false;
  const role = useAppSelector((state) => state.user.role);
  const isGuestUser = role === "GUEST" || isGuest;
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullAddress: initialData.fullAddress || "",
      city: initialData.city || "",
      district: initialData.district || "",
      postalCode: initialData.postalCode || "",
      addressTitle: initialData.addressTitle || "",
      phoneNumber: initialData.phoneNumber || "",
      recipientName: initialData.recipientName || "",
      saveAddress: existingAddressId ? true : (initialData.saveAddress || false),
      isDefault: initialData.isDefault || false
    }
  });

  const saveAddressChecked = watch("saveAddress");

  const onFormSubmit = async (data) => {
    try {
      // Misafir kullanıcı kontrolü
      if (isGuestUser) {
        onSubmit({
          ...data,
          id: null,
          saveAddress: false
        });

        success("Adres bilgileri alındı", {
          title: "Adres Kaydedildi",
          message: "Siparişiniz için kullanılacak."
        });

        return;
      }

      // Kayıtlı kullanıcı için adres kaydetme
      if (isAuthenticated && data.saveAddress) {
        setIsSaving(true);

        const isNewAddress = !existingAddressId;

        try {
          let response;
          const addressPayload = {
            fullAddress: data.fullAddress,
            city: data.city,
            district: data.district,
            postalCode: data.postalCode || "",
            addressTitle: data.addressTitle || `Adres ${new Date().toLocaleDateString()}`,
            phoneNumber: data.phoneNumber || "",
            recipientName: data.recipientName,
            isDefault: data.isDefault || false
          };

          if (isNewAddress) {
            response = await instance.post("user/addresses", addressPayload);
          } else {
            response = await instance.put(`user/addresses/${existingAddressId}`, addressPayload);
          }

          setIsSaving(false);

          if (response.data) {
            onSubmit({
              ...data,
              id: isNewAddress ? response.data.id : existingAddressId,
              saveAddress: false
            });

            success(isNewAddress ? "Adres başarıyla kaydedildi" : "Adres başarıyla güncellendi", {
              title: "İşlem Başarılı",
              message: data.isDefault ? "Varsayılan adresiniz olarak ayarlandı." : ""
            });
          }
        } catch (apiError) {
          setIsSaving(false);
          console.error("Adres kaydedilirken hata:", apiError);

          error(apiError.response?.data?.message || "Adres kaydedilemedi", {
            title: "Hata"
          });

          onSubmit(data);
        }
      } else {
        onSubmit(data);
      }
    } catch (error) {
      setIsSaving(false);
      console.error("Adres işleminde hata:", error);

      error("Lütfen daha sonra tekrar deneyin", {
        title: "Adres kaydedilemedi"
      });

      onSubmit(data);
    }
  };

  const inputClasses = "w-full px-4 py-3 border-2 border-lightgray2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow focus:border-yellow transition-all text-base placeholder-gray";
  const errorInputClasses = "border-red focus:ring-red focus:border-red";

  return (
    <div className="space-y-6">
      {/* Alıcı Bilgileri */}
      <div className="bg-white rounded-xl p-6 border border-lightgray2 space-y-4">
        <h4 className="flex items-center gap-2 text-lg font-bold text-darkgray border-b border-lightgray2 pb-3">
          <User className="w-5 h-5 text-red" />
          Alıcı Bilgileri
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="lg:col-span-2">
            <Label htmlFor="recipientName" className="text-base font-semibold text-darkgray mb-2 block">
              Alıcı Adı Soyadı *
            </Label>
            <Controller
              name="recipientName"
              control={control}
              render={({ field }) => (
                <input
                  id="recipientName"
                  placeholder="Ad Soyad"
                  {...field}
                  className={`${inputClasses} ${errors.recipientName ? errorInputClasses : ""}`}
                />
              )}
            />
            {errors.recipientName && (
              <p className="text-red text-sm mt-2 font-medium">{errors.recipientName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phoneNumber" className="text-base font-semibold text-darkgray mb-2 block">
              Telefon Numarası
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray w-5 h-5" />
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <input
                    id="phoneNumber"
                    placeholder="05XX XXX XX XX"
                    {...field}
                    className={`${inputClasses} pl-12 ${errors.phoneNumber ? errorInputClasses : ""}`}
                  />
                )}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-red text-sm mt-2 font-medium">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="addressTitle" className="text-base font-semibold text-darkgray mb-2 block">
              Adres Başlığı
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray w-5 h-5" />
              <Controller
                name="addressTitle"
                control={control}
                render={({ field }) => (
                  <input
                    id="addressTitle"
                    placeholder="Ev, İş, Ofis vb."
                    {...field}
                    className={`${inputClasses} pl-12 ${errors.addressTitle ? errorInputClasses : ""}`}
                  />
                )}
              />
            </div>
            {errors.addressTitle && (
              <p className="text-red text-sm mt-2 font-medium">{errors.addressTitle.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Adres Bilgileri */}
      <div className="bg-white rounded-xl p-6 border border-lightgray2 space-y-4">
        <h4 className="flex items-center gap-2 text-lg font-bold text-darkgray border-b border-lightgray2 pb-3">
          <MapPin className="w-5 h-5 text-red" />
          Adres Detayları
        </h4>

        <div>
          <Label htmlFor="fullAddress" className="text-base font-semibold text-darkgray mb-2 block">
            Açık Adres *
          </Label>
          <Controller
            name="fullAddress"
            control={control}
            render={({ field }) => (
              <textarea
                id="fullAddress"
                placeholder="Mahalle, sokak, bina no, daire no vb."
                {...field}
                className={`${inputClasses} min-h-[100px] resize-none ${errors.fullAddress ? errorInputClasses : ""}`}
                rows={3}
              />
            )}
          />
          {errors.fullAddress && (
            <p className="text-red text-sm mt-2 font-medium">{errors.fullAddress.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city" className="text-base font-semibold text-darkgray mb-2 block">
              Şehir *
            </Label>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <input
                  id="city"
                  placeholder="Şehir"
                  {...field}
                  className={`${inputClasses} ${errors.city ? errorInputClasses : ""}`}
                />
              )}
            />
            {errors.city && (
              <p className="text-red text-sm mt-2 font-medium">{errors.city.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="district" className="text-base font-semibold text-darkgray mb-2 block">
              İlçe *
            </Label>
            <Controller
              name="district"
              control={control}
              render={({ field }) => (
                <input
                  id="district"
                  placeholder="İlçe"
                  {...field}
                  className={`${inputClasses} ${errors.district ? errorInputClasses : ""}`}
                />
              )}
            />
            {errors.district && (
              <p className="text-red text-sm mt-2 font-medium">{errors.district.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="postalCode" className="text-base font-semibold text-darkgray mb-2 block">
              Posta Kodu
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray w-5 h-5" />
              <Controller
                name="postalCode"
                control={control}
                render={({ field }) => (
                  <input
                    id="postalCode"
                    placeholder="Posta Kodu"
                    {...field}
                    className={`${inputClasses} pl-12 ${errors.postalCode ? errorInputClasses : ""}`}
                  />
                )}
              />
            </div>
            {errors.postalCode && (
              <p className="text-red text-sm mt-2 font-medium">{errors.postalCode.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Kaydetme Seçenekleri - Sadece giriş yapmış kullanıcılar için */}
      {isAuthenticated && !isGuestUser && (
        <div className="bg-gradient-to-r from-lightgray to-lightgray2 rounded-xl p-6 border border-lightgray2">
          <h4 className="flex items-center gap-2 text-lg font-bold text-darkgray mb-4">
            <Save className="w-5 h-5 text-red" />
            Kaydetme Seçenekleri
          </h4>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Controller
                name="saveAddress"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="saveAddress"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="w-5 h-5"
                  />
                )}
              />
              <Label htmlFor="saveAddress" className="text-base font-semibold cursor-pointer text-darkgray">
                Bu adresi profilime kaydet
              </Label>
            </div>

            {saveAddressChecked && (
              <div className="ml-8 flex items-center space-x-3 animate-in slide-in-from-left-2 fade-in-0">
                <Controller
                  name="isDefault"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isDefault"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="w-5 h-5"
                    />
                  )}
                />
                <Label htmlFor="isDefault" className="text-base font-semibold cursor-pointer text-darkgray flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow" />
                  Varsayılan adres olarak ayarla
                </Label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <button
          onClick={handleSubmit(onFormSubmit)}
          disabled={isSubmitting || isSaving}
          className="w-full py-4 bg-yellow text-red font-bold text-lg rounded-xl hover:bg-red hover:text-yellow transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
        >
          {isSubmitting || isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              İşleniyor...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {submitText}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AddressForm;