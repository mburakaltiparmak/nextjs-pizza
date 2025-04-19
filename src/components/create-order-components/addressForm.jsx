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
  existingAddressId = null  // Düzenleme için adres ID'si
}) => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.user?.isLogin) || false;
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

  // Adres kaydetme seçeneğini izle
  const saveAddressChecked = watch("saveAddress");

  const onFormSubmit = async (data) => {
    try {
      // Eğer kullanıcı giriş yapmışsa ve "Adresi Kaydet" seçeneğini işaretlediyse
      if (isAuthenticated && data.saveAddress) {
        setIsSaving(true);
        
        // Yeni adres mi yoksa mevcut adresi güncelleme mi?
        const isNewAddress = !existingAddressId;
        
        try {
          let response;
          if (isNewAddress) {
            // Yeni adres ekleme
            response = await instance.post("user/addresses", {
              fullAddress: data.fullAddress,
              city: data.city,
              district: data.district,
              postalCode: data.postalCode || "",
              addressTitle: data.addressTitle || `Adres ${new Date().toISOString().substring(0, 10)}`,
              phoneNumber: data.phoneNumber || "",
              recipientName: data.recipientName,
              isDefault: data.isDefault || false
            });
          } else {
            // Mevcut adresi güncelleme
            response = await instance.put(`user/addresses/${existingAddressId}`, {
              fullAddress: data.fullAddress,
              city: data.city,
              district: data.district,
              postalCode: data.postalCode || "",
              addressTitle: data.addressTitle || `Adres ${new Date().toISOString().substring(0, 10)}`,
              phoneNumber: data.phoneNumber || "",
              recipientName: data.recipientName,
              isDefault: data.isDefault || false
            });
          }
        
          setIsSaving(false);
        
          if (response.data) {
            // Backend'ten dönen adres ID'sini ekleyerek parent komponente ilet
            onSubmit({
              ...data,
              id: isNewAddress ? response.data.id : existingAddressId,
              // Adres zaten kaydedildiği için redux'ta kaydetme seçeneğini false yapıyoruz
              saveAddress: false
            });
          
            toast({
              title: isNewAddress ? "Adres başarıyla kaydedildi" : "Adres başarıyla güncellendi",
              description: data.isDefault ? "Varsayılan adresiniz olarak ayarlandı." : "",
            });
          }
        } catch (apiError) {
          setIsSaving(false);
          console.error("Adres kaydedilirken hata:", apiError);
          
          toast({
            title: "Hata",
            description: apiError.response?.data?.message || "Adres kaydedilemedi",
            variant: "destructive",
          });
          
          // Hataya rağmen adresi kullanmak için parent komponente iletelim
          onSubmit(data);
        }
      } else {
        // Giriş yapılmamışsa veya adres kaydetme seçeneği işaretlenmemişse
        // Direk parent komponente bilgileri ilet
        onSubmit(data);
      }
    } catch (error) {
      setIsSaving(false);
      console.error("Adres işleminde hata:", error);
      
      toast({
        title: "Adres kaydedilemedi",
        description: "Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
      
      // Hataya rağmen adresi kullanmak için parent komponente iletelim
      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="recipientName">Alıcı Adı Soyadı *</Label>
        <Controller
          name="recipientName"
          control={control}
          render={({ field }) => (
            <Input
              id="recipientName"
              placeholder="Alıcı Adı Soyadı"
              {...field}
              className={errors.recipientName ? "border-red" : ""}
            />
          )}
        />
        {errors.recipientName && (
          <p className="text-red text-sm mt-1">{errors.recipientName.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="phoneNumber">Telefon Numarası</Label>
        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <Input
              id="phoneNumber"
              placeholder="05XX XXX XX XX"
              {...field}
              className={errors.phoneNumber ? "border-red" : ""}
            />
          )}
        />
        {errors.phoneNumber && (
          <p className="text-red text-sm mt-1">{errors.phoneNumber.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="fullAddress">Açık Adres *</Label>
        <Controller
          name="fullAddress"
          control={control}
          render={({ field }) => (
            <Textarea
              id="fullAddress"
              placeholder="Mahalle, sokak, bina no, daire no vb."
              {...field}
              className={errors.fullAddress ? "border-red" : ""}
              rows={3}
            />
          )}
        />
        {errors.fullAddress && (
          <p className="text-red text-sm mt-1">{errors.fullAddress.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Şehir *</Label>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <Input
                id="city"
                placeholder="Şehir"
                {...field}
                className={errors.city ? "border-red" : ""}
              />
            )}
          />
          {errors.city && (
            <p className="text-red text-sm mt-1">{errors.city.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="district">İlçe *</Label>
          <Controller
            name="district"
            control={control}
            render={({ field }) => (
              <Input
                id="district"
                placeholder="İlçe"
                {...field}
                className={errors.district ? "border-red" : ""}
              />
            )}
          />
          {errors.district && (
            <p className="text-red text-sm mt-1">{errors.district.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="postalCode">Posta Kodu</Label>
        <Controller
          name="postalCode"
          control={control}
          render={({ field }) => (
            <Input
              id="postalCode"
              placeholder="Posta Kodu"
              {...field}
              className={errors.postalCode ? "border-red" : ""}
            />
          )}
        />
        {errors.postalCode && (
          <p className="text-red text-sm mt-1">{errors.postalCode.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="addressTitle">Adres Başlığı</Label>
        <Controller
          name="addressTitle"
          control={control}
          render={({ field }) => (
            <Input
              id="addressTitle"
              placeholder="Örn: Ev, İş vb."
              {...field}
              className={errors.addressTitle ? "border-red" : ""}
            />
          )}
        />
        {errors.addressTitle && (
          <p className="text-red text-sm mt-1">{errors.addressTitle.message}</p>
        )}
      </div>

      {isAuthenticated && !isGuest && (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Controller
              name="saveAddress"
              control={control}
              render={({ field }) => (
                <Checkbox 
                  id="saveAddress" 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="saveAddress" className="text-sm cursor-pointer">
              Bu adresi kaydet
            </Label>
          </div>

          {saveAddressChecked && (
            <div className="flex items-center space-x-2">
              <Controller
                name="isDefault"
                control={control}
                render={({ field }) => (
                  <Checkbox 
                    id="isDefault" 
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isDefault" className="text-sm cursor-pointer">
                Varsayılan adres olarak ayarla
              </Label>
            </div>
          )}
        </div>
      )}
<div>
        <button
          type="submit"
          disabled={isSubmitting || isSaving}
          className="w-full py-2 bg-yellow text-red font-semibold rounded-md hover:bg-red hover:text-yellow transition-colors"
        >
          {isSubmitting || isSaving ? "İşleniyor..." : submitText}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;