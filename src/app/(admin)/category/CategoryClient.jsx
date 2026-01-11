"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useAdminModal } from "@/lib/contexts/AdminLayoutContext"; // Updated to use useAdminModal if separate or stick to Layout context
import { useAdminLayout } from "@/lib/contexts/AdminLayoutContext"; // Updated path
import { deleteCategory } from "@/lib/store/actions/categoryActions";
import { fetchDashboard, clearDashboardCache } from "@/lib/store/actions/adminActions";
import { setSuccess } from "@/lib/store/actions/globalActions";
import { fetchStates } from "@/lib/store/constants";

// Components
import { ConfirmationModal } from "@/components/admin/AdminModals"; // Updated path
import { SearchBar } from "@/components/admin/AdminSearchFilter"; // Updated path
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"; // Updated Spinner
import { CategoryTableRow } from "@/components/admin/category/CategoryTableRow";
import { CategoryFormModal } from "@/components/admin/category/CategoryFormModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";

const CategoryClient = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { registerModal } = useAdminLayout();

    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [dataFetchAttempted, setDataFetchAttempted] = useState(false);

    // Redux state - dashboard data'dan kategorileri çek
    const dashboardData = useAppSelector((state) => state.admin.dashboardData);
    const adminFetchState = useAppSelector((state) => state.admin.fetchState);

    // Dashboard data'dan categories array'ini al
    const categories = dashboardData?.categories || [];

    // Dashboard verisi yükle
    useEffect(() => {
        if (adminFetchState === fetchStates.NOT_FETCHED && !dataFetchAttempted) {
            setDataFetchAttempted(true);
            dispatch(fetchDashboard());
        }
    }, [dispatch, adminFetchState, dataFetchAttempted]);

    const openModal = useCallback((category = null) => {
        setEditingCategory(category);
        setModalOpen(true);
    }, []);

    // Register modal with AdminLayoutContext
    useEffect(() => {
        registerModal(openModal);
    }, [registerModal, openModal]);

    const closeModal = () => {
        setModalOpen(false);
        setEditingCategory(null);
        // Modal kapatıldıktan sonra verileri yenile
        dispatch(fetchDashboard(true)); // force refresh
    };

    const openDeleteModal = (category) => {
        setCategoryToDelete(category);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setCategoryToDelete(null);
        setDeleteModalOpen(false);
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        try {
            const result = await dispatch(deleteCategory(categoryToDelete.id));

            if (!result.error) {
                dispatch(
                    setSuccess(`"${categoryToDelete.name}" kategorisi başarıyla silindi`)
                );
                // Cache'i temizle ve dashboard'u yenile
                clearDashboardCache();
                dispatch(fetchDashboard(true));
                closeDeleteModal();
            }
        } catch (err) {
            console.error("Kategori silme işlemi sırasında hata:", err);
        }
    };

    // Kategorileri filtrele
    const filteredCategories = useMemo(() => {
        if (!categories || !Array.isArray(categories)) return [];

        return categories.filter((category) => {
            if (!category || !category.name || typeof category.name !== "string") {
                return false;
            }
            return category.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [categories, searchTerm]);

    // Yükleniyor durumu
    if (adminFetchState === fetchStates.FETCHING) {
        return <LoadingSpinner size="fullPage" />;
    }

    return (
        <div>
            {/* Arama */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center border border-lightgray">
                <SearchBar
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Kategori ara..."
                />
            </div>

            {/* Tablo */}
            <div className="bg-white rounded-xl shadow-sm border border-lightgray overflow-hidden">
                <table className="w-full">
                    <thead className="bg-lightgray/50">
                        <tr className="border-b border-lightgray2">
                            <th className="px-6 py-4 text-left text-sm font-bold text-darkgray font-Barlow">
                                Kategori Adı
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-darkgray font-Barlow">
                                Ürün Sayısı
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-darkgray font-Barlow">
                                İşlemler
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => (
                                <CategoryTableRow
                                    key={category.id}
                                    category={category}
                                    onEdit={() => openModal(category)}
                                    onDelete={() => openDeleteModal(category)}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center">
                                    <p className="text-gray font-Barlow mb-4">
                                        Herhangi bir kategori bulunamadı.
                                    </p>
                                    <button
                                        onClick={() => openModal()}
                                        className="px-4 py-2 bg-red text-lightgray rounded-lg hover:bg-yellow hover:text-red transition-colors font-Barlow"
                                    >
                                        Yeni Kategori Ekle
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Kategori Ekleme/Düzenleme Modal */}
            <CategoryFormModal
                open={modalOpen}
                onClose={closeModal}
                editingCategory={editingCategory}
            />

            {/* Silme Onay Modalı */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                title="Kategoriyi Sil"
                message={`${categoryToDelete?.name} kategorisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
                warning={
                    categoryToDelete?.productCount > 0
                        ? `Bu kategori ${categoryToDelete.productCount} ürün içeriyor. Kategoriyi silmek bu ürünleri de etkileyebilir.`
                        : null
                }
            />
        </div>
    );
};

export default CategoryClient;
