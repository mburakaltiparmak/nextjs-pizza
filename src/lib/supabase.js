import { createClient } from '@supabase/supabase-js';
import { instance } from './hooks';

// Supabase URL ve anon key
const supabaseUrl = 'https://nslkxjzddnjpouzkevii.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbGt4anpkZG5qcG91emtldmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MDA0MjgsImV4cCI6MjA1ODA3NjQyOH0.DP3uywujLW1JzVBOVi3g5M4LKZ4ZzwqtQIGgmWFdMms';

// Supabase client oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase kullanıcısını backend ile senkronize eder
 * @param {object} session - Supabase auth session
 * @returns {Promise<object|null>} - Backend'den dönen kullanıcı verisi
 */
export async function syncSupabaseUser(session) {
  if (!session) return null;
  
  try {
    const { user } = session;
    
    // URL'yi düzelt - "/pizza" kısmını kaldır
    const response = await fetch('/api/auth/sync-supabase-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        email: user.email,
        name: user.user_metadata?.name || user.user_metadata?.full_name?.split(' ')[0] || '',
        surname: user.user_metadata?.family_name || 
                (user.user_metadata?.full_name ? 
                 user.user_metadata.full_name.split(' ').slice(1).join(' ') : ''),
        phoneNumber: user.user_metadata?.phone || '',
        supabaseId: user.id
      })
    });
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Backend senkronizasyon hatası:', error);
    return null;
  }
}