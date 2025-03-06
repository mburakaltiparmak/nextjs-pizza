import { globalActions } from "../reducers/globalReducer";

 export const setLoading = (isLoading) => ({
    type: globalActions.setLoading,
    payload: isLoading,
  });
  
  export const setError = (error) => ({
    type: globalActions.setError,
    payload: error,
  });
  
  // Merkezi hata yönetimi yardımcı fonksiyonu
  export const handleApiError = (err, dispatch, moduleName = "", setFetchState = null, fetchStates = null) => {
    // Hata mesajını belirle
    let errorMessage = "Beklenmeyen bir hata oluştu";
    
    if (err.response) {
      // Sunucu yanıt verdi ama hata kodu döndü
      errorMessage = err.response.data?.message || 
                    `Sunucu hatası (${err.response.status})${moduleName ? ` - ${moduleName}` : ''}`;
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
    if (setFetchState && fetchStates) {
      dispatch(setFetchState(fetchStates.FAILED));
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