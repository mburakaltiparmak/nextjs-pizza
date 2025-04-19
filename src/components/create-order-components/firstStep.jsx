"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setUserData, setSelectedAddress } from "@/lib/store/actions/orderActions";
import { ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddressForm from "./addressForm";
import AddressList from "./addressList";

const schema = z.object({
  fullname: z.string().min(1, { message: "İsim ve soyisim gereklidir" }),
});

const FirstStep = ({ setCurrentStep, setStep1 }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  // Get user profile from redux store
  const userProfile = useAppSelector((state) => state.user.profile);
  const isAuthenticated = useAppSelector((state) => state.user?.isLogin) || false;
  
  // Mevcut adresleri redux'tan al (AddressList bunları kullanacak)
  const addresses = useAppSelector((state) => state.user.addresses || []);
  
  const [newAddress, setNewAddress] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullname: "",
    }
  });

  // Prefill form with user data when component mounts
  useEffect(() => {
    if (userProfile) {
      // Combine user's name and surname for the fullname field
      if (userProfile.name && userProfile.surname) {
        setValue("fullname", `${userProfile.name} ${userProfile.surname}`);
      }
    }
  }, [userProfile, setValue]);

  const fullname = watch("fullname");
  
  // İlerleme butonu aktif olması için isim ve adres kontrolü
  const isStep1Valid = fullname && (selectedAddressId || newAddress);

  // Adres seçimi
  const handleAddressSelect = (addressId) => {
    // ID'ye göre adres nesnesini bul
    const selectedAddress = addresses.find(addr => addr.id === addressId);
    
    setSelectedAddressId(addressId);
    setShowNewAddressForm(false);
    setNewAddress(null);
    
    // Seçilen adresi Redux'a kaydet
    if (selectedAddress) {
      dispatch(setSelectedAddress(selectedAddress));
      console.log(`Adres seçildi ve Redux'a kaydedildi: ID ${addressId}`, selectedAddress);
    }
  };

  // Yeni adres formu göster
  const handleAddNewClick = () => {
    setShowNewAddressForm(true);
    setSelectedAddressId(null);
  };

  // Adres formu gönderimi
  const handleAddressSubmit = (addressData) => {
    console.log("Adres form verisi:", addressData);
    
    // Adres verisini standart formata dönüştür
    const formattedAddress = {
      id: addressData.id || null,
      fullAddress: addressData.fullAddress,
      city: addressData.city,
      district: addressData.district,
      postalCode: addressData.postalCode || "",
      addressTitle: addressData.addressTitle || "",
      phoneNumber: addressData.phoneNumber || "",
      recipientName: addressData.recipientName || fullname,
      isDefault: addressData.isDefault || false
    };
    
    // Eğer adres backend'e kaydedilmiş ve bir ID aldıysa
    if (formattedAddress.id) {
      // Listeden seçilen adres olarak işaretle
      setSelectedAddressId(formattedAddress.id);
      setNewAddress(null);
      setShowNewAddressForm(false);
      
      // Adresi Redux'a kaydet
      dispatch(setSelectedAddress(formattedAddress));
    } 
    // Eğer yeni bir adres ise (backend'e kaydedilmemiş)
    else {
      // Adresi state'e kaydet
      setNewAddress(formattedAddress);
      setSelectedAddressId(null);
      setShowNewAddressForm(false);
      
      // Adresi Redux'a da kaydet
      dispatch(setSelectedAddress(formattedAddress));
      
      toast({
        title: "Adres bilgileri alındı",
        description: "Siparişiniz için kullanılacak."
      });
    }
  };

  const onSubmit = () => {
    try {
      // Adres bilgilerini kontrol et
      if (!selectedAddressId && !newAddress) {
        toast({
          title: "Adres eksik",
          description: "Lütfen bir adres seçin veya yeni adres ekleyin.",
          variant: "destructive"
        });
        return;
      }

      // Seçilen adresi bul
      let addressData = null;
      
      if (selectedAddressId) {
        addressData = addresses.find(addr => addr.id === selectedAddressId);
        
        if (!addressData) {
          toast({
            title: "Hata",
            description: "Seçilen adres bulunamadı.",
            variant: "destructive"
          });
          return;
        }
      } else if (newAddress) {
        addressData = newAddress;
      }

      console.log("Seçilen adres:", addressData);
      
      // Redux'a kullanıcı verilerini kaydet
      dispatch(setUserData({
        fullname,
        addressId: addressData?.id || null,
        userAddress: addressData,
        newAddress: selectedAddressId ? null : newAddress
      }));
      
      // Seçilen adresi ayrıca Redux state'ine kaydet
      if (addressData) {
        dispatch(setSelectedAddress(addressData));
      }
      
      // Adım 1 tamamlandı, sonraki adıma geç
      setStep1(true);
      setCurrentStep(2);
    } catch (error) {
      console.error("Adım 1 tamamlanırken hata:", error);
      toast({
        title: "Hata",
        description: "Bilgiler kaydedilirken bir sorun oluştu.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden font-Barlow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Kişisel Bilgiler</h2>
        <p className="text-gray-500 text-sm mb-6">
          Siparişinizi güvenli bir şekilde size ulaştırabilmemiz için bazı
          bilgilere ihtiyacımız var.
        </p>
        
        <div className="space-y-5">
          <div>
            <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
              İsim & Soyisim
            </label>
            <input
              {...register("fullname")}
              id="fullname"
              placeholder="Lütfen isminizi girin"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red focus:border-red"
            />
            {errors?.fullname?.message && (
              <p className="mt-1 text-sm text-red">{errors.fullname.message}</p>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Teslimat Adresi</h3>
            
            {/* Adres Listesi veya Form */}
            {!showNewAddressForm ? (
              <div>
                {isAuthenticated ? (
                  // Kullanıcı girişi yapılmışsa adres listesini göster
                  <AddressList
                    onSelectAddress={handleAddressSelect}
                    selectedAddressId={selectedAddressId}
                    onAddNewAddress={handleAddNewClick}
                    fullname={fullname}
                    handleAddressSubmit={handleAddressSubmit}
                    isAuthenticated={isAuthenticated}
                  />
                ) : (
                  // Misafir için yeni adres ekle butonu göster
                  <div className="p-4 text-center">
                    <p className="mb-4">Adres bilgilerinizi girin.</p>
                    <button
                      type="button"
                      onClick={handleAddNewClick}
                      className="w-full py-2 bg-yellow text-red font-semibold rounded-md hover:bg-red hover:text-yellow transition-colors"
                    >
                      Adres Ekle
                    </button>
                  </div>
                )}  
              </div>
            ) : (
              <div className="mt-4 border p-4 rounded-lg">
                <h4 className="font-medium mb-3">Yeni Adres Ekle</h4>
                <AddressForm 
                  onSubmit={handleAddressSubmit}
                  submitText="Adresi Kaydet"
                  initialData={{ 
                    saveAddress: isAuthenticated,
                    recipientName: fullname || ""
                  }}
                  isGuest={!isAuthenticated}
                />
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(false)}
                  className="mt-2 w-full py-2 bg-gray-100 text-gray-800 font-medium rounded-md hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={!isStep1Valid}
          className={`flex items-center font-semibold gap-2 px-6 py-2 rounded-md transition-colors ${
            isStep1Valid
              ? "bg-yellow text-red hover:bg-red hover:text-yellow border border-transparent hover:border-yellow" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          İLERLE
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FirstStep;