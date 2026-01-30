import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button";

export const EmptyState = ({ 
    icon = faBoxOpen, 
    title = "Veri Bulunamadı", 
    description, 
    actionLabel, 
    onAction, 
    className = "" 
}) => {
    // Determine if the icon is a FontAwesome object (has iconName) or a React Component (function/object)
    const isFontAwesome = icon && typeof icon === 'object' && 'iconName' in icon;
    const IconComponent = icon;

    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 text-center font-Barlow ${className}`}>
            <div className="bg-gray-100 rounded-full p-6 mb-4 flex items-center justify-center">
                {isFontAwesome ? (
                    <FontAwesomeIcon icon={icon} className="text-4xl text-gray-400" />
                ) : (
                    <IconComponent className="w-10 h-10 text-gray-400" />
                )}
            </div>
            <h3 className="text-lg font-semibold text-darkgray mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-gray-500 max-w-sm mb-6">
                    {description}
                </p>
            )}
            {actionLabel && onAction && (
                <Button 
                    onClick={onAction}
                    className="bg-red text-white hover:bg-darkred"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};
