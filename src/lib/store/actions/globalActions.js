import { globalActions } from "../reducers/globalReducer";

export const setLoading = (isLoading) => ({
  type: globalActions.SET_LOADING,
  payload: isLoading
});

export const setError = (error) => ({
  type: globalActions.SET_ERROR,
  payload: error
});

export const setSuccess = (message) => ({
  type: globalActions.SET_SUCCESS,
  payload: message
});

export const clearMessages = () => ({
  type: globalActions.CLEAR_MESSAGES
});

// Merkezi hata yönetimi yardımcı fonksiyonu
export const handleApiError = (err, dispatch, moduleName = "", setFetchState = null, fetchStateValue = null) => {
  // Hata mesajını belirle
  let errorMessage = "Beklenmeyen bir hata oluştu";
  
  if (err.response) {
    // Sunucu yanıt verdi ama hata kodu döndü
    errorMessage = err.response.data?.message || 
                  `Sunucu hatası (${err.response.status})${moduleName ? ` - ${moduleName}` : ''}`;
                  
    // Yetkilendirme hatası (401)
    if (err.response.status === 401) {
      // Token süresi dolmuş olabilir, kullanıcıyı çıkış yapması gerekebilir
      return "auth/expired";
    }
  } else if (err.request) {
    // Sunucuya istek gitti ama yanıt dönmedi
    errorMessage = "Sunucudan yanıt alınamadı. Lütfen bağlantınızı kontrol edin.";
  } else {
    // İstek oluşturulamadı
    errorMessage = err.message || errorMessage;
  }

  // Global state'e hatayı kaydet
  dispatch(setError(errorMessage));
  
  // İlgili modül için FAILED state'i varsa onu da güncelle
  if (setFetchState && fetchStateValue) {
    dispatch(setFetchState(fetchStateValue));
  }
  
  // Loading state'ini kapat
  dispatch(setLoading(false));
  
  // Hatayı logger'a kaydet
  console.error(`API Error ${moduleName ? `(${moduleName})` : ''}:`, err);
  
  // Eğer response detayları varsa onları da logla
  if (err.response) {
    console.error("Response details:", {
      status: err.response.status,
      data: err.response.data
    });
  }
  
  return errorMessage; // Çağıran component'in kullanabilmesi için hata mesajını döndür
};