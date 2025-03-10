"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteCategory,
  fetchCategories,
  createCategory,
  updateCategory
} from "@/lib/store/actions/categoryActions";
import { setSuccess } from "@/lib/store/actions/globalActions";
import { fetchStates } from "@/lib/store/constants";
import { useToast } from "@/hooks/use-toast";
import { Image } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Components
import {
  ConfirmationModal,
  Modal,
} from "@/components/admin/modal";
import { SearchBar } from "@/components/admin/searchAndFilter";
import ImageUpload from "@/components/admin/imageUpload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SecondaryLoading from "@/components/secondaryLoading";

//Form validation schema
const formSchema = z.object({
  name: z.string().min(3, "Kategori adı en az 3 karakter olmalıdır."),
  image: z.any().optional(),
  preview: z.any().optional(),
});

const CategoryPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [dataFetchAttempted, setDataFetchAttempted] = useState(false);
  
  // Redux state
  const categories = useSelector((state) => state.category.categories);
  const categoryFetchState = useSelector((state) => state.category.fetchState);
  const loading = useSelector((state) => state.global.loading);
  const error = useSelector((state) => state.global.error);
  const success = useSelector((state) => state.global.success);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      image: null,
      preview: null,
    },
  });

  // Kategorileri yükle
  useEffect(() => {
    if (categoryFetchState === fetchStates.NOT_FETCHED && !dataFetchAttempted) {
      setDataFetchAttempted(true);
      dispatch(fetchCategories());
    }
  }, [dispatch, categoryFetchState, dataFetchAttempted]);

  // Toast mesajları için
  useEffect(() => {
    if (error) {
      toast({
        title: "Hata",
        description: error,
        variant: "destructive",
      });
    }
    
    if (success) {
      toast({
        title: "Başarılı",
        description: success,
      });
    }
  }, [error, success, toast]);

  // Add openModal function to DOM element (for external access)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const pageElement = document.getElementById('admin-page-component');
      if (pageElement) {
        pageElement.openModal = openModal;
      }
    }
  }, []);

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      form.reset({
        name: category.name,
        image: null,
        preview: category.img,
      });
    } else {
      setEditingCategory(null);
      form.reset({
        name: "",
        image: null,
        preview: null,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    form.reset({
      name: "",
      image: null,
      preview: null,
    });
  };

  const handleImageChange = (imageData) => {
    if (imageData && imageData.file) {
      form.setValue("image", imageData.file);
      form.setValue("preview", imageData.preview);
    }
  };

  const handleImageError = (errorMessage) => {
    toast({
      title: "Hata",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setCategoryToDelete(null);
    setDeleteModalOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      const categoryData = {
        name: data.name,
        image: data.image
      };

      let result;

      if (editingCategory) {
        // Kategori güncelleme
        result = await dispatch(updateCategory(editingCategory.id, categoryData));
        if (!result.error) {
          dispatch(setSuccess(`"${data.name}" kategorisi başarıyla güncellendi`));
          closeModal();
        }
      } else {
        // Yeni kategori ekleme
        result = await dispatch(createCategory(categoryData));
        if (!result.error) {
          dispatch(setSuccess(`"${data.name}" kategorisi başarıyla oluşturuldu`));
          closeModal();
        }
      }
    } catch (err) {
      console.error("Kategori işlemi sırasında hata:", err);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
  
    try {
      // Check if category has products before deletion
      if (categoryToDelete.products && categoryToDelete.products.length > 0) {
        if (!window.confirm(`Bu kategori ${categoryToDelete.products.length} ürün içeriyor. Silmek istediğinize emin misiniz?`)) {
          return;
        }
      }
      
      const result = await dispatch(deleteCategory(categoryToDelete.id));
      
      if (!result.error) {
        dispatch(setSuccess(`"${categoryToDelete.name}" kategorisi başarıyla silindi`));
        closeDeleteModal();
      }
    } catch (err) {
      console.error("Kategori silme işlemi sırasında hata:", err);
    }
  };

  // Kategorileri filtrele
  // Kategorileri filtrele
const filteredCategories = useMemo(() => {
  if (!categories || !Array.isArray(categories)) return [];

  return categories.filter((category) => {
    // Kategori adı yoksa veya geçersizse filtreleme işleminden geçirme
    if (!category || !category.name || typeof category.name !== 'string') {
      return false;
    }
    return category.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
}, [categories, searchTerm]);

  // Admin layout için props tanımlama
  CategoryPage.props = {
    title: "Kategoriler",
    activePage: "category",
    showAddButton: true,
    addButtonText: "Yeni Kategori",
    onAddButtonClick: () => {
      if (window.openAdminModal) {
        window.openAdminModal();
      } else {
        openModal(); // Fallback olarak kendi modalımızı açalım
      }
    }
  };

  // Yükleniyor durumu
  if (categoryFetchState === fetchStates.FETCHING) {
    return <SecondaryLoading size="fullPage" />;
  }

  return (
    <div>
      {/* Arama ve Filtreleme */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center border border-gray-100">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Kategori ara..."
        />
      </div>

      {/* Kategori Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl shadow-sm border-2 border-lightgray overflow-hidden group"
          >
            <div className="relative flex items-center justify-center h-36 overflow-hidden bg-gray-100">
              {category.img ? (
                <img
                  src={category.img}
                  alt={category.name}
                  className="w-16 object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Image size={48} className="text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(category)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-600"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => openDeleteModal(category)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-red"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-darkgray text-lg font-Quattrocento_Sans">
                {category.name}
              </h3>
              {category.products && (
                <p className="text-sm text-gray mt-1 font-Barlow">
                  {category.products.length} ürün
                </p>
              )}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && categoryFetchState !== fetchStates.FETCHING && (
          <div className="col-span-full text-center py-10">
            <p className="text-gray font-Barlow">Herhangi bir kategori bulunamadı.</p>
            <button
              onClick={() => openModal()}
              className="mt-4 px-4 py-2 bg-red text-lightgray rounded-lg hover:bg-yellow hover:text-red transition-colors font-Barlow"
            >
              Yeni Kategori Ekle
            </button>
          </div>
        )}
      </div>

      {/* Kategori Ekleme/Düzenleme Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingCategory ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
        footer={
          <div className="flex flex-row items-center justify-between space-x-2 p-4">
            <Button
              type="button"
              className="border-gray text-darkgray hover:bg-gray hover:text-lightgray font-Barlow"
              onClick={closeModal}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="bg-red text-lightgray hover:bg-yellow hover:text-red font-Barlow"
              disabled={loading}
              onClick={form.handleSubmit(onSubmit)}
            >
              {loading
                ? "İşleniyor..."
                : editingCategory
                ? "Güncelle"
                : "Kaydet"}
            </Button>
          </div>
        }
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex flex-row items-center font-Quattrocento_Sans">
                    <p className="text-darkgray">Kategori Adı</p>
                    <p className="text-red pl-1">*</p>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full p-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent font-Barlow"
                      placeholder="Kategori adını girin"
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-semibold text-red" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem className="">
                  <FormLabel className="flex flex-row items-center font-Quattrocento_Sans">
                    <p className="text-darkgray">Kategori Logo</p>
                    <p className="text-red pl-1">*</p>
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      preview={form.getValues("preview")}
                      onChange={handleImageChange}
                      onError={handleImageError}
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-semibold text-red" />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </Modal>

      {/* Silme Onay Modalı */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Kategoriyi Sil"
        message={`${categoryToDelete?.name} kategorisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        warning={
          categoryToDelete?.products?.length > 0
            ? `Bu kategori ${categoryToDelete.products.length} ürün içeriyor. Kategoriyi silmek bu ürünleri de etkileyebilir.`
            : null
        }
      />
    </div>
  );
};

export default CategoryPage;