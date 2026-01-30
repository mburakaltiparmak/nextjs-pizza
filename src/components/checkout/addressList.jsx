"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { instance } from "@/lib/hooks";
import { useToast } from "@/lib/hooks/useToast";
import { Plus, Loader2, AlertCircle, MapPin, SquarePen } from "lucide-react";
import AddressForm from "./AddressForm";
import { AddressCard } from "@/components/common";

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
          <AddressCard
            key={address.id}
            address={address}
            isSelected={selectedAddressId === address.id}
            onSelect={() => onSelectAddress(address)}
            onEdit={() => startEditingAddress(address)}
            onDelete={() => handleDeleteAddress(address.id)}
            isProcessing={processingId === address.id}
            onSetDefault={() => handleSetDefault(address.id)}
            showActions={true}
          />
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