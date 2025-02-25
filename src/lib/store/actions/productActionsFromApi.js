import { instance } from "@/lib/hooks";
import { fetchStates, productActions } from "../reducers/productReducersFromApi";

// Hata işleme için yardımcı fonksiyon
const handleApiError = (err, dispatch) => {
  console.error("API Error:", err);
  dispatch(setError(err.message || "Beklenmeyen bir hata oluştu"));
  dispatch(setFetchState(fetchStates.FAILED));
  dispatch(setLoading(false));
};

export const fetchProducts = () => async (dispatch) => {
  dispatch(setFetchState(fetchStates.FETCHING));
  dispatch(setLoading(true));
  dispatch(setError(null)); // Hata varsa temizle
  
  try {
    const res = await instance.get("/product");
    const data = res.data;
    console.log("product data : \n",data);
    dispatch(setProducts(res.data));
    dispatch(setFetchState(fetchStates.FETCHED));
    dispatch(setLoading(false));
  } catch (err) {
    handleApiError(err, dispatch);
  }
};

export const fetchCategoriesWithProducts = () => async (dispatch) => {
  dispatch(setFetchState(fetchStates.FETCHING));
  dispatch(setLoading(true));
  dispatch(setError(null)); // Hata varsa temizle
  
  try {
    const res = await instance.get("/category");
    dispatch(setCategories(res.data));
    dispatch(setFetchState(fetchStates.FETCHED));
    dispatch(setLoading(false));
  } catch (err) {
    handleApiError(err, dispatch);
  }
};

export const fetchCategories = () => async (dispatch) => {
  dispatch(setFetchState(fetchStates.FETCHING));
  dispatch(setLoading(true));
  dispatch(setError(null)); // Hata varsa temizle
  
  try {
    const res = await instance.get("/category/simple");
    dispatch(setCategories(res.data));
    dispatch(setFetchState(fetchStates.FETCHED));
    dispatch(setLoading(false));
  } catch (err) {
    handleApiError(err, dispatch);
  }
};

export const fetchProductById = (id) => async (dispatch) => {
  if (!id) return; // Geçersiz ID kontrolü ekleyelim
  
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
    handleApiError(err, dispatch);
    return null;
  }
};

export const fetchCategoryById = (id) => async (dispatch) => {
  if (!id) return; // Geçersiz ID kontrolü ekleyelim
  
  dispatch(setFetchState(fetchStates.FETCHING));
  dispatch(setLoading(true));
  dispatch(setError(null)); // Hata varsa temizle
  
  try {
    const res = await instance.get(`/category/${id}`);
    // Burada isterseniz özel bir dispatch ekleyebilirsiniz
    dispatch(setFetchState(fetchStates.FETCHED));
    dispatch(setLoading(false));
    return res.data; // Veriyi döndürelim
  } catch (err) {
    handleApiError(err, dispatch);
    return null;
  }
};
export const postNewProduct = (formData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));
  try {
    const res = await instance.post("/product",formData);
    const data = res.data;
  }
  catch (err) {
    handleApiError(err,dispatch);
  }
}
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

export const setSelectedCategory = (selectedCategory) => ({
  type: productActions.setSelectedCategory,
  payload: selectedCategory,
});

export const setLoading = (loading) => ({
  type: productActions.setLoading,
  payload: loading,
});

export const setError = (error) => ({
  type: productActions.setError,
  payload: error,
});