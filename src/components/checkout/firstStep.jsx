"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setUserData, setSelectedAddress } from "@/lib/store/actions/orderActions";
import { ChevronRight, CheckCircle, MapPin, Plus } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";
import AddressForm from "./addressForm";
import AddressList from "./addressList";
import GuestInfoForm from "./guestInfoForm";

import { personalInfoSchema } from "@/lib/validations/order";
import { selectUserProfile, selectIsAuthenticated, selectUserRole, selectUserAddresses } from "@/lib/store/selectors/userSelectors";
import { selectGuestData } from "@/lib/store/selectors/guestSelectors";

// Schema imported from central validation file


const FirstStep = ({ setCurrentStep, setStep1 }) => {
  const dispatch = useAppDispatch();
  const { success, error, warning } = useToast();

  // Get user profile from redux store
  // Get user profile from redux store
  const userProfile = useAppSelector(selectUserProfile);
  const isAuthenticated = useAppSelector(selectIsAuthenticated) || false;
  const role = useAppSelector(selectUserRole);
  const isGuestMode = useAppSelector((state) => state.app?.isGuestMode);
  // Kullanıcı giriş yapmamışsa otomatik olarak misafir sayılır
  const isGuest = role === "GUEST" || isGuestMode || !isAuthenticated;

  // Get guest data from redux store if role is GUEST
  const guestData = useAppSelector(selectGuestData);

  // Mevcut adresleri redux'tan al (AddressList bunları kullanacak)
  const addresses = useAppSelector(selectUserAddresses) || [];

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
    resolver: zodResolver(personalInfoSchema),
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
      // Misafir siparişi ise ve guest email varsa adrese ekle
      if (isGuest && guestData && guestData.email) {
        formattedAddress.email = guestData.email;
      }

      // Adresi state'e kaydet
      setNewAddress(formattedAddress);
      setSelectedAddressId(null);
      setShowNewAddressForm(false);

      // Adresi Redux'a da kaydet
      dispatch(setSelectedAddress(formattedAddress));
    }
  };

  const onSubmit = () => {
    try {
      // Misafir bilgilerini kontrol et
      if (isGuest && !isGuestDataValid) {
        error("Lütfen tüm kişisel bilgilerinizi eksiksiz doldurun", {
          title: "Eksik bilgi"
        });
        return;
      }

      // Adres bilgilerini kontrol et
      if (!selectedAddressId && !newAddress) {
        warning("Lütfen bir adres seçin veya yeni adres ekleyin", {
          title: "Adres eksik"
        });
        return;
      }

      // Seçilen adresi bul
      let addressData = null;

      if (selectedAddressId) {
        addressData = addresses.find(addr => addr.id === selectedAddressId);
      } else if (newAddress) {
        addressData = newAddress;
      }

      // FIX: Misafir emailini adrese ekle (Eğer ilk başta eklenmediyse)
      if (isGuest && addressData && guestData?.email) {
        console.log("Adrese misafir emaili ekleniyor:", guestData.email);
        addressData = { ...addressData, email: guestData.email };
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

    } catch (error) {
      console.error("Adım 1 tamamlanırken hata:", error);
      error("Bilgiler kaydedilirken bir sorun oluştu", {
        title: "Hata"
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden font-Barlow border border-lightgray2">
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3 text-darkgray">Kişisel Bilgiler</h2>
          <p className="text-gray text-base leading-relaxed">
            Siparişinizi güvenli bir şekilde size ulaştırabilmemiz için bazı
            bilgilere ihtiyacımız var.
          </p>
        </div>

        <div className="space-y-8">
          {/* Misafir modunda ise Misafir bilgileri formunu göster */}
          {isGuest ? (
            <>
              {guestInfoSubmitted ? (
                <div className="bg-gradient-to-r from-green-50 to-lightgray border-2 border-green-300 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 rounded-full p-2 mr-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-green-800">Bilgileriniz Kaydedildi</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
                    <div>
                      <span className="font-semibold">İsim Soyisim:</span>
                      <p className="mt-1">{guestData.name} {guestData.surname}</p>
                    </div>
                    <div>
                      <span className="font-semibold">E-posta:</span>
                      <p className="mt-1">{guestData.email}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Telefon:</span>
                      <p className="mt-1">{guestData.phoneNumber}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGuestInfoSubmitted(false)}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                  >
                    Düzenle
                  </button>
                </div>
              ) : (
                <GuestInfoForm />
              )}
            </>
          ) : (
            <div className="space-y-3">
              <label htmlFor="fullname" className="block text-base font-semibold text-darkgray">
                İsim & Soyisim
              </label>
              <input
                {...register("fullname")}
                id="fullname"
                placeholder="Lütfen isminizi girin"
                className="w-full px-4 py-3 border-2 border-lightgray2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow focus:border-yellow transition-all text-base"
              />
              {errors?.fullname?.message && (
                <p className="text-red text-sm font-medium">{errors.fullname.message}</p>
              )}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-yellow rounded-full p-2">
                <MapPin className="w-6 h-6 text-red" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-darkgray">Teslimat Adresi</h3>
            </div>

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
                  <div className="text-center space-y-6">
                    <div className="bg-gradient-to-r from-lightgray to-lightgray2 rounded-xl p-6">
                      <p className="text-gray text-base mb-6 leading-relaxed">
                        {newAddress ?
                          "✅ Adres bilgileriniz alındı. Düzenlemek için yeni adres ekleyebilirsiniz." :
                          "📍 Siparişinizin teslim edileceği adresi belirtin."}
                      </p>

                      {newAddress && (
                        <div className="mb-6 p-4 bg-white rounded-xl border-2 border-yellow shadow-md">
                          <div className="text-left space-y-2">
                            <p className="font-bold text-darkgray text-lg">{newAddress.recipientName || fullname}</p>
                            <p className="text-gray">{newAddress.fullAddress}</p>
                            <p className="text-gray">{newAddress.district}, {newAddress.city}</p>
                            {newAddress.phoneNumber && (
                              <p className="text-gray">📱 {newAddress.phoneNumber}</p>
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleAddNewClick}
                        className="inline-flex items-center gap-3 px-6 py-3 bg-yellow text-red font-bold rounded-xl hover:bg-red hover:text-yellow transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Plus className="w-5 h-5" />
                        {newAddress ? "Adresi Değiştir" : "Adres Ekle"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-r from-lightgray to-lightgray2 rounded-xl p-6 border border-lightgray2">
                <h4 className="font-bold text-xl text-darkgray mb-6 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-red" />
                  Yeni Adres Ekle
                </h4>
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
                  className="mt-4 w-full py-3 bg-lightgray text-darkgray font-semibold rounded-xl hover:bg-gray hover:text-white transition-colors"
                >
                  İptal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6 bg-gradient-to-r from-lightgray to-lightgray2 border-t border-lightgray2">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={!isStep1Valid}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg transform ${isStep1Valid
              ? "bg-yellow text-red hover:bg-red hover:text-yellow hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-yellow"
              : "bg-gray text-lightgray cursor-not-allowed opacity-60"
              }`}
          >
            İLERLE
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirstStep;