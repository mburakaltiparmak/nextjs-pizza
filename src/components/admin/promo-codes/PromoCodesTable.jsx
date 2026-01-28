import { Edit, Trash2, Tag, Plus } from "lucide-react";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils/formatters";

export const PromoCodesTable = ({
    promoCodes,
    onEdit,
    onDelete,
    onAddNew,
    loading,
}) => {
    if (loading) {
        return <TableSkeleton rowCount={8} columnCount={6} />;
    }

    if (!promoCodes || promoCodes.length === 0) {
        return (
            <EmptyState
                icon={Tag}
                title="Promo Kod Bulunamadı"
                description="Henüz hiç promosyon kodu eklenmemiş."
                actionLabel="Yeni Kod Ekle"
                onAction={onAddNew}
            />
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("tr-TR");
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                                Kod
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                                Tip / Değer
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                                Durum
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                                Geçerlilik
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                                Kullanım
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                                İşlemler
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {promoCodes.map((promo) => (
                            <tr key={promo.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-red/10 flex items-center justify-center mr-3">
                                            <Tag size={14} className="text-red" />
                                        </div>
                                        <span className="text-sm font-semibold text-darkgray font-Barlow">{promo.code}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray font-Barlow">
                                        {promo.discountType === "PERCENTAGE" ? (
                                            <span className="font-medium">%{promo.discountValue}</span>
                                        ) : (
                                            <span className="font-medium">{formatPrice(promo.discountValue)}</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {promo.minOrderAmount ? `Min: ${formatPrice(promo.minOrderAmount)}` : "Alt limit yok"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge variant={promo.active ? "success" : "secondary"}>
                                        {promo.active ? "Aktif" : "Pasif"}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray font-Barlow">
                                        {promo.validUntil ? formatDate(promo.validUntil) : "Süresiz"}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {promo.validFrom ? `Başlangıç: ${formatDate(promo.validFrom)}` : ""}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray font-Barlow">
                                    {promo.usageLimit ? `${promo.usageCount || 0} / ${promo.usageLimit}` : `${promo.usageCount || 0} (Limitsiz)`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => onEdit(promo)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(promo)}
                                        className="text-red hover:text-red-900"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
