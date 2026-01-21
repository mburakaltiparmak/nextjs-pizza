import { CategoryTableRow } from "./CategoryTableRow";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";

export const CategoryTable = ({
    categories,
    onEdit,
    onDelete,
    onAddNew,
    loading
}) => {
    if (loading) {
        return <TableSkeleton columnCount={3} />;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-lightgray overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                    <thead className="bg-lightgray/50">
                        <tr className="border-b border-lightgray2">
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-darkgray font-Barlow">
                                Kategori Adı
                            </th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-darkgray font-Barlow">
                                Ürün Sayısı
                            </th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-bold text-darkgray font-Barlow">
                                İşlemler
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories && categories.length > 0 ? (
                            categories.map((category) => (
                                <CategoryTableRow
                                    key={category.id}
                                    category={category}
                                    onEdit={() => onEdit(category)}
                                    onDelete={() => onDelete(category)}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-4 sm:px-6 py-12 text-center">
                                    <p className="text-gray font-Barlow mb-4">
                                        Herhangi bir kategori bulunamadı.
                                    </p>
                                    <button
                                        onClick={() => onAddNew()}
                                        className="px-4 py-2 bg-red text-lightgray rounded-lg hover:bg-yellow hover:text-red transition-colors font-Barlow text-sm sm:text-base"
                                    >
                                        Yeni Kategori Ekle
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
