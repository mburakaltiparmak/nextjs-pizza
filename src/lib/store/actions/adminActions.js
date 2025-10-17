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

// ✅ ÇÖZÜM: Backend'den ayrı ayrı gelen verileri birleştir
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
    // ✅ 3 paralel istek: categories + products + users
    const [categoriesResponse, productsResponse, usersResponse] = await Promise.all([
      instance.get("/category"),
      instance.get("/product"),
      instance.get("/admin/users")
    ]);

    const categories = categoriesResponse.data || [];
    const allProducts = productsResponse.data || [];
    const users = usersResponse.data || [];

    console.log("📊 Backend Responses:", {
      categoriesCount: categories.length,
      productsCount: allProducts.length,
      usersCount: users.length
    });

    // ✅ Kategorileri ürünlerle eşleştir
    const categoriesWithProducts = categories.map(category => {
      // Bu kategoriye ait ürünleri filtrele
      const categoryProducts = allProducts.filter(
        product => product.categoryId === category.id
      );

      console.log(`📦 Category "${category.name}":`, {
        id: category.id,
        productCount: categoryProducts.length
      });

      return {
        ...category,
        products: categoryProducts
      };
    });

    // ✅ Custom Pizza kategorisini çıkar
    const filteredCategories = categoriesWithProducts.filter(
      cat => cat.name !== "Custom Pizza"
    );

    // ✅ Dashboard için kategori verilerini hazırla
    const categoryData = filteredCategories.map(category => {
      const products = category.products || [];
      const productCount = products.length;
      const stockTotal = products.reduce((sum, p) => sum + (p.stock || 0), 0);

      return {
        name: category.name,
        ürünSayısı: productCount,
        stokMiktarı: stockTotal
      };
    }).filter(cat => cat.ürünSayısı > 0); // Sadece ürünü olan kategoriler

    console.log("📊 Processed Category Data:", categoryData);

    // ✅ Toplam değerleri hesapla
    const totalProducts = allProducts.length;
    const totalStock = allProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalCategories = filteredCategories.length;

    // ✅ Dashboard data'yı hazırla
    const dashboardData = {
      totalCategories,
      totalProducts,
      totalStock,
      totalUsers: users.length,
      categories: categoriesWithProducts,
      users: users,
      categoryData: categoryData
    };

    console.log("✅ Final Dashboard Data:", {
      totalCategories: dashboardData.totalCategories,
      totalProducts: dashboardData.totalProducts,
      totalStock: dashboardData.totalStock,
      totalUsers: dashboardData.totalUsers,
      categoryDataLength: dashboardData.categoryData.length,
      sampleCategory: dashboardData.categoryData[0]
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

// Cache'i temizle - veri güncellemelerinde kullan
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

    dispatch(updateUserStatusInState(userId, userStatus.ACTIVE));
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

    dispatch(updateUserStatusInState(userId, userStatus.REJECTED));
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

    dispatch(updateUserRoleInState(userId, role));
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