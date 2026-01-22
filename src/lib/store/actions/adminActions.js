import { adminActions } from "../reducers/adminReducer";
import { setError, setSuccess } from "./globalActions";
import { instance } from "@/lib/hooks";
import { fetchStates, userStatus } from "../constants";
import { handleApiError } from "../middleware/errorMiddleware";
import cache from "@/lib/utils/cacheManager";

// ========================================
// CACHE KEYS
// ========================================
const DASHBOARD_CACHE_KEY = 'dashboard_data';

// ========================================
// SIMPLE ACTION CREATORS - User Management
// ========================================

/**
 * Tüm kullanıcıları state'e set eder
 */
export const setAllUsers = (users) => ({
  type: adminActions.SET_ALL_USERS,
  payload: users,
});

/**
 * Bekleyen kullanıcıları state'e set eder
 */
export const setPendingUsers = (users) => ({
  type: adminActions.SET_PENDING_USERS,
  payload: users,
});

/**
 * Kullanıcı pagination bilgisini set eder
 */
export const setUsersPagination = (pagination) => ({
  type: adminActions.SET_USERS_PAGINATION,
  payload: pagination,
});

/**
 * Kullanıcı durumunu state'de günceller
 */
export const updateUserStatusInState = (userId, status) => ({
  type: adminActions.UPDATE_USER_STATUS,
  payload: { userId, status },
});

/**
 * Kullanıcı rolünü state'de günceller
 */
export const updateUserRoleInState = (userId, role) => ({
  type: adminActions.UPDATE_USER_ROLE,
  payload: { userId, role },
});

/**
 * Kullanıcı fetch state'ini set eder
 */
export const setUsersFetchState = (state) => ({
  type: adminActions.SET_USERS_FETCH_STATE,
  payload: state,
});

// ========================================
// SIMPLE ACTION CREATORS - Dashboard
// ========================================

/**
 * Dashboard verilerini state'e set eder
 */
export const setDashboardData = (data) => ({
  type: adminActions.SET_DASHBOARD_DATA,
  payload: data,
});

/**
 * Dashboard fetch state'ini set eder
 */
export const setDashboardFetchState = (state) => ({
  type: adminActions.SET_DASHBOARD_FETCH_STATE,
  payload: state,
});

// ========================================
// SIMPLE ACTION CREATORS - Analytics
// ========================================

/**
 * Analytics verilerini state'e set eder
 */
export const setAnalyticsData = (data) => ({
  type: adminActions.SET_ANALYTICS_DATA,
  payload: data,
});

/**
 * Gelir verilerini state'e set eder
 */
export const setRevenueData = (revenue) => ({
  type: adminActions.SET_REVENUE_DATA,
  payload: revenue,
});

/**
 * Stok metriklerini state'e set eder
 */
export const setStockMetrics = (metrics) => ({
  type: adminActions.SET_STOCK_METRICS,
  payload: metrics,
});

/**
 * Kullanıcı metriklerini state'e set eder
 */
export const setUserMetrics = (metrics) => ({
  type: adminActions.SET_USER_METRICS,
  payload: metrics,
});

// ========================================
// SIMPLE ACTION CREATORS - Reindex
// ========================================

/**
 * Reindex durumunu set eder
 * @param {string} entity - 'orders' | 'products' | 'categories' | 'users'
 * @param {string} status - 'idle' | 'loading' | 'success' | 'error'
 * @param {string} message - Durum mesajı
 */
export const setReindexStatus = (entity, status, message = null) => ({
  type: adminActions.SET_REINDEX_STATUS,
  payload: { entity, status, message },
});

// ========================================
// SIMPLE ACTION CREATORS - Global
// ========================================

/**
 * Admin loading state'ini set eder
 */
export const setAdminLoading = (loading) => ({
  type: adminActions.SET_LOADING,
  payload: loading,
});

/**
 * Admin error state'ini set eder
 */
export const setAdminError = (error) => ({
  type: adminActions.SET_ERROR,
  payload: error,
});

/**
 * Admin state'ini resetler
 */
export const resetAdminState = () => ({
  type: adminActions.RESET_STATE,
});

// ========================================
// ASYNC THUNKS - User Management
// ========================================

/**
 * Tüm kullanıcıları getirir (Paginated + Search)
 * @param {number} page - Sayfa numarası (0-indexed)
 * @param {number} size - Sayfa başına kayıt
 * @param {string} search - Arama terimi
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const fetchAllUsers = (page = 0, size = 10, search = "") => async (dispatch) => {
  dispatch(setUsersFetchState(fetchStates.FETCHING));
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.get("/admin/users/paged", {
      params: {
        page,
        size,
        search,
        sort: "id,desc"
      }
    });

    // Handle paged response
    const users = response.data.content || response.data;

    if (response.data.page) {
      dispatch(setUsersPagination({
        page: response.data.page.number,
        size: response.data.page.size,
        totalPages: response.data.page.totalPages,
        totalElements: response.data.page.totalElements
      }));
    }

    dispatch(setAllUsers(users));
    dispatch(setUsersFetchState(fetchStates.FETCHED));

    return { success: true, data: response.data };
  } catch (err) {
    dispatch(setUsersFetchState(fetchStates.FAILED));
    return handleApiError(err, dispatch, 'fetchAllUsers');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Bekleyen kullanıcıları getirir (Paginated)
 * @param {number} page - Sayfa numarası (0-indexed)
 * @param {number} size - Sayfa başına kayıt
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const fetchPendingUsers = (page = 0, size = 10) => async (dispatch) => {
  dispatch(setUsersFetchState(fetchStates.FETCHING));
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.get("/admin/users/pending", {
      params: {
        page,
        size,
        sort: "id,desc"
      }
    });

    const users = response.data.content || response.data;

    if (response.data.page) {
      dispatch(setUsersPagination({
        page: response.data.page.number,
        size: response.data.page.size,
        totalPages: response.data.page.totalPages,
        totalElements: response.data.page.totalElements
      }));
    }

    dispatch(setPendingUsers(users));
    dispatch(setUsersFetchState(fetchStates.FETCHED));

    return { success: true, data: response.data };
  } catch (err) {
    dispatch(setUsersFetchState(fetchStates.FAILED));
    return handleApiError(err, dispatch, 'fetchPendingUsers');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Kullanıcıyı onaylar
 * @param {number} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean}>}
 */
export const approveUser = (userId) => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    await instance.post(`/admin/users/${userId}/approve`);
    dispatch(updateUserStatusInState(userId, userStatus.ACTIVE));
    dispatch(setSuccess("Kullanıcı onaylandı"));
    clearDashboardCache();
    return { success: true };
  } catch (err) {
    return handleApiError(err, dispatch, 'approveUser');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Kullanıcıyı reddeder
 * @param {number} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean}>}
 */
export const rejectUser = (userId) => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    await instance.post(`/admin/users/${userId}/reject`);
    dispatch(updateUserStatusInState(userId, userStatus.REJECTED));
    dispatch(setSuccess("Kullanıcı reddedildi"));
    clearDashboardCache();
    return { success: true };
  } catch (err) {
    return handleApiError(err, dispatch, 'rejectUser');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Kullanıcı rolünü günceller
 * @param {number} userId - Kullanıcı ID
 * @param {string} role - Yeni rol
 * @returns {Promise<{success: boolean}>}
 */
export const updateUserRole = (userId, role) => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    await instance.put(`/admin/users/${userId}/role`, null, {
      params: { role }
    });

    dispatch(updateUserRoleInState(userId, role));
    dispatch(setSuccess("Kullanıcı rolü güncellendi"));
    clearDashboardCache();
    return { success: true };
  } catch (err) {
    return handleApiError(err, dispatch, 'updateUserRole');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Kullanıcıları rollerine göre getirir (Paginated)
 * @param {string} role - Kullanıcı rolü
 * @param {number} page - Sayfa numarası
 * @param {number} size - Sayfa başına kayıt
 * @returns {Promise<{success: boolean, data?: any}>}
 */
export const getUsersByRole = (role, page = 0, size = 10) => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.get(`/admin/users/role/${role}`, {
      params: { page, size, sort: "id,desc" }
    });
    dispatch(setSuccess("Kullanıcılar başarıyla getirildi"));
    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'getUsersByRole');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Kullanıcıları duruma göre getirir (Paginated)
 * @param {string} status - Kullanıcı durumu
 * @param {number} page - Sayfa numarası
 * @param {number} size - Sayfa başına kayıt
 * @returns {Promise<{success: boolean, data?: any}>}
 */
export const getUsersByStatus = (status, page = 0, size = 10) => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.get(`/admin/users/status/${status}`, {
      params: { page, size, sort: "id,desc" }
    });
    dispatch(setSuccess("Kullanıcılar başarıyla getirildi"));
    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'getUsersByStatus');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Yeni kullanıcı oluşturur
 * @param {Object} userData - Kullanıcı verileri
 * @returns {Promise<{success: boolean, data?: any}>}
 */
export const createUser = (userData) => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.post("/admin/users", userData);
    dispatch(setSuccess("Kullanıcı başarıyla oluşturuldu"));
    clearDashboardCache();
    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'createUser');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Kullanıcı bilgilerini günceller
 * @param {number} userId - Kullanıcı ID
 * @param {Object} userData - Güncellenecek veriler
 * @returns {Promise<{success: boolean, data?: any}>}
 */
export const updateUser = (userId, userData) => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.put(`/admin/users/${userId}`, userData);
    dispatch(setSuccess("Kullanıcı başarıyla güncellendi"));
    clearDashboardCache();
    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'updateUser');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Kullanıcıyı siler
 * @param {number} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean}>}
 */
export const deleteUser = (userId) => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    await instance.delete(`/admin/users/${userId}`);
    dispatch(setSuccess("Kullanıcı başarıyla silindi"));
    clearDashboardCache();
    return { success: true };
  } catch (err) {
    return handleApiError(err, dispatch, 'deleteUser');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Kullanıcıları arar
 * @param {string} search - Arama terimi
 * @returns {Promise<{success: boolean, data?: any}>}
 */
export const searchUsers = (search) => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.get(`/admin/users/search`, {
      params: { search, sort: "id,desc" }
    });
    dispatch(setSuccess("Kullanıcılar başarıyla getirildi"));
    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'searchUsers');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

// ========================================
// ASYNC THUNKS - Dashboard
// ========================================

/**
 * Dashboard verilerini getirir (Optimized DTO endpoint)
 * @param {boolean} forceRefresh - Cache'i bypass et
 * @returns {Promise<Object>}
 */
export const fetchDashboard = (forceRefresh = false) => async (dispatch) => {
  // Cache kontrolü
  if (!forceRefresh) {
    const cachedData = cache.get(DASHBOARD_CACHE_KEY);
    if (cachedData) {
      console.log("✅ Dashboard Cache Hit - Returning cached data");
      dispatch(setDashboardData(cachedData));
      dispatch(setDashboardFetchState(fetchStates.FETCHED));
      return cachedData;
    }
  }

  console.log("🔄 Fetching dashboard data from optimized DTO endpoint...");
  dispatch(setDashboardFetchState(fetchStates.FETCHING));
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.get("/admin/dashboard");
    const dto = response.data;

    console.log("📊 Backend DTO Response:", {
      totalCategories: dto.totalCategories,
      totalProducts: dto.totalProducts,
      totalStock: dto.totalStock,
      totalUsers: dto.totalUsers,
      categoriesCount: dto.categories?.length || 0
    });

    // DTO'dan categories array'ini al
    const categories = dto.categories || [];

    // CUSTOM_BASE kategorisini filtrele
    const filteredCategories = categories.filter(
      cat => cat.name !== "CUSTOM_BASE"
    );

    // Frontend için categoryData hazırla
    const categoryData = filteredCategories.map(category => {
      console.log(`📦 Category "${category.name}":`, {
        productCount: category.productCount,
        totalStock: category.totalStock
      });

      return {
        id: category.id,
        name: category.name,
        ürünSayısı: category.productCount || 0,
        stokMiktarı: category.totalStock || 0
      };
    }).filter(cat => cat.ürünSayısı > 0);

    console.log("📊 Processed Category Data:", categoryData);

    // Dashboard state'i oluştur
    const dashboardData = {
      totalCategories: filteredCategories.length,
      totalProducts: dto.totalProducts || 0,
      totalStock: dto.totalStock || 0,
      totalUsers: dto.totalUsers || 0,
      categoryData: categoryData,
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

    // Cache'e kaydet (1 dakika)
    cache.set(DASHBOARD_CACHE_KEY, dashboardData, 60000);

    // Redux'a kaydet
    dispatch(setDashboardData(dashboardData));
    dispatch(setDashboardFetchState(fetchStates.FETCHED));

    return dashboardData;
  } catch (err) {
    console.error("❌ Dashboard fetch error:", err);
    dispatch(setDashboardFetchState(fetchStates.FAILED));
    cache.clear(DASHBOARD_CACHE_KEY);
    return handleApiError(err, dispatch, 'fetchDashboard');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Dashboard cache'ini temizler
 */
export const clearDashboardCache = () => {
  cache.clear(DASHBOARD_CACHE_KEY);
  console.log("🗑️ Dashboard cache cleared");
};

/**
 * Dashboard istatistiklerini getirir
 * @returns {Promise<{success: boolean, data?: any}>}
 */
export const getDashboardStats = () => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.get(`/admin/dashboard`);
    dispatch(setSuccess("Dashboard istatistikleri başarıyla getirildi"));
    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'getDashboardStats');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

// ========================================
// ASYNC THUNKS - Analytics
// ========================================

/**
 * Toplam geliri getirir
 * @returns {Promise<{success: boolean, data?: any}>}
 */
export const getTotalRevenue = () => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.get(`/admin/analytics/revenue/total`);
    dispatch(setRevenueData(response.data));
    dispatch(setSuccess("Toplam gelir başarıyla getirildi"));
    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'getTotalRevenue');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Stokta olmayan ürün sayısını getirir
 * @returns {Promise<{success: boolean, data?: any}>}
 */
export const getOutOfStockProductsCount = () => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.get(`/admin/analytics/stock/out-of-stock`);
    dispatch(setSuccess("Stokta olmayan ürünler başarıyla getirildi"));
    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'getOutOfStockProductsCount');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Stokta az olan ürün sayısını getirir
 * @returns {Promise<{success: boolean, data?: any}>}
 */
export const getLowStockProductsCount = () => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.get(`/admin/analytics/stock/low`);
    dispatch(setSuccess("Stokta az olan ürünler başarıyla getirildi"));
    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'getLowStockProductsCount');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Kategoriye göre toplam stok miktarını getirir
 * @param {number} categoryId - Kategori ID
 * @returns {Promise<{success: boolean, data?: any}>}
 */
export const getTotalStockByCategory = (categoryId) => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.get(`/admin/analytics/stock/category/${categoryId}`);
    dispatch(setSuccess("Kategorilerin toplam stokları başarıyla getirildi"));
    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'getTotalStockByCategory');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Rol bazında kullanıcı sayısını getirir
 * @param {string} role - Kullanıcı rolü
 * @returns {Promise<{success: boolean, data?: any}>}
 */
export const getUserCountByRole = (role) => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.get(`/admin/analytics/users/role/${role}/count`);
    dispatch(setSuccess("Kullanıcı sayısına göre rol başarıyla getirildi"));
    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'getUserCountByRole');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Bekleyen kullanıcı sayısını getirir
 * @returns {Promise<{success: boolean, data?: any}>}
 */
export const getPendingUsersCount = () => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.get(`/admin/analytics/users/pending/count`);
    dispatch(setSuccess("Onaylanmamış kullanıcı sayısına göre rol başarıyla getirildi"));
    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'getPendingUsersCount');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

// ========================================
// ASYNC THUNKS - Elasticsearch Reindex
// ========================================

/**
 * Siparişleri yeniden indeksler
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const reindexOrders = () => async (dispatch) => {
  dispatch(setReindexStatus('orders', 'loading'));
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.post("/orders/admin/reindex");
    dispatch(setReindexStatus('orders', 'success', response.data));
    dispatch(setSuccess("Siparişler yeniden indeksleniyor. Bu işlem arka planda devam edecek."));
    return { success: true, message: response.data };
  } catch (err) {
    dispatch(setReindexStatus('orders', 'error', err.message));
    return handleApiError(err, dispatch, 'reindexOrders');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Ürünleri yeniden indeksler
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const reindexProducts = () => async (dispatch) => {
  dispatch(setReindexStatus('products', 'loading'));
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.post("/product/reindex");
    dispatch(setReindexStatus('products', 'success', response.data));
    dispatch(setSuccess("Ürünler yeniden indeksleniyor."));
    return { success: true, message: response.data };
  } catch (err) {
    dispatch(setReindexStatus('products', 'error', err.message));
    return handleApiError(err, dispatch, 'reindexProducts');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Kategorileri yeniden indeksler
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const reindexCategories = () => async (dispatch) => {
  dispatch(setReindexStatus('categories', 'loading'));
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.post("/category/reindex");
    dispatch(setReindexStatus('categories', 'success', response.data));
    dispatch(setSuccess("Kategoriler yeniden indeksleniyor."));
    return { success: true, message: response.data };
  } catch (err) {
    dispatch(setReindexStatus('categories', 'error', err.message));
    return handleApiError(err, dispatch, 'reindexCategories');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

/**
 * Kullanıcıları yeniden indeksler
 * @returns {Promise<{success: boolean, data?: any}>}
 */
export const reindexAllUsers = () => async (dispatch) => {
  dispatch(setReindexStatus('users', 'loading'));
  dispatch(setAdminLoading(true));

  try {
    const response = await instance.post(`/admin/users/reindex`);
    dispatch(setReindexStatus('users', 'success', 'Kullanıcılar başarıyla yeniden indekslendi'));
    dispatch(setSuccess("Kullanıcılar başarıyla yeniden indekslendi"));
    return { success: true, data: response.data };
  } catch (err) {
    dispatch(setReindexStatus('users', 'error', err.message));
    return handleApiError(err, dispatch, 'reindexAllUsers');
  } finally {
    dispatch(setAdminLoading(false));
  }
};
