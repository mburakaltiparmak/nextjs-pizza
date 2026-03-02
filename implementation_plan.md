# Pizza Projesi - Bug Fix & Cleanup Implementation Plan

**Proje:** nextjs-pizza (Frontend)  
**Tarih:** 2026-03-02  
**Kapsam:** Custom pizza özelliğinin kaldırılması + 10 kritik bug fix  
**Kural:** Backend'de hiçbir değişiklik yapılmayacak

---

## Tespit Edilen Buglar (Özet)

| #   | Bug                                                                         | Önem       | Kategori        |
| --- | --------------------------------------------------------------------------- | ---------- | --------------- |
| B1  | `?login=true` redirect döngüsü — guest kullanıcı login'e zorlanıyor         | 🔴 Kritik  | Auth            |
| B2  | Misafir siparişte email backend'e ulaşmıyor → 400 hatası                    | 🔴 Kritik  | Checkout        |
| B3  | GuestInfoForm ile firstStep arasında state senkronizasyonu bozuk            | 🟡 Orta    | State           |
| B4  | `/checkout` URL'sine direkt erişimde guest context yok                      | 🟡 Orta    | Auth            |
| B5  | Middleware ve AuthContext çift redirect çakışması                           | 🟡 Orta    | Auth            |
| B6  | `?login=true` URL parametresi modal kapandığında temizlenmiyor              | 🟡 Orta    | UX              |
| B7  | `isStep1Valid` kontrolü guest email'i doğrulamıyor                          | 🟡 Orta    | Validation      |
| B8  | Guest mode state'i sayfa yenilemesinde kayboluyor (persist yok)             | 🟡 Orta    | State           |
| B9  | Guest data (name, email, phone) sayfa yenilemesinde kayboluyor              | 🟡 Orta    | State           |
| B10 | SuccessClient'ta `clearGuest()` zamanlama sorunu — bilgiler erken siliniyor | 🟡 Orta    | Lifecycle       |
| CP  | Custom pizza özelliği frontend'den tamamen kaldırılacak                     | 🔵 Cleanup | Feature Removal |

---

## Faz Yapısı

```
Faz 0: Custom Pizza Kaldırma (bağımsız, ilk yapılmalı)
  ↓
Faz 1: Auth & Redirect Düzeltmeleri (B1, B5, B6)
  ↓
Faz 2: Guest Mode Persistence (B4, B8, B9)
  ↓
Faz 3: Guest Checkout Email Akışı (B2, B3, B7)
  ↓
Faz 4: Success Sayfası & Son Düzeltmeler (B10)
  ↓
Faz 5: Test & Doğrulama
```

---

## Faz 0: Custom Pizza Kaldırma

**Amaç:** Backend'den kaldırılan custom pizza özelliğinin frontend'deki tüm izlerini temizlemek.

### Adım 0.1 — Route ve Sayfa Silme

**Silinecek dizin:**

- `src/app/order/` — Tüm dizin (custom pizza builder sayfası)

**Etki:** `/order` route'u artık 404 dönecek.

**Commit:** `feat: remove custom pizza builder page`

### Adım 0.2 — `create-order-components` Dizini Temizleme

Bu dizindeki dosyalar checkout step component'leri, custom pizza değil. Ancak `thirdStep.jsx` içinde custom pizza referansları olabilir. Aranacak pattern'ler:

- `isCustom` / `isCustomPizza` / `customPizza`
- `custom-pizza` / `custom_pizza`
- Ürün ID'si olmayan sepet öğesi kontrolleri

**Dosya:** `src/components/checkout/thirdStep.jsx`  
**Aksiyon:** `item.product.id` undefined kontrolü ekle veya custom pizza referanslarını kaldır. Artık tüm sepet öğelerinin geçerli bir `product.id`'si olmalı.

**Commit:** `fix: remove custom pizza references from checkout components`

### Adım 0.3 — ProductService Temizleme

**Dosya:** `src/lib/services/ProductService.js`  
**Aksiyon:** `createCustomPizza` metodunu kaldır.

```diff
- /**
-  * Create custom pizza
-  */
- async createCustomPizza(data) {
-   return this.post('/custom-pizza', data, {
-     headers: { 'Content-Type': 'application/json' }
-   });
- }
```

**Commit:** `refactor: remove createCustomPizza from ProductService`

### Adım 0.4 — Redux Store Temizleme

Aranacak dosyalar ve pattern'ler:

| Dosya                                         | Aranacak Pattern                                  |
| --------------------------------------------- | ------------------------------------------------- |
| `src/lib/store/actions/productActions.js`     | `customPizza`, `custom_pizza`, `CREATE_CUSTOM`    |
| `src/lib/store/reducers/productReducer.js`    | `customPizza` state alanları                      |
| `src/lib/store/selectors/productSelectors.js` | `selectCustomPizza` gibi selector'lar             |
| `src/lib/store/actions/orderActions.js`       | `isCustom` kontrolleri, custom pizza item mapping |
| `src/lib/store/reducers/orderReducer.js`      | Custom pizza ile ilgili cart logic                |

**Aksiyon:** Her dosyada grep ile custom pizza referanslarını bul ve kaldır.

**Commit:** `refactor: clean custom pizza references from Redux store`

### Adım 0.5 — Navigasyon ve Link Temizleme

Aranacak dosyalar:

| Dosya                               | Aranacak Pattern                                               |
| ----------------------------------- | -------------------------------------------------------------- |
| `src/components/layout/Header.jsx`  | `/order` linki, "Pizza Oluştur" gibi menü öğeleri              |
| `src/components/layout/Sidebar.jsx` | `/order` linki                                                 |
| `src/components/layout/Footer.jsx`  | `/order` linki                                                 |
| Tüm component dosyaları             | `href="/order"`, `router.push("/order")`, `Link href="/order"` |

**Aksiyon:** `/order` yönlendirmelerini ve menü öğelerini kaldır.

**Commit:** `refactor: remove custom pizza navigation links`

### Adım 0.6 — README Güncelleme

**Dosya:** `README.md`  
**Aksiyon:** "Custom Pizza Builder" referanslarını kaldır veya "Removed" olarak işaretle. Feature listesinden çıkar.

**Commit:** `docs: update README to reflect custom pizza removal`

### Adım 0.7 — Global Grep & Doğrulama

```bash
# Projenin kök dizininde çalıştır
grep -rn "custom.pizza\|customPizza\|custom_pizza\|isCustom\|CUSTOM_PIZZA\|pizza.builder\|pizzaBuilder" src/ --include="*.js" --include="*.jsx"
grep -rn '"/order"' src/ --include="*.js" --include="*.jsx"
grep -rn "createCustomPizza" src/ --include="*.js" --include="*.jsx"
```

Çıkan tüm sonuçlar temizlenmeli. Sıfır sonuç = temiz.

**Commit:** `chore: verify complete custom pizza removal`

---

## Faz 1: Auth & Redirect Düzeltmeleri

**Çözdüğü buglar:** B1 (`?login=true` döngüsü), B5 (middleware çakışması), B6 (URL temizlenmiyor)

### Adım 1.1 — AuthContext'te Guest Mode Farkındalığı (B1)

**Dosya:** `src/lib/contexts/AuthContext.jsx`  
**Sorun:** `useAuthContext` hook'u `requireAuth && !context.isAuthenticated` kontrolü yapıyor ama guest mode'u dikkate almıyor.

**Çözüm:** Redirect mantığına guest mode kontrolü ekle:

```javascript
// useAuthContext içinde, checkPermissions fonksiyonunda:
const checkPermissions = async () => {
  hasCheckedAuth.current = true;

  // Guest mode aktifse ve auth gerekmiyorsa, redirect yapma
  const isGuestMode = /* Redux store'dan veya context'ten al */;

  if (requireAuth && !context.isAuthenticated && !isGuestMode) {
    router.push("/?login=true");
    return;
  }

  if (allowedRoles.length > 0 && !context.isAuthorized(allowedRoles)) {
    router.push(redirectPath);
    return;
  }
};
```

**Önemli:** Guest mode bilgisi Redux'ta. AuthContext içinden Redux'a erişmek için ya:

- (a) `isGuestMode`'u AuthContext provider'ına prop olarak geçir, ya da
- (b) `useAuthContext` hook'una `skipAuthRedirect` parametresi ekle, ya da
- (c) Checkout sayfasında `useAuth([], "/", false)` şeklinde `requireAuth: false` geç

**Önerilen yaklaşım:** (c) en temiz çözüm. Checkout sayfalarında `requireAuth: false` kullanılmalı.

**Commit:** `fix: prevent auth redirect for guest checkout users (B1)`

### Adım 1.2 — Checkout Sayfasında Auth Koruması Düzeltme (B1)

**Dosya:** `src/app/(public)/checkout/CheckoutClient.jsx` (veya checkout page.js)  
**Aksiyon:** Bu component'te `useAuth` çağrısı varsa `requireAuth: false` olmalı.

Eğer checkout sayfasında doğrudan `useAuth()` çağrılmıyorsa bile, alt component'lerin hiçbiri `requireAuth: true` ile auth kontrolü yapmamalı. Kontrol edilecek component'ler:

- `CheckoutClient.jsx`
- `FirstStep.jsx` → `useGuestMode()` kullanıyor, sorun yok
- `SecondStep.jsx` → Auth kontrolü var mı kontrol et
- `ThirdStep.jsx` → Auth kontrolü var mı kontrol et

**Commit:** `fix: ensure checkout components don't force auth redirect`

### Adım 1.3 — `?login=true` URL Parametresi Temizleme (B6)

**Dosya:** `src/components/user-button/GuestButtons.jsx`  
**Sorun:** `searchParams.get("login") === "true"` modal açıyor ama modal kapanınca URL'deki `?login=true` kalıyor.

**Çözüm:** Modal kapandığında URL'yi temizle:

```javascript
// Login dialog kapandığında:
const handleLoginClose = () => {
  setLoginOpen(false);

  // URL'den login/signup parametrelerini temizle
  const url = new URL(window.location.href);
  url.searchParams.delete("login");
  url.searchParams.delete("signup");
  window.history.replaceState({}, "", url.pathname);
};
```

`setLoginOpen` çağrılan her yerde bu temizlik fonksiyonunu kullan veya `useEffect` ile `loginOpen` false olduğunda temizle.

**Commit:** `fix: clean URL params when login/signup modal closes (B6)`

### Adım 1.4 — Middleware Sadeleştirme (B5)

**Dosya:** `src/app/middleware.js`  
**Mevcut durum:** Sadece `/admin` route'larını kontrol ediyor ve `/?login=true`'ya yönlendiriyor.  
**Sorun:** AuthContext da aynı redirect'i yapıyor → çift redirect.

**Çözüm seçenekleri:**

- (a) Middleware'i kaldır, tüm auth kontrolünü AuthContext'e bırak
- (b) Middleware'i tut ama AuthContext'te middleware'in zaten kontrol ettiği route'ları atla

**Önerilen:** (a) — Middleware token varlığına bakıyor ama geçerliliğini kontrol edemiyor. Gerçek auth kontrolü zaten client-side'da AuthContext'te yapılıyor.

Eğer middleware tutulacaksa, en azından redirect URL'ini farklı yap (örn. `/?auth=required`) veya AuthContext'te middleware'den gelen redirect'i algıla.

**Şimdilik minimal çözüm:** Middleware'i olduğu gibi bırak (sadece admin route için çalışıyor). AuthContext'teki redirect'in admin layout'ta da çalışmasını sağla — çift redirect sorun yaratmaz çünkü ikisi de aynı URL'e gidiyor.

**Commit:** `fix: document middleware and AuthContext redirect interaction (B5)`

---

## Faz 2: Guest Mode Persistence

**Çözdüğü buglar:** B4 (direkt URL erişim), B8 (guest mode persist), B9 (guest data persist)

### Adım 2.1 — Guest Mode SessionStorage Persistence (B8)

**Dosya:** `src/lib/store/reducers/appReducer.js`  
**Sorun:** `isGuestMode` sayfa yenilemesinde `false`'a dönüyor.

**Çözüm:** `sessionStorage` ile persist et (localStorage değil — guest mode oturum bazlı olmalı):

```javascript
// appReducer.js
const getInitialGuestMode = () => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('isGuestMode') === 'true';
};

const initialState = {
  isGuestMode: getInitialGuestMode(),
  isLoading: false,
};

// SET_GUEST_MODE case'inde:
case appActions.SET_GUEST_MODE:
  if (typeof window !== 'undefined') {
    if (action.payload) {
      sessionStorage.setItem('isGuestMode', 'true');
    } else {
      sessionStorage.removeItem('isGuestMode');
    }
  }
  return { ...state, isGuestMode: action.payload };
```

**SSR Uyarısı:** `typeof window` kontrolü zorunlu — Next.js server render'da `sessionStorage` yok.

**Commit:** `fix: persist guest mode in sessionStorage (B8)`

### Adım 2.2 — Guest Data SessionStorage Persistence (B9)

**Dosya:** `src/lib/store/reducers/guestReducer.js`  
**Sorun:** Guest name, surname, email, phoneNumber sayfa yenilemesinde kayboluyor.

**Çözüm:** Guest data'yı sessionStorage'a yaz/oku:

```javascript
// guestReducer.js
const STORAGE_KEY = 'guestData';

const getInitialGuestData = () => {
  if (typeof window === 'undefined') return { name: '', surname: '', email: '', phoneNumber: '' };
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { name: '', surname: '', email: '', phoneNumber: '' };
  } catch {
    return { name: '', surname: '', email: '', phoneNumber: '' };
  }
};

const initialState = getInitialGuestData();

// Her SET action'ında:
const persistState = (state) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  return state;
};

// CLEAR_GUEST_DATA case'inde:
case 'CLEAR_GUEST_DATA':
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEY);
  }
  return { name: '', surname: '', email: '', phoneNumber: '' };
```

**Commit:** `fix: persist guest data in sessionStorage (B9)`

### Adım 2.3 — Direkt URL Erişiminde Guest Guard (B4)

**Dosya:** `src/app/(public)/checkout/CheckoutClient.jsx`  
**Sorun:** Kullanıcı `/checkout`'a doğrudan girerse ne auth ne guest — boş state.

**Çözüm:** Checkout sayfasında guard logic:

```javascript
// CheckoutClient.jsx içinde:
const isAuthenticated = useAppSelector(selectIsAuthenticated);
const { isGuestMode } = useGuestMode();

useEffect(() => {
  if (!isClient) return;

  // Ne authenticated ne de guest ise → login modal aç
  if (!isAuthenticated && !isGuestMode) {
    // Sepet doluysa login/guest seçimi sun
    if (cart && cart.length > 0) {
      router.push("/?login=true");
    } else {
      router.push("/");
    }
    return;
  }
}, [isClient, isAuthenticated, isGuestMode, cart]);
```

Bu sayede `sessionStorage`'da `isGuestMode: true` varsa (Faz 2.1'den) kullanıcı sayfa yenileyince de checkout'ta kalabilir.

**Commit:** `fix: handle direct URL access to checkout (B4)`

---

## Faz 3: Guest Checkout Email Akışı

**Çözdüğü buglar:** B2 (email backend'e ulaşmıyor), B3 (state senkronizasyonu), B7 (step validation)

### Adım 3.1 — GuestInfoForm Submit Zorunluluğu (B3)

**Dosya:** `src/components/checkout/GuestInfoForm.jsx`  
**Sorun:** Kullanıcı formu doldurup "Kaydet" butonuna basmazsa email Redux'a gitmez.

**Çözüm Seçenekleri:**

- (a) Formu otomatik-dispatch yap (her field değişiminde) — UX sorunlu, çok fazla dispatch
- (b) Step 1'de "İLERLE" butonuna basıldığında guest form'u da validate/dispatch et
- (c) Guest info form'u "Kaydet" butonsuz, her blur'da dispatch yapan bir yapıya çevir

**Önerilen: (b)** — `firstStep.jsx`'teki `onStepSubmit` fonksiyonunda:

```javascript
const onStepSubmit = () => {
  // Guest ise ve guest form submit edilmediyse, uyarı ver
  if (isGuest && !isGuestDataValid) {
    error("Lütfen misafir bilgilerinizi doldurup 'Kaydet' butonuna basın", {
      title: "Eksik bilgi",
    });
    return; // Step ilerlemesini engelle
  }
  // ... mevcut logic
};
```

**Alternatif (daha iyi UX):** GuestInfoForm'a `ref` ile `submitForm()` metodu expose et, `onStepSubmit` içinde formu programmatik olarak submit et:

```javascript
// firstStep.jsx
const guestFormRef = useRef(null);

const onStepSubmit = async () => {
  if (isGuest && guestFormRef.current) {
    const isValid = await guestFormRef.current.submitForm();
    if (!isValid) return; // Form validation hatası
  }
  // ... devam et
};

// GuestInfoForm'a ref geç:
<GuestInfoForm ref={guestFormRef} />;
```

Bu, `useImperativeHandle` ile implement edilir.

**Commit:** `fix: ensure guest info is submitted before proceeding to next step (B3)`

### Adım 3.2 — Email Akışını Uçtan Uca Düzeltme (B2)

**Dosya zinciri:** `GuestInfoForm → firstStep → thirdStep → orderActions → Backend`

**Kontrol noktaları ve düzeltmeler:**

**1. GuestInfoForm.jsx → Redux dispatch:**
Mevcut kod doğru çalışıyor (`dispatch(setGuestEmail(data.email))`). Sorun: kullanıcı submit'e basmayabilir (B3'te çözüldü).

**2. firstStep.jsx → `handleAddressSubmit`:**

```javascript
// Mevcut kod:
if (isGuest && guestData && guestData.email) {
  formattedAddress.email = guestData.email;
}
```

Bu doğru, ama `onStepSubmit`'te `userData` objesine de email eklenmeli:

```javascript
// onStepSubmit içinde, userData objesine:
if (isGuest) {
  userData.guestName = guestData.name;
  userData.guestSurname = guestData.surname;
  userData.guestEmail = guestData.email; // ← Bu zaten var
  userData.guestPhone = guestData.phoneNumber;
}
```

Burası zaten mevcut — sorun yok.

**3. thirdStep.jsx → `submitOrder`:**

```javascript
// Mevcut email öncelik sırası:
email: isGuest && guestData?.email
  ? guestData.email
  : selectedAddress.email || userData.guestEmail || null;
```

**Ek güvenlik:** Submit öncesi email kontrolü ekle:

```javascript
const submitOrder = async (formData) => {
  // ... mevcut kod

  // Guest için email kontrolü
  if (isGuest || !isAuthenticated) {
    const guestEmail =
      guestData?.email || selectedAddress?.email || userData?.guestEmail;
    if (!guestEmail) {
      toast.error("Sipariş verebilmek için email adresiniz gereklidir.", {
        title: "Email Eksik",
      });
      return;
    }
  }

  // ... sipariş oluşturma devam
};
```

**4. orderActions.js → `createOrder`:**
Mevcut `newAddress` branch'inde email doğru map ediliyor. Ek olarak root level'da da gönderiliyor:

```javascript
requestData.phone = orderData.newAddress.phoneNumber;
requestData.email = orderData.newAddress.email;
```

Bu kısım doğru görünüyor — email `newAddress.email`'den alınıyor.

**Ana sorun:** Email `newAddress` objesine yalnızca `thirdStep` → `submitOrder` içinde ekleniyor. Eğer `firstStep`'teki `selectedAddress` objesinde email yoksa ve `guestData.email` de boşsa → null gönderiliyor.

**Çözüm:** `thirdStep.jsx`'teki `submitOrder`'da `newAddress` oluşturulurken, fallback zincirini güçlendir:

```javascript
orderRequest.newAddress = {
  // ... diğer alanlar
  email:
    guestData?.email || selectedAddress?.email || userData?.guestEmail || null,
};

// Email null ise hata ver, devam etme
if (!orderRequest.newAddress.email && !isAuthenticated) {
  toast.error("Email adresi gereklidir.");
  return;
}
```

**Commit:** `fix: ensure guest email reaches backend through entire checkout flow (B2)`

### Adım 3.3 — Step 1 Validation'a Email Kontrolü Ekle (B7)

**Dosya:** `src/components/checkout/firstStep.jsx`  
**Sorun:** `isStep1Valid` guest email'i kontrol etmiyor.

```javascript
// Mevcut:
const isStep1Valid = fullname && (selectedAddressId || newAddress);

// Düzeltme:
const isStep1Valid = (() => {
  // Temel kontrol
  if (!fullname && !isGuest) return false;
  if (!(selectedAddressId || newAddress)) return false;

  // Guest ise ek kontroller
  if (isGuest) {
    if (!isGuestDataValid) return false; // email dahil tüm alanlar dolu mu
  }

  return true;
})();
```

Veya daha okunabilir:

```javascript
const hasAddress = selectedAddressId || newAddress;
const hasUserInfo = isGuest ? isGuestDataValid : Boolean(fullname);
const isStep1Valid = hasAddress && hasUserInfo;
```

**Not:** `isGuestDataValid` selector'ı zaten email dahil tüm alanları kontrol ediyor:

```javascript
// guestSelectors.js'den:
(guest) =>
  Boolean(guest.name && guest.surname && guest.email && guest.phoneNumber);
```

**Commit:** `fix: include guest email in step 1 validation (B7)`

---

## Faz 4: Success Sayfası & Son Düzeltmeler

**Çözdüğü bug:** B10 (clearGuest zamanlama)

### Adım 4.1 — SuccessClient Zamanlama Düzeltmesi (B10)

**Dosya:** `src/app/(public)/success/SuccessClient.jsx`  
**Sorun:** `clearGuest()` çağrısı `getCustomerEmail()` ve `getCustomerInfo()` fonksiyonlarından önce guest data'yı silmiş olabilir.

**Mevcut sorunlu kod:**

```javascript
useEffect(() => {
  if (isGuestMode) {
    clearGuest(); // ← Guest data hemen siliniyor!
  }
  if (!loading && !error) {
    dispatch(clearCartAction());
    saveCartToStorage([]);
  }
}, [dispatch, loading, error, isGuestMode, clearGuest]);
```

**Çözüm:** Guest data'yı önce local state'e kaydet, sonra temizle:

```javascript
const [savedGuestInfo, setSavedGuestInfo] = useState(null);

useEffect(() => {
  // Önce guest bilgilerini kaydet
  if (isGuestMode && guestData && !savedGuestInfo) {
    setSavedGuestInfo({
      email: guestData.email,
      name: guestData.name,
      surname: guestData.surname,
      phone: guestData.phoneNumber,
    });
  }
}, [isGuestMode, guestData, savedGuestInfo]);

// Ayrı bir effect'te temizlik yap (bilgiler kaydedildikten sonra)
useEffect(() => {
  if (savedGuestInfo && isGuestMode) {
    clearGuest();
    // Guest mode'u da kapat
    dispatch(setGuestMode(false));
  }
}, [savedGuestInfo]);

// getCustomerEmail ve getCustomerInfo'da savedGuestInfo'yu kullan:
const getCustomerEmail = () => {
  if (savedGuestInfo) return savedGuestInfo.email;
  if ((isGuest || isGuestMode) && guestData) return guestData.email;
  if (userData?.guestEmail) return userData.guestEmail;
  return null;
};
```

**SessionStorage temizliği:** `clearGuest()` çağrıldığında Faz 2.2'deki sessionStorage da temizlenmeli. `guestReducer`'daki `CLEAR_GUEST_DATA` action'ı zaten `sessionStorage.removeItem` yapacak.

**Commit:** `fix: preserve guest info before clearing in success page (B10)`

---

## Faz 5: Test & Doğrulama

### Test Senaryoları

#### Senaryo 1: Guest Sipariş — Tam Akış

```
1. Anasayfaya git (login olmadan)
2. Sepete ürün ekle
3. "Sipariş Ver" / checkout'a git
4. Login modal açılır → "Misafir Olarak Devam Et" tıkla
5. Guest bilgilerini doldur (ad, soyad, email, telefon) → "Kaydet"
6. Adres ekle → "İLERLE"
7. Ödeme yöntemi seç (Nakit) → "DEVAM"
8. Siparişi onayla
9. ✅ Beklenen: Sipariş başarılı, success sayfası açılır
10. ✅ Beklenen: Success sayfasında müşteri bilgileri görünür
```

#### Senaryo 2: Guest — Email Olmadan İlerleme Denemesi

```
1. Guest checkout'a geç
2. Guest bilgilerini doldurmadan adres ekleyip "İLERLE" dene
3. ✅ Beklenen: "Lütfen misafir bilgilerinizi doldurun" hatası
4. ✅ Beklenen: "İLERLE" butonu disabled
```

#### Senaryo 3: Guest — Sayfa Yenileme

```
1. Guest checkout'ta Step 1'e kadar ilerle
2. Sayfayı yenile (F5)
3. ✅ Beklenen: Guest mode ve guest bilgileri korunur
4. ✅ Beklenen: Checkout sayfasında kalır (login'e yönlendirilmez)
```

#### Senaryo 4: URL Parametresi Temizliği

```
1. `/?login=true` URL'sine git
2. Login modal açılır → modal'ı kapat
3. ✅ Beklenen: URL `/?login=true` → `/` olur
4. Sayfayı yenile
5. ✅ Beklenen: Login modal tekrar açılmaz
```

#### Senaryo 5: Authenticated Kullanıcı Akışı (Regresyon)

```
1. Login ol
2. Sepete ürün ekle → checkout'a git
3. ✅ Beklenen: Guest form görünmez, kendi adresleri listelenir
4. Siparişi tamamla
5. ✅ Beklenen: Başarılı
```

#### Senaryo 6: `/checkout` Direkt Erişim

```
1. Yeni tarayıcı sekmesi aç
2. `/checkout` URL'sine git (login olmadan, guest mode olmadan)
3. ✅ Beklenen: Anasayfaya veya login'e yönlendirilir
```

#### Senaryo 7: Custom Pizza Kaldırma Doğrulama

```
1. `/order` URL'sine git
2. ✅ Beklenen: 404 sayfası
3. Navigasyonda "Pizza Oluştur" linki yok
4. `grep -rn "customPizza\|custom.pizza\|/order" src/` → sıfır sonuç
```

#### Senaryo 8: Admin Sayfaları (Regresyon)

```
1. Login olmadan `/admin/dashboard`'a git
2. ✅ Beklenen: `/?login=true`'ya yönlendirilir (middleware çalışır)
3. Admin login yap → dashboard'a eriş
4. ✅ Beklenen: Normal çalışır
```

---

## Git Commit Stratejisi

Her faz tek bir branch'te, her adım ayrı commit:

```
git checkout -b fix/guest-checkout-and-cleanup

# Faz 0
git commit -m "feat: remove custom pizza builder page"
git commit -m "fix: remove custom pizza references from checkout components"
git commit -m "refactor: remove createCustomPizza from ProductService"
git commit -m "refactor: clean custom pizza references from Redux store"
git commit -m "refactor: remove custom pizza navigation links"
git commit -m "docs: update README to reflect custom pizza removal"
git commit -m "chore: verify complete custom pizza removal"

# Faz 1
git commit -m "fix: prevent auth redirect for guest checkout users (B1)"
git commit -m "fix: ensure checkout components don't force auth redirect"
git commit -m "fix: clean URL params when login/signup modal closes (B6)"
git commit -m "fix: document middleware and AuthContext redirect interaction (B5)"

# Faz 2
git commit -m "fix: persist guest mode in sessionStorage (B8)"
git commit -m "fix: persist guest data in sessionStorage (B9)"
git commit -m "fix: handle direct URL access to checkout (B4)"

# Faz 3
git commit -m "fix: ensure guest info is submitted before proceeding (B3)"
git commit -m "fix: ensure guest email reaches backend through entire flow (B2)"
git commit -m "fix: include guest email in step 1 validation (B7)"

# Faz 4
git commit -m "fix: preserve guest info before clearing in success page (B10)"

# Final
git commit -m "test: verify all guest checkout scenarios"

git checkout main
git merge fix/guest-checkout-and-cleanup
```

---

## Dosya Değişiklik Haritası

| Dosya                                          | Faz      | İşlem   |
| ---------------------------------------------- | -------- | ------- |
| `src/app/order/` (tüm dizin)                   | 0.1      | SİL     |
| `src/components/checkout/thirdStep.jsx`        | 0.2, 3.2 | DÜZENLE |
| `src/lib/services/ProductService.js`           | 0.3      | DÜZENLE |
| `src/lib/store/actions/productActions.js`      | 0.4      | DÜZENLE |
| `src/lib/store/reducers/productReducer.js`     | 0.4      | DÜZENLE |
| `src/lib/store/actions/orderActions.js`        | 0.4      | KONTROL |
| `src/components/layout/Header.jsx`             | 0.5      | DÜZENLE |
| `README.md`                                    | 0.6      | DÜZENLE |
| `src/lib/contexts/AuthContext.jsx`             | 1.1      | DÜZENLE |
| `src/app/(public)/checkout/CheckoutClient.jsx` | 1.2, 2.3 | DÜZENLE |
| `src/components/user-button/GuestButtons.jsx`  | 1.3      | DÜZENLE |
| `src/app/middleware.js`                        | 1.4      | KONTROL |
| `src/lib/store/reducers/appReducer.js`         | 2.1      | DÜZENLE |
| `src/lib/store/reducers/guestReducer.js`       | 2.2      | DÜZENLE |
| `src/components/checkout/firstStep.jsx`        | 3.1, 3.3 | DÜZENLE |
| `src/components/checkout/GuestInfoForm.jsx`    | 3.1      | DÜZENLE |
| `src/app/(public)/success/SuccessClient.jsx`   | 4.1      | DÜZENLE |

---

## Riskler ve Dikkat Edilecekler

1. **SSR/Hydration:** `sessionStorage` erişimi sadece client-side. Her yerde `typeof window !== 'undefined'` kontrolü şart.

2. **Redux Persist Kütüphanesi:** Eğer ileride redux-persist eklenirse, sessionStorage çözümü çakışabilir. Şimdilik manuel çözüm yeterli.

3. **Regresyon:** Authenticated kullanıcı flow'unu bozma riski var. Faz 5'teki Senaryo 5 mutlaka test edilmeli.

4. **Custom Pizza Cleanup:** Bazı referanslar component prop'larının içinde gizli olabilir. Global grep ile doğrulama şart.

5. **AuthContext Değişikliği:** Guest mode kontrolü eklenirken, admin sayfalarının koruması bozulmamalı. Admin route'lar `requireAuth: true` ve `allowedRoles: ["ADMIN"]` ile korunmaya devam etmeli.

---

**Son Güncelleme:** 2026-03-02  
**Durum:** Plan hazır, implementasyona başlanabilir
