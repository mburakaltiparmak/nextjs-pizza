"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { instance } from "@/lib/hooks";
import { useToast } from "@/hooks/use-toast";
import { Check, Trash2, Edit, MapPin, Star, SquarePen } from "lucide-react";
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
  const { toast } = useToast();
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
      await instance.put(`/user/addresses/${addressId}/set-default`);
      toast({
        title: "Başarılı",
        description: "Varsayılan adres güncellendi",
      });
      fetchAddresses(); // Listeyi yeniden yükle
    } catch (error) {
      toast({
        title: "Hata",
        description: "Varsayılan adres ayarlanırken bir hata oluştu",
        variant: "destructive",
      });
      console.error("Varsayılan adres ayarlanırken hata:", error);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Bu adresi silmek istediğinizden emin misiniz?")) {
      try {
        await instance.delete(`/user/addresses/${addressId}`);
        toast({
          title: "Başarılı",
          description: "Adres silindi",
        });
        fetchAddresses(); // Listeyi yeniden yükle
      } catch (error) {
        toast({
          title: "Hata",
          description: "Adres silinirken bir hata oluştu",
          variant: "destructive",
        });
        console.error("Adres silinirken hata:", error);
      }
    }
  };

  const handleEditFormSubmit = (updatedAddressData) => {
    // Form gönderimi tamamlandığında düzenleme modundan çık
    setEditingAddress(null);
    
    // Parent bileşene düzenlenmiş adresi ilet
    handleAddressSubmit(updatedAddressData);
    
    // Adres listesini yeniden yükle
    fetchAddresses();
  };

  const startEditingAddress = (address) => {
    setEditingAddress(address);
  };

  const cancelEditing = () => {
    setEditingAddress(null);
  };

  if (loading) {
    return <div className="p-4 text-center">Adresler yükleniyor...</div>;
  }

  // Adres yoksa veya yükleme hatası varsa "Yeni Adres Ekle" düğmesi göster
  if (addresses.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center mb-4">
          {fetchError 
            ? "Adreslerinize erişilemiyor, lütfen yeni bir adres ekleyin." 
            : "Kayıtlı adresiniz bulunmamaktadır."}
        </div>
        
        <button
          onClick={onAddNewAddress}
          className="w-full py-2 bg-yellow text-red font-semibold rounded-md hover:bg-red hover:text-yellow transition-colors"
        >
          Yeni Adres Ekle
        </button>
      </div>
    );
  }

  // Eğer bir adres düzenleme modundaysa
  if (editingAddress) {
    return (
      <div className="mt-4 border p-4 rounded-lg">
        <h4 className="font-medium mb-3">Adresi Düzenle</h4>
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
          className="mt-2 w-full py-2 bg-lightgray text-gray font-medium rounded-md hover:bg-gray-200 transition-colors"
        >
          İptal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <div
          key={address.id}
          className={`border-2 p-4 rounded-lg ${
            selectedAddressId === address.id ? "border-red bg-lightgray2" : "border-gray"
          } cursor-pointer hover:border-yellow transition-colors`}
          onClick={() => onSelectAddress(address.id)}
        >
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              {address.addressTitle ? (
                <span className="font-semibold">{address.addressTitle}</span>
              ) : (
                <span className="font-semibold">Adres {address.id}</span>
              )}
              {address.isDefault && (
                <span className="text-yellow text-xs px-2 py-1 rounded-full bg-red flex items-center gap-1">
                  <Star size={12} />
                  Varsayılan
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {!address.isDefault && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetDefault(address.id);
                  }}
                  className="text-gray hover:text-yellow p-1"
                  title="Varsayılan Yap"
                >
                  <Star size={18} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEditingAddress(address);
                }}
                className="text-black hover:text-red p-1 border border-black rounded-md hover:border-red"
                title="Adresi Düzenle"
              >
                <SquarePen size={18}/>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAddress(address.id);
                }}
                className="text-black hover:text-red p-1 border border-black rounded-md hover:border-red"
                title="Adresi Sil"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-start gap-2">
              <MapPin size={18} className="text-gray mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">{address.recipientName}</p>
                <p className="text-sm text-gray">{address.fullAddress}</p>
                <p className="text-sm text-gray">
                  {address.district}, {address.city}
                  {address.postalCode && ` - ${address.postalCode}`}
                </p>
                {address.phoneNumber && (
                  <p className="text-sm text-gray">{address.phoneNumber}</p>
                )}
              </div>
            </div>
          </div>

          {selectedAddressId === address.id && (
            <div className="mt-2 text-right">
              <span className="inline-flex items-center text-white bg-red gap-1 px-4 py-2 rounded-md border-2 border-red">
                <Check size={16} /> Seçili
              </span>
            </div>
          )}
        </div>
      ))}
      <button
        onClick={onAddNewAddress}
        className="w-full py-2 bg-lightgray text-gray font-medium rounded-md hover:bg-gray-200 transition-colors"
      >
        + Yeni Adres Ekle
      </button>
    </div>
  );
};

export default AddressList;