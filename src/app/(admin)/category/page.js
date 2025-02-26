"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchCategoriesWithProducts,
  postNewCategory,
} from "@/lib/store/actions/productActionsFromApi";
import { instance } from "@/lib/hooks";
import { Image, Search } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Components
import AdminLayout from "@/components/admin/adminLayout";
import {
  ConfirmationModal,
  FormButtons,
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

//Form validation schema
const formSchema = z.object({
  name: z.string().min(3, "Kategori adı en az 3 karakter olmalıdır."),
  image: z.any().optional(),
  preview: z.any().optional(),
});

const CategoryPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Redux durumunu alalım
  const categories = useAppSelector((state) => state.productAPI.categories);
  const loading = useAppSelector((state) => state.productAPI.loading);
  const error = useAppSelector((state) => state.productAPI.error);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      image: null,
      preview: null,
    },
  });

  useEffect(() => {
    dispatch(fetchCategoriesWithProducts());
  }, [dispatch]);

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
    console.log("ImageUpload'dan gelen veri:", imageData);

    if (imageData && imageData.file) {
      console.log("Dosya adı:", imageData.file.name);
      console.log("Dosya tipi:", imageData.file.type);
      console.log("Dosya boyutu:", imageData.file.size, "bytes");

      form.setValue("image", imageData.file);
      form.setValue("preview", imageData.preview);

      // Doğru şekilde set edildi mi kontrol et
      const currentImage = form.getValues("image");
      console.log(
        "Form'a set edilen image:",
        currentImage ? currentImage.name : "null"
      );
    } else {
      console.warn("ImageUpload geçerli bir dosya döndürmedi");
    }
  };

  const handleImageError = (errorMessage) => {
    addNotification(errorMessage, "error");
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setCategoryToDelete(null);
    setDeleteModalOpen(false);
  };

  const addNotification = (message, type = "success") => {
    const newNotification = { id: Date.now(), message, type };
    setNotifications((prev) => [...prev, newNotification]);

    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const onSubmit = async (data) => {
    setFormSubmitting(true);

    try {
      console.log("Form submit verileri:", data);

      // Image kontrolü
      if (!data.image) {
        console.warn("Resim seçilmedi. Devam edilsin mi?");
        // İsteğe bağlı: Resim zorunlu ise burada hata mesajı gösterebilirsiniz
      }

      const categoryData = {
        name: data.name,
        image: data.image,
      };

      console.log("API'ye gönderilecek veriler:", categoryData);

      let result;

      if (editingCategory) {
        // Kategori güncelleme
        // Kodunuzu buraya ekleyin
      } else {
        // Yeni kategori ekleme
        result = await dispatch(postNewCategory(categoryData));
        if (result) {
          addNotification(`"${data.name}" başarıyla eklendi`);
        } else {
          addNotification("Kategori eklenemedi", "error");
        }
      }
      closeModal();
    } catch (err) {
      console.error("API hatası:", err);
      addNotification(
        `İşlem sırasında bir hata oluştu: ${err.message || "Beklenmeyen hata"}`,
        "error"
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await instance.delete(`/category/${categoryToDelete.id}`);
      addNotification("Kategori başarıyla silindi");

      // Redux store'u güncelle
      dispatch(fetchCategoriesWithProducts());

      closeDeleteModal();
    } catch (error) {
      console.error("Silme hatası:", error);
      addNotification(
        error.response?.data?.message || "Kategori silinirken bir hata oluştu",
        "error"
      );
    }
  };

  // Kategorileri filtrele
  const filteredCategories = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];

    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  return (
    <AdminLayout
      title="Kategoriler"
      activePage="category"
      loading={loading}
      error={error}
      notifications={notifications}
      onNotificationClose={removeNotification}
      showAddButton={true}
      addButtonText="Yeni Kategori"
      onAddButtonClick={() => openModal()}
    >
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
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group"
          >
            <div className="relative h-48 overflow-hidden bg-gray-100">
              {category.img ? (
                <img
                  src={category.img}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
              <h3 className="font-medium text-gray-800 text-lg">
                {category.name}
              </h3>
              {category.products && (
                <p className="text-sm text-gray-500 mt-1">
                  {category.products.length} ürün
                </p>
              )}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && !loading && (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">Herhangi bir kategori bulunamadı.</p>
            <button
              onClick={() => openModal()}
              className="mt-4 px-4 py-2 bg-red text-white rounded-lg hover:bg-red-700 transition-colors"
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
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={formSubmitting}
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="bg-red text-white hover:bg-red-700"
              disabled={formSubmitting}
              onClick={form.handleSubmit(onSubmit)}
            >
              {formSubmitting
                ? "İşleniyor..."
                : editingCategory
                ? "Güncelle"
                : "Kaydet"}
            </Button>
          </div>
        }
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex flex-row items-center">
                    <p className="text-darkgray">Kategori Adı</p>
                    <p className="text-red pl-1">*</p>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent"
                      placeholder="Kategori adını girin"
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-semibold text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem className="py-4">
                  <FormLabel className="flex flex-row items-center">
                    <p className="text-darkgray">Kategori Logo</p>
                    <p className="text-red pl-1">*</p>
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      preview={form.getValues("preview")}
                      onChange={handleImageChange}
                      onError={handleImageError}
                      label="Kategori Logo"
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-semibold text-red-500" />
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
    </AdminLayout>
  );
};

export default CategoryPage;
