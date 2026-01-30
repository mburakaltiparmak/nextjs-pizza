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
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <p className="text-gray-500 text-base mb-6 leading-relaxed">
            {newAddress ?
              "✅ Adres bilgileriniz alındı. Düzenlemek için yeni adres ekleyebilirsiniz." :
              "📍 Siparişinizin teslim edileceği adresi belirtin."}
          </p>

          {newAddress && (
            <div className="mb-6 p-4 bg-white rounded-xl border border-yellow shadow-sm text-left relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-yellow"></div>
              <div className="pl-3 space-y-2">
                <p className="font-bold text-darkgray text-lg">{newAddress.recipientName || fullname}</p>
                <p className="text-gray-600">{newAddress.fullAddress}</p>
                <p className="text-gray-600">{newAddress.district}, {newAddress.city}</p>
                {newAddress.phoneNumber && (
                  <p className="text-gray-500 text-sm">📱 {newAddress.phoneNumber}</p>
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onAddNewClick}
            className="inline-flex items-center gap-3 px-6 py-3 bg-white border-2 border-yellow text-darkgray font-bold rounded-xl hover:bg-yellow hover:text-red transition-all duration-300 shadow-sm hover:shadow-md"
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
        <div className="bg-yellow/10 rounded-full p-2">
          <MapPin className="w-6 h-6 text-orange-600" />
        </div>
        <h3 className="text-xl lg:text-2xl font-bold text-darkgray">Teslimat Adresi</h3>
      </div>

      {!showNewAddressForm ? (
        renderAddressList()
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-inner">
          <h4 className="font-bold text-xl text-darkgray mb-6 flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-full border border-gray-200 shadow-sm">
                <Plus className="w-5 h-5 text-red" />
            </div>
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
            className="mt-4 w-full py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
          >
            İptal
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressSelectionSection;
