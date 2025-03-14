import { categoryActions } from "../reducers/categoryReducer";
import { setError, setLoading, setSuccess } from "./globalActions";
import { instance } from "@/lib/hooks";
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
// Yeni kategori ekle
export const createCategory = (categoryData) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    // FormData nesnesi oluştur
    const formData = new FormData();
    formData.append("name", categoryData.name);

    // Görsel varsa ekle
    if (categoryData.image && categoryData.image instanceof File) {
      formData.append("image", categoryData.image);
    }

    // Authorization token'ını headers'a ekleyelim
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "multipart/form-data",
    };

    // Token varsa ekleyelim
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // İstek atarken headers'ı ekleyelim
    const response = await instance.post("/category", formData, {
      headers: headers,
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
export const updateCategory =
  (categoryId, categoryData) => async (dispatch) => {
    dispatch(setLoading(true));

    try {
      // FormData nesnesi oluştur
      const formData = new FormData();
      formData.append("name", categoryData.name);

      // Görsel varsa ekle
      if (categoryData.image && categoryData.image instanceof File) {
        formData.append("image", categoryData.image);
      }

      // Authorization token'ını headers'a ekleyelim
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "multipart/form-data",
      };

      // Token varsa ekleyelim
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // İstek atarken headers'ı ekleyelim
      const response = await instance.put(`/category/${categoryId}`, formData, {
        headers: headers,
      });

      dispatch(updateCategoryInState(response.data));
      dispatch(setLoading(false));
      dispatch(setSuccess("Kategori başarıyla güncellendi"));

      return response.data;
    } catch (err) {
      let errorMessage = "Kategori güncellenemedi";

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

// Kategori sil
export const deleteCategory = (categoryId) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    await instance.delete(`/category/${categoryId}`);

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
