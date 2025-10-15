/**
 * Basit Cache Yöneticisi
 * Redux action'larda kullanılmak üzere
 * 
 * Kullanım:
 * import cache from '@/lib/utils/cacheManager';
 * 
 * // Cache'e kaydet
 * cache.set('key', data, 5 * 60 * 1000); // 5 dakika
 * 
 * // Cache'den oku
 * const cached = cache.get('key');
 * if (cached) { ... }
 * 
 * // Cache temizle
 * cache.clear('key'); // Tek key
 * cache.clear();      // Tümü
 */
class CacheManager {
  constructor() {
    this.caches = new Map();
    this.defaultDuration = 5 * 60 * 1000; // 5 dakika (300 saniye)
  }

  /**
   * Cache'e veri kaydet
   * @param {string} key - Cache anahtarı
   * @param {any} data - Kaydedilecek veri
   * @param {number} duration - Cache süresi (ms), varsayılan 5 dakika
   */
  set(key, data, duration = this.defaultDuration) {
    this.caches.set(key, {
      data,
      timestamp: Date.now(),
      duration
    });
    console.log(`📦 Cache Set: ${key} (${duration/1000}s)`);
  }

  /**
   * Cache'den veri oku
   * @param {string} key - Cache anahtarı
   * @returns {any|null} Cached data veya null
   */
  get(key) {
    const cached = this.caches.get(key);
    
    if (!cached) {
      console.log(`❌ Cache Miss: ${key}`);
      return null;
    }

    const now = Date.now();
    const age = now - cached.timestamp;

    // Expired kontrolü
    if (age > cached.duration) {
      console.log(`⏰ Cache Expired: ${key} (${(age/1000).toFixed(1)}s old)`);
      this.caches.delete(key);
      return null;
    }

    console.log(`✅ Cache Hit: ${key} (${(age/1000).toFixed(1)}s old)`);
    return cached.data;
  }

  /**
   * Cache'i temizle
   * @param {string} key - Cache anahtarı (opsiyonel, yoksa tümünü temizler)
   */
  clear(key = null) {
    if (key) {
      this.caches.delete(key);
      console.log(`🗑️ Cache Cleared: ${key}`);
    } else {
      this.caches.clear();
      console.log(`🗑️ All Caches Cleared`);
    }
  }

  /**
   * Pattern'a uyan cache'leri temizle
   * @param {string} pattern - Regex pattern
   * @example
   * cache.clearPattern('product_'); // product_ ile başlayan tüm cache'leri temizle
   */
  clearPattern(pattern) {
    const regex = new RegExp(pattern);
    const keys = Array.from(this.caches.keys());
    
    let clearedCount = 0;
    keys.forEach(key => {
      if (regex.test(key)) {
        this.caches.delete(key);
        console.log(`🗑️ Cache Cleared (pattern): ${key}`);
        clearedCount++;
      }
    });

    if (clearedCount > 0) {
      console.log(`🗑️ Total ${clearedCount} caches cleared by pattern: ${pattern}`);
    }
  }

  /**
   * Cache istatistikleri
   * @returns {Object} Cache stats
   */
  stats() {
    const now = Date.now();
    const items = [];
    let valid = 0;
    let expired = 0;

    this.caches.forEach((cache, key) => {
      const age = now - cache.timestamp;
      const isExpired = age > cache.duration;

      if (isExpired) {
        expired++;
      } else {
        valid++;
      }

      items.push({
        key,
        age: `${(age/1000).toFixed(1)}s`,
        duration: `${(cache.duration/1000).toFixed(1)}s`,
        expired: isExpired
      });
    });

    const stats = {
      total: this.caches.size,
      valid,
      expired,
      items
    };

    console.table(items);
    return stats;
  }

  /**
   * Tüm cache'leri listele (debug için)
   */
  list() {
    console.log("📋 Cache List:");
    this.caches.forEach((cache, key) => {
      const age = Date.now() - cache.timestamp;
      const isExpired = age > cache.duration;
      console.log(`  ${key}: ${isExpired ? '⏰ EXPIRED' : '✅ VALID'} (${(age/1000).toFixed(1)}s old)`);
    });
  }

  /**
   * Belirli bir key'in durumunu kontrol et
   * @param {string} key - Cache anahtarı
   * @returns {Object|null} Cache info veya null
   */
  info(key) {
    const cached = this.caches.get(key);
    
    if (!cached) {
      console.log(`ℹ️ Cache not found: ${key}`);
      return null;
    }

    const now = Date.now();
    const age = now - cached.timestamp;
    const isExpired = age > cached.duration;
    const remainingTime = cached.duration - age;

    const info = {
      key,
      exists: true,
      expired: isExpired,
      age: `${(age/1000).toFixed(1)}s`,
      duration: `${(cached.duration/1000).toFixed(1)}s`,
      remainingTime: isExpired ? 0 : `${(remainingTime/1000).toFixed(1)}s`,
      dataType: typeof cached.data,
      dataSize: JSON.stringify(cached.data).length
    };

    console.log(`ℹ️ Cache Info:`, info);
    return info;
  }
}

// Singleton instance
const cache = new CacheManager();

// Default export
export default cache;

// Named export (opsiyonel)
export { cache };