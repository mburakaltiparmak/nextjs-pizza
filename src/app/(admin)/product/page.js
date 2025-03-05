"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchProducts,
  fetchCategories,
  setLoading,
  setError,
  postNewProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/store/actions/productActionsFromApi";
import { Plus, Edit, Trash2, Package, Image } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Components
import {
  ConfirmationModal,
  FormButtons,
  Modal,
} from "@/components/admin/modal";
import {
  SearchBar,
  CategoryFilter,
  SearchFilterContainer,
} from "@/components/admin/searchAndFilter";
import ImageUpload from "@/components/admin/imageUpload";
import RatingStars from "@/components/admin/ratingStars";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, "Ürün adı en az 3 karakter olmalıdır."),
  categoryId: z.string().min(1, "Kategori seçmelisiniz."),
  price: z.coerce.number().positive("Fiyat pozitif bir değer olmalıdır."),
  stock: z.coerce.number().int().nonnegative("Stok negatif olamaz."),
  rating: z.coerce
    .number()
    .min(0, "En düşük puan 0 olabilir.")
    .max(5, "En yüksek puan 5 olabilir."),
  image: z.any(),
  preview: z.any(),
});

const ProductPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");

  const [filterCategory, setFilterCategory] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Redux state
  const products = useAppSelector((state) => state.productAPI.products || []);
  const categories = useAppSelector(
    (state) => state.productAPI.categories || []
  );
  const loading = useAppSelector((state) => state.productAPI.loading);
  const error = useAppSelector((state) => state.productAPI.error);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      price: 0,
      stock: 0,
      rating: 0,
      image: null,
      preview: null,
    },
  });

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      form.reset({
        name: product.name,
        price: product.price,
        stock: product.stock,
        rating: product.rating,
        categoryId: product.categoryId.toString(),
        image: null,
        preview: product.img,
      });
    } else {
      setEditingProduct(null);
      form.reset({
        name: "",
        categoryId: "",
        price: 0,
        stock: 0,
        rating: 0,
        image: null,
        preview: null,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    form.reset();
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleImageChange = (imageData) => {
    form.setValue("image", imageData.file);
    form.setValue("preview", imageData.preview);
  };

  const handleImageError = (errorMessage) => {
    toast.error(errorMessage);
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
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
      // Ürün verilerini hazırla
      const productData = {
        name: data.name,
        rating: data.rating,
        stock: data.stock,
        price: data.price,
        categoryId: data.categoryId,
        image: data.image,
      };

      let result;

      // Eğer düzenleme modundaysak
      if (editingProduct) {
        productData.id = editingProduct.id;
        result = await dispatch(updateProduct(productData));
        if (result) {
          addNotification(`"${data.name}" başarıyla güncellendi`);
        }
      } else {
        // Yeni ürün ekleme
        result = await dispatch(postNewProduct(productData));
        if (result) {
          addNotification(`"${data.name}" başarıyla eklendi`);
        }
      }

      closeModal();
    } catch (err) {
      console.error("API hatası", err);
      addNotification(
        `İşlem sırasında bir hata oluştu: ${err.message || "Beklenmeyen hata"}`,
        "error"
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const success = await dispatch(deleteProduct(productToDelete.id));
      if (success) {
        addNotification(`"${productToDelete.name}" başarıyla silindi`);
      }
    } catch (err) {
      addNotification(
        `Silme işlemi sırasında bir hata oluştu: ${
          err.message || "Beklenmeyen hata"
        }`,
        "error"
      );
    } finally {
      closeDeleteModal();
    }
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "" ||
        product.categoryId.toString() === filterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, filterCategory]);

  // Get category name
  const getCategoryName = (categoryId) => {
    if (!categories || !Array.isArray(categories)) return "Bilinmeyen Kategori";

    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Bilinmeyen Kategori";
  };
  ProductPage.openModal = openModal;

// Doğru şekilde handleModalOpen fonksiyonunu tanımlayalım
const handleModalOpen = () => {
  console.log("Modal açılıyor...");
  openModal();
};

// Props tanımını güncelleyelim, onAddButtonClick doğru fonksiyonu çağırmalı
useEffect(() => {
  // Sayfa yüklendiğinde, component DOM elemanına openModal fonksiyonunu ekleyelim
  if (typeof document !== 'undefined') {
    const pageElement = document.getElementById('admin-page-component');
    if (pageElement) {
      pageElement.openModal = openModal;
    }
  }
}, []);

// Admin layout için props tanımlama - BU ÖNEMLİ (mevcut kodu değiştirin)
ProductPage.props = {
  title: "Ürünler", 
  activePage: "product",
  loading: loading,
  error: error,
  showAddButton: true,
  addButtonText: "Yeni Ürün",
  onAddButtonClick: () => {
    if (window.openAdminModal) {
      window.openAdminModal();
    } else {
      console.log("openAdminModal fonksiyonu bulunamadı");
    }
  }
};

  return (
    <div>
      {/* Search and Filter */}
      <SearchFilterContainer>
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Ürün ara..."
        />
        <CategoryFilter
          categories={categories}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        />
      </SearchFilterContainer>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ürün
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Kategori
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fiyat
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Stok
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Puan
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {product.img ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={product.img}
                            alt={product.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Package size={16} className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {getCategoryName(product.categoryId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.price.toFixed(2)} ₺
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.stock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RatingStars rating={product.rating} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openModal(product)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(product)}
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

        {filteredProducts.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-gray-500">Ürün bulunamadı</p>
            <button
              onClick={() => openModal()}
              className="mt-4 px-4 py-2 bg-red text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center"
            >
              <Plus size={16} className="mr-2" />
              <span>Yeni Ürün Ekle</span>
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingProduct ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
        footer={
          <div className="flex flex-row items-center justify-between space-x-2 p-4">
            <Button
              type="button"
              className=""
              onClick={closeModal}
              disabled={formSubmitting}
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="bg-red text-white hover:text-red hover:bg-yellow"
              disabled={formSubmitting}
              onClick={form.handleSubmit(onSubmit)}
            >
              {formSubmitting
                ? "İşleniyor..."
                : editingProduct
                ? "Güncelle"
                : "Kaydet"}
            </Button>
          </div>
        }
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex flex-row items-center">
                    <p className="text-darkgray">Ürün Adı</p>
                    <p className="text-red pl-1">*</p>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent"
                      placeholder="Ürün adını girin"
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-semibold text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex flex-row items-center">
                    <p className="text-darkgray">Kategori</p>
                    <p className="text-red pl-1">*</p>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori Seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.isArray(categories) &&
                        categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs font-semibold text-red-500" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex flex-row items-center">
                      <p className="text-darkgray">Fiyat (₺)</p>
                      <p className="text-red pl-1">*</p>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-semibold text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex flex-row items-center">
                      <p className="text-darkgray">Stok</p>
                      <p className="text-red pl-1">*</p>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-semibold text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex flex-row items-center">
                    <p className="text-darkgray">Puan (0-5)</p>
                    <p className="text-red pl-1">*</p>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      {...field}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent"
                    />
                  </FormControl>
                  <div className="py-2">
                    <RatingStars rating={field.value} />
                  </div>
                  <FormMessage className="text-xs font-semibold text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="flex flex-row items-center">
                    <p className="text-darkgray">Ürün Resmi</p>
                    <p className="text-red pl-1">*</p>
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      preview={form.getValues("preview")}
                      onChange={handleImageChange}
                      onError={handleImageError}
                      label="Ürün Resmi"
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-semibold text-red-500" />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteProduct}
        title="Ürünü Sil"
        message={`${productToDelete?.name} ürününü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
      />
</div>  );
};

export default ProductPage;
