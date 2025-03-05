import { instance } from "@/lib/hooks";
import {
  fetchStates,
  productActions,
} from "../reducers/productReducersFromApi";


const handleApiError = (err, dispatch) => {
  console.error("API Error:", err);
  dispatch(setError(err.message || "Beklenmeyen bir hata oluştu"));
  dispatch(setFetchState(fetchStates.FAILED));
  dispatch(setLoading(false));
};

// GET REQUESTS

export const fetchProducts = () => async (dispatch) => {
  dispatch(setFetchState(fetchStates.FETCHING));
  dispatch(setLoading(true));
  dispatch(setError(null)); // Hata varsa temizle

  try {
    const res = await instance.get("/product");
    const data = res.data;
    console.log("product data : \n", data);
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

// POST REQUESTS

export const postNewProduct = (formData) => async (dispatch) => {
  const token = localStorage.getItem("token");
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    console.log("Gönderilecek form verileri:", formData);
    // FormData nesnesi oluştur
    const formDataObj = new FormData();
    // Form verilerini ekle ve konsola logla
    formDataObj.append("name", formData.name);
    formDataObj.append("rating", formData.rating.toString());
    formDataObj.append("stock", formData.stock.toString());
    formDataObj.append("price", formData.price.toString());
    formDataObj.append("image", formData.image);
    formDataObj.append("categoryId", formData.categoryId);
    // FormData içeriğini kontrol et
    console.log("FormData gönderiliyor...");
    for (let pair of formDataObj.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }
    const res = await instance.post("/product", formDataObj, {
      headers: {
        Authorization: `Bearer ${token}`,
        // multipart/form-data için Content-Type header'ı axios tarafından otomatik ayarlanır
        // Content-Type header'ını manuel olarak eklemeyin
      },
    });

    console.log("API Yanıtı:", res.data);

    dispatch(setLoading(false));
    // Başarılı işlem sonrası ürünleri yeniden yükle
    dispatch(fetchProducts());
    return res.data;
  } catch (err) {
    console.error("API İsteği Hatası:", err);
    console.error(
      "Hata Detayları:",
      err.response ? err.response.data : "Yanıt yok"
    );
    handleApiError(err, dispatch);
    return null;
  }
};
export const postNewCategory = (formData) => async (dispatch) => {
  const token = localStorage.getItem("token");
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    console.log("Kategori verileri:", formData);

    // FormData nesnesini kontrol et
    if (!formData.name) {
      throw new Error("Kategori adı gereklidir");
    }

    if (!formData.image) {
      console.warn("Resim seçilmedi! Yine de devam ediliyor...");
    }

    // FormData nesnesi oluştur
    const formDataObj = new FormData();

    // Form verilerini ekle
    formDataObj.append("name", formData.name);

    // Eğer resim varsa ekle
    if (formData.image) {
      formDataObj.append("image", formData.image);
      console.log("Eklenen resim dosyası:", formData.image.name);
    }

    // FormData içeriğini kontrol et
    console.log("FormData içeriği:");
    for (let pair of formDataObj.entries()) {
      console.log(
        pair[0] + ": " + (pair[1] instanceof File ? pair[1].name : pair[1])
      );
    }

    // Axios isteğinin yapılandırması
    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        // multipart/form-data için Content-Type header'ı axios tarafından otomatik ayarlanır
      },
    };

    console.log(
      "API isteği gönderiliyor:",
      "/category",
      "Metod: POST",
      "Config:",
      config
    );

    const res = await instance.post("/category", formDataObj, config);

    console.log("API Yanıtı:", res.data);

    // Başarılı işlem sonrası kategorileri yeniden yükle
    // Bu kısmı düzenliyoruz - burada fetchCategoriesWithProducts'ı çağırıyoruz ve 
    // await ile bekliyoruz ki işlem tamamlanana kadar promise'i çözmesin
    await dispatch(fetchCategoriesWithProducts());
    
    // Toast notification'ı kullanıyoruz
    toast({
      title: "Başarılı",
      description: "Kategori başarıyla eklendi."
    });
    
    dispatch(setLoading(false));
    
    // API'den gelen datayı geri döndürüyoruz ki component içinde kullanabilelim
    return res.data;
  } catch (err) {
    console.error("API İsteği Hatası:", err);
    console.error(
      "Hata Detayları:",
      err.response
        ? {
            status: err.response.status,
            statusText: err.response.statusText,
            data: err.response.data,
          }
        : "Yanıt yok"
    );

    // Hata mesajını toast ile gösteriyoruz
    toast({
      title: "Hata",
      description: err.response?.data?.message || "Kategori eklenirken bir hata oluştu",
      variant: "destructive"
    });

    handleApiError(err, dispatch);
    return null;
  }
};

// PUT REQUESTS 

export const updateProduct = (formData,id) => async (dispatch) => {

}
export const updateCategory = (formData,id) => async (dispatch) => {

}

// DELETE REQUESTS

export const deleteProduct = (id) => async (dispatch) => {
  const token = localStorage.getItem("token");
  dispatch(setLoading(true));
  dispatch(setError(null));
  try {
    const res = await instance.delete(`/product/${id}`,{
      headers : {
        Authorization : `Bearer ${token}`
      }
    });
    console.log("Delete requests API response : \n",res.data);
    dispatch(setLoading(false));
    dispatch(fetchProducts());
    dispatch(fetchCategoriesWithProducts());
    return res.data;
  }
  catch (err) {
    console.error("Delete request hatası : ",err);
    handleApiError(err,dispatch);
    return null;
  }
}
export const deleteCategory = (id) => async (dispatch) => {
  const token = localStorage.getItem("token");
  dispatch(setLoading(true));
  dispatch(setError(null));
  
  try {
    const res = await instance.delete(`/category/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Delete requests API response:", res.data);
    dispatch(setLoading(false));
    dispatch(fetchProducts());
    dispatch(fetchCategoriesWithProducts());
    return res.data;
    
  } catch (err) {
    console.error("Delete request error:", err);
    
    // Enhanced error logging
    if (err.response) {
      // The server responded with a status code outside the 2xx range
      console.error("Error response data:", err.response.data);
      console.error("Error response status:", err.response.status);
      console.error("Error response headers:", err.response.headers);
      
      // Set a more descriptive error message based on server response
      dispatch(setError(err.response.data?.message || `Server error (${err.response.status}): Unable to delete category`));
    } else if (err.request) {
      // The request was made but no response was received
      console.error("Error request:", err.request);
      dispatch(setError("No response received from server. Please check your connection."));
    } else {
      // Something happened in setting up the request
      console.error("Error message:", err.message);
      dispatch(setError(err.message || "An unexpected error occurred"));
    }
    
    dispatch(setLoading(false));
    handleApiError(err, dispatch);
    return null;
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
