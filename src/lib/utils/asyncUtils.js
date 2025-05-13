/**
 * Gelişmiş asenkron istek yönetimi için yardımcı fonksiyonlar.
 * Bu fonksiyonlar API çağrılarını deduplikasyon ve önbellekleme ile optimize eder.
 */

/**
 * İstekleri ertelemek ve deduplication için gelişmiş yardımcı fonksiyon
 * @param {Function} asyncFn - Asenkron fonksiyon
 * @param {number} lockTime - Kilit süresi (ms)
 * @returns {Function} - Kilitli ve ertelemeli fonksiyon
 */
export const debouncedPromise = (asyncFn, lockTime = 2000) => {
  let inProgress = false;
  let lastRunTime = 0;
  let currentPromise = null;

  return async (...args) => {
    const now = Date.now();

    // Son çalıştırmadan beri belirli bir süre geçmediyse önbellekten sonuç döndür
    if (now - lastRunTime < lockTime) {
      if (currentPromise) {
        console.log(
          `Son çalıştırmadan bu yana ${lockTime}ms geçmedi, mevcut Promise döndürülüyor. Geçen süre: ${
            now - lastRunTime
          }ms`
        );
        return currentPromise;
      }

      console.log(`Son çalıştırmadan bu yana ${lockTime}ms geçmedi, atlıyor`);
      return Promise.resolve(null);
    }

    // Eğer halen işlemde ise bekle
    if (inProgress) {
      console.log("İşlem zaten devam ediyor, tamamlanana kadar bekleniyor");
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!inProgress) {
            clearInterval(checkInterval);
            resolve(currentPromise);
          }
        }, 100);
      });
    }

    try {
      // İşlem başlıyor olarak işaretle
      inProgress = true;

      // Son çalıştırma zamanını güncelle
      lastRunTime = now;

      console.log("Yeni asenkron işlem başlatılıyor");
      currentPromise = asyncFn(...args);

      // Asenkron işlemin sonucunu bekle ve döndür
      return await currentPromise;
    } finally {
      // İşlem bitti olarak işaretle
      // Küçük bir gecikme ile race conditionları önle
      setTimeout(() => {
        inProgress = false;
      }, 100);
    }
  };
};

/**
 * Belirli bir asenkron fonksiyonu zamanlanmış önbellekleme ile saran fonksiyon
 * API istekleri gibi maliyetli işlemleri optimize etmek için kullanılır
 *
 * @param {Function} fn - Sarılacak asenkron fonksiyon
 * @param {number} cacheTimeMs - Önbellek geçerlilik süresi (ms)
 * @returns {Function} - Önbellekli fonksiyon
 */
export const createDebouncedRequest = (fn, cacheTimeMs = 2000) => {
  let inProgress = false;
  let currentPromise = null;
  let lastRunTime = 0;
  let lastResult = null;

  return async (...args) => {
    const now = Date.now();

    // Önbellek hala geçerliyse önbellekten döndür
    if (now - lastRunTime < cacheTimeMs) {
      console.log(
        `Önbellekteki sonuç döndürülüyor. Geçen süre: ${
          now - lastRunTime
        }ms, max: ${cacheTimeMs}ms`
      );
      return lastResult !== null ? lastResult : true;
    }

    // Zaten çalışıyorsa, tamamlanmasını bekle
    if (inProgress && currentPromise) {
      console.log("İşlem zaten devam ediyor, mevcut Promise döndürülüyor");
      return currentPromise;
    }

    // Yeni bir işlem başlat
    try {
      console.log("Yeni debounced istek başlatılıyor");
      inProgress = true;

      // Promise'i oluştur ve çalıştır
      currentPromise = fn(...args);

      // Sonucu bekle ve önbelleğe al
      lastResult = await currentPromise;
      lastRunTime = Date.now();

      return lastResult;
    } finally {
      // Temizlik işlemi
      setTimeout(() => {
        inProgress = false;
        currentPromise = null;
      }, 100);
    }
  };
};

/**
 * İşlemi bitmiş Promise'i "deduplikasyon" için önbellekleyen fonksiyon
 * Özellikle auth durumu kontrolü gibi tekrarlanan işlemler için
 *
 * @param {Function} asyncFn - Asenkron fonksiyon
 * @param {Object} options - Seçenekler
 * @param {number} options.cacheTime - Önbellek geçerlilik süresi (ms)
 * @param {boolean} options.resetOnError - Hata durumunda önbelleği sıfırla
 * @returns {Function} - Önbellekli fonksiyon
 */
export const memoizePromise = (
  asyncFn,
  { cacheTime = 5000, resetOnError = true } = {}
) => {
  let cachedPromise = null;
  let lastCallTime = 0;

  return async (...args) => {
    const now = Date.now();

    // Eğer önbelleğe alınmış bir Promise varsa ve henüz zaman aşımına uğramamışsa
    if (cachedPromise && now - lastCallTime < cacheTime) {
      return cachedPromise;
    }

    try {
      // Yeni bir Promise oluştur ve önbelleğe al
      lastCallTime = now;
      cachedPromise = asyncFn(...args);

      // Sonucu bekle ve döndür
      return await cachedPromise;
    } catch (error) {
      // Hata durumunda önbelleği sıfırla
      if (resetOnError) {
        cachedPromise = null;
        lastCallTime = 0;
      }
      throw error;
    }
  };
};
