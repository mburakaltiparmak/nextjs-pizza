// src/lib/store/actions/productActions.js

import { instance } from "@/lib/hooks";
import { setLoading, setError, setSuccess } from "./globalActions";
import { fetchStates } from "../constants";
import { fetchCategories } from "./categoryActions";
import { productActions } from "../reducers/productReducer";

// Ürünleri getir - daha güvenilir hata yakalama ile
export const fetchProducts = () => async (dispatch) => {
  // Önce loading durumlarını ayarla
  dispatch(setLoading(true));
  dispatch({
    type: productActions.setProductFetchState,
    payload: fetchStates.FETCHING,
  });

  try {
    // API isteğini yap
    const response = await instance.get("/product");

    // Yanıt kontrolü
    if (!response || !response.data) {
      throw new Error("Ürün verisi alınamadı");
    }

    // Ürünleri store'a kaydet
    dispatch({
      type: productActions.setProducts,
      payload: response.data,
    });

    // Başarılı fetch state'i ayarla
    dispatch({
      type: productActions.setProductFetchState,
      payload: fetchStates.FETCHED,
    });

    // Loading durumunu kapat
    dispatch(setLoading(false));

    return response.data;
  } catch (err) {
    console.error("Ürün getirme hatası:", err);

    // Başarısız fetch state'i ayarla
    dispatch({
      type: productActions.setProductFetchState,
      payload: fetchStates.FAILED,
    });

    // Hata mesajını oluştur
    let errorMessage = "Ürünler yüklenirken bir hata oluştu";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    } else if (err.request) {
      errorMessage =
        "Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.";
    } else {
      errorMessage = err.message || errorMessage;
    }

    // Hata mesajını ayarla
    dispatch(setError(errorMessage));

    // Loading durumunu kapat
    dispatch(setLoading(false));

    return { error: errorMessage };
  }
};

// Tek bir ürünü ID'ye göre getir - Sayfa yenilemesinde ürün detayı için
// Düzeltilmiş aksiyon
export const fetchProductById = (productId) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch({
    type: productActions.setProductFetchState,
    payload: fetchStates.FETCHING,
  });

  try {
    console.log("Ürün getiriliyor, ID:", productId);
    // API isteğini yap
    const response = await instance.get(`/product/${productId}`);

    // Yanıt kontrolü
    if (!response || !response.data) {
      throw new Error("Ürün detayı alınamadı");
    }

    console.log("API'den gelen ürün verisi:", response.data);

    // Sadece tek bir action dispatch edelim (daha basit ve güvenilir)
    // API'den gelen ürünü doğrudan products array'ine ekleyelim
    dispatch({
      type: productActions.ADD_PRODUCT,
      payload: response.data,
    });

    // Başarılı fetch state'i ayarla
    dispatch({
      type: productActions.setProductFetchState,
      payload: fetchStates.FETCHED,
    });

    // Loading durumunu kapat
    dispatch(setLoading(false));

    return response.data;
  } catch (err) {
    console.error("Ürün detayı getirme hatası:", err);

    // Başarısız fetch state'i ayarla
    dispatch({
      type: productActions.setProductFetchState,
      payload: fetchStates.FAILED,
    });

    // Hata mesajını oluştur
    let errorMessage = "Ürün detayı yüklenirken bir hata oluştu";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    } else if (err.request) {
      errorMessage =
        "Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.";
    } else {
      errorMessage = err.message || errorMessage;
    }

    // Hata mesajını ayarla
    dispatch(setError(errorMessage));

    // Loading durumunu kapat
    dispatch(setLoading(false));

    return { error: errorMessage };
  }
};

// Kategori ID'sine göre ürünleri getir
export const fetchProductsByCategory = (categoryId) => async (dispatch) => {
  if (!categoryId) {
    return dispatch(fetchProducts());
  }

  dispatch(setLoading(true));
  dispatch({
    type: productActions.setProductFetchState,
    payload: fetchStates.FETCHING,
  });

  try {
    // Kategori ID'sine göre API isteği yap
    // Not: Backend'de böyle bir endpoint varsa kullanılabilir
    // Backend'de yoksa client-side filtreleme tercih edilebilir
    const response = await instance.get(`/product?categoryId=${categoryId}`);

    if (!response || !response.data) {
      throw new Error("Kategori ürünleri alınamadı");
    }

    dispatch({
      type: productActions.setProducts,
      payload: response.data,
    });

    dispatch({
      type: productActions.setProductFetchState,
      payload: fetchStates.FETCHED,
    });

    dispatch(setLoading(false));

    return response.data;
  } catch (err) {
    console.error("Kategori ürünleri getirme hatası:", err);

    dispatch({
      type: productActions.setProductFetchState,
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

// Ürün oluştur
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
    formData.append("image", productData.image);

    //Açıklama varsa ekle
    if (productData.description) {
      formData.append("description", productData.description);
    }

    // API isteği yap
    const response = await instance.post("/product", formData);

    // Ürün oluşturulduktan sonra verileri yeniden getir
    await Promise.all([dispatch(fetchCategories()), dispatch(fetchProducts())]);

    dispatch(setSuccess("Ürün başarıyla oluşturuldu"));
    dispatch(setLoading(false));

    return response.data;
  } catch (err) {
    let errorMessage = "Ürün oluşturulamadı";

    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    } else if (err.request) {
      errorMessage =
        "Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.";
    } else {
      errorMessage = err.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

// Ürün güncelle
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
    await Promise.all([dispatch(fetchCategories()), dispatch(fetchProducts())]);

    dispatch(setSuccess("Ürün başarıyla güncellendi"));
    dispatch(setLoading(false));

    return response.data;
  } catch (err) {
    let errorMessage = "Ürün güncellenemedi";

    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    } else if (err.request) {
      errorMessage =
        "Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.";
    } else {
      errorMessage = err.message || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { error: errorMessage };
  }
};

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
    dispatch(setLoading(false));

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
    dispatch(setLoading(false));
    return { error: errorMessage };
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
      dispatch(setLoading(false));

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
      dispatch(setLoading(false));
      return { error: errorMessage };
    }
  };