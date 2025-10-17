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

// ✅ DÜZELTME: Dashboard verilerini backend'e uygun şekilde işle
export const fetchDashboard = (forceRefresh = false) => async (dispatch) => {

  //TO DO : fetchDashboard fonksiyonunu düzelt. Kategori ve ürün verilerini çekmesine gerek yok. Uygulama ilk render edildiğinde bu veriler zaten çekiliyor. Bunların cache kontrolü yapılmalı. Sadece dashboard istatistik verileri reduxtan çekilmeli. Request sayısını azalt. 

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

    // ✅ Backend'den gelen veriyi kontrol et
    const categories = dashboardStats.categories || [];
    
    let categoriesWithProducts = [];
    
    // Eğer kategoriler products içermiyorsa, /category endpoint'ini kullan
    const hasProducts = categories.length > 0 && categories[0].products !== undefined;
    
    if (!hasProducts && categories.length > 0) {
      console.log("⚠️ Categories don't include products, fetching from /category endpoint...");
      
      try {
        const categoriesResponse = await instance.get("/category");
        categoriesWithProducts = categoriesResponse.data;
        console.log("✅ Fetched categories with products:", categoriesWithProducts);
      } catch (catErr) {
        console.error("❌ Failed to fetch categories with products:", catErr);
        // Fallback: En azından kategori isimlerini göster
        categoriesWithProducts = categories.map(cat => ({
          ...cat,
          products: [] // Boş products array
        }));
      }
    } else {
      categoriesWithProducts = categories;
    }

    console.log("📦 Categories with products:", categoriesWithProducts.length);
    
    // ✅ Her kategori için veri hazırla - products array'i şimdi var
    const categoryData = categoriesWithProducts
      .filter(category => category.name !== "Custom Pizza") // Custom pizza hariç
      .map(category => {
        const products = category.products || [];
        const productCount = products.length;
        const stockTotal = products.reduce((sum, p) => sum + (p.stock || 0), 0);
        
        return {
          name: category.name,
          ürünSayısı: productCount,
          stokMiktarı: stockTotal
        };
      })
      .filter(cat => cat.ürünSayısı > 0); // Sadece ürünü olan kategorileri göster

    console.log("📊 Processed category data:", categoryData);

    // ✅ Dashboard data'yı hazırla
    const dashboardData = {
      // Backend'den gelen değerleri kullan
      totalCategories: dashboardStats.totalCategories || categoriesWithProducts.length || 0,
      totalProducts: dashboardStats.totalProducts || 0,
      totalStock: dashboardStats.totalStock || 0,
      totalUsers: users.length,
      // Raw data
      categories: categoriesWithProducts,
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
      sampleData: dashboardData.categoryData[0]
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

// Kullanıcı durumunu güncelle
export const updateUserStatus = (userId, status) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const endpoint = status === userStatus.APPROVED 
      ? `/admin/users/${userId}/approve`
      : `/admin/users/${userId}/reject`;

    const response = await instance.post(endpoint);

    dispatch(updateUserStatusInState(userId, status));
    dispatch(setSuccess(`Kullanıcı başarıyla ${status === userStatus.APPROVED ? 'onaylandı' : 'reddedildi'}`));
    dispatch(setLoading(false));

    return { success: true, data: response.data };
  } catch (err) {
    dispatch(setLoading(false));
    return handleApiError(err, dispatch, 'updateUserStatus');
  }
};

// Kullanıcı rolünü güncelle
export const updateUserRole = (userId, role) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const response = await instance.put(`/admin/users/${userId}/role`, null, {
      params: { role }
    });

    dispatch(updateUserRoleInState(userId, role));
    dispatch(setSuccess("Kullanıcı rolü başarıyla güncellendi"));
    dispatch(setLoading(false));

    return { success: true, data: response.data };
  } catch (err) {
    dispatch(setLoading(false));
    return handleApiError(err, dispatch, 'updateUserRole');
  }
};