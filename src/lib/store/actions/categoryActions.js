import { instance } from "@/lib/hooks";
import {
  fetchStates,
  categoryActions,
} from "../reducers/categoryReducer";
import { toast } from "react-toastify";
import CustomToastContent from "@/components/ui/customToastContent";
import { fetchProducts } from "./productActionsFromApi";
import { setError, setLoading, handleApiError } from "./globalActions";

// GET REQUESTS

export const fetchCategoriesWithProducts = () => async (dispatch) => {
  dispatch(setFetchState(fetchStates.FETCHING));
  dispatch(setLoading(true));
  dispatch(setError(null)); // Hata varsa temizle

  try {
    const res = await instance.get("/category");
    dispatch(setCategories(res.data));
    dispatch(setFetchState(fetchStates.FETCHED));
    dispatch(setLoading(false));
    return res.data;
  } catch (err) {
    handleApiError(err, dispatch, "Categories", setFetchState, fetchStates);
    return null;
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
    console.log("categories : ",res.data);
    return res.data;
  } catch (err) {
    handleApiError(err, dispatch, "Categories", setFetchState, fetchStates);
    return null;
  }
};

export const fetchCategoryById = (id) => async (dispatch) => {
  if (!id) return null; // Geçersiz ID kontrolü ekleyelim

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
    handleApiError(err, dispatch, "Categories", setFetchState, fetchStates);
    return null;
  }
};

//POST REQUEST

export const postNewCategory = (formData) => async (dispatch) => {
  const token = localStorage.getItem("token");
  dispatch(setLoading(true));
  dispatch(setError(null));
  dispatch(setFetchState(fetchStates.FETCHING));

  try {
    // Form validasyonu
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
    }

    // Axios isteğinin yapılandırması
    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
    
    const res = await instance.post("/category", formDataObj, config);
    
    // Başarılı işlem sonrası kategorileri yeniden yükle
    dispatch(fetchCategoriesWithProducts());
    
    // İşlem tamamlandığında loading state'ini false yapın
    dispatch(setFetchState(fetchStates.FETCHED));
    dispatch(setLoading(false));
    
    // Başarılı işlem bildirimi
    toast.success(
      <CustomToastContent
        title={`${res.data.name} başarıyla eklendi`}
        image={formData.image instanceof File ? URL.createObjectURL(formData.image) : formData.preview} 
      />
    );
    
    return res.data;
  } catch (err) {
    handleApiError(err, dispatch, "Category Add", setFetchState, fetchStates);
    return null;
  }
};

// PUT REQUEST

export const updateCategory = (formData, id) => async (dispatch) => {
  const token = localStorage.getItem("token");
  dispatch(setLoading(true));
  dispatch(setError(null));
  dispatch(setFetchState(fetchStates.FETCHING));

  try {
    // Form validasyonu
    if (!formData.name) {
      throw new Error("Kategori adı gereklidir");
    }

    // FormData nesnesi oluştur
    const formDataObj = new FormData();

    // Form verilerini ekle
    formDataObj.append("name", formData.name);

    // Eğer resim varsa ekle
    if (formData.image) {
      formDataObj.append("image", formData.image);
    }

    // Axios isteğinin yapılandırması
    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
    
    const res = await instance.put(`/category/${id}`, formDataObj, config);
    
    // Başarılı işlem sonrası kategorileri yeniden yükle
    dispatch(fetchCategoriesWithProducts());
    
    // İşlem tamamlandığında loading state'ini false yapın
    dispatch(setFetchState(fetchStates.FETCHED));
    dispatch(setLoading(false));
    
    // Başarılı işlem bildirimi
    toast.success(`"${formData.name}" başarıyla güncellendi`);
    
    return res.data;
  } catch (err) {
    handleApiError(err, dispatch, "Category Update", setFetchState, fetchStates);
    return null;
  }
};

// DELETE REQUEST

export const deleteCategory = (id) => async (dispatch) => {
  const token = localStorage.getItem("token");
  dispatch(setLoading(true));
  dispatch(setError(null));
  dispatch(setFetchState(fetchStates.FETCHING));
  
  try {
    const res = await instance.delete(`/category/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // İşlemi tamamla
    dispatch(setFetchState(fetchStates.FETCHED));
    dispatch(setLoading(false));
    
    // Diğer verileri güncelle
    dispatch(fetchProducts());
    dispatch(fetchCategoriesWithProducts());
    
    return res.data;
  } catch (err) {
    handleApiError(err, dispatch, "Category Delete", setFetchState, fetchStates);
    return null;
  }
};

// Action creators
export const setCategories = (categories) => ({
  type: categoryActions.setCategories,
  payload: categories,
});

export const setFetchState = (fetchState) => ({
  type: categoryActions.setFetchState,
  payload: fetchState,
});

export const setSelectedCategory = (selectedCategory) => ({
  type: categoryActions.setSelectedCategory,
  payload: selectedCategory,
});