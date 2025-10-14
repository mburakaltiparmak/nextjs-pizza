import { setError } from "../actions/globalActions";

export const errorMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type && action.type.endsWith('rejected')) {
    const error = action.payload || action.error;
    
    if (error) {
      const errorMessage = parseErrorMessage(error);
      store.dispatch(setError(errorMessage));
      
      if (process.env.NODE_ENV === 'development') {
        console.group('🔴 Error Middleware');
        console.error('Action Type:', action.type);
        console.error('Error:', error);
        console.error('Parsed Message:', errorMessage);
        console.groupEnd();
      }
    }
  }

  return result;
};

export const parseErrorMessage = (error) => {
  if (error.code === 'ECONNABORTED') {
    return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
  }
  
  if (error.message === 'Network Error' || !error.response) {
    return 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.';
  }
  
  if (error.response) {
    const { status, data } = error.response;
    
    if (status === 401) {
      return 'Oturumunuzun süresi dolmuş. Lütfen tekrar giriş yapın.';
    }
    
    if (status === 403) {
      return 'Bu işlem için yetkiniz bulunmuyor.';
    }
    
    if (status === 404) {
      return 'İstenen kaynak bulunamadı.';
    }
    
    if (status === 422) {
      return data?.message || 'Gönderilen veriler geçersiz.';
    }
    
    if (status >= 500) {
      return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
    }
    
    if (typeof data === 'string') {
      return data;
    }
    
    if (data?.message) {
      return data.message;
    }
    
    if (data?.error) {
      return data.error;
    }
  }
  
  return error.message || 'Beklenmeyen bir hata oluştu.';
};

export const handleApiError = (error, dispatch, context = '') => {
  const errorMessage = parseErrorMessage(error);
  
  dispatch(setError(errorMessage));
  
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔴 API Error${context ? ` - ${context}` : ''}`);
    console.error('Error Object:', error);
    console.error('Parsed Message:', errorMessage);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    console.groupEnd();
  }
  
  return { error: errorMessage };
};

export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  UNKNOWN: 'UNKNOWN'
};

export const getErrorType = (error) => {
  if (error.code === 'ECONNABORTED') {
    return ErrorTypes.TIMEOUT_ERROR;
  }
  
  if (error.message === 'Network Error' || !error.response) {
    return ErrorTypes.NETWORK_ERROR;
  }
  
  if (error.response) {
    const { status } = error.response;
    
    if (status === 401) return ErrorTypes.AUTH_ERROR;
    if (status === 403) return ErrorTypes.FORBIDDEN;
    if (status === 404) return ErrorTypes.NOT_FOUND;
    if (status === 422) return ErrorTypes.VALIDATION_ERROR;
    if (status >= 500) return ErrorTypes.SERVER_ERROR;
  }
  
  return ErrorTypes.UNKNOWN;
};

export default errorMiddleware;