// src/lib/store/actions/productActions.js

import { instance } from "@/lib/hooks";
import { setLoading, setError, setSuccess } from "./globalActions";
import { fetchStates } from "../constants";
import { fetchCategories } from "./categoryActions";
import { productActions } from "../reducers/productReducer";

// Ürünleri getir
export const fetchProducts = () => async (dispatch) => {
  dispatch({ 
    type: productActions.setProductFetchState, 
    payload: fetchStates.FETCHING 
  });
  dispatch(setLoading(true));

  try {
    const response = await instance.get("/product");
    
    // Ürünleri store'a kaydet
    /*
    dispatch({
      type: "product/SET_PRODUCTS",
      payload: response.data,
    });
    */
   dispatch({
    type: productActions.setProducts,
    payload: response.data
   });
    
    dispatch({ 
      type: productActions.setProductFetchState, 
      payload: fetchStates.FETCHED 
    });    dispatch(setLoading(false));
    return response.data;
  } catch (err) {
    dispatch({ 
      type: productActions.setProductFetchState, 
      payload: fetchStates.FAILED 
    });
    dispatch(setLoading(false));
    
    let errorMessage = "Ürünler yüklenirken bir hata oluştu";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }
    
    dispatch(setError(errorMessage));
    return { error: errorMessage };
  }
};

// Ürün oluştur ve ardından hem ürün hem kategori verilerini yeniden getir
export const createProduct = (productData, token) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    // FormData oluştur
    const formData = new FormData();
    
    // Temel ürün verilerini ekle
    formData.append("name", productData.name);
    formData.append("rating", productData.rating);
    formData.append("stock", productData.stock);
    formData.append("price", productData.price);
    formData.append("categoryId", productData.categoryId);
    
    // Resim varsa ekle
    if (productData.image) {
      formData.append("image", productData.image);
    }

    // API isteği yap
    const response = await instance.post("/product", formData);
    
    // Ürün oluşturulduktan sonra verileri yeniden getir
    await Promise.all([
      dispatch(fetchCategories()),
      dispatch(fetchProducts())
    ]);
    
    dispatch(setSuccess("Ürün başarıyla oluşturuldu"));
    dispatch(setLoading(false));
    
    return response.data;
  } catch (err) {
    let errorMessage = "Ürün oluşturulamadı";
    
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    } else if (err.request) {
      errorMessage = "Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.";
    } else {
      errorMessage = err.message || errorMessage;
    }
    
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

// Ürün güncelle ve ardından hem ürün hem kategori verilerini yeniden getir
export const updateProduct = (id, productData, token) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    // FormData oluştur
    const formData = new FormData();
    
    // Temel ürün verilerini ekle
    formData.append("name", productData.name);
    formData.append("rating", productData.rating);
    formData.append("stock", productData.stock);
    formData.append("price", productData.price);
    formData.append("categoryId", productData.categoryId);
    
    // Resim varsa ekle
    if (productData.image) {
      formData.append("image", productData.image);
    }

    // API isteği yap
    const response = await instance.put(`/product/${id}`, formData);
    
    // Ürün güncellendikten sonra verileri yeniden getir
    await Promise.all([
      dispatch(fetchCategories()),
      dispatch(fetchProducts())
    ]);
    
    dispatch(setSuccess("Ürün başarıyla güncellendi"));
    dispatch(setLoading(false));
    
    return response.data;
  } catch (err) {
    let errorMessage = "Ürün güncellenemedi";
    
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    } else if (err.request) {
      errorMessage = "Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.";
    } else {
      errorMessage = err.message || errorMessage;
    }
    
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

// Ürün sil ve ardından hem ürün hem kategori verilerini yeniden getir
export const deleteProduct = (id, token) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    // API isteği yap
    const response = await instance.delete(`/product/${id}`);
    
    // Ürün silindikten sonra verileri yeniden getir
    await Promise.all([
      dispatch(fetchCategories()),
      dispatch(fetchProducts())
    ]);
    
    dispatch(setSuccess("Ürün başarıyla silindi"));
    dispatch(setLoading(false));
    
    return response.data;
  } catch (err) {
    let errorMessage = "Ürün silinemedi";
    
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    } else if (err.request) {
      errorMessage = "Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.";
    } else {
      errorMessage = err.message || errorMessage;
    }
    
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};