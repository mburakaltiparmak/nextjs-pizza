import { createClient } from "@supabase/supabase-js";
import { instance } from "./hooks";

// Supabase URL ve anon key
const supabaseUrl = "https://nslkxjzddnjpouzkevii.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbGt4anpkZG5qcG91emtldmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MDA0MjgsImV4cCI6MjA1ODA3NjQyOH0.DP3uywujLW1JzVBOVi3g5M4LKZ4ZzwqtQIGgmWFdMms";

// Supabase client oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Senkronizasyon için bir zamanlaması kaydı
const SYNC_INTERVAL_MS = 1000 * 60 * 60; // 1 saat
let lastSyncTime = 0;
let lastSyncUserId = null;
let syncPromise = null;

/**
 * Supabase kullanıcısını backend ile senkronize eder
 * @param {object} session - Supabase auth session
 * @returns {Promise<object|null>} - Backend'den dönen kullanıcı verisi
 */
export async function syncSupabaseUser(session) {
  if (!session) return null;

  try {
    const { user } = session;
    const now = Date.now();

    // Senkronizasyon halihazırda devam ediyorsa bekleyelim
    if (syncPromise) {
      return await syncPromise;
    }

    // Son senkronizasyondan bu yana yeterince zaman geçti mi?
    // Veya kullanıcı değişti mi?
    if (lastSyncUserId === user.id && now - lastSyncTime < SYNC_INTERVAL_MS) {
      console.log("Yakın zamanda senkronizasyon yapıldı, atlanıyor.");
      // localStorage'dan kullanıcı bilgilerini çekmeyi deneyelim
      try {
        const cachedUser = localStorage.getItem("supabase_user_data");
        if (cachedUser) {
          return JSON.parse(cachedUser);
        }
      } catch (e) {
        console.warn("Önbellekten kullanıcı bilgisi alınamadı:", e);
      }
    }

    // Senkronizasyonu başlat ve promise'i kaydet
    syncPromise = (async () => {
      try {
        // fetch yerine instance kullanarak baseURL ile istek yapıyoruz
        const response = await instance.post(
          "/auth/sync-supabase-user",
          {
            email: user.email,
            name:
              user.user_metadata?.name ||
              user.user_metadata?.full_name?.split(" ")[0] ||
              "",
            surname:
              user.user_metadata?.family_name ||
              (user.user_metadata?.full_name
                ? user.user_metadata.full_name.split(" ").slice(1).join(" ")
                : ""),
            phoneNumber: user.user_metadata?.phone || "",
            supabaseId: user.id,
          },
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (response.status === 200) {
          const userData = response.data;

          // Senkronizasyon zamanı ve kullanıcı ID'sini kaydet
          lastSyncTime = now;
          lastSyncUserId = user.id;

          // Veriyi önbelleğe al
          try {
            localStorage.setItem(
              "supabase_user_data",
              JSON.stringify(userData)
            );
            localStorage.setItem("supabase_sync_time", now.toString());
            localStorage.setItem("supabase_sync_user_id", user.id);
          } catch (e) {
            console.warn("Kullanıcı verisi önbelleğe kaydedilemedi:", e);
          }

          return userData;
        }

        return null;
      } catch (error) {
        console.error("Backend senkronizasyon hatası:", error);
        return null;
      } finally {
        syncPromise = null;
      }
    })();

    return await syncPromise;
  } catch (error) {
    console.error("Backend senkronizasyon hatası:", error);
    syncPromise = null;
    return null;
  }
}

// Uygulama başladığında önbelleği yeniden yükleyelim
if (typeof window !== "undefined") {
  try {
    lastSyncTime = parseInt(localStorage.getItem("supabase_sync_time") || "0");
    lastSyncUserId = localStorage.getItem("supabase_sync_user_id");
  } catch (e) {
    console.warn("Önbellek yüklenirken hata:", e);
  }
}
