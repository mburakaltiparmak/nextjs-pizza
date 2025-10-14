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
  // Cache kontrolü
  const now = Date.now();
  if (!forceRefresh && dashboardCache && (now - dashboardCacheTimestamp) < DASHBOARD_CACHE_DURATION) {
    dispatch(setDashboardData(dashboardCache));
    dispatch(setAllUsers(dashboardCache.users || []));
    dispatch(setAdminFetchState(fetchStates.FETCHED));
    return dashboardCache;
  }

  dispatch(setAdminFetchState(fetchStates.FETCHING));

  try {
    // ÇÖZÜM: Promise.all ile paralel istekler - performans artışı
    const [dashboardResponse, usersResponse] = await Promise.all([
      instance.get("/admin/dashboard"),
      instance.get("/admin/users")
    ]);

    const dashboardStats = dashboardResponse.data;
    const users = usersResponse.data || [];

    // Backend'den gelen dashboard stats'i kullan
    const dashboardData = {
      totalCategories: dashboardStats.totalCategories || 0,
      totalProducts: dashboardStats.totalProducts || 0,
      totalStock: dashboardStats.totalStock || 0,
      totalUsers: users.length,
      categories: dashboardStats.categories || [],
      users: users,
      // Grafik için kategori verilerini hazırla
      categoryData: (dashboardStats.categories || []).map(category => ({
        name: category.name,
        ürünSayısı: category.products?.length || 0,
        stokMiktarı: category.products?.reduce((sum, p) => sum + (p.stock || 0), 0) || 0
      }))
    };

    // Cache'e kaydet
    dashboardCache = dashboardData;
    dashboardCacheTimestamp = now;

    dispatch(setDashboardData(dashboardData));
    dispatch(setAllUsers(users));
    dispatch(setAdminFetchState(fetchStates.FETCHED));

    return dashboardData;
  } catch (err) {
    dispatch(setAdminFetchState(fetchStates.FAILED));
    
    // Cache'i temizle
    dashboardCache = null;
    dashboardCacheTimestamp = 0;
    
    return handleApiError(err, dispatch, 'fetchDashboard');
  }
};

// Cache'i temizle - veri güncellemelerinde kullanılır
export const clearDashboardCache = () => {
  dashboardCache = null;
  dashboardCacheTimestamp = 0;
};

// Kullanıcı onayla
export const approveUser = (userId) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    await instance.post(`/admin/users/${userId}/approve`);

    dispatch(updateUserStatusInState(userId, userStatus.ACTIVE));
    dispatch(setLoading(false));
    dispatch(setSuccess("Kullanıcı başarıyla onaylandı"));

    // Cache'i temizle
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
    dispatch(setLoading(false));
    dispatch(setSuccess("Kullanıcı reddedildi"));

    // Cache'i temizle
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
      params: { role },
    });

    dispatch(updateUserRoleInState(userId, role));
    dispatch(setLoading(false));
    dispatch(setSuccess("Kullanıcı rolü güncellendi"));

    // Cache'i temizle
    clearDashboardCache();

    return { success: true };
  } catch (err) {
    dispatch(setLoading(false));
    return handleApiError(err, dispatch, 'updateUserRole');
  }
};