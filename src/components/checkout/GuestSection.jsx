"use client";
import React from "react";
import { CheckCircle } from "lucide-react";
import GuestInfoForm from "./GuestInfoForm";

const GuestSection = ({ isGuest, guestData, isSubmitted, onEdit, onRef }) => {
  if (!isGuest) return null;

  return (
    <div ref={onRef}>
      {isSubmitted ? (
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
            onClick={onEdit}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            Düzenle
          </button>
        </div>
      ) : (
        <GuestInfoForm />
      )}
    </div>
  );
};

export default GuestSection;
