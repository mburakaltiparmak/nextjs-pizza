"use client";
import { X } from 'lucide-react';

// Loading bileşeni
export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red"></div>
    </div>
  );
};

// Hata bileşeni
export const ErrorMessage = ({ error }) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
      <p className="font-medium">Hata oluştu</p>
      <p className="text-sm">{error}</p>
    </div>
  );
};

// Bildirim bileşeni (success veya error için)
export const Notification = ({ 
  message, 
  type = 'success', // 'success' veya 'error'
  onClose 
}) => {
  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const iconColor = type === 'success' ? 'text-green-600' : 'text-red-600';

  return (
    <div className={`${bgColor} border ${borderColor} ${textColor} p-4 rounded-lg mb-6 flex justify-between items-center`}>
      <p>{message}</p>
      <button onClick={onClose} className={iconColor}>
        <X size={18} />
      </button>
    </div>
  );
};

// Notification Manager - Birden fazla bildirimi yönetmek için
export const NotificationManager = ({ notifications, onClose }) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="space-y-4 mb-6">
      {notifications.map((notification, index) => (
        <Notification
          key={index}
          message={notification.message}
          type={notification.type}
          onClose={() => onClose(index)}
        />
      ))}
    </div>
  );
};