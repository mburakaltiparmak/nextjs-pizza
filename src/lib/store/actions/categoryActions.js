// src/lib/store/actions/categoryActions.js
import { categoryActions } from "../reducers/categoryReducer";
import { setLoading, setSuccess } from "./globalActions";
import { instance } from "@/lib/hooks";
import { fetchStates } from "../constants";
import { handleApiError } from "../middleware/errorMiddleware"; // ✅ Import

export const setCategories = (categories) => ({
  type: categoryActions.SET_CATEGORIES,
  payload: categories,
});

export const setCategoryFetchState = (state) => ({
  type: categoryActions.SET_FETCH_STATE,
  payload: state,
});

// Tüm kategorileri getir - DÜZELTME ÖRNEĞİ
export const fetchCategories = () => async (dispatch) => {
  dispatch(setCategoryFetchState(fetchStates.FETCHING));

  try {
    const response = await instance.get("/category");

    dispatch(setCategories(response.data));
    dispatch(setCategoryFetchState(fetchStates.FETCHED));

    return response.data;
  } catch (err) {
    dispatch(setCategoryFetchState(fetchStates.FAILED));
    
    // ✅ Merkezi error handler kullan - tek satır!
    return handleApiError(err, dispatch, 'fetchCategories');
    
    // ❌ Eski yöntem - artık gerekli değil:
    // let errorMessage = "Kategoriler yüklenemedi";
    // if (err.response) {
    //   errorMessage = err.response.data?.message || errorMessage;
    // }
    // dispatch(setCategoryError(errorMessage));
    // return { error: errorMessage };
  }
};

// Basit kategori listesini getir
export const fetchSimpleCategories = () => async (dispatch) => {
  dispatch(setCategoryFetchState(fetchStates.FETCHING));

  try {
    const response = await instance.get("/category/simple");

    dispatch(setCategories(response.data));
    dispatch(setCategoryFetchState(fetchStates.FETCHED));

    return response.data;
  } catch (err) {
    dispatch(setCategoryFetchState(fetchStates.FAILED));
    
    // ✅ Merkezi error handler
    return handleApiError(err, dispatch, 'fetchSimpleCategories');
  }
};

// Yeni kategori ekle
export const createCategory = (categoryData) => async (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    const formData = new FormData();
    formData.append('name', categoryData.name);
    
    if (categoryData.image) {
      formData.append("image", categoryData.image);
    }
    
    const response = await instance.post("/category", formData);

    dispatch(addCategory(response.data));
    dispatch(setLoading(false));
    dispatch(setSuccess("Kategori başarıyla eklendi"));

    return response.data;
  } catch (err) {
    dispatch(setLoading(false));
    
    // ✅ Merkezi error handler
    return handleApiError(err, dispatch, 'createCategory');
  }
};

// Kategori güncelle
export const updateCategory = (id, categoryData) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const formData = new FormData();
    formData.append("name", categoryData.name);

    if (categoryData.image && categoryData.image instanceof File) {
      formData.append("image", categoryData.image);
    }

    const response = await instance.put(`/category/${id}`, formData);

    dispatch(updateCategoryInState(response.data));
    dispatch(setSuccess("Kategori başarıyla güncellendi"));
    dispatch(setLoading(false));

    return response.data;
  } catch (err) {
    dispatch(setLoading(false));
    
    // ✅ Merkezi error handler
    return handleApiError(err, dispatch, 'updateCategory');
  }
};

// Kategori sil
export const deleteCategory = (id) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    await instance.delete(`/category/${id}`);

    dispatch(deleteCategoryFromState(id));
    dispatch(setSuccess("Kategori başarıyla silindi"));
    dispatch(setLoading(false));

    return { success: true };
  } catch (err) {
    dispatch(setLoading(false));
    
    // ✅ Merkezi error handler
    return handleApiError(err, dispatch, 'deleteCategory');
  }
};