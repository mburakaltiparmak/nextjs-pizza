import React from "react";

const AddressSummary = ({ address }) => {
    if (!address) return null;

    return (
        <div className="bg-lightgray p-4 rounded-xl border border-lightgray2">
            <h4 className="font-bold text-darkgray mb-1">
                {address.addressTitle || "Teslimat Adresi"}
            </h4>
            <div className="text-sm text-gray space-y-1">
                <p>{address.recipientName}</p>
                <p>{address.fullAddress}</p>
                <p>{address.district}/{address.city}</p>
                {address.phoneNumber && <p>{address.phoneNumber}</p>}
            </div>
        </div>
    );
};

export default AddressSummary;
