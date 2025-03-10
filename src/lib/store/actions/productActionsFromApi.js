import { instance } from "@/lib/hooks";
import {
  fetchStates,
  productActions,
} from "../reducers/productReducersFromApi";
import { toast } from "react-toastify";
import CustomToastContent from "@/components/ui/customToastContent";
import { setError, setLoading, handleApiError } from "./globalActions";
import { fetchCategoriesWithProducts } from "./categoryActions";

// GET REQUESTS

export const fetchProducts = () => async (dispatch) => {
  dispatch(setFetchState(fetchStates.FETCHING));
  dispatch(setLoading(true));
  dispatch(setError(null)); // Hata varsa temizle

  try {
    const res = await instance.get("/product");
    const data = res.data;
    console.log("product data : \n", data);
    dispatch(setProducts(res.data));
    dispatch(setFetchState(fetchStates.FETCHED));
    dispatch(setLoading(false));
    return data; // Return data for component usage if needed
  } catch (err) {
    handleApiError(err, dispatch, "Products", setFetchState, fetchStates);
    return null;
  }
};

export const fetchProductById = (id) => async (dispatch) => {
  if (!id) return null; // Geçersiz ID kontrolü ekleyelim

  dispatch(setFetchState(fetchStates.FETCHING));
  dispatch(setLoading(true));
  dispatch(setError(null)); // Hata varsa temizle

  try {
    const res = await instance.get(`/product/${id}`);
    // Burada isterseniz özel bir dispatch ekleyebilirsiniz
    dispatch(setFetchState(fetchStates.FETCHED));
    dispatch(setLoading(false));
    return res.data; // Veriyi döndürelim
  } catch (err) {
    handleApiError(err, dispatch, "Products", setFetchState, fetchStates);
    return null;
  }
};

// POST REQUESTS

export const postNewProduct = (formData) => async (dispatch) => {
  const token = localStorage.getItem("token");
  dispatch(setLoading(true));
  dispatch(setError(null));
  dispatch(setFetchState(fetchStates.FETCHING));

  try {
    // Form validasyonu yapılabilir
    if (!formData.name || !formData.categoryId) {
      throw new Error("Ürün adı ve kategori zorunludur");
    }
    
    // FormData nesnesi oluştur
    const formDataObj = new FormData();
    // Form verilerini ekle ve konsola logla
    formDataObj.append("name", formData.name);
    formDataObj.append("rating", formData.rating.toString());
    formDataObj.append("stock", formData.stock.toString());
    formDataObj.append("price", formData.price.toString());
    formDataObj.append("categoryId", formData.categoryId);
    
    if (formData.image) {
      formDataObj.append("image", formData.image);
    }
    
    const res = await instance.post("/product", formDataObj, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Durum güncellemeleri
    dispatch(setFetchState(fetchStates.FETCHED));
    dispatch(setLoading(false));
    
    // Ürün listesini yeniden yükle
    dispatch(fetchProducts());
    
    // Başarılı işlem bildirimi
    toast.success(
      <CustomToastContent
        title={`${res.data.name} başarıyla eklendi`}
        image={res.data.img} 
      />
    );
              
    return res.data;
  } catch (err) {
    handleApiError(err, dispatch, "Product Add", setFetchState, fetchStates);
    return null;
  }
};

// PUT REQUESTS 

export const updateProduct = (formData, id) => async (dispatch) => {
  const token = localStorage.getItem("token");
  dispatch(setLoading(true));
  dispatch(setError(null));
  dispatch(setFetchState(fetchStates.FETCHING));

  try {
    // Form validasyonu yapılabilir
    if (!formData.name || !formData.categoryId) {
      throw new Error("Ürün adı ve kategori zorunludur");
    }
    
    // FormData nesnesi oluştur
    const formDataObj = new FormData();
    // Form verilerini ekle
    formDataObj.append("name", formData.name);
    formDataObj.append("rating", formData.rating.toString());
    formDataObj.append("stock", formData.stock.toString());
    formDataObj.append("price", formData.price.toString());
    formDataObj.append("categoryId", formData.categoryId);
    
    // Eğer yeni bir resim seçildiyse ekle
    if (formData.image) {
      formDataObj.append("image", formData.image);
    }
    
    const res = await instance.put(`/product/${id}`, formDataObj, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Durum güncellemeleri
    dispatch(setFetchState(fetchStates.FETCHED));
    dispatch(setLoading(false));
    
    // Ürün listesini yeniden yükle
    dispatch(fetchProducts());
    
    // Başarılı işlem bildirimi
    toast.success(`"${formData.name}" başarıyla güncellendi`);
    
    return res.data;
  } catch (err) {
    handleApiError(err, dispatch, "Product Update", setFetchState, fetchStates);
    return null;
  }
};

// DELETE REQUESTS

export const deleteProduct = (id) => async (dispatch) => {
  const token = localStorage.getItem("token");
  dispatch(setLoading(true));
  dispatch(setError(null));
  dispatch(setFetchState(fetchStates.FETCHING));
  
  try {
    const res = await instance.delete(`/product/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Durum güncellemeleri
    dispatch(setFetchState(fetchStates.FETCHED));
    dispatch(setLoading(false));
    
    // Verileri yeniden yükle
    dispatch(fetchProducts());
    dispatch(fetchCategoriesWithProducts());
    
    // Başarılı işlem bildirimi
    toast.success(`Ürün başarıyla silindi`);
    
    return res.data;
  } catch (err) {
    handleApiError(err, dispatch, "Product Delete", setFetchState, fetchStates);
    return null;
  }
};

// Action creators
export const setProducts = (products) => ({
  type: productActions.setProductList,
  payload: products,
});

export const setCategories = (categories) => ({
  type: productActions.setCategories,
  payload: categories,
});

export const setFetchState = (fetchState) => ({
  type: productActions.setFetchState,
  payload: fetchState,
});