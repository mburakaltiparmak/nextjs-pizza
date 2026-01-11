// src/lib/store/actions/adminActions.js
import { adminActions } from "../reducers/adminReducer";
import { setError, setLoading, setSuccess } from "./globalActions";
import { instance } from "@/lib/hooks";
import { fetchStates, userStatus } from "../constants";
import { handleApiError } from "../middleware/errorMiddleware";
import cache from "@/lib/utils/cacheManager";

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

// Cache keys
const DASHBOARD_CACHE_KEY = 'dashboard_data';


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
    return handleApiError(err, dispatch, 'fetchAllUsers');
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
    return handleApiError(err, dispatch, 'fetchPendingUsers');
  }
};

// ✅ OPTIMIZED: Backend DTO endpoint'ini kullan
export const fetchDashboard = (forceRefresh = false) => async (dispatch) => {
  // ✅ Cache kontrolü
  if (!forceRefresh) {
    const cachedData = cache.get(DASHBOARD_CACHE_KEY);
    if (cachedData) {
      console.log("✅ Dashboard Cache Hit - Returning cached data");
      dispatch(setDashboardData(cachedData));
      dispatch(setAdminFetchState(fetchStates.FETCHED));
      return cachedData;
    }
  }

  console.log("🔄 Fetching dashboard data from optimized DTO endpoint...");
  dispatch(setAdminFetchState(fetchStates.FETCHING));

  try {
    // ✅ Tek istek - Backend DTO ile her şeyi gönderiyor
    const response = await instance.get("/admin/dashboard");
    const dto = response.data;

    console.log("📊 Backend DTO Response:", {
      totalCategories: dto.totalCategories,
      totalProducts: dto.totalProducts,
      totalStock: dto.totalStock,
      totalUsers: dto.totalUsers,
      categoriesCount: dto.categories?.length || 0
    });

    // ✅ DTO'dan categories array'ini al (products dahil)
    const categories = dto.categories || [];

    // ✅ CUSTOM_BASE kategorisini filtrele
    const filteredCategories = categories.filter(
      cat => cat.name !== "CUSTOM_BASE"
    );

    // ✅ Frontend için categoryData hazırla (DTO'da zaten hesaplanmış)
    const categoryData = filteredCategories.map(category => {
      console.log(`📦 Category "${category.name}":`, {
        productCount: category.productCount, // ✅ Backend'den hazır
        totalStock: category.totalStock      // ✅ Backend'den hazır
      });

      return {
        name: category.name,
        ürünSayısı: category.productCount || 0,  // ✅ Backend'den hazır
        stokMiktarı: category.totalStock || 0     // ✅ Backend'den hazır
      };
    }).filter(cat => cat.ürünSayısı > 0); // Boş kategorileri filtrele

    console.log("📊 Processed Category Data:", categoryData);

    // ✅ Dashboard state'i oluştur
    const dashboardData = {
      // DTO'dan direkt değerler
      totalCategories: filteredCategories.length, // CUSTOM_BASE hariç
      totalProducts: dto.totalProducts || 0,
      totalStock: dto.totalStock || 0,
      totalUsers: dto.totalUsers || 0,

      // Processed data
      categoryData: categoryData,

      // Raw data (gerekirse kullanılabilir)
      categories: filteredCategories,
      recentProducts: dto.recentProducts || []
    };

    console.log("✅ Final Dashboard Data:", {
      totalCategories: dashboardData.totalCategories,
      totalProducts: dashboardData.totalProducts,
      totalStock: dashboardData.totalStock,
      totalUsers: dashboardData.totalUsers,
      categoryDataLength: dashboardData.categoryData.length,
      sampleCategory: dashboardData.categoryData[0]
    });

    // ✅ Cache'e kaydet (1 dakika)
    cache.set(DASHBOARD_CACHE_KEY, dashboardData, 60000);

    // ✅ Redux'a kaydet
    dispatch(setDashboardData(dashboardData));
    dispatch(setAdminFetchState(fetchStates.FETCHED));

    return dashboardData;
  } catch (err) {
    console.error("❌ Dashboard fetch error:", err);
    dispatch(setAdminFetchState(fetchStates.FAILED));

    // ✅ Hata durumunda cache'i temizle
    cache.clear(DASHBOARD_CACHE_KEY);

    return handleApiError(err, dispatch, 'fetchDashboard');
  }
};

// Cache'i temizle - veri güncellemelerinde kullan
export const clearDashboardCache = () => {
  cache.clear(DASHBOARD_CACHE_KEY);
  console.log("🗑️ Dashboard cache cleared");
};

// Kullanıcı onayla
export const approveUser = (userId) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    await instance.post(`/admin/users/${userId}/approve`);

    dispatch(updateUserStatusInState(userId, userStatus.ACTIVE));
    dispatch(setSuccess("Kullanıcı onaylandı"));
    dispatch(setLoading(false));

    clearDashboardCache();
    return { success: true };
  } catch (err) {
    dispatch(setLoading(false));
    return handleApiError(err, dispatch, 'approveUser');
  }
};

// Kullanıcı reddet
export const rejectUser = (userId) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    await instance.post(`/admin/users/${userId}/reject`);

    dispatch(updateUserStatusInState(userId, userStatus.REJECTED));
    dispatch(setSuccess("Kullanıcı reddedildi"));
    dispatch(setLoading(false));

    clearDashboardCache();
    return { success: true };
  } catch (err) {
    dispatch(setLoading(false));
    return handleApiError(err, dispatch, 'rejectUser');
  }
};

// Kullanıcı rolünü güncelle
export const updateUserRole = (userId, role) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    await instance.put(`/admin/users/${userId}/role`, null, {
      params: { role }
    });

    dispatch(updateUserRoleInState(userId, role));
    dispatch(setSuccess("Kullanıcı rolü güncellendi"));
    dispatch(setLoading(false));

    clearDashboardCache();
    return { success: true };
  } catch (err) {
    dispatch(setLoading(false));
    return handleApiError(err, dispatch, 'updateUserRole');
  }
};

// Siparişleri yeniden indeksle (Elasticsearch Reindex)
export const reindexOrders = () => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const response = await instance.post("/orders/admin/reindex");

    dispatch(setSuccess("Siparişler yeniden indeksleniyor. Bu işlem arka planda devam edecek."));
    dispatch(setLoading(false));

    return { success: true, message: response.data };
  } catch (err) {
    dispatch(setLoading(false));
    return handleApiError(err, dispatch, 'reindexOrders');
  }
};

// Ürünleri yeniden indeksle
export const reindexProducts = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await instance.post("/product/reindex"); // Endpoint per updates.txt
    dispatch(setSuccess("Ürünler yeniden indeksleniyor."));
    dispatch(setLoading(false));
    return { success: true, message: response.data };
  } catch (err) {
    dispatch(setLoading(false));
    return handleApiError(err, dispatch, 'reindexProducts');
  }
};

// Kategorileri yeniden indeksle
export const reindexCategories = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await instance.post("/category/reindex"); // Endpoint per updates.txt
    dispatch(setSuccess("Kategoriler yeniden indeksleniyor."));
    dispatch(setLoading(false));
    return { success: true, message: response.data };
  } catch (err) {
    dispatch(setLoading(false));
    return handleApiError(err, dispatch, 'reindexCategories');
  }
};

// Kullanıcıları yeniden indeksle
export const reindexUsers = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await instance.post("/admin/users/reindex"); // Endpoint per updates.txt
    dispatch(setSuccess("Kullanıcılar yeniden indeksleniyor."));
    dispatch(setLoading(false));
    return { success: true, message: response.data };
  } catch (err) {
    dispatch(setLoading(false));
    return handleApiError(err, dispatch, 'reindexUsers');
  }
};