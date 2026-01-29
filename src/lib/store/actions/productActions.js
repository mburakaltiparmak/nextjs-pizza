// src/lib/store/actions/productActions.js

import { instance } from "@/lib/hooks";
import { setModuleLoading } from "./globalActions";
import { handleApiError } from "../middleware/errorMiddleware";
import { fetchStates } from "../constants";
import { productActions } from "../reducers/productReducer";
import cache from "@/lib/utils/cacheManager";

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

export const fetchProducts = (page = 0, size = 8, params = {}) => async (dispatch) => {
  dispatch(setModuleLoading('product', true)); // ✅ Module loading kullan
  dispatch({
    type: productActions.SET_FETCH_STATE,
    payload: fetchStates.FETCHING,
  });

  try {
    // Backend pagination endpoint kullan
    const response = await instance.get("/product/paged", {
      params: {
        page,
        size,
        sort: params.sort || "id,desc",
        ...(params.search && { name: params.search }),
        // Backend uyumluluğu için hem camelCase hem snake_case gönderelim
        ...(params.minPrice && { minPrice: params.minPrice, min_price: params.minPrice }),
        ...(params.maxPrice && { maxPrice: params.maxPrice, max_price: params.maxPrice }),
      }
    });

    if (!response || !response.data) {
      throw new Error("Ürün verisi alınamadı");
    }

    // Paginated response'dan content'i çıkar
    const products = response.data.content || response.data;

    // Pagination bilgisini dispatch et
    if (response.data.page) {
      dispatch({
        type: productActions.SET_PAGINATION,
        payload: {
          page: response.data.page.number,
          size: response.data.page.size,
          totalPages: response.data.page.totalPages,
          totalElements: response.data.page.totalElements
        }
      });
    }

    dispatch({
      type: productActions.SET_PRODUCTS,
      payload: products,
    });

    dispatch({
      type: productActions.SET_FETCH_STATE,
      payload: fetchStates.FETCHED,
    });

    dispatch(setModuleLoading('product', false));

    return products;
  } catch (err) {
    console.error("Ürün getirme hatası:", err);

    dispatch({
      type: productActions.SET_FETCH_STATE,
      payload: fetchStates.FAILED,
    });

    dispatch(setModuleLoading('product', false));

    // Merkezi error handler kullan
    return handleApiError(err, dispatch, 'fetchProducts');
  }
};

// YENİ: Tüm ürünleri tek seferde (sayfalama ile) çekmek için
export const fetchGetAllProducts = (size = 100) => async (dispatch) => {
  dispatch(setModuleLoading('product', true));
  dispatch({ type: productActions.SET_FETCH_STATE, payload: fetchStates.FETCHING });

  try {
    let allProducts = [];
    let currentPage = 0;
    let totalPages = 1;

    // İlk sayfayı çek
    const firstPage = await instance.get("/product/paged", {
      params: { page: 0, size }
    });
    
    if (firstPage?.data) {
       const content = firstPage.data.content || firstPage.data;
       allProducts = [...content];
       
       if (firstPage.data.page) {
         totalPages = firstPage.data.page.totalPages;
       }
    }

    // Kalan sayfaları çek
    if (totalPages > 1) {
       const pagePromises = [];
       for (let i = 1; i < totalPages; i++) {
         pagePromises.push(
           instance.get("/product/paged", { params: { page: i, size } })
         );
       }
       
       const responses = await Promise.all(pagePromises);
       responses.forEach(response => {
         const content = response.data.content || response.data;
         allProducts = [...allProducts, ...content];
       });
    }

    // Tek seferde store'a yükle
    dispatch({
      type: productActions.SET_PRODUCTS,
      payload: allProducts,
    });

    // Pagination bilgisini "hepsi tek sayfa" gibi güncelle
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

  const existingProduct = state.product.products.find(
    (p) => p.id.toString() === productId.toString()
  );

  if (existingProduct) {
    dispatch(setCurrentProduct(existingProduct));
    return existingProduct;
  }

  dispatch(setModuleLoading('product', true));

  try {
    const response = await instance.get(`/product/${productId}`);

    if (!response || !response.data) {
      throw new Error("Ürün detayı alınamadı");
    }

    dispatch({
      type: productActions.ADD_PRODUCT,
      payload: response.data,
    });

    dispatch(setCurrentProduct(response.data));
    dispatch(setModuleLoading('product', false));

    return response.data;
  } catch (err) {
    dispatch(setModuleLoading('product', false));
    return handleApiError(err, dispatch, 'fetchProductById');
  }
};

// Kategori ID'sine göre ürünleri getir
export const fetchProductsByCategory = (categoryId, page = 0, size = 8, params = {}) => async (dispatch) => {
  if (!categoryId) {
    return dispatch(fetchProducts(page, size, params));
  }

  dispatch(setModuleLoading('product', true));
  dispatch({
    type: productActions.SET_FETCH_STATE,
    payload: fetchStates.FETCHING,
  });

  try {
    // Backend'in pagination endpoint'ini kullan: /product/category/{id}/paged
    const response = await instance.get(`/product/paged/category/${categoryId}`, {
      params: {
        page,
        size,
        sort: params.sort || "id,desc",
        ...(params.search && { name: params.search }),
        // Backend uyumluluğu için hem camelCase hem snake_case gönderelim
        ...(params.minPrice && { minPrice: params.minPrice, min_price: params.minPrice }),
        ...(params.maxPrice && { maxPrice: params.maxPrice, max_price: params.maxPrice }),
      }
    });

    if (!response || !response.data) {
      throw new Error("Kategori ürünleri alınamadı");
    }

    // Paginated response'dan content'i çıkar
    const products = response.data.content || response.data;

    // Pagination bilgisini dispatch et
    if (response.data.page) {
      dispatch({
        type: productActions.SET_PAGINATION,
        payload: {
          page: response.data.page.number,
          size: response.data.page.size,
          totalPages: response.data.page.totalPages,
          totalElements: response.data.page.totalElements
        }
      });
    }

    dispatch({
      type: productActions.SET_PRODUCTS,
      payload: products,
    });

    dispatch({
      type: productActions.SET_FETCH_STATE,
      payload: fetchStates.FETCHED,
    });

    dispatch(setModuleLoading('product', false));

    return products;
  } catch (err) {
    console.error("Kategori ürünleri getirme hatası:", err);

    dispatch({
      type: productActions.SET_FETCH_STATE,
      payload: fetchStates.FAILED,
    });

    let errorMessage = "Kategori ürünleri yüklenirken bir hata oluştu";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));

    return { error: errorMessage };
  }
};

export const createProduct = (productData, token) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    // FormData oluştur
    const formData = new FormData();

    console.log("🔍 Original productData:", productData);

    // Temel ürün verilerini ekle - tümü string olarak
    formData.append("name", productData.name);
    formData.append("rating", productData.rating.toString());
    formData.append("stock", productData.stock.toString());
    formData.append("price", productData.price.toString());
    formData.append("categoryId", productData.categoryId.toString());

    // Resim dosyasını ekle
    if (productData.image && productData.image instanceof File) {
      formData.append("image", productData.image);
      console.log("✅ Image file added:", {
        name: productData.image.name,
        size: productData.image.size,
        type: productData.image.type
      });
    } else {
      console.log("❌ No valid image file found:", productData.image);
    }

    // Açıklama varsa ekle
    if (productData.description) {
      formData.append("description", productData.description);
    }

    // FormData içeriğini debug için logla
    console.log("📤 FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
    }

    // API isteği - interceptor Content-Type'ı otomatik yönetecek
    const response = await instance.post("/product", formData);

    console.log("✅ Product created successfully:", response.data);

    // Başarılı işlem
    await Promise.all([dispatch(fetchCategories()), dispatch(fetchProducts())]);
    dispatch(setSuccess("Ürün başarıyla oluşturuldu"));

    // Clear dashboard cache as product counts changed
    cache.clearPattern('dashboard');

    return response.data;
  } catch (err) {
    console.error("❌ Product creation error:", err);

    if (err.response) {
      console.error("📨 Error details:", {
        status: err.response.status,
        data: err.response.data,
        headers: err.response.headers
      });
    }

    let errorMessage = "Ürün oluşturulamadı";

    if (err.response) {
      if (typeof err.response.data === 'string') {
        errorMessage = err.response.data;
      } else if (err.response.data?.message) {
        errorMessage = err.response.data.message;
      }
    } else if (err.request) {
      errorMessage = "Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.";
    } else {
      errorMessage = err.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    return { error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};

// Ürün güncelle
// Ürün güncelle
export const updateProduct = (id, productData, token) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    // FormData oluştur
    const formData = new FormData();

    // Temel ürün verilerini ekle - tümü string olarak
    formData.append("name", productData.name);
    formData.append("rating", productData.rating.toString());
    formData.append("stock", productData.stock.toString());
    formData.append("price", productData.price.toString());
    formData.append("categoryId", productData.categoryId.toString());

    // Resim varsa ekle
    if (productData.image && productData.image instanceof File) {
      formData.append("image", productData.image);
      console.log("✅ Image file added for update:", productData.image.name);
    }

    // Açıklama varsa ekle
    if (productData.description) {
      formData.append("description", productData.description);
    }

    console.log("📤 Update FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
    }

    // API isteği yap
    const response = await instance.put(`/product/${id}`, formData);

    // Ürün güncellendikten sonra verileri yeniden getir
    await Promise.all([dispatch(fetchCategories()), dispatch(fetchProducts())]);

    dispatch(setSuccess("Ürün başarıyla güncellendi"));

    // Clear dashboard and products cache
    cache.clearPattern('dashboard');

    return response.data;
  } catch (err) {
    console.error("❌ Product update error:", err);

    let errorMessage = "Ürün güncellenemedi";

    if (err.response) {
      if (typeof err.response.data === 'string') {
        errorMessage = err.response.data;
      } else if (err.response.data?.message) {
        errorMessage = err.response.data.message;
      }
    } else if (err.request) {
      errorMessage = "Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.";
    } else {
      errorMessage = err.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    return { error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};

// Ürün sil
// Ürün sil
export const deleteProduct = (id, token) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    // API isteği yap
    const response = await instance.delete(`/product/${id}`);

    // Ürün silindikten sonra verileri yeniden getir
    await Promise.all([dispatch(fetchCategories()), dispatch(fetchProducts())]);

    dispatch(setSuccess("Ürün başarıyla silindi"));

    // Clear dashboard cache
    cache.clearPattern('dashboard');


    return response.data;
  } catch (err) {
    let errorMessage = "Ürün silinemedi";

    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    } else if (err.request) {
      errorMessage =
        "Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.";
    } else {
      errorMessage = err.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    return { error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};

export const createCustomPizza =
  (customPizzaData, total, token) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      // FormData yerine JSON object oluşturun
      const requestData = {
        name: customPizzaData.name,
        totalPrice: total,
        customDetails: customPizzaData.description,
      };
      console.log("request data", requestData);

      // JSON olarak gönderin
      const response = await instance.post(
        "/product/custom-pizza",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      dispatch(setSuccess("Custom Pizza başarıyla oluşturuldu"));

      return response.data;
    } catch (err) {
      console.error("Custom Pizza Oluşturma Hatası Detayları:", {
        error: err,
        response: err.response ? err.response.data : null,
        status: err.response ? err.response.status : null,
      });

      let errorMessage = "Ürün oluşturulamadı";
      if (err.response) {
        errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          errorMessage;
      }

      dispatch(setError(errorMessage));
      return { error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };