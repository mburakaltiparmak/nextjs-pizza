// src/lib/store/actions/adminActions.js
import { adminActions } from "../reducers/adminReducer";
import { setError, setLoading, setSuccess } from "./globalActions";
import { instance } from "@/lib/hooks";
import { fetchStates, userStatus } from "../constants";
import { handleApiError } from "../middleware/errorMiddleware";

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

// Cache mekanizması
let dashboardCache = null;
let dashboardCacheTimestamp = 0;
const DASHBOARD_CACHE_DURATION = 60000; // 1 dakika

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

// ✅ PROBLEM #1 & #19 ÇÖZÜMÜ: Dashboard verilerini optimize edilmiş şekilde getir
export const fetchDashboard = (forceRefresh = false) => async (dispatch) => {
  // ✅ Cache kontrolü
  const now = Date.now();
  if (!forceRefresh && dashboardCache && (now - dashboardCacheTimestamp) < DASHBOARD_CACHE_DURATION) {
    console.log("✅ Dashboard Cache Hit - Returning cached data");
    dispatch(setDashboardData(dashboardCache));
    dispatch(setAllUsers(dashboardCache.users || []));
    dispatch(setAdminFetchState(fetchStates.FETCHED));
    return dashboardCache;
  }

  console.log("🔄 Fetching fresh dashboard data...");
  dispatch(setAdminFetchState(fetchStates.FETCHING));

  try {
    // ✅ Parallel requests - Dashboard ve Users aynı anda
    const [dashboardResponse, usersResponse] = await Promise.all([
      instance.get("/admin/dashboard"),
      instance.get("/admin/users")
    ]);

    const dashboardStats = dashboardResponse.data;
    const users = usersResponse.data || [];

    console.log("📊 Backend Dashboard Response:", {
      totalCategories: dashboardStats.totalCategories,
      totalProducts: dashboardStats.totalProducts,
      totalStock: dashboardStats.totalStock,
      categoriesCount: dashboardStats.categories?.length || 0
    });

    // ✅ DÜZELTME: Backend'den gelen categories array'ini işle
    const categories = dashboardStats.categories || [];
    
    // ✅ Her kategori için veri hazırla
    const categoryData = categories.map(category => {
      // Backend'den category.products array'i geliyor mu kontrol et
      const products = category.products || [];
      const productCount = products.length;
      const stockTotal = products.reduce((sum, p) => sum + (p.stock || 0), 0);
      
      console.log(`📦 Category: ${category.name}`, { 
        productCount, 
        stockTotal,
        hasProducts: products.length > 0 
      });
      
      return {
        name: category.name,
        ürünSayısı: productCount,
        stokMiktarı: stockTotal
      };
    });

    // ✅ Dashboard data'yı hazırla
    const dashboardData = {
      // Backend'den gelen değerleri kullan
      totalCategories: dashboardStats.totalCategories || categories.length || 0,
      totalProducts: dashboardStats.totalProducts || 0,
      totalStock: dashboardStats.totalStock || 0,
      totalUsers: users.length,
      // Raw data
      categories: categories,
      users: users,
      // İşlenmiş kategori verileri (grafik ve tablo için)
      categoryData: categoryData
    };

    console.log("✅ Prepared Dashboard Data:", {
      totalCategories: dashboardData.totalCategories,
      totalProducts: dashboardData.totalProducts,
      totalStock: dashboardData.totalStock,
      totalUsers: dashboardData.totalUsers,
      categoryDataLength: dashboardData.categoryData.length,
      categoryDataSample: dashboardData.categoryData[0]
    });

    // ✅ Cache'e kaydet
    dashboardCache = dashboardData;
    dashboardCacheTimestamp = now;
    console.log(`📦 Dashboard cached for ${DASHBOARD_CACHE_DURATION/1000} seconds`);

    // ✅ Redux'a kaydet
    dispatch(setDashboardData(dashboardData));
    dispatch(setAllUsers(users));
    dispatch(setAdminFetchState(fetchStates.FETCHED));

    return dashboardData;
  } catch (err) {
    console.error("❌ Dashboard fetch error:", err);
    dispatch(setAdminFetchState(fetchStates.FAILED));
    
    // ✅ Hata durumunda cache'i temizle
    dashboardCache = null;
    dashboardCacheTimestamp = 0;
    
    return handleApiError(err, dispatch, 'fetchDashboard');
  }
};

// Cache'i temizle - veri güncellemelerinde kullanılır
export const clearDashboardCache = () => {
  dashboardCache = null;
  dashboardCacheTimestamp = 0;
  console.log("🗑️ Dashboard cache cleared");
};

// Kullanıcı onayla
export const approveUser = (userId) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    await instance.post(`/admin/users/${userId}/approve`);

    dispatch(updateUserStatus(userId, userStatus.ACTIVE));
    dispatch(setSuccess("Kullanıcı onaylandı"));
    dispatch(setLoading(false));

    // ✅ Dashboard cache'ini temizle (kullanıcı sayısı değişti)
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

    dispatch(updateUserStatus(userId, userStatus.REJECTED));
    dispatch(setSuccess("Kullanıcı reddedildi"));
    dispatch(setLoading(false));

    // ✅ Dashboard cache'ini temizle (kullanıcı sayısı değişti)
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

    dispatch({
      type: adminActions.UPDATE_USER_ROLE,
      payload: { userId, role }
    });

    dispatch(setSuccess("Kullanıcı rolü güncellendi"));
    dispatch(setLoading(false));

    // ✅ Dashboard cache'ini temizle (kullanıcı bilgisi değişti)
    clearDashboardCache();

    return { success: true };
  } catch (err) {
    dispatch(setLoading(false));
    return handleApiError(err, dispatch, 'updateUserRole');
  }
};