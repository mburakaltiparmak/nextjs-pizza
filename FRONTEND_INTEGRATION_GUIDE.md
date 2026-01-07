# 🚀 Frontend Entegrasyon Rehberi

Bu rehber, Pizza Order System REST API'yi frontend projenize hızlıca entegre etmeniz için hazırlanmıştır.

---

## 📋 İçindekiler

- [Hızlı Başlangıç](#-hızlı-başlangıç)
- [API Yapılandırması](#-api-yapılandırması)
- [Kimlik Doğrulama](#-kimlik-doğrulama)
- [Temel Kullanım Örnekleri](#-temel-kullanım-örnekleri)
- [Hata Yönetimi](#-hata-yönetimi)
- [TypeScript Türleri](#-typescript-türleri)
- [En İyi Pratikler](#-en-i̇yi-pratikler)

---

## 🎯 Hızlı Başlangıç

### 1. API Bağlantı Bilgileri

```javascript
// Geliştirme
const API_URL = 'http://localhost:8080/pizza/api';

// Prodüksiyon
const API_URL = 'https://api.burakaltiparmak.site/pizza/api';
```

### 2. Temel Kurulum

#### Axios ile (Önerilen)

```bash
npm install axios
```

```javascript
// src/api/client.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/pizza/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token'ı her isteğe ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Token yenileme
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          { refreshToken }
        );

        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
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

export default api;
```

#### Fetch API ile

```javascript
// src/utils/api.js
const BASE_URL = 'http://localhost:8080/pizza/api';

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      config.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
      return await fetch(`${BASE_URL}${endpoint}`, config);
    }
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return await response.json();
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    window.location.href = '/login';
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (response.ok) {
      const { accessToken } = await response.json();
      localStorage.setItem('accessToken', accessToken);
      return true;
    }

    localStorage.clear();
    window.location.href = '/login';
    return false;
  } catch (error) {
    return false;
  }
}

export { apiCall, refreshAccessToken };
```

---

## 🔐 Kimlik Doğrulama

### Kayıt Olma

```javascript
// src/api/auth.js
import api from './client';

export const register = async (userData) => {
  const response = await api.post('/auth/register', {
    name: userData.name,
    surname: userData.surname,
    email: userData.email,
    password: userData.password,
    phoneNumber: userData.phoneNumber
  });
  return response.data;
};

// Kullanım
try {
  await register({
    name: "Ahmet",
    surname: "Yılmaz",
    email: "ahmet@example.com",
    password: "Sifre123!",
    phoneNumber: "+905551234567"
  });
  // Başarılı - Email doğrulama mesajı göster
} catch (error) {
  console.error('Kayıt hatası:', error.response.data);
}
```

### Giriş Yapma

```javascript
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const { accessToken, refreshToken, user } = response.data;
  
  // Token'ları sakla
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
  
  return response.data;
};

// Kullanım
try {
  const { user } = await login('ahmet@example.com', 'Sifre123!');
  console.log('Hoş geldin:', user.name);
  // Ana sayfaya yönlendir
} catch (error) {
  console.error('Giriş hatası:', error.response.data.message);
}
```

### Çıkış Yapma

```javascript
export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/auth/logout', { refreshToken });
  } finally {
    localStorage.clear();
    window.location.href = '/';
  }
};
```

### React Hook ile Kimlik Doğrulama

```javascript
// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { login as apiLogin, logout as apiLogout } from '../api/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// Kullanım - Component içinde
const { user, login, logout } = useAuth();

if (user) {
  console.log(`Merhaba ${user.name}!`);
}
```

---

## 📦 Temel Kullanım Örnekleri

### Kategorileri Listeleme

```javascript
// src/api/categories.js
import api from './client';

export const getCategories = async (page = 0, size = 10) => {
  const response = await api.get('/category/paged', {
    params: { page, size, sort: 'name,asc' }
  });
  return response.data;
};

// React Component
function CategoriesList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories(0, 20);
        setCategories(data.content);
      } catch (error) {
        console.error('Kategoriler yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div>
      {categories.map(category => (
        <div key={category.id}>
          <img src={category.img} alt={category.name} />
          <h3>{category.name}</h3>
        </div>
      ))}
    </div>
  );
}
```

### Ürünleri Listeleme

```javascript
// src/api/products.js
import api from './client';

export const getProducts = async (page = 0, size = 20) => {
  const response = await api.get('/product/paged', {
    params: { page, size, sort: 'id,desc' }
  });
  return response.data;
};

export const getProductsByCategory = async (categoryId, page = 0, size = 12) => {
  const response = await api.get(`/product/category/${categoryId}/paged`, {
    params: { page, size }
  });
  return response.data;
};

export const getProduct = async (productId) => {
  const response = await api.get(`/product/${productId}`);
  return response.data;
};

// Kullanım
const products = await getProducts(0, 20);
const pizzas = await getProductsByCategory(1, 0, 12);
const product = await getProduct(5);
```

### Ürün Arama (Elasticsearch)

```javascript
// src/api/search.js
import api from './client';

export const searchProducts = async (filters) => {
  const response = await api.get('/product/search', {
    params: {
      query: filters.query,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      categoryId: filters.categoryId,
      inStock: filters.inStock ?? true
    }
  });
  return response.data;
};

export const getSearchSuggestions = async (query, limit = 5) => {
  if (query.length < 2) return [];
  
  const response = await api.get('/search/suggestions', {
    params: { query, limit }
  });
  return response.data;
};

// Autocomplete Component
function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length >= 2) {
        const results = await getSearchSuggestions(query, 5);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ürün ara..."
      />
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map(item => (
            <li key={item.id}>
              <img src={item.img} alt={item.name} />
              {item.name} - {item.price} ₺
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Sipariş Oluşturma

```javascript
// src/api/orders.js
import api from './client';

// Kayıtlı kullanıcı siparişi
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', {
    items: orderData.items, // [{ productId, quantity }]
    addressId: orderData.addressId,
    paymentMethod: orderData.paymentMethod,
    notes: orderData.notes
  });
  return response.data;
};

// Misafir siparişi (token gerektirmez)
export const createGuestOrder = async (orderData) => {
  const response = await axios.post(
    'http://localhost:8080/pizza/api/orders',
    {
      items: orderData.items,
      newAddress: {
        addressTitle: orderData.address.title,
        fullAddress: orderData.address.street,
        city: orderData.address.city,
        district: orderData.address.district,
        postalCode: orderData.address.postalCode,
        phoneNumber: orderData.address.phone,
        recipientName: orderData.address.name
      },
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes
    }
  );
  return response.data;
};

// Kullanıcının siparişlerini getir
export const getMyOrders = async () => {
  const response = await api.get('/orders/my-orders');
  return response.data;
};

// Kullanım - Sepet Component
async function handleCheckout(cart, addressId) {
  try {
    const order = await createOrder({
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      })),
      addressId: addressId,
      paymentMethod: 'CREDIT_CARD',
      notes: 'Hızlı teslimat lütfen'
    });
    
    console.log('Sipariş oluşturuldu:', order.id);
    // Ödeme sayfasına yönlendir
    window.location.href = `/payment/${order.payment.id}`;
  } catch (error) {
    if (error.response?.status === 409) {
      alert('Stokta yeterli ürün yok!');
    } else {
      alert('Sipariş oluşturulamadı: ' + error.response?.data?.message);
    }
  }
}
```

### Adres Yönetimi

```javascript
// src/api/addresses.js
import api from './client';

export const getMyAddresses = async () => {
  const response = await api.get('/users/me/addresses');
  return response.data;
};

export const addAddress = async (addressData) => {
  const response = await api.post('/users/me/addresses', addressData);
  return response.data;
};

export const updateAddress = async (addressId, addressData) => {
  const response = await api.put(`/users/me/addresses/${addressId}`, addressData);
  return response.data;
};

export const deleteAddress = async (addressId) => {
  await api.delete(`/users/me/addresses/${addressId}`);
};

// Kullanım
const addresses = await getMyAddresses();
const newAddress = await addAddress({
  addressTitle: "Ev",
  fullAddress: "Atatürk Cad. No:123",
  city: "İstanbul",
  district: "Kadıköy",
  postalCode: "34710",
  phoneNumber: "+905551234567",
  recipientName: "Ahmet Yılmaz"
});
```

---

## 🚨 Hata Yönetimi

### Kapsamlı Hata Yakalama

```javascript
// src/utils/errorHandler.js
export function handleApiError(error) {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          title: 'Geçersiz İstek',
          message: data.message || 'Lütfen girdiğiniz bilgileri kontrol edin.'
        };
      
      case 401:
        localStorage.clear();
        window.location.href = '/login';
        return {
          title: 'Oturum Sonlandı',
          message: 'Lütfen tekrar giriş yapın.'
        };
      
      case 403:
        return {
          title: 'Erişim Engellendi',
          message: 'Bu işlem için yetkiniz bulunmuyor.'
        };
      
      case 404:
        return {
          title: 'Bulunamadı',
          message: data.message || 'Aradığınız kayıt bulunamadı.'
        };
      
      case 409:
        return {
          title: 'Çakışma',
          message: data.message || 'Bu işlem gerçekleştirilemiyor.'
        };
      
      case 429:
        return {
          title: 'Çok Fazla İstek',
          message: 'Lütfen biraz bekleyip tekrar deneyin.'
        };
      
      case 500:
        return {
          title: 'Sunucu Hatası',
          message: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
        };
      
      default:
        return {
          title: 'Hata',
          message: data.message || 'Beklenmedik bir hata oluştu.'
        };
    }
  } else if (error.request) {
    return {
      title: 'Bağlantı Hatası',
      message: 'Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.'
    };
  } else {
    return {
      title: 'Hata',
      message: error.message || 'Beklenmedik bir hata oluştu.'
    };
  }
}

// Kullanım
try {
  await createOrder(orderData);
} catch (error) {
  const { title, message } = handleApiError(error);
  toast.error(title, { description: message });
}
```

---

## 📘 TypeScript Türleri

```typescript
// src/types/api.ts

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: 'ADMIN' | 'PERSONAL' | 'CUSTOMER';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
}

export interface Category {
  id: number;
  name: string;
  img: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  img: string;
  categoryId: number;
  categoryName: string;
  stock: number;
  isActive: boolean;
}

export interface Address {
  id: number;
  addressTitle: string;
  fullAddress: string;
  city: string;
  district: string;
  postalCode: string;
  phoneNumber: string;
  recipientName: string;
}

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  addressId?: number;
  newAddress?: Omit<Address, 'id'>;
  paymentMethod: 'CREDIT_CARD' | 'CASH' | 'ONLINE';
  notes?: string;
}

export interface Order {
  id: number;
  orderDate: string;
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  notes?: string;
  user: User;
  deliveryAddress: Address;
  items: {
    id: number;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  payment: {
    id: number;
    amount: number;
    paymentMethod: string;
    paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdAt: string;
  };
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}
```

---

## ✅ En İyi Pratikler

### 1. Environment Variables Kullanın

```javascript
// .env
REACT_APP_API_URL=http://localhost:8080/pizza/api

// .env.production
REACT_APP_API_URL=https://api.burakaltiparmak.site/pizza/api

// Kullanım
const API_URL = process.env.REACT_APP_API_URL;
```

### 2. Loading State Yönetimi

```javascript
function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data.content);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage {...error} />;
  
  return <ProductGrid products={products} />;
}
```

### 3. Debounce ile Arama

```javascript
import { useDebounce } from 'use-debounce';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchProducts({ query: debouncedQuery }).then(setResults);
    }
  }, [debouncedQuery]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Ürün ara..."
    />
  );
}
```

### 4. React Query Kullanımı (Önerilen)

```bash
npm install @tanstack/react-query
```

```javascript
// src/hooks/useProducts.js
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/products';

export function useProducts(page = 0, size = 20) {
  return useQuery({
    queryKey: ['products', page, size],
    queryFn: () => getProducts(page, size),
    staleTime: 5 * 60 * 1000, // 5 dakika
    cacheTime: 10 * 60 * 1000 // 10 dakika
  });
}

// Kullanım
function ProductsList() {
  const { data, isLoading, error } = useProducts(0, 20);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {data.content.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 5. Protected Routes

```javascript
// src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// App.jsx
<Route path="/orders" element={
  <PrivateRoute>
    <OrdersPage />
  </PrivateRoute>
} />
```

---

## 🔗 Yararlı Linkler

- **API Dokümantasyonu:** [README.md](./README.md)
- **Production API:** `https://api.burakaltiparmak.site/pizza/api`
- **Health Check:** `https://api.burakaltiparmak.site/pizza/actuator/health`
- **Monitoring (Grafana):** `http://localhost:3001` (local)

---

## 📞 Destek

Sorularınız için:
- 📧 Email: mburakaltiparmak@gmail.com
- 💼 GitHub: [@mburakaltiparmak](https://github.com/mburakaltiparmak)

---

**Son Güncelleme:** Aralık 2025  
**API Versiyonu:** 2.0.0
