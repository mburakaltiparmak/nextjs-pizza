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
import GuestInfoForm from "./guestInfoForm"; // Import the new GuestInfoForm component

const schema = z.object({
  fullname: z.string().min(1, { message: "İsim ve soyisim gereklidir" }),
});

const FirstStep = ({ setCurrentStep, setStep1 }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  // Get user profile from redux store
  const userProfile = useAppSelector((state) => state.user.profile);
  const isAuthenticated = useAppSelector((state) => state.user?.isLogin) || false;
  const role = useAppSelector((state) => state.user.role);
  const isGuest = role === "GUEST";
  
  // Get guest data from redux store if role is GUEST
  const guestData = useAppSelector((state) => state.guest);
  
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
    if (userProfile && !isGuest) {
      // Combine user's name and surname for the fullname field
      if (userProfile.name && userProfile.surname) {
        setValue("fullname", `${userProfile.name} ${userProfile.surname}`);
      }
    } else if (isGuest && guestData) {
      // Prefill with guest data if available
      if (guestData.name && guestData.surname) {
        setValue("fullname", `${guestData.name} ${guestData.surname}`);
      }
    }
  }, [userProfile, guestData, isGuest, setValue]);

  const fullname = watch("fullname");
  
  
  
  // İlerleme butonu aktif olması için isim ve adres kontrolü
  const isStep1Valid = fullname && (selectedAddressId || newAddress);
  
  // Guests need additional validation for email and phone
  const isGuestDataValid = !isGuest || (
    guestData && 
    guestData.name && 
    guestData.surname && 
    guestData.email && 
    guestData.phoneNumber
  );
  
  // Guest info form submit durumunu izlemek için
  const [guestInfoSubmitted, setGuestInfoSubmitted] = useState(false);
  
  // Guest bilgileri submit edildiğinde
  useEffect(() => {
    if (isGuest && guestData.name && guestData.surname && guestData.email && guestData.phoneNumber) {
      setGuestInfoSubmitted(true);
    }
  }, [isGuest, guestData]);

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
    // Eğer yeni bir adres ise (backend'e kaydedilmemiş veya misafir kullanıcı için)
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
      // Misafir bilgilerini kontrol et
      if (isGuest && !isGuestDataValid) {
        toast({
          title: "Eksik bilgi",
          description: "Lütfen tüm kişisel bilgilerinizi eksiksiz doldurun.",
          variant: "destructive"
        });
        return;
      }
      
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
      
      // Kullanıcı verileri objesi oluştur
      const userData = {
        fullname,
        addressId: addressData?.id || null, // Misafir kullanıcılar için null olacak
        userAddress: addressData,
        newAddress: selectedAddressId ? null : addressData, // Misafir kullanıcılar için yeni adres olarak işaretle
        isGuestOrder: isGuest
      };
      
      // Eğer misafir siparişi ise guest bilgilerini ekle
      if (isGuest) {
        userData.guestName = guestData.name;
        userData.guestSurname = guestData.surname;
        userData.guestEmail = guestData.email;
        userData.guestPhone = guestData.phoneNumber;
      }
      
      // Redux'a kullanıcı verilerini kaydet
      dispatch(setUserData(userData));
      
      // Seçilen adresi ayrıca Redux state'ine kaydet
      if (addressData) {
        dispatch(setSelectedAddress(addressData));
      }
      
      // Adım 1 tamamlandı, sonraki adıma geç
      setStep1(true);
      setCurrentStep(2);
      
      toast({
        title: "Bilgiler kaydedildi",
        description: isGuest ? 
          "Misafir bilgileriniz ve adres bilgileriniz başarıyla kaydedildi." : 
          "Kişisel bilgileriniz başarıyla kaydedildi."
      });
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
          {/* Misafir modunda ise Misafir bilgileri formunu göster */}
          {isGuest ? (
            <>
              {guestInfoSubmitted ? (
                <div className="mb-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <h3 className="text-lg font-medium text-green-800">Bilgileriniz kaydedildi</h3>
                    </div>
                    <div className="mt-2 text-sm text-green-700">
                      <p><strong>İsim Soyisim:</strong> {guestData.name} {guestData.surname}</p>
                      <p><strong>E-posta:</strong> {guestData.email}</p>
                      <p><strong>Telefon:</strong> {guestData.phoneNumber}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setGuestInfoSubmitted(false)}
                      className="mt-2 text-sm font-medium text-green-700 hover:text-green-900"
                    >
                      Düzenle
                    </button>
                  </div>
                </div>
              ) : (
                <GuestInfoForm />
              )}
            </>
          ) : (
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
          )}
          
          <div>
            <h3 className="text-lg font-medium mb-4">Teslimat Adresi</h3>
            
            {/* Adres Listesi veya Form */}
            {!showNewAddressForm ? (
              <div>
                {isAuthenticated && !isGuest ? (
                  // Kullanıcı girişi yapılmışsa adres listesini göster (misafir değilse)
                  <AddressList
                    onSelectAddress={handleAddressSelect}
                    selectedAddressId={selectedAddressId}
                    onAddNewAddress={handleAddNewClick}
                    fullname={fullname}
                    handleAddressSubmit={handleAddressSubmit}
                    isAuthenticated={isAuthenticated && !isGuest}
                  />
                ) : (
                  // Misafir için yeni adres ekle butonu göster
                  <div className="p-4 text-center">
                    <p className="mb-4">
                      {newAddress ? 
                        "Adres bilgileriniz alındı. Düzenlemek için yeni adres ekleyebilirsiniz." : 
                        "Adres bilgilerinizi girin."}
                    </p>
                    {newAddress && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                        <p className="font-medium">{newAddress.recipientName || fullname}</p>
                        <p className="text-sm text-gray-700">{newAddress.fullAddress}</p>
                        <p className="text-sm text-gray-700">{newAddress.district}, {newAddress.city}</p>
                        <p className="text-sm text-gray-700">{newAddress.phoneNumber}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleAddNewClick}
                      className="w-full py-2 bg-yellow text-red font-semibold rounded-md hover:bg-red hover:text-yellow transition-colors"
                    >
                      {newAddress ? "Adresi Değiştir" : "Adres Ekle"}
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
                    saveAddress: isAuthenticated && !isGuest,
                    recipientName: fullname || ""
                  }}
                  isGuest={isGuest}
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
          disabled={!isStep1Valid || (isGuest && !isGuestDataValid)}
          className={`flex items-center font-semibold gap-2 px-6 py-2 rounded-md transition-colors ${
            isStep1Valid && (!isGuest || isGuestDataValid)
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