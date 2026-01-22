import { fetchStates, userStatus } from "../constants";

// ========================================
// ACTION TYPES - Organized & Namespaced
// ========================================
export const adminActions = {
  // User Management
  SET_ALL_USERS: "ADMIN/SET_ALL_USERS",
  SET_PENDING_USERS: "ADMIN/SET_PENDING_USERS",
  SET_USERS_PAGINATION: "ADMIN/SET_USERS_PAGINATION",
  UPDATE_USER_STATUS: "ADMIN/UPDATE_USER_STATUS",
  UPDATE_USER_ROLE: "ADMIN/UPDATE_USER_ROLE",
  SET_USERS_FETCH_STATE: "ADMIN/SET_USERS_FETCH_STATE",

  // Dashboard
  SET_DASHBOARD_DATA: "ADMIN/SET_DASHBOARD_DATA",
  SET_DASHBOARD_FETCH_STATE: "ADMIN/SET_DASHBOARD_FETCH_STATE",

  // Analytics
  SET_ANALYTICS_DATA: "ADMIN/SET_ANALYTICS_DATA",
  SET_REVENUE_DATA: "ADMIN/SET_REVENUE_DATA",
  SET_STOCK_METRICS: "ADMIN/SET_STOCK_METRICS",
  SET_USER_METRICS: "ADMIN/SET_USER_METRICS",

  // Reindex Operations
  SET_REINDEX_STATUS: "ADMIN/SET_REINDEX_STATUS",

  // Global
  SET_LOADING: "ADMIN/SET_LOADING",
  SET_ERROR: "ADMIN/SET_ERROR",
  RESET_STATE: "ADMIN/RESET_STATE"
};

// ========================================
// INITIAL STATE - Organized & Nested
// ========================================
const adminInitialState = {
  // Kullanıcı Yönetimi
  users: {
    all: [],
    pending: [],
    pagination: {
      page: 0,
      size: 10,
      totalPages: 0,
      totalElements: 0
    },
    fetchState: fetchStates.NOT_FETCHED
  },

  // Dashboard & Analytics
  dashboard: {
    data: null,
    fetchState: fetchStates.NOT_FETCHED
  },

  // Analytics Data
  analytics: {
    revenue: null,
    stockMetrics: null,
    userMetrics: null,
    fetchState: fetchStates.NOT_FETCHED
  },

  // Elasticsearch Reindex Operations
  reindex: {
    orders: { status: 'idle', message: null },
    products: { status: 'idle', message: null },
    categories: { status: 'idle', message: null },
    users: { status: 'idle', message: null }
  },

  // Global State
  error: null,
  loading: false
};

// ========================================
// HELPER FUNCTIONS - Immutability Helpers
// ========================================

/**
 * Kullanıcı listesinde belirli bir kullanıcıyı günceller
 * @param {Array} users - Kullanıcı listesi
 * @param {number} userId - Güncellenecek kullanıcı ID
 * @param {Object} updates - Güncellenecek alanlar
 * @returns {Array} Güncellenmiş kullanıcı listesi
 */
const updateUserInList = (users, userId, updates) =>
  users.map(user => user.id === userId ? { ...user, ...updates } : user);

/**
 * Kullanıcı listesinden belirli bir kullanıcıyı kaldırır
 * @param {Array} users - Kullanıcı listesi
 * @param {number} userId - Kaldırılacak kullanıcı ID
 * @returns {Array} Filtrelenmiş kullanıcı listesi
 */
const removeUserFromList = (users, userId) =>
  users.filter(user => user.id !== userId);

// ========================================
// REDUCER
// ========================================
export const adminReducer = (state = adminInitialState, action) => {
  switch (action.type) {
    // ========================================
    // USER MANAGEMENT
    // ========================================
    case adminActions.SET_ALL_USERS:
      return {
        ...state,
        users: {
          ...state.users,
          all: action.payload
        }
      };

    case adminActions.SET_PENDING_USERS:
      return {
        ...state,
        users: {
          ...state.users,
          pending: action.payload
        }
      };

    case adminActions.SET_USERS_PAGINATION:
      return {
        ...state,
        users: {
          ...state.users,
          pagination: action.payload
        }
      };

    case adminActions.UPDATE_USER_STATUS:
      return {
        ...state,
        users: {
          ...state.users,
          all: updateUserInList(state.users.all, action.payload.userId, {
            status: action.payload.status
          }),
          // Pending listesinden kaldır (eğer artık pending değilse)
          pending: action.payload.status === userStatus.PENDING
            ? state.users.pending
            : removeUserFromList(state.users.pending, action.payload.userId)
        }
      };

    case adminActions.UPDATE_USER_ROLE:
      return {
        ...state,
        users: {
          ...state.users,
          all: updateUserInList(state.users.all, action.payload.userId, {
            role: action.payload.role
          })
        }
      };

    case adminActions.SET_USERS_FETCH_STATE:
      return {
        ...state,
        users: {
          ...state.users,
          fetchState: action.payload
        }
      };

    // ========================================
    // DASHBOARD
    // ========================================
    case adminActions.SET_DASHBOARD_DATA:
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          data: action.payload
        }
      };

    case adminActions.SET_DASHBOARD_FETCH_STATE:
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          fetchState: action.payload
        }
      };

    // ========================================
    // ANALYTICS
    // ========================================
    case adminActions.SET_ANALYTICS_DATA:
      return {
        ...state,
        analytics: {
          ...state.analytics,
          ...action.payload
        }
      };

    case adminActions.SET_REVENUE_DATA:
      return {
        ...state,
        analytics: {
          ...state.analytics,
          revenue: action.payload
        }
      };

    case adminActions.SET_STOCK_METRICS:
      return {
        ...state,
        analytics: {
          ...state.analytics,
          stockMetrics: action.payload
        }
      };

    case adminActions.SET_USER_METRICS:
      return {
        ...state,
        analytics: {
          ...state.analytics,
          userMetrics: action.payload
        }
      };

    // ========================================
    // REINDEX OPERATIONS
    // ========================================
    case adminActions.SET_REINDEX_STATUS:
      return {
        ...state,
        reindex: {
          ...state.reindex,
          [action.payload.entity]: {
            status: action.payload.status,
            message: action.payload.message
          }
        }
      };

    // ========================================
    // GLOBAL
    // ========================================
    case adminActions.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case adminActions.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };

    case adminActions.RESET_STATE:
      return adminInitialState;

    default:
      return state;
  }
};