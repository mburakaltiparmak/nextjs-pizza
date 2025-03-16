import { categoryActions } from "../reducers/categoryReducer";
import { setError, setLoading, setSuccess } from "./globalActions";
import { instance, useAppSelector } from "@/lib/hooks";
import { fetchStates } from "../constants";

export const setCategories = (categories) => ({
  type: categoryActions.SET_CATEGORIES,
  payload: categories,
});

export const setSingleCategory = (category) => ({
  type: categoryActions.SET_SINGLE_CATEGORY,
  payload: category,
});

export const addCategory = (category) => ({
  type: categoryActions.ADD_CATEGORY,
  payload: category,
});

export const updateCategoryInState = (category) => ({
  type: categoryActions.UPDATE_CATEGORY,
  payload: category,
});

export const deleteCategoryFromState = (categoryId) => ({
  type: categoryActions.DELETE_CATEGORY,
  payload: categoryId,
});

export const setCategoryFetchState = (state) => ({
  type: categoryActions.SET_FETCH_STATE,
  payload: state,
});

export const setCategoryError = (error) => ({
  type: categoryActions.SET_ERROR,
  payload: error,
});

// Tüm kategorileri getir
export const fetchCategories = () => async (dispatch) => {
  dispatch(setCategoryFetchState(fetchStates.FETCHING));

  try {
    const response = await instance.get("/category");

    dispatch(setCategories(response.data));
    dispatch(setCategoryFetchState(fetchStates.FETCHED));

    return response.data;
  } catch (err) {
    dispatch(setCategoryFetchState(fetchStates.FAILED));

    let errorMessage = "Kategoriler yüklenemedi";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }

    dispatch(setCategoryError(errorMessage));
    return { error: errorMessage };
  }
};

// Basit kategori listesini getir (ürünler dahil değil)
export const fetchSimpleCategories = () => async (dispatch) => {
  dispatch(setCategoryFetchState(fetchStates.FETCHING));

  try {
    const response = await instance.get("/category/simple");

    dispatch(setCategories(response.data));
    dispatch(setCategoryFetchState(fetchStates.FETCHED));

    return response.data;
  } catch (err) {
    dispatch(setCategoryFetchState(fetchStates.FAILED));

    let errorMessage = "Kategoriler yüklenemedi";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }

    dispatch(setCategoryError(errorMessage));
    return { error: errorMessage };
  }
};

// Belirli bir kategoriyi getir
export const fetchCategoryById = (categoryId) => async (dispatch) => {
  dispatch(setCategoryFetchState(fetchStates.FETCHING));

  try {
    const response = await instance.get(`/category/${categoryId}`);

    dispatch(setSingleCategory(response.data));
    dispatch(setCategoryFetchState(fetchStates.FETCHED));

    return response.data;
  } catch (err) {
    dispatch(setCategoryFetchState(fetchStates.FAILED));

    let errorMessage = "Kategori bilgileri yüklenemedi";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }

    dispatch(setCategoryError(errorMessage));
    return { error: errorMessage };
  }
};

// Yeni kategori ekle
export const createCategory = (categoryData, token) => async (dispatch) => {
  dispatch(setLoading(true));
  
  
  try {
    // FormData nesnesi oluştur
    const formData = new FormData();
    formData.append('name', categoryData.name);
    const token = useAppSelector((state)=>state.user.token);
    
    if (categoryData.image) {
      formData.append("image", categoryData.image);
    }
    console.log("category form data",formData);
    
    const response = await instance.post("/category", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });

    dispatch(addCategory(response.data));
    dispatch(setLoading(false));
    dispatch(setSuccess("Kategori başarıyla eklendi"));

    return response.data;
  } catch (err) {
    let errorMessage = "Kategori eklenemedi";

    if (err.response) {
      console.error("Sunucu yanıtı:", err.response);
      errorMessage = err.response.data?.message || errorMessage;
    } else if (err.request) {
      console.error("İstek gönderildi ama yanıt alınamadı:", err.request);
      errorMessage = "Sunucudan yanıt alınamadı";
    } else {
      console.error("İstek oluşturulurken hata:", err.message);
      errorMessage = err.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));

    return { error: errorMessage };
  }
};

// Kategori güncelle
export const updateCategory = (categoryId, categoryData) => async (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    const formData = new FormData();
    formData.append('name', categoryData.name);
    
    if (categoryData.image) {
      formData.append('image', categoryData.image);
    }
    
    const response = await instance.put(`/category/${categoryId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }});

      dispatch(updateCategoryInState(response.data));
      dispatch(setLoading(false));
      dispatch(setSuccess("Kategori başarıyla güncellendi"));

      return response.data;
    } catch (err) {
      let errorMessage = "Kategori güncellenemedi";

      if (err.response) {
        errorMessage = err.response.data?.message || errorMessage;
      }

      dispatch(setError(errorMessage));
      dispatch(setLoading(false));

      return { error: errorMessage };
    }
  };

// Kategori sil
export const deleteCategory = (categoryId, token) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    await instance.delete(`/category/${categoryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000, // 10 saniye timeout ekle
    });

    dispatch(deleteCategoryFromState(categoryId));
    dispatch(setLoading(false));
    dispatch(setSuccess("Kategori başarıyla silindi"));

    return { success: true };
  } catch (err) {
    let errorMessage = "Kategori silinemedi";

    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));

    return { error: errorMessage };
  }
};
