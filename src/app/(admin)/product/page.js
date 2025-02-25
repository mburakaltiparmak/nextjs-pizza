"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { 
  fetchProducts, 
  fetchCategories, 
  setLoading,
  setError
} from "@/lib/store/actions/productActionsFromApi";
import { instance } from "@/lib/hooks";
import { 
  postNewProduct
} from "@/lib/store/actions/productActionsFromApi";
import { 
  Plus,
  Edit,
  Trash2,
  Package,
  Image
} from 'lucide-react';

// Components
import AdminLayout from "@/components/admin/adminLayout";
import { ConfirmationModal, FormButtons, Modal } from "@/components/admin/modal";
import { SearchBar, CategoryFilter, SearchFilterContainer } from "@/components/admin/searchAndFilter";
import ImageUpload from "@/components/admin/imageUpload";
import RatingStars from "@/components/admin/ratingStars";

const Page = () => {
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
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    stock: 0,
    rating: 0,
    categoryId: "",
    image: null,
    preview: null
  });
  
  // Redux state
  const products = useAppSelector((state) => state.productAPI.products || []);
  const categories = useAppSelector((state) => state.productAPI.categories || []);
  const loading = useAppSelector((state) => state.productAPI.loading);
  const error = useAppSelector((state) => state.productAPI.error);

  useEffect(() => {    
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setNewProduct({
        name: product.name,
        price: product.price,
        stock: product.stock,
        rating: product.rating,
        categoryId: product.categoryId || "",
        image: null,
        preview: product.img
      });
    } else {
      setEditingProduct(null);
      setNewProduct({
        name: "",
        price: 0,
        stock: 0,
        rating: 0,
        categoryId: "",
        image: null,
        preview: null
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setNewProduct({
      name: "",
      price: 0,
      stock: 0,
      rating: 0,
      categoryId: "",
      image: null,
      preview: null
    });
  };

  const handleImageChange = (imageData) => {
    setNewProduct({
      ...newProduct,
      image: imageData.file,
      preview: imageData.preview
    });
  };

  const handleImageError = (errorMessage) => {
    addNotification(errorMessage, 'error');
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
    setDeleteModalOpen(false);
  };

  const addNotification = (message, type = 'success') => {
    const newNotification = { id: Date.now(), message, type };
    setNotifications(prev => [...prev, newNotification]);
    
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setError(""));
    try {
      const formData = {
        name : product_name,
        rating : product_rating,
        stock : product_stock,
        price : product_price,
        image : product_image,
        categoryId : product_categoryId,
      };
      console.log("formData : \n",formData);
    }
    catch (err){
      console.error("error occured while posting products data",err);
      dispatch(setError("error occured while posting products data"));
    }
    finally {
      dispatch(setLoading(false));
    }

  }

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "" || product.categoryId.toString() === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, filterCategory]);

  // Get category name
  const getCategoryName = (categoryId) => {
    if (!categories || !Array.isArray(categories)) return "Bilinmeyen Kategori";
    
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Bilinmeyen Kategori";
  };

  return (
    <AdminLayout 
      title="Ürünler"
      activePage="product"
      loading={loading}
      error={error}
      notifications={notifications}
      onNotificationClose={removeNotification}
      showAddButton={true}
      addButtonText="Yeni Ürün"
      onAddButtonClick={() => openModal()}
    >
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ürün
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiyat
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stok
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puan
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <div className="text-sm text-gray-900">{product.price.toFixed(2)} ₺</div>
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
        title={editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
        footer={
          <FormButtons
            onCancel={closeModal}
            isSubmitting={formSubmitting}
            submitText={editingProduct ? 'Güncelle' : 'Kaydet'}
          />
        }
      >
        <form onSubmit={handleSubmit} >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ürün Adı
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent"
              value={product_name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent"
              value={product_categoryId}
              onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}
              required
            >
              <option value="">Kategori Seçin</option>
              {Array.isArray(categories) && categories.map(category => (
                <option key={category.id} value={category.id.toString()}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fiyat (₺)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stok
              </label>
              <input
                type="number"
                min="0"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Puan (0-5)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent"
              value={newProduct.rating}
              onChange={(e) => setNewProduct({...newProduct, rating: parseFloat(e.target.value)})}
              required
            />
            <div className="mt-1">
              <RatingStars rating={newProduct.rating} />
            </div>
          </div>

          <ImageUpload
            preview={newProduct.preview}
            onChange={handleImageChange}
            onError={handleImageError}
            label="Ürün Resmi"
            height="h-48"
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={""}
        title="Ürünü Sil"
        message={`${productToDelete?.name} ürününü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
      />
    </AdminLayout>
  );
};

export default Page;