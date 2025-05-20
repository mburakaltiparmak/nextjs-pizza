// lib/supabaseSync.js
import { instance } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';

// Senkronizasyon durumu
let syncInProgress = false;
let lastEnhancedSyncTime = 0;
let lastEnhancedSyncUserId = null;
const SYNC_DEBOUNCE_MS = 5000; // 5 saniye

/**
 * Supabase localStorage token'ını system token'ına dönüştürür
 * @returns {string|null} - Bulunan token veya null
 */
export const extractSupabaseToken = () => {
  try {
    // Supabase token key'i
    const supabaseKey = 'sb-nslkxjzddnjpouzkevii-auth-token';
    
    // localStorage'dan Supabase token JSON'ını al
    const supabaseAuthData = localStorage.getItem(supabaseKey);
    
    if (!supabaseAuthData) return null;
    
    // JSON parse et
    const parsedData = JSON.parse(supabaseAuthData);
    
    // access_token'ı döndür
    return parsedData.access_token || null;
  } catch (error) {
    console.error('Supabase token çıkarma hatası:', error);
    return null;
  }
};

/**
 * Supabase token'ını sistem token'ı olarak senkronize eder
 * @returns {boolean} - İşlemin başarılı olup olmadığı
 */
export const syncSupabaseTokenToSystem = (rememberMe = true, dispatch) => {
  try {
    const token = extractSupabaseToken();
    
    if (!token) return false;
    
    // Kullanıcı bilgilerini de almaya çalış
    const supabaseKey = 'sb-nslkxjzddnjpouzkevii-auth-token';
    const supabaseAuthData = localStorage.getItem(supabaseKey);
    let email = '';
    
    if (supabaseAuthData) {
      try {
        const parsedData = JSON.parse(supabaseAuthData);
        email = parsedData.user?.email || '';
      } catch (e) {
        console.warn('Supabase kullanıcı bilgisi çıkarılamadı');
      }
    }
    
    // Token'ı sistem için kaydet
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', token);
    
    if (email) {
      storage.setItem('userEmail', email);
    }
    
    // Auth header'ı ayarla
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Redux store'a da token bilgisini yükle (eğer dispatch fonksiyonu sağlanmışsa)
    if (dispatch) {
      try {
        const { setToken, setIsLogin, setEmail } = require('@/lib/store/actions/userActions');
        dispatch(setToken(token));
        dispatch(setIsLogin(true));
        if (email) {
          dispatch(setEmail(email));
        }
      } catch (e) {
        console.warn('Redux action import hatası:', e);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Token senkronizasyon hatası:', error);
    return false;
  }
};

/**
 * API istemcisini geçerli kimlik doğrulama token'ı ile yapılandırır
 * Hem backend JWT hem de Supabase token'ları ile çalışır
 */
export const configureAuthHeaders = async (token) => {
  if (!token) {
    // Eğer token verilmediyse, Supabase'den almayı dene
    token = extractSupabaseToken();
    if (!token) return false;
  }
  
  // Önce token'ı sistem token'ı olarak da kaydet
  const rememberMe = localStorage.getItem("rememberMe") === "true";
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem("token", token);
  
  // Tüm istekler için Authorization header'ını ayarla
  instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  // Her zaman doğrulama yapmaya gerek yok, sadece token'ı ayarla
  return true;
};

/**
 * Geliştirilmiş syncSupabaseUser fonksiyonu - token geçerli kabul edilir
 */
export const enhancedSyncSupabaseUser = async (session) => {
  if (!session || !session.access_token) {
    console.error('Senkronizasyon için geçersiz oturum nesnesi');
    return null;
  }
  
  try {
    const now = Date.now();
    const userId = session.user.id;
    
    // Senkronizasyon zaten devam ediyorsa veya son senkronizasyondan bu yana yeterince zaman geçmediyse
    if (syncInProgress || (lastEnhancedSyncUserId === userId && now - lastEnhancedSyncTime < SYNC_DEBOUNCE_MS)) {
      console.log("Senkronizasyon atlanıyor - zaten yakın zamanda yapıldı veya devam ediyor");
      // Önbellekten kullanıcı verilerini getir
      try {
        const cachedUser = localStorage.getItem('supabase_user_data');
        if (cachedUser) {
          return JSON.parse(cachedUser);
        }
      } catch (e) {
        // Önbellek hatası, devam et
      }
    }
    
    syncInProgress = true;
    
    try {
      // Supabase token'ını sistem token'ına senkronize et
      const rememberMe = localStorage.getItem("rememberMe") === "true";
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", session.access_token);
      
      // API header'larını Supabase token'ı ile yapılandır
      await configureAuthHeaders(session.access_token);
      
      // Mevcut syncSupabaseUser fonksiyonunu kullan
      const { syncSupabaseUser } = require('@/lib/supabase');
      const userData = await syncSupabaseUser(session);
      
      if (userData) {
        // Senkronizasyon bilgilerini güncelle
        lastEnhancedSyncTime = now;
        lastEnhancedSyncUserId = userId;
        
        // Backend farklı bir token döndürürse, onu kullan
        if (userData.token) {
          storage.setItem("token", userData.token);
          await configureAuthHeaders(userData.token);
        }
      }
      
      return userData;
    } finally {
      syncInProgress = false;
    }
  } catch (error) {
    console.error('Kullanıcı senkronizasyon hatası:', error);
    syncInProgress = false;
    return null;
  }
};

// Uygulama başladığında önbelleği yeniden yükleyelim
if (typeof window !== 'undefined') {
  try {
    lastEnhancedSyncTime = parseInt(localStorage.getItem('supabase_enhanced_sync_time') || '0');
    lastEnhancedSyncUserId = localStorage.getItem('supabase_enhanced_sync_user_id');
  } catch (e) {
    console.warn("Önbellek yüklenirken hata:", e);
  }
}