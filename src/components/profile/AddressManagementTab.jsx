"use client";

import { useState } from "react";
import AddressList from "@/components/checkout/addressList";
import AddressForm from "@/components/checkout/addressForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faTimes } from "@fortawesome/free-solid-svg-icons";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const AddressManagementTab = () => {
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    const handleAddressSubmit = (addressData) => {
        setShowAddressForm(false);
        // AddressList component will handle its own refresh
    };

    if (showAddressForm) {
        return (
            <Card className="border-gray">
                <CardHeader>
                    <CardTitle className="text-darkgray font-Quattrocento_Sans flex items-center gap-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        Yeni Adres Ekle
                    </CardTitle>
                    <CardDescription className="text-gray font-Barlow">
                        Teslimat için yeni bir adres ekleyin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AddressForm onSubmit={handleAddressSubmit} isGuest={false} />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddressForm(false)}
                        className="mt-4 w-full border-gray text-darkgray hover:bg-gray hover:text-lightgray font-Barlow"
                    >
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        İptal
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-gray">
            <CardHeader>
                <CardTitle className="text-darkgray font-Quattrocento_Sans flex items-center gap-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    Kayıtlı Adreslerim
                </CardTitle>
                <CardDescription className="text-gray font-Barlow">
                    Teslimat adreslerinizi yönetin.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AddressList
                    onSelectAddress={(id) => setSelectedAddressId(id)}
                    handleAddressSubmit={handleAddressSubmit}
                    selectedAddressId={selectedAddressId}
                    onAddNewAddress={() => setShowAddressForm(true)}
                    isAuthenticated={true}
                />
            </CardContent>
        </Card>
    );
};
