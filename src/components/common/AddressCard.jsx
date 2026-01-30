import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone, faTrashCan, faPenToSquare, faStar } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent } from "@/components/ui/card";

export const AddressCard = ({ 
    address, 
    isSelected = false, 
    onSelect, 
    onEdit, 
    onDelete, 
    onSetDefault, 
    isProcessing = false, 
    showActions = false, 
    className = "" 
}) => {
    if (!address) return null;

    return (
        <div 
            className={`
                group relative p-4 rounded-lg border transition-all duration-200
                ${isSelected 
                    ? 'border-yellow bg-yellow/5 ring-1 ring-yellow' 
                    : 'border-gray-200 bg-gray-50 hover:border-gray-400'
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
                        {address.addressTitle || "Adres"}
                    </span>
                    {isSelected && (
                        <span className="text-xs bg-red text-white py-0.5 px-2 rounded-full ml-2">
                            Seçili
                        </span>
                    )}
                    {address.isDefault && (
                        <span className="text-xs border border-red text-red py-0.5 px-2 rounded-full ml-2">
                            Varsayılan
                        </span>
                    )}
                </div>

                {/* Actions */}
                {showActions && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {onSetDefault && !address.isDefault && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSetDefault(address);
                                }}
                                disabled={isProcessing}
                                className="w-8 h-8 flex items-center justify-center bg-white text-yellow border border-yellow rounded hover:bg-yellow hover:text-white transition-colors"
                                title="Varsayılan Yap"
                            >
                                <FontAwesomeIcon icon={faStar} />
                            </button>
                        )}
                        {onEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(address);
                                }}
                                className="w-8 h-8 flex items-center justify-center bg-white text-darkgray border border-darkgray rounded hover:bg-darkgray hover:text-white transition-colors"
                                title="Düzenle"
                            >
                                <FontAwesomeIcon icon={faPenToSquare} />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(address);
                                }}
                                disabled={isProcessing}
                                className="w-8 h-8 flex items-center justify-center bg-white text-red border border-red rounded hover:bg-red hover:text-white transition-colors"
                                title="Sil"
                            >
                                <FontAwesomeIcon icon={faTrashCan} />
                            </button>
                        )}
                    </div>
                )}
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
