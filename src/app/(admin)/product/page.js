"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/store/actions/productActions";
import { fetchCategories } from "@/lib/store/actions/categoryActions";
import { fetchStates } from "@/lib/store/constants";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Components
import { ConfirmationModal, Modal } from "@/components/admin/modal";
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
import SecondaryLoading from "@/components/secondaryLoading";

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
  image: z.any().optional(),
  preview: z.any().optional(),
});

const ProductPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [dataFetchAttempted, setDataFetchAttempted] = useState(false);

  // Redux state
  const products = useSelector((state) => state.product.products || []);
  const category = useSelector((state) => state.category.categories || []);
  const loading = useSelector((state) => state.global.loading);
  const error = useSelector((state) => state.global.error);
  const success = useSelector((state) => state.global.success);
  const productFetchState = useSelector((state) => state.product.fetchState);
  const categoryFetchState = useSelector((state) => state.category.fetchState);
  const token = useSelector((state) => state.user.token);

  // İki yükleme durumunu tek bir değişkende birleştir
  const isLoading = productFetchState === fetchStates.FETCHING || 
                   categoryFetchState === fetchStates.FETCHING;

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

  // Load initial data
  useEffect(() => {
    if ((productFetchState === fetchStates.NOT_FETCHED || !products || products.length === 0) && !dataFetchAttempted) {
      setDataFetchAttempted(true);
      
     dispatch(fetchCategories());
     dispatch(fetchProducts());
      
    }
  }, [dispatch, productFetchState, products, dataFetchAttempted]);

  // Debugging - store verisini kontrol et
  /*
  useEffect(() => {
    console.log("Products Redux State:", products);
    console.log("Categories Redux State:", category);
    console.log("Product Fetch State:", productFetchState);
    console.log("Category Fetch State:", categoryFetchState);
  }, [products, category, productFetchState, categoryFetchState]);
*/
  // Add openModal function to DOM element
  useEffect(() => {
    if (typeof document !== "undefined") {
      const pageElement = document.getElementById("admin-page-component");
      if (pageElement) {
        pageElement.openModal = openModal;
      }
    }
  }, []);

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      form.reset({
        name: product.name,
        price: product.price,
        stock: product.stock,
        rating: product.rating,
        categoryId: product.categoryId ? product.categoryId.toString() : "",
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

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
    setDeleteModalOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      // Form validation is handled by zod resolver

      // Prepare product data
      const productData = {
        name: data.name,
        rating: data.rating,
        stock: data.stock,
        price: data.price,
        categoryId: data.categoryId,
        image: data.image,
      };

      let result;

      // If editing product
      if (editingProduct) {
        result = await dispatch(
          updateProduct(editingProduct.id, productData, token)
        );
        if (!result.error) {
          closeModal();
        }
      } else {
        // Creating new product
        result = await dispatch(createProduct(productData, token));
        if (!result.error) {
          closeModal();
        }
      }
    } catch (err) {
      console.error("Ürün işlemi sırasında hata:", err);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const result = await dispatch(deleteProduct(productToDelete.id, token));

      if (!result.error) {
        closeDeleteModal();
      }
    } catch (err) {
      console.error("Ürün silme işlemi sırasında hata:", err);
    }
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    console.log("filteredProducts çağrıldı, products:", products);
    
    if (!products || !Array.isArray(products)) {
      console.log("products array değil veya boş");
      return [];
    }

    return products.filter((product) => {
      // Ensure product has a name property and it's a string
      if (!product || !product.name || typeof product.name !== "string") {
        console.log("Geçersiz ürün:", product);
        return false;
      }

      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      let matchesCategory = true;
      
      // categoryId kontrolü güvenli hale getirildi
      if (filterCategory !== "") {
        matchesCategory = product.categoryId && product.categoryId.toString() === filterCategory;
      }

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, filterCategory]);

  // Get category name
  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Bilinmeyen Kategori";
    
    // String'e dönüştürelim
    const categoryIdStr = categoryId.toString();
    
    // Kategoriler yüklendi mi kontrol edelim
    if (!category || !Array.isArray(category) || category.length === 0) {
      return "Kategoriler yükleniyor...";
    }

    const foundCategory = category.find(
      (cat) => cat.id && cat.id.toString() === categoryIdStr
    );
    return foundCategory ? foundCategory.name : "Bilinmeyen Kategori";
  };

  // Admin layout için props tanımlama
  ProductPage.props = {
    title: "Ürünler",
    activePage: "product",
    showAddButton: true,
    addButtonText: "Yeni Ürün",
    onAddButtonClick: () => {
      if (window.openAdminModal) {
        window.openAdminModal();
      } else {
        openModal(); // Fallback olarak kendi modalımızı açalım
      }
    },
  };

  // Ana return ifadesi - Hook kullanım kurallarına uygun JSX koşullu render
  return (
    <>
      {isLoading ? (
        <SecondaryLoading size="fullPage" />
      ) : (
        <div>
          {/* Search and Filter */}
          <SearchFilterContainer>
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ürün ara..."
            />
            <CategoryFilter
              category={category}
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
                  {filteredProducts && filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
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
                              <div className="text-sm font-medium text-darkgray font-Quattrocento_Sans">
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray">
                        {productFetchState === fetchStates.FETCHED ? "Ürün bulunamadı" : "Ürünler yükleniyor..."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && !isLoading && (
              <div className="py-10 text-center">
                <p className="text-gray font-Barlow">Ürün bulunamadı</p>
                <button
                  onClick={() => openModal()}
                  className="mt-4 px-4 py-2 bg-red text-lightgray rounded-lg hover:bg-yellow hover:text-red transition-colors inline-flex items-center font-Barlow"
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
                  className="border-gray text-lightgray hover:bg-gray hover:text-lightgray font-Barlow"
                  onClick={closeModal}
                  disabled={loading}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  className="bg-red text-lightgray hover:text-red hover:bg-yellow font-Barlow"
                  disabled={loading}
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {loading
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
                      <FormLabel className="flex flex-row items-center font-Quattrocento_Sans">
                        <p className="text-darkgray">Ürün Adı</p>
                        <p className="text-red pl-1">*</p>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full p-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent font-Barlow"
                          placeholder="Ürün adını girin"
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-semibold text-red" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex flex-row items-center font-Quattrocento_Sans">
                        <p className="text-darkgray">Kategori</p>
                        <p className="text-red pl-1">*</p>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="font-Barlow">
                            <SelectValue placeholder="Kategori Seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(category) &&
                            category.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id.toString()}
                                className="font-Barlow"
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs font-semibold text-red" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex flex-row items-center font-Quattrocento_Sans">
                          <p className="text-darkgray">Fiyat (₺)</p>
                          <p className="text-red pl-1">*</p>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            className="w-full p-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent font-Barlow"
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-semibold text-red" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex flex-row items-center font-Quattrocento_Sans">
                          <p className="text-darkgray">Stok</p>
                          <p className="text-red pl-1">*</p>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            className="w-full p-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent font-Barlow"
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-semibold text-red" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex flex-row items-center font-Quattrocento_Sans">
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
                          className="w-full p-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent font-Barlow"
                        />
                      </FormControl>
                      <div className="py-2">
                        <RatingStars rating={field.value} />
                      </div>
                      <FormMessage className="text-xs font-semibold text-red" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="flex flex-row items-center font-Quattrocento_Sans">
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
                      <FormMessage className="text-xs font-semibold text-red" />
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
        </div>
      )}
    </>
  );
};

export default ProductPage;