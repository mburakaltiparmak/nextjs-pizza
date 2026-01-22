import { categoryActions } from "../reducers/categoryReducer";
import { setLoading, setSuccess } from "./globalActions";
import { instance } from "@/lib/hooks";
import { fetchStates } from "../constants";
import { handleApiError } from "../middleware/errorMiddleware";
import cache from "@/lib/utils/cacheManager";

export const setCategories = (categories) => ({
  type: categoryActions.SET_CATEGORIES,
  payload: categories,
});

export const setCategoryFetchState = (state) => ({
  type: categoryActions.SET_FETCH_STATE,
  payload: state,
});

export const resetCategoryState = () => ({
  type: categoryActions.RESET_CATEGORY_STATE,
});

/**
 * Cache ile tüm kategorileri getir - pagination desteği ile
 */
export const fetchCategories = (page = 0, size = 10) => async (dispatch) => {
  const CACHE_KEY = `categories_page_${page}_size_${size}`;

  // Cache kontrolü
  const cached = cache.get(CACHE_KEY);
  if (cached) {
    dispatch(setCategories(cached.content));
    if (cached.pagination) {
      dispatch({
        type: categoryActions.SET_PAGINATION,
        payload: cached.pagination
      });
    }
    dispatch(setCategoryFetchState(fetchStates.FETCHED));
    return cached.content;
  }

  dispatch(setCategoryFetchState(fetchStates.FETCHING));

  try {
    // Backend pagination endpoint kullan
    const response = await instance.get("/category/paged", {
      params: {
        page,
        size,
        sort: "name,asc"
      }
    });

    // Paginated response'dan content'i çıkar
    const categories = response.data.content || response.data;

    // Pagination bilgisini dispatch et
    let paginationData = null;
    if (response.data.page) {
      paginationData = {
        page: response.data.page.number,
        size: response.data.page.size,
        totalPages: response.data.page.totalPages,
        totalElements: response.data.page.totalElements
      };

      dispatch({
        type: categoryActions.SET_PAGINATION,
        payload: paginationData
      });
    }

    dispatch(setCategories(categories));
    dispatch(setCategoryFetchState(fetchStates.FETCHED));

    // Cache'e kaydet (5 dakika)
    cache.set(CACHE_KEY, { content: categories, pagination: paginationData });

    return categories;
  } catch (err) {
    dispatch(setCategoryFetchState(fetchStates.FAILED));
    return handleApiError(err, dispatch, 'fetchCategories');
  }
};

/**
 * Yeni kategori oluştur (cache temizler)
 */
export const createCategory = (categoryData, token) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const formData = new FormData();

    if (categoryData.name) {
      formData.append("name", categoryData.name);
    }

    if (categoryData.image && categoryData.image.file) {
      formData.append("image", categoryData.image.file);
    }

    const response = await instance.post("/category", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({
      type: categoryActions.ADD_CATEGORY,
      payload: response.data,
    });

    dispatch(setSuccess("Kategori başarıyla eklendi"));

    // Cache'i temizle - yeni veri eklendiği için
    cache.clear('categories_all');
    // Dashboard cache'ini de temizle
    cache.clearPattern('dashboard');

    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'createCategory');
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Kategori güncelle (cache temizler)
 */
export const updateCategory = (categoryId, categoryData, token) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const formData = new FormData();

    if (categoryData.name) {
      formData.append("name", categoryData.name);
    }

    if (categoryData.image && categoryData.image.file) {
      formData.append("image", categoryData.image.file);
    }

    const response = await instance.put(`/category/${categoryId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({
      type: categoryActions.UPDATE_CATEGORY,
      payload: response.data,
    });

    dispatch(setSuccess("Kategori başarıyla güncellendi"));

    // Cache'i temizle
    cache.clear('categories_all');
    cache.clearPattern('dashboard');

    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'updateCategory');
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Kategori sil (cache temizler)
 */
export const deleteCategory = (categoryId) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    await instance.delete(`/category/${categoryId}`);

    dispatch({
      type: categoryActions.DELETE_CATEGORY,
      payload: categoryId,
    });

    // Cache'i temizle
    cache.clear('categories_all');
    cache.clearPattern('dashboard');

    return { success: true };
  } catch (err) {
    return handleApiError(err, dispatch, 'deleteCategory');
  } finally {
    dispatch(setLoading(false));
  }
};