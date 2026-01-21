import Image from "next/image";
import { Edit, Trash2, Package, Plus } from "lucide-react";
import RatingStars from "@/components/admin/ratingStars";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";

export const ProductsTable = ({
    products,
    categories,
    onEdit,
    onDelete,
    onAddNew,
    loading,
}) => {

    const getCategoryName = (categoryId) => {
        if (!categoryId) return "Bilinmeyen Kategori";

        const categoryIdStr = categoryId.toString();

        if (!categories || !Array.isArray(categories) || categories.length === 0) {
            return "Kategoriler yükleniyor...";
        }

        const foundCategory = categories.find(
            (cat) => cat.id && cat.id.toString() === categoryIdStr
        );
        return foundCategory ? foundCategory.name : "Bilinmeyen Kategori";
    };

    if (loading) {
        return <TableSkeleton rowCount={10} columnCount={6} />;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow"
                            >
                                Ürün
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow"
                            >
                                Kategori
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow"
                            >
                                Fiyat
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow"
                            >
                                Stok
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow"
                            >
                                Puan
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow"
                            >
                                İşlemler
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products && products.length > 0 ? (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                {product.img ? (
                                                    <Image
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        src={product.img}
                                                        alt={product.name}
                                                        width={40}
                                                        height={40}
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <Package size={16} className="text-gray-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-darkgray font-Barlow">
                                                    {product.name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray font-Barlow">
                                            {getCategoryName(product.categoryId)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-darkgray font-Barlow">
                                            {product.price.toFixed(2)} ₺
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-darkgray font-Barlow">
                                            {product.stock}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <RatingStars rating={product.rating} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => onEdit(product)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(product)}
                                            className="text-red hover:text-red-900"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="px-6 py-4 text-center text-gray"
                                >
                                    <div className="py-10">
                                        <p className="text-gray font-Barlow">Ürün bulunamadı</p>
                                        <button
                                            onClick={onAddNew}
                                            className="mt-4 px-4 py-2 bg-red text-lightgray rounded-lg hover:bg-yellow hover:text-red transition-colors inline-flex items-center font-Barlow"
                                        >
                                            <Plus size={16} className="mr-2" />
                                            <span>Yeni Ürün Ekle</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
