"use client";
import React from "react";
import { CheckCircle } from "lucide-react";
import GuestInfoForm from "./GuestInfoForm";

const GuestSection = ({ isGuest, guestData, isSubmitted, onEdit, onRef }) => {
  if (!isGuest) return null;

  return (
    <div ref={onRef}>
      {isSubmitted ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-white rounded-full p-2 mr-4 shadow-sm">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-800">Bilgileriniz Kaydedildi</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
            <div>
              <span className="font-semibold block mb-1">İsim Soyisim:</span>
              <p className="bg-white/50 p-2 rounded-lg border border-green-100">{guestData.name} {guestData.surname}</p>
            </div>
            <div>
              <span className="font-semibold block mb-1">E-posta:</span>
              <p className="bg-white/50 p-2 rounded-lg border border-green-100">{guestData.email}</p>
            </div>
            <div>
              <span className="font-semibold block mb-1">Telefon:</span>
              <p className="bg-white/50 p-2 rounded-lg border border-green-100">{guestData.phoneNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="mt-6 px-4 py-2 bg-white text-green-700 border border-green-200 hover:border-green-300 rounded-lg text-sm font-semibold hover:bg-green-50 transition-colors shadow-sm"
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
