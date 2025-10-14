# Pizza Projesi - Frontend Dashboard Problemleri ve Çözüm Yol Haritası

**Proje:** nextjs-pizza (Frontend) ve pizza (Backend)  
**Durum:** İkisi de localde çalışıyor, request/response dönüyor  
**Odak:** Frontend dashboard ve genel problemler  
**Tarih:** 2025-10-13

---

## Tespit Edilen Problemler (20 Adet)

### Dashboard Sayfası Problemleri

#### Problem #1: Veri Yükleme Performansı
- `fetchDashboard` action'ı hem kategorileri hem kullanıcıları getirmeye çalışıyor
- Fallback mekanizması varsa da, birden fazla API isteği sırayla atılıyor (kategoriler + kullanıcılar)
- Dashboard açılışta 3-5 farklı API isteği yapıyor, bu yavaşlamaya neden oluyor
- `useDashboardDataLoader` hook'u her render'da yeniden çalışma riski taşıyor

#### Problem #2: Retry Mekanizması
- MAX_RETRIES 3 olarak ayarlanmış, ancak exponential backoff çok agresif
- İlk hatada 1 saniye, sonra 2, sonra 4 saniye bekliyor - kullanıcı deneyimi olumsuz etkileniyor

#### Problem #3: State Yönetimi
- `dataInitialized` state'i ile `useEffect` dependency array'i arasında potansiyel infinite loop riski
- Dashboard verileri hem Redux'ta (`dashboardData`) hem de lokal state'te tutuluyor - tek kaynak prensibi ihlal ediliyor

#### Problem #4: İstatistik Hesaplamaları
- `statistics` useMemo hook'u içinde her render'da karmaşık hesaplamalar yapılıyor
- Kategoriler üzerinde nested loop'lar (`category.products.forEach`) - büyük veri setlerinde performans sorunu

#### Problem #5: Hata Yönetimi
- API hataları için kullanıcıya sadece "Veri yüklenirken bir hata oluştu" mesajı gösteriliyor
- Hangi verinin yüklenemediği belli değil (kategori mi, kullanıcı mı, sipariş mi?)

---

### Siparişler Sayfası (Orders-Admin) Problemleri

#### Problem #6: Sürekli Polling/Fetching
- `fetchOrders` fonksiyonu 5 saniye kuralı ile sınırlanmış ama yine de çok sık çağrılabilir
- Kullanıcı sayfa içinde işlem yaptıkça sürekli yeni istekler atılıyor
- AbortController kullanılsa da, iptal mantığı tutarsız

#### Problem #7: Filter/Search Debounce
- 300ms debounce ile `filterOrders` çalışıyor ama yine de her değişiklikte tüm siparişler üzerinde filtreleme yapılıyor
- Büyük sipariş listelerinde performans sorunu

#### Problem #8: Memory Leak Riski
- `mountedRef` kullanılıyor ancak cleanup fonksiyonlarında `currentRequestRef.current` düzgün temizlenmiyor
- `useEffect` cleanup'larında bazı state güncellemeleri hala yapılabilir

#### Problem #9: Sipariş Güncelleme
- Her sipariş durumu güncellemesinde tüm siparişler yeniden çekiliyor (`fetchOrders(true)`)
- Sadece güncellenen siparişin state'te değiştirilmesi daha verimli olurdu

---

### Admin Layout Problemleri

#### Problem #10: Page Props Mantığı
- `children?.props?.pageProps` ve `children?.type?.props` kontrolü çok kırılgan
- Next.js App Router'da bu yapı çalışmayabilir

#### Problem #11: Global Modal Handler
- `window.openAdminModal` global scope'a ekleniyor - React best practices'e aykırı
- Modal açma işlemi DOM element ID'si (`admin-page-component`) ile yapılıyor - kırılgan

#### Problem #12: Mobile State
- `isMobile` state'i window resize event'inde her seferinde güncelleniyor
- Debounce/throttle olmadan performans sorunu yaratabilir

---

### Genel Redux/API Problemleri

#### Problem #13: Timeout Yönetimi
- `instance` ve `userInstance` için timeout yoruma alınmış - production'da timeout olmaması büyük sorun
- API istekleri sonsuz beklemeye girebilir
- **Dosya:** `src/lib/hooks.js`

#### Problem #14: Content-Type Yönetimi
- FormData için Content-Type header'ı siliniyor - bu doğru ancak kod içinde tutarsızlıklar var
- Bazı yerlerde FormData kontrolü yapılıyor, bazı yerlerde yapılmıyor
- **Dosya:** `src/lib/hooks.js` - request interceptor

#### Problem #15: Error Handling
- Her action'da ayrı ayrı error handling yapılıyor - merkezi bir error handling middleware'i yok
- Kullanıcıya gösterilen hata mesajları tutarsız
- **Dosyalar:** Tüm action dosyaları (`src/lib/store/actions/*`)

#### Problem #16: Custom Pizza Sipariş
- `/order/page.js` içinde custom pizza için backend'e istek gönderilmiyor
- Sadece Redux store'a ekleniyor - backend ile senkronizasyon yok
- **Dosya:** `src/app/order/page.js`

#### Problem #17: Cart Item ID Problemi
- `thirdStep.jsx` içinde sepet öğeleri backend'e gönderilirken `item.product.id` kullanılıyor
- Custom pizza'larda bu ID olmayabilir - backend hatası riski
- **Dosya:** `src/components/create-order-components/thirdStep.jsx`

#### Problem #18: Product Actions
- `fetchProductById` fonksiyonu sadece Redux store'a ekliyor, ayrı bir `currentProduct` state'i yok
- Aynı ID'ye sahip ürün zaten store'da varsa gereksiz istek atılıyor
- **Dosya:** `src/lib/store/actions/productActions.js`

#### Problem #19: Category Simple Endpoint
- `fetchCategories` ile `/category` endpoint'i kullanılıyor ama bir de `/category/simple` var
- Dashboard'da sadece kategori adları gerekiyorsa simple endpoint kullanılmalı
- **Dosya:** `src/lib/store/actions/categoryActions.js`

#### Problem #20: Loading States
- Global loading ve modül-specific loading state'leri karışıyor
- Kullanıcı bir sayfada birden fazla loading spinner görebilir
- **Dosyalar:** `src/lib/store/reducers/globalReducer.js` ve tüm modül reducer'ları

---

## Çözüm Sıralaması (Bağımlılık Bazlı)

### Grup 1: Temel Altyapı
**Bu grup düzelmeden diğer optimizasyonlar üzerine çalışmak verimsiz olur.**

1. **Problem #13 - Timeout Yönetimi**
   - Dosya: `src/lib/hooks.js`
   - Aksiyon: Timeout parametrelerini geri ekle

2. **Problem #14 - Content-Type Tutarlılığı**
   - Dosya: `src/lib/hooks.js`
   - Aksiyon: FormData kontrolünü tutarlı hale getir

3. **Problem #15 - Merkezi Error Handling**
   - Dosya: Yeni `src/lib/store/middleware/errorMiddleware.js` oluştur
   - Aksiyon: Merkezi error handling middleware'i ekle

4. **Problem #20 - Loading States Ayrımı**
   - Dosyalar: Tüm reducer'lar
   - Aksiyon: Global ve modül-specific loading'i ayır

---

### Grup 2: Redux State Yapısı
**State yapıları düzelmeden component optimizasyonları yaparsak, sonradan state değişikliği yapmak zorunda kalırız.**

5. **Problem #3 - Dashboard State Yönetimi**
   - Dosya: `src/app/(admin)/dashboard/page.js`
   - Aksiyon: Tek kaynak prensibi - sadece Redux kullan

6. **Problem #18 - Product Actions**
   - Dosya: `src/lib/store/actions/productActions.js` ve `src/lib/store/reducers/productReducer.js`
   - Aksiyon: `currentProduct` state'i ekle

---

### Grup 3: Admin Layout & Global Handlers
**Layout bileşeni tüm admin sayfalarını etkiliyor. Bunu düzelttikten sonra sayfa bazlı optimizasyonlara geçebiliriz.**

7. **Problem #10 - Page Props Mantığı**
   - Dosya: `src/app/(admin)/layout.js`
   - Aksiyon: Next.js App Router uyumlu props yönetimi

8. **Problem #11 - Global Modal Handler**
   - Dosya: `src/app/(admin)/layout.js`
   - Aksiyon: Context API veya state management ile modal yönetimi

9. **Problem #12 - Mobile State Debounce**
   - Dosya: `src/app/(admin)/layout.js`
   - Aksiyon: Resize event'ine debounce ekle

---

### Grup 4: Dashboard Sayfası Optimizasyonları
**Dashboard veri yükleme stratejisi düzeldikten sonra, üzerine retry ve hesaplama optimizasyonları eklenebilir.**

10. **Problem #1 - Dashboard Veri Yükleme Performansı**
    - Dosya: `src/lib/store/actions/adminActions.js` - `fetchDashboard`
    - Aksiyon: Parallel request'ler ve cache stratejisi

11. **Problem #19 - Category Simple Endpoint Kullanımı**
    - Dosya: `src/lib/store/actions/adminActions.js` - `fetchDashboard`
    - Aksiyon: `/category/simple` endpoint'i kullan

12. **Problem #2 - Retry Mekanizması**
    - Dosya: `src/app/(admin)/dashboard/page.js` - `useDashboardDataLoader`
    - Aksiyon: Retry timing'i yumuşat

13. **Problem #4 - İstatistik Hesaplamaları**
    - Dosya: `src/app/(admin)/dashboard/page.js`
    - Aksiyon: useMemo optimizasyonu, memoization

14. **Problem #5 - Dashboard Hata Yönetimi**
    - Dosya: `src/app/(admin)/dashboard/page.js`
    - Aksiyon: Detaylı hata mesajları

---

### Grup 5: Orders-Admin Sayfası Optimizasyonları
**Önce fetching stratejisi düzeltilmeli, sonra memory leak'ler önlenmeli, en son optimizasyon olarak filter işlemleri iyileştirilmeli.**

15. **Problem #6 - Sürekli Polling/Fetching**
    - Dosya: `src/app/(admin)/orders-admin/page.js`
    - Aksiyon: WebSocket veya daha akıllı polling stratejisi

16. **Problem #8 - Memory Leak Riski**
    - Dosya: `src/app/(admin)/orders-admin/page.js`
    - Aksiyon: Cleanup fonksiyonlarını düzelt

17. **Problem #9 - Sipariş Güncelleme**
    - Dosya: `src/app/(admin)/orders-admin/page.js`
    - Aksiyon: Optimistic update, sadece ilgili siparişi güncelle

18. **Problem #7 - Filter/Search Debounce**
    - Dosya: `src/app/(admin)/orders-admin/page.js`
    - Aksiyon: useMemo ile filtreleme optimizasyonu

---

### Grup 6: Sipariş Oluşturma (Custom Pizza & Cart)
**Bu ikisi birbirine bağlı. Custom pizza backend'e entegre edildikten sonra ID problemi otomatik çözülür.**

19. **Problem #16 - Custom Pizza Backend Entegrasyonu**
    - Dosya: `src/app/order/page.js`
    - Aksiyon: Custom pizza'yı backend'e kaydet

20. **Problem #17 - Cart Item ID Problemi**
    - Dosya: `src/components/create-order-components/thirdStep.jsx`
    - Aksiyon: ID kontrolü ve fallback mekanizması

---

## Önemli Notlar

- Backend'de hiçbir değişiklik yapılmayacak
- Her grup kendi içinde sıralı çözülmeli
- Bir sonraki gruba geçmeden önce önceki grup tamamlanmalı
- Her problem çözümünde test yapılmalı
- Git commit'leri problem bazlı atılmalı

---

## Mevcut Durum
- Backend: Çalışıyor ✅
- Frontend: Çalışıyor ✅
- Dashboard: Performans problemleri var ⚠️
- Orders-Admin: Polling ve memory leak problemleri var ⚠️
- Custom Pizza: Backend entegrasyonu yok ❌

---

**Son Güncelleme:** 2025-10-13  
**Durum:** Analiz tamamlandı, çözüme hazır