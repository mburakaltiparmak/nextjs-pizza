import { productActions } from "../reducers/productReducer";
import { setError, setLoading, setSuccess } from "./globalActions";
import { instance } from "@/lib/hooks";
import { fetchStates } from "../constants";

export const setProducts = (products) => ({
  type: productActions.SET_PRODUCTS,
  payload: products
});

export const setProductDetail = (product) => ({
  type: productActions.SET_PRODUCT_DETAIL,
  payload: product
});

export const setCategoryProducts = (products) => ({
  type: productActions.SET_CATEGORY_PRODUCTS,
  payload: products
});

export const addProduct = (product) => ({
  type: productActions.ADD_PRODUCT,
  payload: product
});

export const updateProductInState = (product) => ({
  type: productActions.UPDATE_PRODUCT,
  payload: product
});

export const deleteProductFromState = (productId) => ({
  type: productActions.DELETE_PRODUCT,
  payload: productId
});

export const setSelectedCategory = (categoryId) => ({
  type: productActions.SET_SELECTED_CATEGORY,
  payload: categoryId
});

export const setProductFetchState = (state) => ({
  type: productActions.SET_FETCH_STATE,
  payload: state
});

export const setProductError = (error) => ({
  type: productActions.SET_ERROR,
  payload: error
});

// Tüm ürünleri getir
export const fetchProducts = () => async (dispatch) => {
  dispatch(setProductFetchState(fetchStates.FETCHING));
  
  try {
    const response = await instance.get("api/product");
    
    dispatch(setProducts(response.data));
    dispatch(setProductFetchState(fetchStates.FETCHED));
    
    return response.data;
  } catch (err) {
    dispatch(setProductFetchState(fetchStates.FAILED));
    
    let errorMessage = "Ürünler yüklenemedi";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }
    
    dispatch(setProductError(errorMessage));
    return { error: errorMessage };
  }
};

// Belirli bir ürünü getir
export const fetchProductById = (productId) => async (dispatch) => {
  dispatch(setProductFetchState(fetchStates.FETCHING));
  
  try {
    const response = await instance.get(`api/product/${productId}`);
    
    dispatch(setProductDetail(response.data));
    dispatch(setProductFetchState(fetchStates.FETCHED));
    
    return response.data;
  } catch (err) {
    dispatch(setProductFetchState(fetchStates.FAILED));
    
    let errorMessage = "Ürün bilgileri yüklenemedi";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }
    
    dispatch(setProductError(errorMessage));
    return { error: errorMessage };
  }
};

// Kategoriye göre ürünleri getir
export const fetchProductsByCategory = (categoryId) => async (dispatch) => {
  dispatch(setProductFetchState(fetchStates.FETCHING));
  dispatch(setSelectedCategory(categoryId));
  
  try {
    const response = await instance.get(`api/product/category/${categoryId}`);
    
    dispatch(setCategoryProducts(response.data));
    dispatch(setProductFetchState(fetchStates.FETCHED));
    
    return response.data;
  } catch (err) {
    dispatch(setProductFetchState(fetchStates.FAILED));
    
    let errorMessage = "Kategori ürünleri yüklenemedi";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }
    
    dispatch(setProductError(errorMessage));
    return { error: errorMessage };
  }
};

// Yeni ürün ekle
export const createProduct = (productData) => async (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description || '');
    formData.append('price', productData.price);
    formData.append('stock', productData.stock || 0);
    formData.append('categoryId', productData.categoryId);
    
    if (productData.image) {
      formData.append('image', productData.image);
    }
    
    const response = await instance.post("/product", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    dispatch(addProduct(response.data));
    dispatch(setLoading(false));
    dispatch(setSuccess("Ürün başarıyla eklendi"));
    
    return response.data;
  } catch (err) {
    let errorMessage = "Ürün eklenemedi";
    
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }
    
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    
    return { error: errorMessage };
  }
};

// Ürün güncelle
export const updateProduct = (productId, productData) => async (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description || '');
    formData.append('price', productData.price);
    formData.append('stock', productData.stock || 0);
    formData.append('categoryId', productData.categoryId);
    
    if (productData.image) {
      formData.append('image', productData.image);
    }
    
    const response = await instance.put(`/product/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    dispatch(updateProductInState(response.data));
    dispatch(setLoading(false));
    dispatch(setSuccess("Ürün başarıyla güncellendi"));
    
    return response.data;
  } catch (err) {
    let errorMessage = "Ürün güncellenemedi";
    
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }
    
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    
    return { error: errorMessage };
  }
};

// Ürün sil
export const deleteProduct = (productId) => async (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    await instance.delete(`api/product/${productId}`);
    
    dispatch(deleteProductFromState(productId));
    dispatch(setLoading(false));
    dispatch(setSuccess("Ürün başarıyla silindi"));
    
    return { success: true };
  } catch (err) {
    let errorMessage = "Ürün silinemedi";
    
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }
    
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    
    return { error: errorMessage };
  }
};