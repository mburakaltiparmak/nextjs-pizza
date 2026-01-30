"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";

export const GuestInfoSection = ({ guestData, isGuest, userData, getCustomerInfo }) => {
    if (!isGuest && !userData) return null;
    
    // Helper to get info if not provided
    const getInfo = () => {
         if (isGuest && guestData) {
            return `${guestData.name} ${guestData.surname}`;
        } else if (userData && userData.fullname) {
            return userData.fullname;
        }
        return "Belirtilmemiş";
    };

    const name = getCustomerInfo ? getCustomerInfo() : getInfo();
    const email = (isGuest && guestData) ? guestData.email : (userData ? userData.email || userData.guestEmail : "");
    const phone = (isGuest && guestData) ? guestData.phoneNumber : (userData ? userData.phoneNumber : "");

    // If no guest data and not guest mode, we might not want to show this or show user data
    // The original code showed this block if (isGuest && guestData) is true.
    if (!isGuest || !guestData) return null;

    return (
        <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Müşteri Bilgileri</h3>
            <div className="text-sm">
                <p>
                    <span className="font-medium">Ad Soyad:</span>{" "}
                    {name}
                </p>
                <p>
                    <span className="font-medium">E-posta:</span>{" "}
                    {email}
                </p>
                <p>
                    <span className="font-medium">Telefon:</span>{" "}
                    {phone}
                </p>
            </div>
            <Separator orientation="horizontal" className="bg-red mt-2" />
        </div>
    );
};
