"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setLoading } from "@/lib/store/actions/globalActions";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";

// Base Modal Component (tüm modaller için temel bileşen)
export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black bg-opacity-50">
      <div
        className="absolute inset-0 md:hidden"
        onClick={onClose}
      />

      {/* Modal Content - Full screen on mobile, dialog on desktop */}
      <div className="relative bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-xl shadow-xl flex flex-col font-Barlow">
        {/* Header */}
        <div className="p-4 md:p-6 border-b flex-shrink-0 flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-semibold text-gray font-Quattrocento_Sans">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && <div className="border-t flex space-x-3 flex-shrink-0">{footer}</div>}
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
  icon = <Trash2 className="h-6 w-6 text-red" />,
}) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.global.loading);

  // Render sırasında değil, bileşen mount edildiğinde loading'i false yapıyoruz
  useEffect(() => {
    if (isOpen) {
      dispatch(setLoading(false));
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-Barlow">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 ">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-lightgray ">
            {icon}
          </div>
          <span className="flex flex-col gap-2">
            <h3 className="text-lg leading-6 font-medium text-gray">{title}</h3>
            <p className="text-sm text-gray">{message}</p>
          </span>
          {warning && (
            <div className="p-4 bg-lightgray border-y border-red text-red  text-sm">
              <strong>Uyarı:</strong> {warning}
            </div>
          )}

          <div className="flex justify-center space-x-3 my-4">
            <button
              type="button"
              className="px-4 py-2 bg-red text-white rounded-lg hover:bg-yellow hover:text-red transition-colors"
              onClick={onClose}
              disabled={loading}
            >
              {cancelButtonText}
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-900  transition-colors flex items-center justify-center"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
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
  cancelText = "İptal",
}) => {
  return (
    <div className="flex flex-row">
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
    </div>
  );
};
