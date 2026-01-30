import { categoryActions } from "../reducers/categoryReducer";
import { setLoading, setSuccess, setError } from "./globalActions";
import { fetchStates } from "../constants";
import { handleApiError } from "../middleware/errorMiddleware";
import cache from "@/lib/utils/cacheManager";
import CategoryService from "@/lib/services/CategoryService";
import debounce from 'lodash/debounce';

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

// ========================================
// CACHE KEYS
// ========================================
const CACHE_KEYS = {
  CATEGORIES_PAGED: (page, size, search) => 
    `categories_p${page}_s${size}_q${search || ''}`,
  CATEGORIES_ALL: 'categories_all',
};

const CACHE_DURATION = 5 * 60 * 1000;

// Cache invalidation helper
const invalidateCategoryCache = () => {
  cache.clearPattern('categories_');
  cache.clearPattern('dashboard');
};

/**
 * Cache ile tüm kategorileri getir - pagination desteği ile
 */
export const fetchCategories = (page = 0, size = 10, search = '', forceRefresh = false) => async (dispatch) => {
  const cacheKey = CACHE_KEYS.CATEGORIES_PAGED(page, size, search);

  if (!forceRefresh) {
    // Cache kontrolü
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('✅ Cache hit (Categories):', cacheKey);
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
  }

  dispatch(setCategoryFetchState(fetchStates.FETCHING));

  try {
    // Service kullanımı
    // Note: Base implementation in CategoryService.fetchPaged takes (page, size). 
    // If search is needed, we might need to update CategoryService or just pass it if it supported filters.
    // The current CategoryService.fetchPaged implementation looks like:
    // async fetchPaged(page = 0, size = 10) { const params = this.buildPageParams(page, size, 'name,asc'); ... }
    // It doesn't seem to support search explicitly yet according to Phase 1. 
    // However, the original code didn't send search param either, so we'll stick to page/size for now.
    // If search is crucial, we should update CategoryService.
    
    // Let's assume for now we just pass page/size as per original code.
    const response = await CategoryService.fetchPaged(page, size);

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

    // Cache'e kaydet
    cache.set(cacheKey, { content: categories, pagination: paginationData }, CACHE_DURATION);

    return categories;
  } catch (err) {
    dispatch(setCategoryFetchState(fetchStates.FAILED));
    return handleApiError(err, dispatch, 'fetchCategories');
  }
};

/**
 * Debounced category search
 */
export const debouncedSearchCategories = debounce(
  (searchTerm, page = 0, size = 10) => (dispatch) => {
    return dispatch(fetchCategories(page, size, searchTerm, true));
  },
  300
);

/**
 * Yeni kategori oluştur (cache temizler)
 */
export const createCategory = (categoryData) => async (dispatch) => {
  dispatch(setLoading(true)); // Global loading

  try {
    const formData = new FormData();

    if (categoryData.name) {
      formData.append("name", categoryData.name);
    }

    if (categoryData.image && categoryData.image.file) {
      formData.append("image", categoryData.image.file);
    }

    const response = await CategoryService.create(formData);

    dispatch({
      type: categoryActions.ADD_CATEGORY,
      payload: response.data,
    });

    dispatch(setSuccess("Kategori başarıyla eklendi"));

    // Cache'i temizle
    invalidateCategoryCache();

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
export const updateCategory = (categoryId, categoryData) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const formData = new FormData();

    if (categoryData.name) {
      formData.append("name", categoryData.name);
    }

    if (categoryData.image && categoryData.image.file) {
      formData.append("image", categoryData.image.file);
    }

    const response = await CategoryService.update(categoryId, formData);

    dispatch({
      type: categoryActions.UPDATE_CATEGORY,
      payload: response.data,
    });

    dispatch(setSuccess("Kategori başarıyla güncellendi"));

    invalidateCategoryCache();

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
    await CategoryService.remove(categoryId);

    dispatch({
      type: categoryActions.DELETE_CATEGORY,
      payload: categoryId,
    });

    invalidateCategoryCache();

    return { success: true };
  } catch (err) {
    return handleApiError(err, dispatch, 'deleteCategory');
  } finally {
    dispatch(setLoading(false));
  }
};