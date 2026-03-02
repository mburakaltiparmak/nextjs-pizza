import { setModuleLoading, setError, setSuccess, setLoading } from "./globalActions";
import { handleApiError } from "../middleware/errorMiddleware";
import { fetchStates } from "../constants";
import { productActions } from "../reducers/productReducer";
import cache from "@/lib/utils/cacheManager";
import ProductService from "@/lib/services/ProductService";
import debounce from 'lodash/debounce';

// ========================================
// CACHE KEYS
// ========================================
const CACHE_KEYS = {
  PRODUCTS_PAGED: (page, size, filters) => 
    `products_p${page}_s${size}_${JSON.stringify(filters)}`,
  PRODUCT_BY_ID: (id) => `product_${id}`,
  // Note: Category-based fetching often uses the same structure as paged, 
  // but if we want specific keys:
  PRODUCTS_BY_CATEGORY: (catId, page, size, filters) => 
    `products_cat${catId}_p${page}_s${size}_${JSON.stringify(filters)}`,
  ALL_PRODUCTS: 'products_all',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache invalidation helper
const invalidateProductCache = () => {
  cache.clearPattern('products_');
  cache.clearPattern('dashboard');
};

export const setCurrentProduct = (product) => ({
  type: productActions.SET_CURRENT_PRODUCT,
  payload: product,
});

export const clearCurrentProduct = () => ({
  type: productActions.CLEAR_CURRENT_PRODUCT,
});

export const resetProductState = () => ({
  type: productActions.RESET_PRODUCT_STATE,
});

/**
 * Fetch paginated products with caching
 */
export const fetchProducts = (page = 0, size = 8, filters = {}, forceRefresh = false) => async (dispatch) => {
  const cacheKey = CACHE_KEYS.PRODUCTS_PAGED(page, size, filters);
  
  if (!forceRefresh) {
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('✅ Cache hit:', cacheKey);
      dispatch({ type: productActions.SET_PRODUCTS, payload: cached.content });
      if (cached.pagination) {
        dispatch({ type: productActions.SET_PAGINATION, payload: cached.pagination });
      }
      dispatch({ type: productActions.SET_FETCH_STATE, payload: fetchStates.FETCHED });
      return cached.content;
    }
  }

  dispatch(setModuleLoading('product', true));
  dispatch({ type: productActions.SET_FETCH_STATE, payload: fetchStates.FETCHING });

  try {
    const response = await ProductService.fetchPaged(page, size, filters);
    const products = response.data.content || response.data;
    
    // Extract pagination info
    let pagination = null;
    if (response.data.page) {
      pagination = {
        page: response.data.page.number,
        size: response.data.page.size,
        totalPages: response.data.page.totalPages,
        totalElements: response.data.page.totalElements
      };
      
      dispatch({
        type: productActions.SET_PAGINATION,
        payload: pagination
      });
    }

    // Cache the result
    cache.set(cacheKey, { content: products, pagination }, CACHE_DURATION);

    dispatch({ type: productActions.SET_PRODUCTS, payload: products });
    dispatch({ type: productActions.SET_FETCH_STATE, payload: fetchStates.FETCHED });
    dispatch(setModuleLoading('product', false));

    return products;
  } catch (err) {
    console.error("Ürün getirme hatası:", err);
    dispatch({ type: productActions.SET_FETCH_STATE, payload: fetchStates.FAILED });
    dispatch(setModuleLoading('product', false));
    return handleApiError(err, dispatch, 'fetchProducts');
  }
};

/**
 * Debounced product search
 */
export const debouncedSearchProducts = debounce(
  (searchTerm, page = 0, size = 10) => (dispatch) => {
    return dispatch(fetchProducts(page, size, { search: searchTerm }, true));
  },
  300
);

/**
 * Fetch all products (handled via pagination loop if needed)
 */
export const fetchGetAllProducts = (size = 100) => async (dispatch) => {
  dispatch(setModuleLoading('product', true));
  dispatch({ type: productActions.SET_FETCH_STATE, payload: fetchStates.FETCHING });

  // This specific action might be too heavy to cache fully or might need a different strategy.
  // For now, we will perform the fetch without explicit caching of the "all" list, 
  // or we could cache the final result.

  try {
    let allProducts = [];
    let totalPages = 1;

    // First page
    const firstPage = await ProductService.fetchPaged(0, size);
    
    if (firstPage?.data) {
       const content = firstPage.data.content || firstPage.data;
       allProducts = [...content];
       
       if (firstPage.data.page) {
         totalPages = firstPage.data.page.totalPages;
       }
    }

    // Remaining pages
    if (totalPages > 1) {
       const pagePromises = [];
       for (let i = 1; i < totalPages; i++) {
         pagePromises.push(ProductService.fetchPaged(i, size));
       }
       
       const responses = await Promise.all(pagePromises);
       responses.forEach(response => {
         const content = response.data.content || response.data;
         allProducts = [...allProducts, ...content];
       });
    }

    dispatch({ type: productActions.SET_PRODUCTS, payload: allProducts });
    
    // Mock pagination for "all" view
    dispatch({
      type: productActions.SET_PAGINATION,
      payload: {
        page: 0,
        size: allProducts.length,
        totalPages: 1,
        totalElements: allProducts.length
      }
    });

    dispatch({ type: productActions.SET_FETCH_STATE, payload: fetchStates.FETCHED });
    dispatch(setModuleLoading('product', false));
    return allProducts;

  } catch (err) {
    console.error("Tüm ürünleri getirme hatası:", err);
    dispatch({ type: productActions.SET_FETCH_STATE, payload: fetchStates.FAILED });
    dispatch(setModuleLoading('product', false));
    return handleApiError(err, dispatch, 'fetchGetAllProducts');
  }
};

export const fetchProductById = (productId) => async (dispatch, getState) => {
  const state = getState();
  const cacheKey = CACHE_KEYS.PRODUCT_BY_ID(productId);

  // 1. Check State
  const existingProduct = state.product.products.find(
    (p) => p.id.toString() === productId.toString()
  );
  if (existingProduct) {
    dispatch(setCurrentProduct(existingProduct));
    return existingProduct;
  }

  // 2. Check Cache
  const cached = cache.get(cacheKey);
  if (cached) {
      dispatch({ type: productActions.ADD_PRODUCT, payload: cached });
      dispatch(setCurrentProduct(cached));
      return cached;
  }

  dispatch(setModuleLoading('product', true));

  try {
    const response = await ProductService.fetchById(productId);
    const product = response.data;

    if (!product) {
      throw new Error("Ürün detayı alınamadı");
    }

    // Cache result
    cache.set(cacheKey, product, CACHE_DURATION);

    dispatch({ type: productActions.ADD_PRODUCT, payload: product });
    dispatch(setCurrentProduct(product));
    dispatch(setModuleLoading('product', false));

    return product;
  } catch (err) {
    dispatch(setModuleLoading('product', false));
    return handleApiError(err, dispatch, 'fetchProductById');
  }
};

export const fetchProductsByCategory = (categoryId, page = 0, size = 8, filters = {}) => async (dispatch) => {
  if (!categoryId) {
    return dispatch(fetchProducts(page, size, filters));
  }

  const cacheKey = CACHE_KEYS.PRODUCTS_BY_CATEGORY(categoryId, page, size, filters);

  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('✅ Cache hit (Category):', cacheKey);
    dispatch({ type: productActions.SET_PRODUCTS, payload: cached.content });
    if (cached.pagination) {
      dispatch({ type: productActions.SET_PAGINATION, payload: cached.pagination });
    }
    dispatch({ type: productActions.SET_FETCH_STATE, payload: fetchStates.FETCHED });
    return cached.content;
  }

  dispatch(setModuleLoading('product', true));
  dispatch({ type: productActions.SET_FETCH_STATE, payload: fetchStates.FETCHING });

  try {
    const response = await ProductService.fetchByCategory(categoryId, page, size, filters);
    const products = response.data.content || response.data;
    
    let pagination = null;
    if (response.data.page) {
      pagination = {
        page: response.data.page.number,
        size: response.data.page.size,
        totalPages: response.data.page.totalPages,
        totalElements: response.data.page.totalElements
      };
      dispatch({ type: productActions.SET_PAGINATION, payload: pagination });
    }

    cache.set(cacheKey, { content: products, pagination }, CACHE_DURATION);

    dispatch({ type: productActions.SET_PRODUCTS, payload: products });
    dispatch({ type: productActions.SET_FETCH_STATE, payload: fetchStates.FETCHED });
    dispatch(setModuleLoading('product', false));

    return products;
  } catch (err) {
    console.error("Kategori ürünleri getirme hatası:", err);
    dispatch({ type: productActions.SET_FETCH_STATE, payload: fetchStates.FAILED });
    return handleApiError(err, dispatch, 'fetchProductsByCategory');
  }
};

// Removed token param
export const createProduct = (productData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    // FormData creation should handle files correctly.
    // Assuming productData has the file object if needed.
    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("rating", productData.rating.toString());
    formData.append("stock", productData.stock.toString());
    formData.append("price", productData.price.toString());
    formData.append("categoryId", productData.categoryId.toString());
    
    if (productData.image instanceof File) {
      formData.append("image", productData.image);
    }
    if (productData.description) {
      formData.append("description", productData.description);
    }

    const response = await ProductService.create(formData);

    invalidateProductCache();

    // Refresh lists
    dispatch(setSuccess("Ürün başarıyla oluşturuldu"));
    await dispatch(fetchProducts(0, 8, {}, true)); // force refresh

    return response.data;
  } catch (err) {
    return handleApiError(err, dispatch, 'createProduct');
  } finally {
    dispatch(setLoading(false));
  }
};

// Removed token param
export const updateProduct = (id, productData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("rating", productData.rating.toString());
    formData.append("stock", productData.stock.toString());
    formData.append("price", productData.price.toString());
    formData.append("categoryId", productData.categoryId.toString());

    if (productData.image instanceof File) {
      formData.append("image", productData.image);
    }
    if (productData.description) {
      formData.append("description", productData.description);
    }

    const response = await ProductService.update(id, formData);

    invalidateProductCache();

    dispatch(setSuccess("Ürün başarıyla güncellendi"));
    await dispatch(fetchProducts(0, 8, {}, true));

    return response.data;
  } catch (err) {
    return handleApiError(err, dispatch, 'updateProduct');
  } finally {
    dispatch(setLoading(false));
  }
};

// Removed token param
export const deleteProduct = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await ProductService.remove(id);

    invalidateProductCache();
    
    dispatch(setSuccess("Ürün başarıyla silindi"));
    await dispatch(fetchProducts(0, 8, {}, true));

    return response.data;
  } catch (err) {
    return handleApiError(err, dispatch, 'deleteProduct');
  } finally {
    dispatch(setLoading(false));
  }
};

