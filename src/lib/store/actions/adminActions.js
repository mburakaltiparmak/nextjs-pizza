import { adminActions } from "../reducers/adminReducer";
import { setError, setSuccess } from "./globalActions";
import { fetchStates, userStatus } from "../constants";
import { handleApiError } from "../middleware/errorMiddleware";
import cache from "@/lib/utils/cacheManager";
import AdminService from "@/lib/services/AdminService";
import ProductService from "@/lib/services/ProductService";
import CategoryService from "@/lib/services/CategoryService";
import OrderService from "@/lib/services/OrderService";
import debounce from 'lodash/debounce';

// ========================================
// CACHE KEYS
// ========================================
const DASHBOARD_CACHE_KEY = 'dashboard_data';

// ========================================
// SIMPLE ACTION CREATORS
// ========================================
export const setAllUsers = (users) => ({ type: adminActions.SET_ALL_USERS, payload: users });
export const setPendingUsers = (users) => ({ type: adminActions.SET_PENDING_USERS, payload: users });
export const setUsersPagination = (pagination) => ({ type: adminActions.SET_USERS_PAGINATION, payload: pagination });
export const updateUserStatusInState = (userId, status) => ({ type: adminActions.UPDATE_USER_STATUS, payload: { userId, status } });
export const updateUserRoleInState = (userId, role) => ({ type: adminActions.UPDATE_USER_ROLE, payload: { userId, role } });
export const setUsersFetchState = (state) => ({ type: adminActions.SET_USERS_FETCH_STATE, payload: state });
export const setDashboardData = (data) => ({ type: adminActions.SET_DASHBOARD_DATA, payload: data });
export const setDashboardFetchState = (state) => ({ type: adminActions.SET_DASHBOARD_FETCH_STATE, payload: state });
export const setAnalyticsData = (data) => ({ type: adminActions.SET_ANALYTICS_DATA, payload: data });
export const setRevenueData = (revenue) => ({ type: adminActions.SET_REVENUE_DATA, payload: revenue });
export const setStockMetrics = (metrics) => ({ type: adminActions.SET_STOCK_METRICS, payload: metrics });
export const setUserMetrics = (metrics) => ({ type: adminActions.SET_USER_METRICS, payload: metrics });
export const setReindexStatus = (entity, status, message = null) => ({ type: adminActions.SET_REINDEX_STATUS, payload: { entity, status, message } });
export const setAdminLoading = (loading) => ({ type: adminActions.SET_LOADING, payload: loading });
export const setAdminError = (error) => ({ type: adminActions.SET_ERROR, payload: error });
export const resetAdminState = () => ({ type: adminActions.RESET_STATE });

// ========================================
// ASYNC THUNKS - User Management
// ========================================

export const fetchAllUsers = (page = 0, size = 10, search = "") => async (dispatch) => {
  dispatch(setUsersFetchState(fetchStates.FETCHING));
  dispatch(setAdminLoading(true));

  try {
    const response = await AdminService.fetchAllUsers(page, size, search);
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
 * Debounced user search
 */
export const debouncedSearchUsers = debounce(
  (searchTerm, page = 0, size = 10) => (dispatch) => {
    return dispatch(fetchAllUsers(page, size, searchTerm));
  },
  300
);

export const fetchPendingUsers = (page = 0, size = 10) => async (dispatch) => {
  dispatch(setUsersFetchState(fetchStates.FETCHING));
  dispatch(setAdminLoading(true));

  try {
    const response = await AdminService.fetchPendingUsers(page, size);
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

export const approveUser = (userId) => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    await AdminService.approveUser(userId);
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

export const rejectUser = (userId) => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    await AdminService.rejectUser(userId);
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

export const updateUserRole = (userId, role) => async (dispatch) => {
  dispatch(setAdminLoading(true));

  try {
    await AdminService.updateUserRole(userId, role);
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

export const getUsersByRole = (role, page = 0, size = 10) => async (dispatch) => {
  dispatch(setAdminLoading(true));
  try {
    const response = await AdminService.getUsersByRole(role, page, size);
    dispatch(setSuccess("Kullanıcılar başarıyla getirildi"));
    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'getUsersByRole');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

export const getUsersByStatus = (status, page = 0, size = 10) => async (dispatch) => {
  dispatch(setAdminLoading(true));
  try {
    const response = await AdminService.getUsersByStatus(status, page, size);
    dispatch(setSuccess("Kullanıcılar başarıyla getirildi"));
    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'getUsersByStatus');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

export const createUser = (userData) => async (dispatch) => {
  dispatch(setAdminLoading(true));
  try {
    const response = await AdminService.createUser(userData);
    dispatch(setSuccess("Kullanıcı başarıyla oluşturuldu"));
    clearDashboardCache();
    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'createUser');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

export const updateUser = (userId, userData) => async (dispatch) => {
  dispatch(setAdminLoading(true));
  try {
    const response = await AdminService.updateUser(userId, userData);
    dispatch(setSuccess("Kullanıcı başarıyla güncellendi"));
    clearDashboardCache();
    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'updateUser');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

export const deleteUser = (userId) => async (dispatch) => {
  dispatch(setAdminLoading(true));
  try {
    await AdminService.deleteUser(userId);
    dispatch(setSuccess("Kullanıcı başarıyla silindi"));
    clearDashboardCache();
    return { success: true };
  } catch (err) {
    return handleApiError(err, dispatch, 'deleteUser');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

export const searchUsers = (search) => async (dispatch) => {
  dispatch(setAdminLoading(true));
  try {
    const response = await AdminService.searchUsers(search);
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

export const fetchDashboard = (forceRefresh = false) => async (dispatch) => {
  if (!forceRefresh) {
    const cachedData = cache.get(DASHBOARD_CACHE_KEY);
    if (cachedData) {
      console.log("✅ Dashboard Cache Hit");
      dispatch(setDashboardData(cachedData));
      dispatch(setDashboardFetchState(fetchStates.FETCHED));
      return cachedData;
    }
  }

  dispatch(setDashboardFetchState(fetchStates.FETCHING));
  dispatch(setAdminLoading(true));

  try {
    const response = await AdminService.fetchDashboard();
    const dto = response.data;
    
    // Process DTO (Logic from original file)
    const categories = dto.categories || [];
    const filteredCategories = categories.filter(cat => cat.name !== "CUSTOM_BASE");
    const categoryData = filteredCategories.map(category => ({
        id: category.id,
        name: category.name,
        ürünSayısı: category.productCount || 0,
        stokMiktarı: category.totalStock || 0
      })).filter(cat => cat.ürünSayısı > 0);

    const dashboardData = {
      totalCategories: filteredCategories.length,
      totalProducts: dto.totalProducts || 0,
      totalStock: dto.totalStock || 0,
      totalUsers: dto.totalUsers || 0,
      categoryData: categoryData,
      categories: filteredCategories,
      recentProducts: dto.recentProducts || []
    };

    cache.set(DASHBOARD_CACHE_KEY, dashboardData, 60000); // 1 min cache

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

export const clearDashboardCache = () => {
  cache.clear(DASHBOARD_CACHE_KEY);
};

export const getDashboardStats = () => async (dispatch) => {
    // This seems redundant given fetchDashboard but kept for compatibility
    return dispatch(fetchDashboard());
};

// ========================================
// ASYNC THUNKS - Analytics (Proxied to AdminService)
// ========================================

export const getTotalRevenue = () => async (dispatch) => {
  dispatch(setAdminLoading(true));
  try {
    const response = await AdminService.getTotalRevenue();
    dispatch(setRevenueData(response.data));
    dispatch(setSuccess("Toplam gelir başarıyla getirildi"));
    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'getTotalRevenue');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

export const getOutOfStockProductsCount = () => async (dispatch) => {
  dispatch(setAdminLoading(true));
  try {
    const response = await AdminService.getOutOfStockCount();
    dispatch(setSuccess("Stokta olmayan ürünler başarıyla getirildi"));
    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError(err, dispatch, 'getOutOfStockProductsCount');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

export const getLowStockProductsCount = () => async (dispatch) => {
    dispatch(setAdminLoading(true));
    try {
      const response = await AdminService.getLowStockCount();
      dispatch(setSuccess("Stokta az olan ürünler başarıyla getirildi"));
      return { success: true, data: response.data };
    } catch (err) {
      return handleApiError(err, dispatch, 'getLowStockProductsCount');
    } finally {
      dispatch(setAdminLoading(false));
    }
};

export const getTotalStockByCategory = (categoryId) => async (dispatch) => {
    dispatch(setAdminLoading(true));
    try {
      const response = await AdminService.getTotalStockByCategory(categoryId);
      dispatch(setSuccess("Kategorilerin toplam stokları başarıyla getirildi"));
      return { success: true, data: response.data };
    } catch (err) {
      return handleApiError(err, dispatch, 'getTotalStockByCategory');
    } finally {
      dispatch(setAdminLoading(false));
    }
};

export const getUserCountByRole = (role) => async (dispatch) => {
    dispatch(setAdminLoading(true));
    try {
      const response = await AdminService.getUserCountByRole(role);
      dispatch(setSuccess("Kullanıcı sayısına göre rol başarıyla getirildi"));
      return { success: true, data: response.data };
    } catch (err) {
      return handleApiError(err, dispatch, 'getUserCountByRole');
    } finally {
      dispatch(setAdminLoading(false));
    }
};

export const getPendingUsersCount = () => async (dispatch) => {
    dispatch(setAdminLoading(true));
    try {
      const response = await AdminService.getPendingUsersCount();
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

export const reindexOrders = () => async (dispatch) => {
  dispatch(setReindexStatus('orders', 'loading'));
  dispatch(setAdminLoading(true));

  try {
    const response = await OrderService.reindex();
    dispatch(setReindexStatus('orders', 'success', response.data));
    dispatch(setSuccess("Siparişler yeniden indeksleniyor."));
    return { success: true, message: response.data };
  } catch (err) {
    dispatch(setReindexStatus('orders', 'error', err.message));
    return handleApiError(err, dispatch, 'reindexOrders');
  } finally {
    dispatch(setAdminLoading(false));
  }
};

export const reindexProducts = () => async (dispatch) => {
  dispatch(setReindexStatus('products', 'loading'));
  dispatch(setAdminLoading(true));

  try {
    const response = await ProductService.reindex();
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

export const reindexCategories = () => async (dispatch) => {
  dispatch(setReindexStatus('categories', 'loading'));
  dispatch(setAdminLoading(true));

  try {
    const response = await CategoryService.reindex();
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

export const reindexAllUsers = () => async (dispatch) => {
  dispatch(setReindexStatus('users', 'loading'));
  dispatch(setAdminLoading(true));

  try {
    const response = await AdminService.reindexUsers();
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
