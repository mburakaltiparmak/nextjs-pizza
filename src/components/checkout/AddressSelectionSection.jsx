"use client";
import React from "react";
import { MapPin, Plus } from "lucide-react";
import AddressList from "./AddressList";
import AddressForm from "./AddressForm";

const AddressSelectionSection = ({ 
  isAuthenticated, 
  isGuest, 
  showNewAddressForm, 
  setShowNewAddressForm,
  selectedAddressId,
  newAddress,
  fullname,
  onAddressSelect,
  onAddressSubmit,
  onAddNewClick
}) => {
  
  // Adres Listesi Görünümü
  const renderAddressList = () => {
    // Kullanıcı girişi yapılmışsa (ve misafir değilse) gerçek adres listesi
    if (isAuthenticated && !isGuest) {
      return (
        <AddressList
          onSelectAddress={onAddressSelect}
          selectedAddressId={selectedAddressId}
          onAddNewAddress={onAddNewClick}
          fullname={fullname}
          handleAddressSubmit={onAddressSubmit}
          isAuthenticated={true}
        />
      );
    }
    
    // Misafir kullanıcı için basit görünüm
    return (
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
            onClick={onAddNewClick}
            className="inline-flex items-center gap-3 px-6 py-3 bg-yellow text-red font-bold rounded-xl hover:bg-red hover:text-yellow transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            {newAddress ? "Adresi Değiştir" : "Adres Ekle"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-yellow rounded-full p-2">
          <MapPin className="w-6 h-6 text-red" />
        </div>
        <h3 className="text-xl lg:text-2xl font-bold text-darkgray">Teslimat Adresi</h3>
      </div>

      {!showNewAddressForm ? (
        renderAddressList()
      ) : (
        <div className="bg-gradient-to-r from-lightgray to-lightgray2 rounded-xl p-6 border border-lightgray2">
          <h4 className="font-bold text-xl text-darkgray mb-6 flex items-center gap-2">
            <Plus className="w-6 h-6 text-red" />
            Yeni Adres Ekle
          </h4>
          <AddressForm
            onSubmit={onAddressSubmit}
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
  );
};

export default AddressSelectionSection;
