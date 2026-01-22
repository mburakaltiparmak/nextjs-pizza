/**
 * EmptyState Component
 * Reusable empty state component for tables and lists
 */

import { Button } from "@/components/ui/button";

export const EmptyState = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className = ""
}) => {
    return (
        <div className={`bg-white rounded-xl shadow-sm p-12 text-center border border-lightgray ${className}`}>
            {Icon && (
                <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            )}

            {title && (
                <h3 className="text-lg font-semibold text-darkgray mb-2 font-Barlow">
                    {title}
                </h3>
            )}

            {description && (
                <p className="text-gray-500 font-Barlow mb-4">
                    {description}
                </p>
            )}

            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    className="bg-red text-lightgray hover:bg-yellow hover:text-red font-Barlow"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

/**
 * Usage Examples:
 * 
 * // Simple empty state
 * <EmptyState
 *   icon={ShoppingBag}
 *   title="Sipariş Bulunamadı"
 *   description="Henüz hiç sipariş yok."
 * />
 * 
 * // With action button
 * <EmptyState
 *   icon={Package}
 *   title="Ürün Bulunamadı"
 *   description="Henüz hiç ürün eklenmemiş."
 *   actionLabel="Yeni Ürün Ekle"
 *   onAction={() => openModal()}
 * />
 * 
 * // Filtered results empty state
 * <EmptyState
 *   icon={Search}
 *   title="Sonuç Bulunamadı"
 *   description="Arama kriterlerinizle eşleşen kayıt bulunamadı."
 *   actionLabel="Filtreleri Temizle"
 *   onAction={resetFilters}
 * />
 */
