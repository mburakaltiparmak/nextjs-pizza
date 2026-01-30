import React from "react";

const PriceSummary = ({ subtotal, discountAmount = 0, totalAmount }) => {
    return (
        <div className="space-y-1 py-2 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-Barlow">Ara Toplam</span>
                <span className="font-medium text-gray-700 font-Barlow">
                    {subtotal?.toFixed(2)} ₺
                </span>
            </div>
            {discountAmount > 0 && (
                <div className="flex justify-between items-center text-sm">
                    <span className="text-green-600 font-Barlow">İndirim</span>
                    <span className="font-medium text-green-600 font-Barlow">
                        -{discountAmount.toFixed(2)} ₺
                    </span>
                </div>
            )}
            <div className="flex justify-between items-end pt-2">
                <span className="font-bold text-darkgray font-Barlow text-base">Toplam</span>
                <span className="font-bold text-darkgray text-xl sm:text-2xl font-Barlow">
                    {totalAmount?.toFixed(2)} <span className="text-lg text-gray font-normal">₺</span>
                </span>
            </div>
        </div>
    );
};

export default PriceSummary;
