# 🔍 Backend API Entegrasyon Analiz Raporu

## 📊 Özet

Yeni backend dokümantasyonu (`BACKEND_README.md` ve `FRONTEND_INTEGRATION_GUIDE.md`) ile mevcut frontend requestleri karşılaştırıldığında **kritik farklılıklar ve uyumsuzluklar** tespit edildi.

---

## ❌ Kritik Sorunlar

### 1. **API Base URL Eksikliği** 🚨
**Dosya:** `src/lib/store/constants.js`

**Mevcut Durum:**
```javascript
export const API_BASE_URL = "https://api.burakaltiparmak.site";
```

**Olması Gereken:**
```javascript
export const API_BASE_URL = "https://api.burakaltiparmak.site/pizza/api";
```

**Açıklama:** Backend'de tüm endpoint'ler `/pizza/api` prefix'i ile başlıyor. Mevcut durumda bu prefix eksik, bu yüzden **TÜM API requestleri yanlış URL'e gidiyor.**

---

### 2. **Login Response Formatı Uyumsuzluğu** 🚨
**Dosya:** `src/lib/store/actions/userActions.js` (satır 117-185)

**Mevcut Kod:**
```javascript
const response = await instance.post("/auth/login", {
  email: formData.username,
  password: formData.password,
});

if (!response.data || !response.data.token) {
  throw new Error("Token alınamadı");
}

const token = response.data.token;
```

**Backend Response (Dokümantasyona Göre):**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "tokenType": "Bearer",
  "expiresIn": 1800,
  "user": {
    "id": 1,
    "name": "John",
    "surname": "Doe",
    "email": "john.doe@example.com",
    "role": "CUSTOMER",
    "status": "ACTIVE"
  }
}
```

**Sorun:** 
- Frontend `response.data.token` bekliyor, backend `accessToken` gönderiyor
- Backend ayrıca `refreshToken` gönderiyor (frontend kullanmıyor)
- `user` objesi backend'de farklı formatta

---

### 3. **Refresh Token Sistemi Eksik** 🚨
**Dosya:** `src/lib/store/actions/userActions.js`

**Backend Özelliği:**
- Access token süresi: **30 dakika**
- Refresh token süresi: **7 gün**
- `/api/auth/refresh-token` endpoint'i mevcut

**Frontend Durumu:**
- Refresh token sistemi **YOK**
- Token expire olduğunda kullanıcı logout oluyor
- Otomatik token yenileme mekanizması eksik

---

### 4. **Product Endpoints - Pagination Eksikliği** ⚠️
**Dosya:** `src/lib/store/actions/productActions.js`

**Mevcut Kod:**
```javascript
const response = await instance.get("/product");
```

**Backend Dokümantasyonu:**
- `/api/product/paged` endpoint'i pagination desteği sunuyor
- Query parameters: `page`, `size`, `sort`

**Sorun:**
- Frontend pagination kullanmıyor
- Büyük veri setlerinde performans problemi olabilir
- Backend `/product` endpoint'i pagination desteklemiyor olabilir

---

### 5. **Category Endpoints - Pagination Eksikliği** ⚠️
**Dosya:** `src/lib/store/actions/categoryActions.js`

**Mevcut Kod:**
```javascript
const response = await instance.get("/category");
```

**Backend Dokümantasyonu:**
- `/api/category/paged` endpoint'i mevcut
- Query parameters destekleniyor

---

### 6. **Order Creation - Request Format Hatası** 🚨
**Dosya:** `src/lib/store/actions/orderActions.js` (satır 258-404)

**Mevcut Kod:**
```javascript
const processedItems = orderData.items.map((item) => {
  return {
    product: {
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.img,
      description: item.product.description,
    },
    quantity: item.quantity,
    unitPrice: item.product.price,
  };
});
```

**Backend Beklentisi (Dokümantasyona göre):**
```javascript
{
  "items": [
    { "productId": 1, "quantity": 2 }
  ],
  "addressId": 5,
  "paymentMethod": "CREDIT_CARD",
  "notes": "Extra cheese"
}
```

**Sorun:**
- Frontend tam ürün objesini gönderiyor
- Backend sadece `productId` ve `quantity` bekliyor
- Gereksiz veri gönderiliyor

---

### 7. **Address Endpoints - URL Farklılığı** ⚠️
**Dosya:** `src/lib/store/actions/userActions.js` (satır 698-792)

**Mevcut Kod:**
```javascript
const response = await instance.get("/user/addresses");
await instance.post("/user/addresses", addressData);
await instance.put(`/user/addresses/${addressId}`, addressData);
```

**Backend Dokümantasyonu:**
```javascript
GET  /api/users/me/addresses
POST /api/users/me/addresses
PUT  /api/users/me/addresses/{id}
DELETE /api/users/me/addresses/{id}
```

**Sorun:**
- Frontend `/user/addresses` kullanıyor
- Backend `/users/me/addresses` bekliyor
- **Endpoint'ler uyuşmuyor**

---

### 8. **Payment Method Values - Enum Uyumsuzluğu** ⚠️
**Dosya:** `src/lib/store/actions/orderActions.js`

**Mevcut Kod:**
```javascript
if (orderData.paymentMethod === "ONLINE_CREDIT_CARD" && paymentData) {
  // ...
}
```

**Backend Dokümantasyonu:**
```
Supported values: "CREDIT_CARD", "CASH", "ONLINE"
```

**Sorun:**
- Frontend `ONLINE_CREDIT_CARD` kullanıyor
- Backend `ONLINE` veya `CREDIT_CARD` bekliyor
- Enum değerleri uyuşmuyor

---

### 9. **Email Verification Endpoint** ⚠️
**Dosya:** `src/lib/store/actions/userActions.js` (satır 604-642)

**Mevcut Kod:**
```javascript
const response = await instance.get(`/auth/verify?token=${token}`);
```

**Backend Dokümantasyonu:**
```javascript
GET /api/auth/verify-email?token={token}
```

**Sorun:**
- Frontend `/auth/verify` kullanıyor
- Backend `/auth/verify-email` bekliyor

---

### 10. **User Profile Endpoints** ⚠️
**Dosya:** `src/lib/store/actions/userActions.js`

**Mevcut Kod:**
```javascript
const response = await instance.get("/user/profile");
await instance.put("/user/profile", userData);
await instance.post("/user/password", passwordData);
```

**Backend Dokümantasyonu:**
```javascript
GET  /api/users/me
PUT  /api/users/me
POST /api/users/me/password
```

**Sorun:**
- Endpoint path'leri tamamen farklı
- `/user/profile` yerine `/users/me` olmalı

---

### 11. **Search Suggestions Endpoint** ⚠️
**Backend Feature:** Elasticsearch tabanlı autocomplete
```javascript
GET /api/search/suggestions?query={query}&limit={limit}
GET /api/search/suggestions/fuzzy?query={query}
```

**Frontend Durumu:** Bu feature **hiç implemente edilmemiş**

---

### 12. **Product Search Endpoint** ⚠️
**Dosya:** `src/lib/store/actions/productActions.js` (satır 97-149)

**Mevcut Kod:**
```javascript
const response = await instance.get(`/product?categoryId=${categoryId}`);
```

**Backend Dokümantasyonu:**
```javascript
GET /api/product/category/{categoryId}/paged
```

**Sorun:**
- Query parameter yerine path parameter kullanılmalı
- Pagination desteği eklenmeli

---

## ✅ Doğru Olan Kısımlar

1. **Admin Dashboard** - `/admin/dashboard` endpoint'i doğru kullanılıyor
2. **Admin User Management** - `/admin/users` endpoints doğru
3. **Product CRUD** - `/product` POST/PUT/DELETE doğru
4. **Category CRUD** - `/category` POST/PUT/DELETE doğru

---

## 🛠️ Düzeltme Önerileri

### 1. **Acil Düzeltmeler (Kritik)**

#### A. API Base URL'i düzelt
```javascript
// src/lib/store/constants.js
export const API_BASE_URL = "https://api.burakaltiparmak.site/pizza/api";
```

#### B. Login response formatını güncelle
```javascript
// src/lib/store/actions/userActions.js - login fonksiyonu
const response = await instance.post("/auth/login", {
  email: formData.username,
  password: formData.password,
});

// ✅ Düzeltilmiş
const { accessToken, refreshToken, user } = response.data;

// Token'ları kaydet
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

dispatch(setToken(accessToken));
dispatch(setUserProfile(user));
dispatch(setUserRole(user.role));
dispatch(setUserStatus(user.status));
```

#### C. Axios interceptor'a refresh token ekle
```javascript
// src/lib/axios.js veya hooks.js
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

#### D. Address endpoints'lerini düzelt
```javascript
// src/lib/store/actions/userActions.js
const response = await instance.get("/users/me/addresses");
await instance.post("/users/me/addresses", addressData);
await instance.put(`/users/me/addresses/${addressId}`, addressData);
await instance.delete(`/users/me/addresses/${addressId}`);
```

#### E. User profile endpoints'lerini düzelt
```javascript
// src/lib/store/actions/userActions.js
const response = await instance.get("/users/me");
await instance.put("/users/me", userData);
await instance.post("/users/me/password", passwordData);
```

---

### 2. **Orta Öncelikli Düzeltmeler**

#### A. Order creation request formatını düzelt
```javascript
// src/lib/store/actions/orderActions.js
const requestData = {
  items: orderData.items.map(item => ({
    productId: item.product.id,
    quantity: item.quantity
  })),
  paymentMethod: orderData.paymentMethod,
  notes: orderData.notes || ""
};
```

#### B. Payment method enum'ları düzelt
```javascript
// Mevcut: "ONLINE_CREDIT_CARD"
// Yeni: "ONLINE" veya "CREDIT_CARD"
```

#### C. Email verification endpoint'ini düzelt
```javascript
const response = await instance.get(`/auth/verify-email?token=${token}`);
```

---

### 3. **İyileştirmeler (Opsiyonel)**

#### A. Pagination desteği ekle
```javascript
// Products
export const fetchProducts = (page = 0, size = 20) => async (dispatch) => {
  const response = await instance.get("/product/paged", {
    params: { page, size, sort: "id,desc" }
  });
  return response.data;
};

// Categories
export const fetchCategories = (page = 0, size = 10) => async (dispatch) => {
  const response = await instance.get("/category/paged", {
    params: { page, size, sort: "name,asc" }
  });
  return response.data;
};
```

#### B. Search suggestions ekle
```javascript
// src/lib/store/actions/searchActions.js (yeni dosya)
export const getSearchSuggestions = async (query, limit = 5) => {
  if (query.length < 2) return [];
  
  const response = await instance.get("/search/suggestions", {
    params: { query, limit }
  });
  return response.data;
};
```

---

## 📝 Sonuç

**Toplam Tespit Edilen Sorun:** 12  
**Kritik Sorunlar:** 6  
**Orta Öncelikli Sorunlar:** 6  

**En Kritik Sorun:** API Base URL eksikliği - tüm requestleri etkiliyor

**Önerilen Aksiyon Planı:**
1. ✅ API Base URL'i düzelt (5 dakika)
2. ✅ Login/Auth sistemini düzelt (30 dakika)
3. ✅ Refresh token sistemi ekle (1 saat)
4. ✅ Address ve Profile endpoints düzelt (30 dakika)
5. ⚠️ Order creation format düzelt (20 dakika)
6. ⚠️ Pagination desteği ekle (1 saat)

**Toplam Tahmini Süre:** ~4 saat