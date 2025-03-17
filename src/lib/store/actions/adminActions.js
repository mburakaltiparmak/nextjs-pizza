import { adminActions } from "../reducers/adminReducer";
import { setError, setLoading, setSuccess } from "./globalActions";
import { instance } from "@/lib/hooks";
import { fetchStates, userStatus } from "../constants";

export const setAllUsers = (users) => ({
  type: adminActions.SET_ALL_USERS,
  payload: users,
});

export const setPendingUsers = (users) => ({
  type: adminActions.SET_PENDING_USERS,
  payload: users,
});

export const setDashboardData = (data) => ({
  type: adminActions.SET_DASHBOARD_DATA,
  payload: data,
});

export const updateUserStatusInState = (userId, status) => ({
  type: adminActions.UPDATE_USER_STATUS,
  payload: { userId, status },
});

export const updateUserRoleInState = (userId, role) => ({
  type: adminActions.UPDATE_USER_ROLE,
  payload: { userId, role },
});

export const setAdminFetchState = (state) => ({
  type: adminActions.SET_FETCH_STATE,
  payload: state,
});

export const setAdminError = (error) => ({
  type: adminActions.SET_ERROR,
  payload: error,
});

// Tüm kullanıcıları getir
export const fetchAllUsers = () => async (dispatch) => {
  dispatch(setAdminFetchState(fetchStates.FETCHING));

  try {
    const response = await instance.get("/admin/users");
    
    dispatch(setAllUsers(response.data));
    dispatch(setAdminFetchState(fetchStates.FETCHED));

    return response.data;
  } catch (err) {
    dispatch(setAdminFetchState(fetchStates.FAILED));

    let errorMessage = "Kullanıcılar yüklenemedi";
    if (err.response) {
      errorMessage = err.response.data || errorMessage;
    }

    dispatch(setAdminError(errorMessage));
    return { error: errorMessage };
  }
};

// Onay bekleyen kullanıcıları getir
export const fetchPendingUsers = () => async (dispatch) => {
  dispatch(setAdminFetchState(fetchStates.FETCHING));

  try {
    const response = await instance.get("/admin/users/pending");

    dispatch(setPendingUsers(response.data));
    dispatch(setAdminFetchState(fetchStates.FETCHED));

    return response.data;
  } catch (err) {
    dispatch(setAdminFetchState(fetchStates.FAILED));

    let errorMessage = "Bekleyen kullanıcılar yüklenemedi";
    if (err.response) {
      errorMessage = err.response.data || errorMessage;
    }

    dispatch(setAdminError(errorMessage));
    return { error: errorMessage };
  }
};

// Dashboard verilerini getir
export const fetchDashboard = () => async (dispatch) => {
  dispatch(setAdminFetchState(fetchStates.FETCHING));

  try {
    // Dashboard bilgilerini toplamak için birden fazla API isteği yapabiliriz
    const categoriesResponse = await instance.get("/category");
    const usersResponse = await instance.get("/admin/users");
    
    // Kategori ve kullanıcı verilerini işle
    const categories = categoriesResponse.data || [];
    const users = usersResponse.data || [];
    
    // Ürün ve stok bilgilerini hesapla
    let totalProducts = 0;
    let totalStock = 0;
    let categoryData = [];
    
    categories.forEach(category => {
      if (category.products && Array.isArray(category.products)) {
        const productCount = category.products.length;
        totalProducts += productCount;
        
        let categoryStock = 0;
        category.products.forEach(product => {
          categoryStock += product.stock || 0;
        });
        
        totalStock += categoryStock;
        
        // Kategori verilerini grafik için hazırla
        categoryData.push({
          name: category.name,
          ürünSayısı: productCount,
          stokMiktarı: categoryStock
        });
      }
    });
    
    // Dashboard verilerini derle
    const dashboardData = {
      totalCategories: categories.length,
      totalProducts,
      totalStock,
      totalUsers: users.length,
      categoryData,
      categories, // Tüm kategori verilerini de ekle
      users // Tüm kullanıcı verilerini de ekle
    };
    
    dispatch(setDashboardData(dashboardData));
    dispatch(setAllUsers(users)); // Kullanıcı verilerini de Redux store'a ekle
    dispatch(setAdminFetchState(fetchStates.FETCHED));
    
    return dashboardData;
  } catch (err) {
    dispatch(setAdminFetchState(fetchStates.FAILED));
    
    let errorMessage = "Dashboard verileri yüklenemedi";
    console.error("Dashboard veri hatası:", err);
    
    if (err.response) {
      errorMessage = err.response.data || errorMessage;
    }
    
    dispatch(setAdminError(errorMessage));
    return { error: errorMessage };
  }
};

// Kullanıcı onayla - Backend'e uygun olarak POST metodu kullanıyoruz
export const approveUser = (userId) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    await instance.post(`/admin/users/${userId}/approve`);

    dispatch(updateUserStatusInState(userId, userStatus.ACTIVE));
    dispatch(setLoading(false));
    dispatch(setSuccess("Kullanıcı başarıyla onaylandı"));

    return { success: true };
  } catch (err) {
    let errorMessage = "Kullanıcı onaylanamadı";

    if (err.response) {
      errorMessage = err.response.data || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));

    return { error: errorMessage };
  }
};

// Kullanıcı reddet - Backend'e uygun olarak POST metodu kullanıyoruz
export const rejectUser = (userId) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    await instance.post(`/admin/users/${userId}/reject`);

    dispatch(updateUserStatusInState(userId, userStatus.REJECTED));
    dispatch(setLoading(false));
    dispatch(setSuccess("Kullanıcı başarıyla reddedildi"));

    return { success: true };
  } catch (err) {
    let errorMessage = "Kullanıcı reddedilemedi";

    if (err.response) {
      errorMessage = err.response.data || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));

    return { error: errorMessage };
  }
};

// Kullanıcı rolünü güncelle - Backend'e uygun olarak PUT metodu kullanıyoruz
export const updateUserRole = (userId, role) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    // Backend PUT /api/admin/users/{id}/role?role=XXXX bekliyor
    await instance.put(`/admin/users/${userId}/role`, null, {
      params: { role: role }
    });

    dispatch(updateUserRoleInState(userId, role));
    dispatch(setLoading(false));
    dispatch(setSuccess("Kullanıcı rolü başarıyla güncellendi"));

    return { success: true };
  } catch (err) {
    let errorMessage = "Kullanıcı rolü güncellenemedi";

    if (err.response) {
      errorMessage = err.response.data || errorMessage;
    }

    dispatch(setError(errorMessage));
    dispatch(setLoading(false));

    return { error: errorMessage };
  }
};