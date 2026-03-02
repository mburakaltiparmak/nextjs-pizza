"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setUserData, setSelectedAddress } from "@/lib/store/actions/orderActions";
import { ChevronRight } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";
import { personalInfoSchema } from "@/lib/validations/order";
import { selectUserProfile, selectIsAuthenticated, selectUserAddresses } from "@/lib/store/selectors/userSelectors";
import { useGuestMode } from "@/lib/hooks/useGuestMode";

import GuestSection from "./GuestSection";
import AddressSelectionSection from "./AddressSelectionSection";

const FirstStep = ({ onComplete }) => {
  const dispatch = useAppDispatch();
  const { success, error, warning } = useToast();

  // Get user profile from Redux
  const userProfile = useAppSelector(selectUserProfile);
  const isAuthenticated = useAppSelector(selectIsAuthenticated) || false;
  
  // Custom hook for guest mode
  const { isGuest, guestData } = useGuestMode();
  const addresses = useAppSelector(selectUserAddresses) || [];

  const [newAddress, setNewAddress] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddressObj, setSelectedAddressObj] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [guestInfoSubmitted, setGuestInfoSubmitted] = useState(false);

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

  // Prefill form
  useEffect(() => {
    if (userProfile && !isGuest && userProfile.name && userProfile.surname) {
        setValue("fullname", `${userProfile.name} ${userProfile.surname}`);
    } else if (isGuest && guestData && guestData.name && guestData.surname) {
        setValue("fullname", `${guestData.name} ${guestData.surname}`);
    }
  }, [userProfile, guestData, isGuest, setValue]);

  // Guest Submitted Check
  useEffect(() => {
    if (isGuest && guestData.name && guestData.surname && guestData.email && guestData.phoneNumber) {
      setGuestInfoSubmitted(true);
    }
  }, [isGuest, guestData]);

  const isGuestDataValid = !isGuest || (
    guestData && guestData.name && guestData.surname && guestData.email && guestData.phoneNumber && guestInfoSubmitted
  );

  const isStep1Valid = fullname && (selectedAddressId || newAddress) && isGuestDataValid;

  // Handlers
  const handleAddressSelect = (addressOrId) => {
    let selectedAddress;
    let newAddressId;

    if (typeof addressOrId === 'object' && addressOrId !== null) {
      selectedAddress = addressOrId;
      newAddressId = addressOrId.id;
    } else {
      selectedAddress = addresses.find(addr => addr.id === addressOrId);
      newAddressId = addressOrId;
    }

    setSelectedAddressId(newAddressId);
    setSelectedAddressObj(selectedAddress);
    setShowNewAddressForm(false);
    setNewAddress(null);

    if (selectedAddress) {
      dispatch(setSelectedAddress(selectedAddress));
    }
  };

  const handleAddNewClick = () => {
    setShowNewAddressForm(true);
    setSelectedAddressId(null);
  };

  const handleAddressSubmit = (addressData) => {
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

    if (formattedAddress.id) {
      setSelectedAddressId(formattedAddress.id);
      setNewAddress(null);
      setShowNewAddressForm(false);
      dispatch(setSelectedAddress(formattedAddress));
    } else {
      if (isGuest && guestData && guestData.email) {
        formattedAddress.email = guestData.email;
      }
      setNewAddress(formattedAddress);
      setSelectedAddressId(null);
      setShowNewAddressForm(false);
      dispatch(setSelectedAddress(formattedAddress));
    }
  };

  const onStepSubmit = () => {
    try {
      if (isGuest && !isGuestDataValid) {
        error("Lütfen tüm kişisel bilgilerinizi eksiksiz doldurun", { title: "Eksik bilgi" });
        return;
      }

      if (!selectedAddressId && !newAddress) {
        warning("Lütfen bir adres seçin veya yeni adres ekleyin", { title: "Adres eksik" });
        return;
      }

      let addressData = null;
      if (selectedAddressId) {
        if (selectedAddressObj && selectedAddressObj.id === selectedAddressId) {
          addressData = selectedAddressObj;
        } else {
          addressData = addresses.find(addr => addr.id === selectedAddressId);
        }
      } else if (newAddress) {
        addressData = newAddress;
      }

      if (isGuest && addressData && guestData?.email) {
        addressData = { ...addressData, email: guestData.email };
      }

      const userData = {
        fullname,
        addressId: addressData?.id || null,
        userAddress: addressData,
        newAddress: selectedAddressId ? null : addressData,
        isGuestOrder: isGuest
      };

      if (isGuest) {
        userData.guestName = guestData.name;
        userData.guestSurname = guestData.surname;
        userData.guestEmail = guestData.email;
        userData.guestPhone = guestData.phoneNumber;
      }

      dispatch(setUserData(userData));
      if (addressData) {
        dispatch(setSelectedAddress(addressData));
      }

      if (onComplete) onComplete();

    } catch (err) {
        console.error("Adım 1 hatası:", err);
        error("Bilgiler kaydedilirken bir sorun oluştu.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden font-Barlow border border-gray-100">
      <div className="p-6 lg:p-8">
        <div className="mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3 text-darkgray">Kişisel Bilgiler</h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Siparişinizi güvenli bir şekilde size ulaştırabilmemiz için bazı bilgilere ihtiyacımız var.
          </p>
        </div>

        <div className="space-y-8">
          {/* Guest Section */}
          <GuestSection 
            isGuest={isGuest} 
            guestData={guestData} 
            isSubmitted={guestInfoSubmitted}
            onEdit={() => setGuestInfoSubmitted(false)}
          />

          {/* User Fullname Input (Only if not guest) */}
          {!isGuest && (
            <div className="space-y-3">
              <label htmlFor="fullname" className="block text-base font-semibold text-darkgray">
                İsim & Soyisim
              </label>
              <input
                {...register("fullname")}
                id="fullname"
                placeholder="Lütfen isminizi girin"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow focus:border-yellow transition-all text-base bg-gray-50 focus:bg-white"
              />
              {errors?.fullname?.message && (
                <p className="text-red text-sm font-medium">{errors.fullname.message}</p>
              )}
            </div>
          )}

          {/* Address Section */}
          <AddressSelectionSection
             isAuthenticated={isAuthenticated}
             isGuest={isGuest}
             showNewAddressForm={showNewAddressForm}
             setShowNewAddressForm={setShowNewAddressForm}
             selectedAddressId={selectedAddressId}
             newAddress={newAddress}
             fullname={fullname}
             onAddressSelect={handleAddressSelect}
             onAddressSubmit={handleAddressSubmit}
             onAddNewClick={handleAddNewClick}
          />
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit(onStepSubmit)}
            disabled={!isStep1Valid}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-md transform ${isStep1Valid
              ? "bg-yellow text-darkgray hover:bg-red hover:text-white hover:shadow-lg hover:-translate-y-1"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
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