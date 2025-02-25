"use client";
import { Trash2 } from 'lucide-react';

// Base Modal Component (tüm modaller için temel bileşen)
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  footer
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-Barlow">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="p-6">
          {children}
        </div>
        {footer && (
          <div className="p-4 border-t flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Confirmation Modal Component (silme onayı gibi onay modalları için)
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  warning,
  confirmButtonText = "Evet",
  cancelButtonText = "İptal",
  icon = <Trash2 className="h-6 w-6 text-red-600" />,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-Barlow">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            {icon}
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-4">{message}</p>
          
          {warning && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg mb-4 text-sm">
              <strong>Uyarı:</strong> {warning}
            </div>
          )}
          
          <div className="flex justify-center space-x-3 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelButtonText}
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-red text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  <span>İşleniyor...</span>
                </>
              ) : (
                confirmButtonText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Form Button Component (Form düğmeleri için)
export const FormButtons = ({ 
  onCancel, 
  isSubmitting = false, 
  submitText = "Kaydet", 
  cancelText = "İptal" 
}) => {
  return (
    <>
      <button
        type="button"
        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        {cancelText}
      </button>
      <button
        type="submit"
        className="px-4 py-2 bg-red text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
            <span>İşleniyor...</span>
          </>
        ) : (
          <span>{submitText}</span>
        )}
      </button>
    </>
  );
};