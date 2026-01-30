import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent } from "@/components/ui/card";

export const AddressCard = ({ address, isSelected = false, onSelect, className = "" }) => {
    if (!address) return null;

    return (
        <div 
            className={`
                relative p-4 rounded-lg border transition-all duration-200
                ${isSelected 
                    ? 'border-yellow bg-yellow/5 ring-1 ring-yellow' 
                    : 'border-gray bg-gray-50 hover:border-gray-400'
                }
                ${onSelect ? 'cursor-pointer' : ''}
                ${className}
            `}
            onClick={() => onSelect && onSelect(address)}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faLocationDot} className={isSelected ? "text-red" : "text-gray-500"} />
                    <span className="font-semibold text-darkgray capitalize">
                        {address.addressTitle}
                    </span>
                    {isSelected && (
                        <span className="text-xs bg-red text-white py-0.5 px-2 rounded-full ml-2">
                            Seçili
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-1 text-sm text-gray-700 ml-6">
                <p className="font-medium text-darkgray">{address.recipientName}</p>
                <p className="text-gray-600 line-clamp-2">{address.fullAddress}</p>
                <p>{address.district} / {address.city}</p>
                {address.phoneNumber && (
                    <p className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                        <FontAwesomeIcon icon={faPhone} className="text-gray-400 text-xs" />
                        {address.phoneNumber}
                    </p>
                )}
            </div>
        </div>
    );
};
