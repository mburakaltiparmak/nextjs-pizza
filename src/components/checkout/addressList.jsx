"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { instance } from "@/lib/hooks";
import { useToast } from "@/lib/hooks/useToast";
import { Check, Trash2, MapPin, Star, SquarePen, Plus, Loader2, AlertCircle } from "lucide-react";
import AddressForm from "./addressForm";

const AddressList = ({
  onSelectAddress,
  handleAddressSubmit,
  selectedAddressId = null,
  onAddNewAddress,
  fullname = "",
  isAuthenticated = false
}) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const { success, error } = useToast();
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setFetchError(false);
      const response = await instance.get("/user/addresses");

      if (response.data && Array.isArray(response.data)) {
        setAddresses(response.data);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error("Adresler yüklenirken hata:", error);
      setAddresses([]);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      setProcessingId(addressId);
      await instance.put(`/user/addresses/${addressId}/set-default`);
      success("Varsayılan adres güncellendi");
      fetchAddresses();
    } catch (err) {
      error("Varsayılan adres ayarlanırken bir hata oluştu");
      console.error("Varsayılan adres ayarlanırken hata:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Bu adresi silmek istediğinizden emin misiniz?")) {
      try {
        setProcessingId(addressId);
        await instance.delete(`/user/addresses/${addressId}`);
        success("Adres silindi");
        fetchAddresses();
      } catch (err) {
        error("Adres silinirken bir hata oluştu");
        console.error("Adres silinirken hata:", err);
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleEditFormSubmit = (updatedAddressData) => {
    setEditingAddress(null);
    handleAddressSubmit(updatedAddressData);
    fetchAddresses();
  };

  const startEditingAddress = (address) => {
    setEditingAddress(address);
  };

  const cancelEditing = () => {
    setEditingAddress(null);
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-yellow mx-auto" />
          <p className="text-gray font-medium">Adresler yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (addresses.length === 0) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="bg-gradient-to-r from-lightgray to-lightgray2 rounded-2xl p-8 border border-lightgray2">
          <div className="space-y-4">
            <div className="bg-yellow rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
              <MapPin className="w-8 h-8 text-red" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-darkgray">
                {fetchError ? "Adreslerinize Erişilemiyor" : "Kayıtlı Adres Bulunamadı"}
              </h3>
              <p className="text-gray">
                {fetchError
                  ? "Lütfen yeni bir adres ekleyerek devam edin."
                  : "Hızlı teslimat için ilk adresinizi ekleyin."}
              </p>
            </div>

            {fetchError && (
              <div className="flex items-center justify-center gap-2 text-red bg-red-50 py-2 px-4 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Bağlantı sorunu yaşanıyor</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onAddNewAddress}
          className="inline-flex items-center gap-3 px-8 py-4 bg-yellow text-red font-bold rounded-xl hover:bg-red hover:text-yellow transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Yeni Adres Ekle
        </button>
      </div>
    );
  }

  // Edit Form State
  if (editingAddress) {
    return (
      <div className="bg-gradient-to-r from-lightgray to-lightgray2 rounded-2xl p-6 border border-lightgray2">
        <h4 className="font-bold text-xl text-darkgray mb-6 flex items-center gap-2">
          <SquarePen className="w-6 h-6 text-red" />
          Adresi Düzenle
        </h4>
        <AddressForm
          onSubmit={handleEditFormSubmit}
          submitText="Adresi Güncelle"
          initialData={{
            fullAddress: editingAddress.fullAddress,
            city: editingAddress.city,
            district: editingAddress.district,
            postalCode: editingAddress.postalCode || "",
            addressTitle: editingAddress.addressTitle || "",
            phoneNumber: editingAddress.phoneNumber || "",
            recipientName: editingAddress.recipientName,
            isDefault: editingAddress.isDefault || false,
            saveAddress: true
          }}
          isGuest={!isAuthenticated}
          existingAddressId={editingAddress.id}
        />
        <button
          type="button"
          onClick={cancelEditing}
          className="mt-4 w-full py-3 bg-white text-darkgray font-semibold rounded-xl hover:bg-darkgray hover:text-white transition-colors border-2 border-lightgray2 hover:border-darkgray"
        >
          İptal
        </button>
      </div>
    );
  }

  // Address List
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`group relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-102 hover:shadow-lg ${selectedAddressId === address.id
              ? "border-red bg-gradient-to-r from-yellow to-lightyellow shadow-lg scale-102"
              : "border-lightgray2 bg-white hover:border-yellow"
              }`}
            onClick={() => onSelectAddress(address.id)}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border-2 ${selectedAddressId === address.id
                  ? "bg-red border-red"
                  : "bg-yellow border-yellow"
                  }`}>
                  <MapPin className={`w-5 h-5 ${selectedAddressId === address.id ? "text-yellow" : "text-red"
                    }`} />
                </div>

                <div>
                  <h4 className={`font-bold text-lg ${selectedAddressId === address.id ? "text-red" : "text-darkgray"
                    }`}>
                    {address.addressTitle || `Adres ${address.id}`}
                  </h4>

                  {address.isDefault && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-red fill-current" />
                      <span className="text-sm font-medium text-red">Varsayılan</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Kontrast Düzeltildi */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!address.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetDefault(address.id);
                    }}
                    disabled={processingId === address.id}
                    className="p-2 bg-white text-yellow border-2 border-yellow rounded-lg hover:bg-yellow hover:text-red transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
                    title="Varsayılan Yap"
                  >
                    {processingId === address.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Star className="w-4 h-4" />
                    )}
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditingAddress(address);
                  }}
                  className="p-2 bg-white text-darkgray border-2 border-darkgray rounded-lg hover:bg-darkgray hover:text-white transition-colors shadow-md hover:shadow-lg"
                  title="Düzenle"
                >
                  <SquarePen className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAddress(address.id);
                  }}
                  disabled={processingId === address.id}
                  className="p-2 bg-white text-red border-2 border-red rounded-lg hover:bg-red hover:text-white transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
                  title="Sil"
                >
                  {processingId === address.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Address Details */}
            <div className={`space-y-2 text-sm ${selectedAddressId === address.id ? "text-red" : "text-gray"
              }`}>
              <p className="font-semibold text-base">{address.recipientName}</p>
              <p className="leading-relaxed">{address.fullAddress}</p>
              <div className="flex flex-wrap gap-4">
                <span>📍 {address.district}, {address.city}</span>
                {address.postalCode && <span>📮 {address.postalCode}</span>}
                {address.phoneNumber && <span>📱 {address.phoneNumber}</span>}
              </div>
            </div>

            {/* Selected Indicator */}
            {selectedAddressId === address.id && (
              <div className="absolute bottom-4 right-4">
                <div className="bg-red text-yellow px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg border-2 border-red">
                  <Check className="w-4 h-4" />
                  Seçili
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Address Button */}
      <div className="pt-4 border-t border-lightgray2">
        <button
          onClick={onAddNewAddress}
          className="w-full py-4 bg-white text-darkgray font-semibold rounded-xl hover:bg-yellow hover:text-red transition-all duration-300 border-2 border-lightgray2 hover:border-yellow shadow-md hover:shadow-lg flex items-center justify-center gap-3"
        >
          <Plus className="w-5 h-5" />
          Yeni Adres Ekle
        </button>
      </div>
    </div>
  );
};

export default AddressList;