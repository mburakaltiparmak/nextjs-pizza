// lib/supabaseSync.js
import { instance } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';

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
// supabaseSync.js içinde syncSupabaseTokenToSystem fonksiyonunu güncelleme
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
      dispatch(setToken(token));
      dispatch(setIsLogin(true));
      if (email) {
        dispatch(setEmail(email));
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
  
  // Token'ın backend ile geçerli olup olmadığını kontrol et
  try {
    // Bu endpoint hem JWT hem de Supabase token'larını işleyebilmeli
    const response = await instance.post('/auth/validate-token');
    return response.data?.valid || false;
  } catch (error) {
    console.warn('Token doğrulama başarısız:', error.message);
    return false;
  }
};

/**
 * Geliştirilmiş syncSupabaseUser fonksiyonu
 */
export const enhancedSyncSupabaseUser = async (session) => {
  if (!session || !session.access_token) {
    console.error('Senkronizasyon için geçersiz oturum nesnesi');
    return null;
  }
  
  try {
    // Supabase token'ını sistem token'ına senkronize et
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("token", session.access_token);
    
    // API header'larını önce Supabase token'ı ile yapılandır
    await configureAuthHeaders(session.access_token);
    
    // Şimdi backend ile senkronizasyon yap
    const response = await fetch('/api/auth/sync-supabase-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        email: session.user.email,
        name: session.user.user_metadata?.name || 
              session.user.user_metadata?.full_name?.split(' ')[0] || '',
        surname: session.user.user_metadata?.family_name || 
                (session.user.user_metadata?.full_name ? 
                 session.user.user_metadata.full_name.split(' ').slice(1).join(' ') : ''),
        phoneNumber: session.user.user_metadata?.phone || '',
        supabaseId: session.user.id,
        provider: 'google'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend kullanıcı senkronizasyonu başarısız:', errorData);
      throw new Error(`Senkronizasyon başarısız, durum: ${response.status}`);
    }
    
    const userData = await response.json();
    
    // Eğer backend farklı bir token döndürürse, onu kullan
    if (userData.token) {
      storage.setItem("token", userData.token); // System token'ı güncelle
      await configureAuthHeaders(userData.token);
    }
    
    return userData;
  } catch (error) {
    console.error('Kullanıcı senkronizasyon hatası:', error);
    return null;
  }
};