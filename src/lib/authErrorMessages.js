// authErrorMessages.js
// Güvenli ve jenerik hata mesajları için tanımlamalar

export const AUTH_ERRORS = {
    // Genel kimlik doğrulama hataları
    INVALID_CREDENTIALS: "Kullanıcı adı veya şifre hatalı",
    AUTHENTICATION_FAILED: "Kimlik doğrulama başarısız",
    LOGIN_FAILED: "Giriş yapılamadı",
    
    // Sunucu hataları
    SERVER_ERROR: "Sunucu hatası, lütfen daha sonra tekrar deneyin",
    NETWORK_ERROR: "Bağlantı hatası, internet bağlantınızı kontrol edin",
    
    // Girdi doğrulama hataları
    FORM_VALIDATION: "Lütfen tüm alanları doğru şekilde doldurun",
    
    // Oturum hataları
    SESSION_EXPIRED: "Oturumunuz sona erdi, lütfen tekrar giriş yapın",
    
    // Varsayılan hata
    DEFAULT: "Bir hata oluştu, lütfen tekrar deneyin"
  };
  
  /**
   * Güvenli hata mesajı oluşturur
   * @param {Error} error - Hata nesnesi
   * @returns {string} Kullanıcıya gösterilecek güvenli hata mesajı
   */
  export function getSafeErrorMessage(error) {
    // Eğer özel bir hata mesajı varsa
    if (error && error.message) {
      const message = error.message.toLowerCase();
      
      // Spesifik bilgileri içeren mesajları genel mesajlarla değiştir
      if (message.includes("token") || message.includes("jwt")) {
        return AUTH_ERRORS.AUTHENTICATION_FAILED;
      }
      
      if (message.includes("password") || message.includes("şifre") || 
          message.includes("username") || message.includes("kullanıcı")) {
        return AUTH_ERRORS.INVALID_CREDENTIALS;
      }
      
      if (message.includes("server") || message.includes("sunucu") || 
          message.includes("500")) {
        return AUTH_ERRORS.SERVER_ERROR;
      }
      
      if (message.includes("network") || message.includes("ağ") || 
          message.includes("connect") || message.includes("bağlantı")) {
        return AUTH_ERRORS.NETWORK_ERROR;
      }
      
      // Eğer error mesajı jenerik bir hata değilse ve güvenlik açığı oluşturmuyorsa, 
      // kullanılabilir
      if (message.length < 50 && !message.includes("code") && 
          !message.includes("syntax") && !message.includes("database") && 
          !message.includes("sql") && !message.includes("token")) {
        return error.message;
      }
    }
    
    // Durum koduna göre jenerik hata mesajı
    if (error && error.response) {
      switch (error.response.status) {
        case 400: return AUTH_ERRORS.FORM_VALIDATION;
        case 401: return AUTH_ERRORS.INVALID_CREDENTIALS;
        case 403: return AUTH_ERRORS.AUTHENTICATION_FAILED;
        case 500: return AUTH_ERRORS.SERVER_ERROR;
        default: return AUTH_ERRORS.DEFAULT;
      }
    }
    
    // Varsayılan hata mesajı
    return AUTH_ERRORS.DEFAULT;
  }