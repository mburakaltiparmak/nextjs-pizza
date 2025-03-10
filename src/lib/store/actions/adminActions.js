import { adminActions } from "../reducers/adminReducer";
import { setError, setLoading, setSuccess } from "./globalActions";
import { instance } from "@/lib/hooks";
import { fetchStates, userStatus } from "../constants";

export const setAllUsers = (users) => ({
  type: adminActions.SET_ALL_USERS,
  payload: users
});

export const setPendingUsers = (users) => ({
  type: adminActions.SET_PENDING_USERS,
  payload: users
});

export const setDashboardData = (data) => ({
  type: adminActions.SET_DASHBOARD_DATA,
  payload: data
});

export const updateUserStatusInState = (userId, status) => ({
  type: adminActions.UPDATE_USER_STATUS,
  payload: { userId, status }
});

export const updateUserRoleInState = (userId, role) => ({
  type: adminActions.UPDATE_USER_ROLE,
  payload: { userId, role }
});

export const setAdminFetchState = (state) => ({
  type: adminActions.SET_FETCH_STATE,
  payload: state
});

export const setAdminError = (error) => ({
  type: adminActions.SET_ERROR,
  payload: error
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
      errorMessage = err.response.data?.message || errorMessage;
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
      errorMessage = err.response.data?.message || errorMessage;
    }
    
    dispatch(setAdminError(errorMessage));
    return { error: errorMessage };
  }
};

// Dashboard verilerini getir
export const fetchDashboard = () => async (dispatch) => {
  dispatch(setAdminFetchState(fetchStates.FETCHING));
  
  try {
    const response = await instance.get("/admin/dashboard");
    
    dispatch(setDashboardData(response.data));
    dispatch(setAdminFetchState(fetchStates.FETCHED));
    
    return response.data;
  } catch (err) {
    dispatch(setAdminFetchState(fetchStates.FAILED));
    
    let errorMessage = "Dashboard verileri yüklenemedi";
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }
    
    dispatch(setAdminError(errorMessage));
    return { error: errorMessage };
  }
};

// Kullanıcı onayla
export const approveUser = (userId) => async (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    await instance.get(`/admin/users/approve/${userId}`);
    
    dispatch(updateUserStatusInState(userId, userStatus.ACTIVE));
    dispatch(setLoading(false));
    dispatch(setSuccess("Kullanıcı başarıyla onaylandı"));
    
    return { success: true };
  } catch (err) {
    let errorMessage = "Kullanıcı onaylanamadı";
    
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }
    
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    
    return { error: errorMessage };
  }
};

// Kullanıcı reddet
export const rejectUser = (userId) => async (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    await instance.get(`/admin/users/reject/${userId}`);
    
    dispatch(updateUserStatusInState(userId, userStatus.REJECTED));
    dispatch(setLoading(false));
    dispatch(setSuccess("Kullanıcı başarıyla reddedildi"));
    
    return { success: true };
  } catch (err) {
    let errorMessage = "Kullanıcı reddedilemedi";
    
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }
    
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    
    return { error: errorMessage };
  }
};

// Kullanıcı rolünü güncelle
export const updateUserRole = (userId, role) => async (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    // Form data olarak gönderilmesi gerekiyor
    const formData = new FormData();
    formData.append('role', role);
    
    await instance.post(`/admin/users/role/${userId}`, formData);
    
    dispatch(updateUserRoleInState(userId, role));
    dispatch(setLoading(false));
    dispatch(setSuccess("Kullanıcı rolü başarıyla güncellendi"));
    
    return { success: true };
  } catch (err) {
    let errorMessage = "Kullanıcı rolü güncellenemedi";
    
    if (err.response) {
      errorMessage = err.response.data?.message || errorMessage;
    }
    
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    
    return { error: errorMessage };
  }
};