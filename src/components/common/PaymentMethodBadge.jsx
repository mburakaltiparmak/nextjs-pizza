import React from 'react';
import { getPaymentMethodDisplay } from '@/lib/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faMoneyBillWave, faWallet } from '@fortawesome/free-solid-svg-icons';

export const PaymentMethodBadge = ({ method, className = "" }) => {
    const getIcon = (methodKey) => {
        switch (methodKey) {
            case 'CREDIT_CARD': return faCreditCard;
            case 'CASH_ON_DELIVERY': return faMoneyBillWave;
            default: return faWallet;
        }
    };

    const displayText = getPaymentMethodDisplay(method);

    return (
        <div className={`flex items-center space-x-2 text-darkgray font-medium ${className}`}>
            <FontAwesomeIcon icon={getIcon(method)} className="text-gray-500" />
            <span>{displayText}</span>
        </div>
    );
};
