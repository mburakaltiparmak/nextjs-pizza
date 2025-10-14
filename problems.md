# Pizza Projesi - Frontend Dashboard Problemleri ve Çözüm Yol Haritası

**Proje:** nextjs-pizza (Frontend) ve pizza (Backend)  
**Durum:** İkisi de localde çalışıyor, request/response dönüyor  
**Odak:** Frontend dashboard ve genel problemler  
**Son Güncelleme:** 2025-10-14

---

## İlerleme Durumu

**✅ Tamamlanan:** Grup 1, Grup 2, Grup 3 (9/20 problem)  
**🔄 Devam Eden:** Grup 4 (Dashboard Sayfası Optimizasyonları)  
**⏳ Bekleyen:** Grup 5, Grup 6

---

## Tespit Edilen Problemler (20 Adet)

### Dashboard Sayfası Problemleri

#### Problem #1: Veri Yükleme Performansı
- `fetchDashboard` action'ı hem kategorileri hem kullanıcıları getirmeye çalışıyor
- Fallback mekanizması varsa da, birden fazla API isteği sırayla atılıyor (kategoriler + kullanıcılar)
- Dashboard açılışta 3-5 farklı API isteği yapıyor, bu yavaşlamaya neden oluyor
- **Durum:** ⏳ Bekliyor (Grup 4)

#### Problem #2: Retry Mekanizması
- MAX_RETRIES 3 olarak ayarlanmış, ancak exponential backoff çok agresif
- İlk hatada 1 saniye, sonra 2, sonra 4 saniye bekliyor - kullanıcı deneyimi olumsuz etkileniyor
- **Durum:** ⏳ Bekliyor (Grup 4)

#### Problem #3: State Yönetimi ✅
- Dashboard verileri hem Redux'ta (`dashboardData`) hem de lokal state'te tutuluyor - tek kaynak prensibi ihlal ediliyor
- **Çözüm:** Redux tek kaynak olarak kullanılıyor, `useDashboardData` hook'u ile yönetiliyor
- **Durum:** ✅ Tamamlandı (Grup 2)

#### Problem #4: İstatistik Hesaplamaları
- `statistics` useMemo hook'u içinde her render'da karmaşık hesaplamalar yapılıyor
- Kategoriler üzerinde nested loop'lar (`category.products.forEach`) - büyük veri setlerinde performans sorunu
- **Durum:** ⏳ Bekliyor (Grup 4)

#### Problem #5: Hata Yönetimi
- API hataları için kullanıcıya sadece "Veri yüklenirken bir hata oluştu" mesajı gösteriliyor
- Hangi verinin yüklenemediği belli değil (kategori mi, kullanıcı mı, sipariş mi?)
- **Durum:** ⏳ Bekliyor (Grup 4)

---

### Siparişler Sayfası (Orders-Admin) Problemleri

#### Problem #6: Sürekli Polling/Fetching
- `fetchOrders` fonksiyonu 5 saniye kuralı ile sınırlanmış ama yine de çok sık çağrılabilir
- Kullanıcı sayfa içinde işlem yaptıkça sürekli yeni istekler atılıyor
- AbortController kullanılsa da, iptal mantığı tutarsız
- **Durum:** ⏳ Bekliyor (Grup 5)

#### Problem #7: Filter/Search Debounce
- 300ms debounce ile `filterOrders` çalışıyor ama yine de her değişiklikte tüm siparişler üzerinde filtreleme yapılıyor
- Büyük sipariş listelerinde performans sorunu
- **Durum:** ⏳ Bekliyor (Grup 5)

#### Problem #8: Memory Leak Riski
- `mountedRef` kullanılıyor ancak cleanup fonksiyonlarında `currentRequestRef.current` düzgün temizlenmiyor
- `useEffect` cleanup'larında bazı state güncellemeleri hala yapılabilir
- **Durum:** ⏳ Bekliyor (Grup 5)

#### Problem #9: Sipariş Güncelleme
- Her sipariş durumu güncellemesinde tüm siparişler yeniden çekiliyor (`fetchOrders(true)`)
- Sadece güncellenen siparişin state'te değiştirilmesi daha verimli olurdu
- **Durum:** ⏳ Bekliyor (Grup 5)

---

### Admin Layout Problemleri

#### Problem #10: Page Props Mantığı ✅
- `children?.props?.pageProps` ve `children?.type?.props` kontrolü çok kırılgan - Next.js App Router'da bu yapı çalışmayabilir
- **Çözüm:** `AdminLayoutContext` ile pathname'den config oluşturuldu, `getPageConfig` fonksiyonu kullanılıyor
- **Durum:** ✅ Tamamlandı (Grup 3)

#### Problem #11: Global Modal Handler ✅
- `window.openAdminModal` global scope'a ekleniyor - React best practices'e aykırı
- Modal açma işlemi DOM element ID'si ile yapılıyordu - kırılgan
- **Çözüm:** `AdminLayoutContext` ve `useAdminLayout` hook'u ile modal yönetimi yapılıyor
- **Durum:** ✅ Tamamlandı (Grup 3)

#### Problem #12: Mobile State ✅
- `isMobile` state'i window resize event'inde her seferinde güncelleniyor - debounce/throttle olmadan performans sorunu yaratabilir
- **Çözüm:** `useMobileDetection` hook'u oluşturuldu, 150ms debounce eklendi
- **Durum:** ✅ Tamamlandı (Grup 3)

---

### Genel Redux/API Problemleri

#### Problem #13: Timeout Yönetimi ✅
- `instance` ve `userInstance` için timeout yoruma alınmış - production'da timeout olmaması büyük sorun
- **Çözüm:** `API_TIMEOUT = 15000` tanımlandı, her iki instance için de uygulandı
- **Dosya:** `src/lib/hooks.js`
- **Durum:** ✅ Tamamlandı (Grup 1)

#### Problem #14: Content-Type Yönetimi ✅
- FormData için Content-Type header'ı siliniyor - bazı yerlerde FormData kontrolü tutarsız
- **Çözüm:** Request interceptor'da tutarlı `instanceof FormData` kontrolü yapılıyor
- **Dosya:** `src/lib/hooks.js`
- **Durum:** ✅ Tamamlandı (Grup 1)

#### Problem #15: Error Handling ✅
- Her action'da ayrı ayrı error handling yapılıyor - merkezi bir error handling middleware'i yok
- **Çözüm:** `errorMiddleware.js` oluşturuldu, `handleApiError` ve `parseErrorMessage` fonksiyonları eklendi
- **Dosyalar:** `src/lib/store/middleware/errorMiddleware.js`, tüm action dosyaları
- **Durum:** ✅ Tamamlandı (Grup 1)

#### Problem #16: Custom Pizza Sipariş
- `/order/page.js` içinde custom pizza için backend'e istek gönderilmiyor
- Sadece Redux store'a ekleniyor - backend ile senkronizasyon yok
- **Dosya:** `src/app/order/page.js`
- **Durum:** ⏳ Bekliyor (Grup 6)

#### Problem #17: Cart Item ID Problemi
- `thirdStep.jsx` içinde sepet öğeleri backend'e gönderilirken `item.product.id` kullanılıyor
- Custom pizza'larda bu ID olmayabilir - backend hatası riski
- **Dosya:** `src/components/create-order-components/thirdStep.jsx`
- **Durum:** ⏳ Bekliyor (Grup 6)

#### Problem #18: Product Actions ✅
- `fetchProductById` fonksiyonu sadece Redux store'a ekliyor, ayrı bir `currentProduct` state'i yok
- **Çözüm:** `currentProduct` state'i ve `currentProductFetchState` eklendi, `setCurrentProduct` ve `clearCurrentProduct` action'ları mevcut
- **Dosyalar:** `src/lib/store/actions/productActions.js`, `src/lib/store/reducers/productReducer.js`
- **Durum:** ✅ Tamamlandı (Grup 2)

#### Problem #19: Category Simple Endpoint
- `fetchCategories` ile `/category` endpoint'i kullanılıyor ama bir de `/category/simple` var
- Dashboard'da sadece kategori adları gerekiyorsa simple endpoint kullanılmalı
- **Dosya:** `src/lib/store/actions/categoryActions.js`
- **Durum:** ⏳ Bekliyor (Grup 4)

#### Problem #20: Loading States ✅
- Global loading ve modül-specific loading state'leri karışıyor
- **Çözüm:** `moduleLoading` object'i ile her modül için ayrı loading state'i tutuluyor
- **Dosyalar:** `src/lib/store/reducers/globalReducer.js`, tüm reducer'lar
- **Durum:** ✅ Tamamlandı (Grup 1)

---

## Çözüm Sıralaması (Bağımlılık Bazlı)

### ✅ Grup 1: Temel Altyapı (TAMAMLANDI)
**Bu grup düzelmeden diğer optimizasyonlar üzerine çalışmak verimsiz olur.**

1. **✅ Problem #13 - Timeout Yönetimi**
   - Dosya: `src/lib/hooks.js`
   - Aksiyon: Timeout parametrelerini geri ekle
   - Çözüm: `API_TIMEOUT = 15000` eklendi

2. **✅ Problem #14 - Content-Type Tutarlılığı**
   - Dosya: `src/lib/hooks.js`
   - Aksiyon: FormData kontrolünü tutarlı hale getir
   - Çözüm: Request interceptor'da tutarlı kontrol yapılıyor

3. **✅ Problem #15 - Merkezi Error Handling**
   - Dosya: `src/lib/store/middleware/errorMiddleware.js`
   - Aksiyon: Merkezi error handling middleware'i ekle
   - Çözüm: Middleware oluşturuldu ve store'a eklendi

4. **✅ Problem #20 - Loading States Ayrımı**
   - Dosyalar: Tüm reducer'lar
   - Aksiyon: Global ve modül-specific loading'i ayır
   - Çözüm: `moduleLoading` object'i eklendi

---

### ✅ Grup 2: Redux State Yapısı (TAMAMLANDI)
**State yapıları düzelmeden component optimizasyonları yaparsak, sonradan state değişikliği yapmak zorunda kalırız.**

5. **✅ Problem #3 - Dashboard State Yönetimi**
   - Dosya: `src/app/(admin)/dashboard/page.js`
   - Aksiyon: Tek kaynak prensibi - sadece Redux kullan
   - Çözüm: `useDashboardData` hook'u ile Redux yönetimi

6. **✅ Problem #18 - Product Actions**
   - Dosyalar: `src/lib/store/actions/productActions.js`, `src/lib/store/reducers/productReducer.js`
   - Aksiyon: `currentProduct` state'i ekle
   - Çözüm: `currentProduct` ve ilgili action'lar eklendi

---

### ✅ Grup 3: Admin Layout & Global Handlers (TAMAMLANDI)
**Layout bileşeni tüm admin sayfalarını etkiliyor. Bunu düzelttikten sonra sayfa bazlı optimizasyonlara geçebiliriz.**

7. **✅ Problem #10 - Page Props Mantığı**
   - Dosya: `src/app/(admin)/layout.js`
   - Aksiyon: Next.js App Router uyumlu props yönetimi
   - Çözüm: `AdminLayoutContext` ile pathname'den config

8. **✅ Problem #11 - Global Modal Handler**
   - Dosya: `src/app/(admin)/layout.js`
   - Aksiyon: Context API ile modal yönetimi
   - Çözüm: `useAdminLayout` hook'u oluşturuldu

9. **✅ Problem #12 - Mobile State Debounce**
   - Dosya: `src/app/(admin)/layout.js`
   - Aksiyon: Resize event'ine debounce ekle
   - Çözüm: `useMobileDetection` hook'u ile 150ms debounce

---

### 🔄 Grup 4: Dashboard Sayfası Optimizasyonları (DEVAM EDİYOR)
**Dashboard veri yükleme stratejisi düzeldikten sonra, üzerine retry ve hesaplama optimizasyonları eklenebilir.**

10. **⏳ Problem #1 - Dashboard Veri Yükleme Performansı**
    - Dosya: `src/lib/store/actions/adminActions.js` - `fetchDashboard`
    - Aksiyon: Parallel request'ler ve cache stratejisi
    - Hedef: Promise.all ile paralel istekler, cache mekanizması

11. **⏳ Problem #19 - Category Simple Endpoint Kullanımı**
    - Dosya: `src/lib/store/actions/adminActions.js` - `fetchDashboard`
    - Aksiyon: `/category/simple` endpoint'i kullan
    - Hedef: Gereksiz ürün verilerini çekmemek

12. **⏳ Problem #2 - Retry Mekanizması**
    - Dosya: `src/lib/hooks/useDashboardData.js`
    - Aksiyon: Retry timing'i yumuşat
    - Hedef: Daha kullanıcı dostu backoff stratejisi

13. **⏳ Problem #4 - İstatistik Hesaplamaları**
    - Dosya: `src/app/(admin)/dashboard/page.js`
    - Aksiyon: useMemo optimizasyonu, memoization
    - Hedef: Gereksiz hesaplamaları önlemek

14. **⏳ Problem #5 - Dashboard Hata Yönetimi**
    - Dosya: `src/app/(admin)/dashboard/page.js`
    - Aksiyon: Detaylı hata mesajları
    - Hedef: Kullanıcıya hangi verinin yüklenemediğini göstermek

---

### ⏳ Grup 5: Orders-Admin Sayfası Optimizasyonları
**Önce fetching stratejisi düzeltilmeli, sonra memory leak'ler önlenmeli, en son optimizasyon olarak filter işlemleri iyileştirilmeli.**

15. **⏳ Problem #6 - Sürekli Polling/Fetching**
    - Dosya: `src/app/(admin)/orders-admin/page.js`
    - Aksiyon: WebSocket veya daha akıllı polling stratejisi
    - Hedef: Gereksiz istekleri azaltmak

16. **⏳ Problem #8 - Memory Leak Riski**
    - Dosya: `src/app/(admin)/orders-admin/page.js`
    - Aksiyon: Cleanup fonksiyonlarını düzelt
    - Hedef: Component unmount'ta düzgün temizlik

17. **⏳ Problem #9 - Sipariş Güncelleme**
    - Dosya: `src/app/(admin)/orders-admin/page.js`
    - Aksiyon: Optimistic update, sadece ilgili siparişi güncelle
    - Hedef: Tüm listeyi yeniden çekmeden güncelleme

18. **⏳ Problem #7 - Filter/Search Debounce**
    - Dosya: `src/app/(admin)/orders-admin/page.js`
    - Aksiyon: useMemo ile filtreleme optimizasyonu
    - Hedef: Büyük listelerde performans iyileştirmesi

---

### ⏳ Grup 6: Sipariş Oluşturma (Custom Pizza & Cart)
**Bu ikisi birbirine bağlı. Custom pizza backend'e entegre edildikten sonra ID problemi otomatik çözülür.**

19. **⏳ Problem #16 - Custom Pizza Backend Entegrasyonu**
    - Dosya: `src/app/order/page.js`
    - Aksiyon: Custom pizza'yı backend'e kaydet
    - Hedef: Backend ile senkronizasyon

20. **⏳ Problem #17 - Cart Item ID Problemi**
    - Dosya: `src/components/create-order-components/thirdStep.jsx`
    - Aksiyon: ID kontrolü ve fallback mekanizması
    - Hedef: Custom pizza ID'lerini düzgün işlemek

---

## İlerleme İstatistikleri

| Grup | Tamamlanan | Toplam | İlerleme |
|------|-----------|--------|----------|
| Grup 1 | 4 | 4 | 100% ✅ |
| Grup 2 | 2 | 2 | 100% ✅ |
| Grup 3 | 3 | 3 | 100% ✅ |
| Grup 4 | 0 | 5 | 0% 🔄 |
| Grup 5 | 0 | 4 | 0% ⏳ |
| Grup 6 | 0 | 2 | 0% ⏳ |
| **TOPLAM** | **9** | **20** | **45%** |

---

## Önemli Notlar

- ✅ Backend'de hiçbir değişiklik yapılmayacak
- ✅ Her grup kendi içinde sıralı çözülmeli
- ✅ Bir sonraki gruba geçmeden önce önceki grup tamamlanmalı
- ✅ Her problem çözümünde test yapılmalı
- ✅ Git commit'leri problem bazlı atılmalı

---

## Mevcut Durum

- Backend: Çalışıyor ✅
- Frontend: Çalışıyor ✅
- **Grup 1-3: Tamamlandı ✅**
- **Grup 4: Devam ediyor 🔄**
- Dashboard: Temel optimizasyonlar yapıldı, performans iyileştirmeleri bekleniyor ⚠️
- Orders-Admin: Polling ve memory leak problemleri var ⚠️
- Custom Pizza: Backend entegrasyonu yok ❌

---

## Sonraki Adımlar

1. **Grup 4'ü tamamla** - Dashboard veri yükleme ve performans optimizasyonları
2. **Grup 5'e geç** - Orders-Admin sayfası optimizasyonları
3. **Grup 6'yı bitir** - Custom Pizza backend entegrasyonu

---

**Son Güncelleme:** 2025-10-14  
**Durum:** Grup 3 tamamlandı, Grup 4'e hazır 🚀