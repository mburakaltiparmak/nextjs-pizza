# 🍕 Pizza Order System - REST API Documentation

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.2-red.svg)](https://redis.io/)
[![Elasticsearch](https://img.shields.io/badge/Elasticsearch-8.11-yellow.svg)](https://www.elastic.co/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Enterprise-grade Pizza Order Management System backend with modern Spring Boot architecture, featuring JWT authentication, Redis caching, Elasticsearch search, and Iyzico payment gateway integration.

**🌐 API Documentation:** Comprehensive REST API for Pizza Order Management  
**📊 Health Check:** `GET /pizza/actuator/health`

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Monitoring Services](#monitoring-services)
- [API Documentation](#-api-documentation)
  - [Authentication](#1-authentication-endpoints)
  - [Categories](#2-category-endpoints)
  - [Products](#3-product-endpoints)
  - [Search](#4-search-endpoints)
  - [Orders](#5-order-endpoints)
  - [User Management](#6-user-management-endpoints)
  - [Admin Panel](#7-admin-endpoints)
  - [Payment](#8-payment-endpoints)
- [Response Models](#-response-models)
- [Error Handling](#-error-handling)
- [Performance Tips](#-performance-tips)
- [Contributing](#-contributing)

---

## ✨ Features

### 🔐 Security & Authentication
- **JWT Authentication** with access (30 min) and refresh tokens (7 days)
- **OAuth2 Integration** (Google via Supabase)
- **Role-based Access Control** (ADMIN, PERSONAL, CUSTOMER)
- **Password Encryption** with BCrypt
- **Rate Limiting** with Bucket4j (IP & User-based)
- **CORS Configuration** for frontend integration

### 🚀 Performance & Scalability
- **Redis Caching** for improved response times (~85% faster)
- **N+1 Query Optimization** with JOIN FETCH strategies
- **Pessimistic Locking** for stock management
- **Pagination Support** for all list endpoints
- **Connection Pool Optimization** with HikariCP

### 🔍 Search & Discovery
- **Elasticsearch Integration** for full-text search
- **Fuzzy Search** with typo tolerance
- **Search Suggestions** (autocomplete)
- **Multi-field Search** (name, description, price)
- **Search Analytics** tracking

### 💳 Payment Processing
- **Iyzico Payment Gateway** (Turkish market)
- **3D Secure Support** for secure transactions
- **Guest Checkout** capability
- **Payment Status Tracking**

### 📊 Monitoring & Observability
- **Prometheus** for metrics collection and aggregation
- **Grafana** for visualization dashboards (accessible on port 3001)
- **node-exporter** for host/OS metrics
- **cAdvisor** for container metrics and resource usage
- **Spring Boot Actuator** with Prometheus metrics endpoint
- **Custom Health Checks**
- **Application Metrics** tracking
- **HTTP Request Tracking**

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Backend** | Java 17, Spring Boot 3.4.2, Maven |
| **Database** | PostgreSQL 16 (Supabase) |
| **Caching** | Redis 7.2 |
| **Search** | Elasticsearch 8.11 |
| **Security** | Spring Security, JWT, OAuth2 |
| **Payment** | Iyzico Payment Gateway |
| **File Storage** | Cloudinary |
| **Deployment** | Docker |
| **Monitoring** | Prometheus, Grafana, node-exporter, cAdvisor, Spring Boot Actuator |

---

## 🚀 Getting Started

### Prerequisites

```bash
- Java 17 or higher
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7.2
- Elasticsearch 8.11
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/mburakaltiparmak/pizza-backend.git
cd pizza-backend
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Start with Docker Compose**
```bash
docker-compose up -d
```

4. **Run the application**
```bash
mvn clean install
mvn spring-boot:run
```

The API will be available at `http://localhost:8080/pizza/api`

### Environment Variables

```bash
# Database
DB_URL=jdbc:postgresql://localhost:5432/postgres
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-512-bit-secret-key
JWT_ACCESS_TOKEN_EXPIRATION=1800000  # 30 minutes
JWT_REFRESH_TOKEN_EXPIRATION=604800000  # 7 days

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Elasticsearch
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Iyzico (Sandbox)
IYZICO_API_KEY=sandbox-key
IYZICO_SECRET_KEY=sandbox-secret
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

### Monitoring Services

The application includes a comprehensive monitoring stack for metrics collection, visualization, and observability.

#### 📈 **Prometheus** - Metrics Collection
- **URL:** `http://localhost:9090`
- **Purpose:** Collects and stores time-series metrics from all services
- **Scrape Targets:**
  - Spring Boot Application (`/pizza/actuator/prometheus`)
  - node-exporter (system metrics)
  - cAdvisor (container metrics)
  - Prometheus self-monitoring

#### 📊 **Grafana** - Visualization Dashboard
- **URL:** `http://localhost:3001`
- **Default Credentials:**
  - Username: `admin`
  - Password: `Kqbf9akUe2xBW2k` *(Change in production!)*
- **Pre-configured:** Prometheus datasource is automatically configured
- **Features:** Create custom dashboards, alerts, and visualizations

#### 💻 **node-exporter** - System Metrics
- **URL:** `http://localhost:9100/metrics`
- **Purpose:** Exposes detailed host/OS metrics (CPU, memory, disk, network)

#### 🐳 **cAdvisor** - Container Metrics
- **URL:** `http://localhost:8081`
- **Purpose:** Monitors container resource usage and performance characteristics

#### 🏥 **Spring Boot Actuator** - Application Health
- **Health Check:** `http://localhost:8080/pizza/actuator/health`
- **Prometheus Metrics:** `http://localhost:8080/pizza/actuator/prometheus`
- **All Endpoints:** `http://localhost:8080/pizza/actuator`

> **Note:** For production deployments, ensure you:
> 1. Change Grafana admin password
> 2. Secure monitoring endpoints with authentication
> 3. Configure Prometheus retention policies based on your needs (currently: 30 days)

---


## 📖 API Documentation

### Base URLs

- **Production:** `https://api.burakaltiparmak.site/pizza/api`
- **Development:** `http://localhost:8080/pizza/api`

### Authentication Setup

All protected endpoints require a JWT token in the Authorization header.

#### Axios Global Configuration

```javascript
import axios from 'axios';

// Create API instance
const api = axios.create({
  baseURL: 'http://localhost:8080/pizza/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add token to every request
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

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          'http://localhost:8080/pizza/api/auth/refresh-token',
          { refreshToken }
        );

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
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

#### JavaScript Fetch API Configuration

```javascript
// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const baseURL = 'http://localhost:8080/pizza/api';
  const token = localStorage.getItem('accessToken');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${baseURL}${endpoint}`, config);

    // Handle 401 - Token expired
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry with new token
        config.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
        return await fetch(`${baseURL}${endpoint}`, config);
      }
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Refresh token helper
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    window.location.href = '/login';
    return false;
  }

  try {
    const response = await fetch('http://localhost:8080/pizza/api/auth/refresh-token', {
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
    console.error('Token refresh failed:', error);
    return false;
  }
}
```

---

## 1️⃣ Authentication Endpoints

### Register New User

Create a new user account. Status will be PENDING until admin approval.

**Endpoint:** `POST /api/auth/register`  
**Access:** Public

#### Request Body

```json
{
  "name": "John",
  "surname": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "+905551234567"
}
```

#### Axios Example

```javascript
const register = async (userData) => {
  try {
    const response = await axios.post('/auth/register', userData);
    console.log('Registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response.data);
    throw error;
  }
};

// Usage
register({
  name: "John",
  surname: "Doe",
  email: "john.doe@example.com",
  password: "SecurePass123!",
  phoneNumber: "+905551234567"
});
```

#### JavaScript Fetch Example

```javascript
async function register(userData) {
  const response = await fetch('http://localhost:8080/pizza/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}
```

#### Postman

```
POST http://localhost:8080/pizza/api/auth/register
Content-Type: application/json

Body (raw JSON):
{
  "name": "John",
  "surname": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "+905551234567"
}
```

#### Response

```json
{
  "success": true,
  "message": "Kayıt başarılı. Email doğrulama linki gönderildi."
}
```

---

### Login

Authenticate user and receive JWT tokens.

**Endpoint:** `POST /api/auth/login`  
**Access:** Public  
**Rate Limit:** 10 requests/minute per IP

#### Request Body

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

#### Axios Example

```javascript
const login = async (credentials) => {
  try {
    const response = await axios.post('/auth/login', credentials);
    const { accessToken, refreshToken, user } = response.data;

    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    console.log('Login successful:', user);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response.data);
    throw error;
  }
};

// Usage
login({
  email: "john.doe@example.com",
  password: "SecurePass123!"
});
```

#### JavaScript Fetch Example

```javascript
async function login(credentials) {
  const response = await fetch('http://localhost:8080/pizza/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));

  return data;
}
```

#### Postman

```
POST http://localhost:8080/pizza/api/auth/login
Content-Type: application/json

Body (raw JSON):
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

#### Response

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

---

### Refresh Access Token

Get a new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh-token`  
**Access:** Public

#### Request Body

```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Axios Example

```javascript
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axios.post('/auth/refresh-token', { refreshToken });
    
    const { accessToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    
    return accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear tokens and redirect to login
    localStorage.clear();
    window.location.href = '/login';
    throw error;
  }
};
```

#### JavaScript Fetch Example

```javascript
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('http://localhost:8080/pizza/api/auth/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) {
    localStorage.clear();
    window.location.href = '/login';
    throw new Error('Token refresh failed');
  }

  const { accessToken } = await response.json();
  localStorage.setItem('accessToken', accessToken);
  return accessToken;
}
```

#### Postman

```
POST http://localhost:8080/pizza/api/auth/refresh-token
Content-Type: application/json

Body (raw JSON):
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Response

```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 1800
}
```

---

### Logout

Invalidate refresh token and logout user.

**Endpoint:** `POST /api/auth/logout`  
**Access:** Authenticated

#### Axios Example

```javascript
const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    await axios.post('/auth/logout', { refreshToken });
    
    // Clear local storage
    localStorage.clear();
    
    // Redirect to home
    window.location.href = '/';
  } catch (error) {
    console.error('Logout failed:', error);
    // Clear anyway
    localStorage.clear();
  }
};
```

#### Postman

```
POST http://localhost:8080/pizza/api/auth/logout
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (raw JSON):
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### Verify Email

Verify user email with token sent to email.

**Endpoint:** `GET /api/auth/verify-email?token={token}`  
**Access:** Public

#### Axios Example

```javascript
const verifyEmail = async (token) => {
  try {
    const response = await axios.get(`/auth/verify-email?token=${token}`);
    console.log('Email verified:', response.data);
    return response.data;
  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
};
```

#### Postman

```
GET http://localhost:8080/pizza/api/auth/verify-email?token=abc123def456
```

---

### Forgot Password

Request password reset email.

**Endpoint:** `POST /api/auth/forgot-password`  
**Access:** Public

#### Request Body

```json
{
  "email": "john.doe@example.com"
}
```

#### Axios Example

```javascript
const forgotPassword = async (email) => {
  try {
    const response = await axios.post('/auth/forgot-password', { email });
    console.log('Reset email sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};
```

---

### Reset Password

Reset password with token from email.

**Endpoint:** `POST /api/auth/reset-password`  
**Access:** Public

#### Request Body

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

#### Axios Example

```javascript
const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post('/auth/reset-password', {
      token,
      newPassword
    });
    console.log('Password reset successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Reset failed:', error);
    throw error;
  }
};
```

---

## 2️⃣ Category Endpoints

### Get Categories (Paginated)

Retrieve categories with pagination support.

**Endpoint:** `GET /api/category/paged`  
**Access:** Public  
**Query Parameters:**
- `page` (optional, default: 0) - Page number
- `size` (optional, default: 10) - Page size
- `sort` (optional, default: id,asc) - Sort field and direction

#### Axios Example

```javascript
const getCategoriesPaged = async (page = 0, size = 10) => {
  try {
    const response = await axios.get('/category/paged', {
      params: { page, size, sort: 'name,asc' }
    });
    
    const { content, totalPages, totalElements, number, size: pageSize } = response.data;
    
    console.log(`Page ${number + 1} of ${totalPages}`);
    console.log(`Total categories: ${totalElements}`);
    
    return response.data;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
};

// Usage
getCategoriesPaged(0, 5);
```

#### JavaScript Fetch Example

```javascript
async function getCategoriesPaged(page = 0, size = 10) {
  const url = new URL('http://localhost:8080/pizza/api/category/paged');
  url.searchParams.append('page', page);
  url.searchParams.append('size', size);
  url.searchParams.append('sort', 'name,asc');

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return await response.json();
}
```

#### Postman

```
GET http://localhost:8080/pizza/api/category/paged?page=0&size=10&sort=name,asc
```

#### Response

```json
{
  "content": [
    {
      "id": 1,
      "name": "Pizza",
      "img": "https://res.cloudinary.com/.../pizza.jpg"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 15,
  "totalPages": 2,
  "last": false
}
```

---

### Get Single Category

Get category details by ID.

**Endpoint:** `GET /api/category/{id}`  
**Access:** Public

#### Axios Example

```javascript
const getCategory = async (categoryId) => {
  try {
    const response = await axios.get(`/category/${categoryId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('Category not found');
    }
    throw error;
  }
};

// Usage
getCategory(1);
```

#### Postman

```
GET http://localhost:8080/pizza/api/category/1
```

---

### Search Categories

Search categories by name (uses Elasticsearch).

**Endpoint:** `GET /api/category/search`  
**Access:** Public  
**Query Parameters:**
- `query` (required) - Search term

#### Axios Example

```javascript
const searchCategories = async (query) => {
  try {
    const response = await axios.get('/category/search', {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
};

// Usage
searchCategories('pizza');
```

#### Postman

```
GET http://localhost:8080/pizza/api/category/search?query=pizza
```

---

### Search Categories (DB)

Search categories by name using database (LIKE query).

**Endpoint:** `GET /api/category/search/db`  
**Access:** Public  
**Query Parameters:**
- `name` (required) - Search term
- `page` (optional, default: 0)
- `size` (optional, default: 10)

#### Axios Example

```javascript
const searchCategoriesDb = async (name) => {
  try {
    const response = await axios.get('/category/search/db', {
      params: { name }
    });
    return response.data;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
};
```

#### Postman

```
GET http://localhost:8080/pizza/api/category/search/db?name=piz
```

---


## 3️⃣ Product Endpoints

### Get Products (Paginated)

Retrieve products with pagination.

**Endpoint:** `GET /api/product/paged`  
**Access:** Public  
**Query Parameters:**
- `page` (optional, default: 0)
- `size` (optional, default: 10)
- `sort` (optional, default: id,desc)

#### Axios Example

```javascript
const getProductsPaged = async (page = 0, size = 20, sortBy = 'id,desc') => {
  try {
    const response = await axios.get('/product/paged', {
      params: { page, size, sort: sortBy }
    });
    
    const { content, totalPages, totalElements } = response.data;
    console.log(`Showing ${content.length} of ${totalElements} products`);
    
    return response.data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};

// Usage examples
getProductsPaged(0, 20); // First page, 20 items
getProductsPaged(1, 10, 'price,asc'); // Second page, sorted by price
getProductsPaged(0, 50, 'name,asc'); // First page, sorted by name
```

#### JavaScript Fetch Example

```javascript
async function getProductsPaged(page = 0, size = 20) {
  const url = new URL('http://localhost:8080/pizza/api/product/paged');
  url.searchParams.append('page', page);
  url.searchParams.append('size', size);
  url.searchParams.append('sort', 'id,desc');

  const response = await fetch(url);
  return await response.json();
}
```

#### Postman

```
GET http://localhost:8080/pizza/api/product/paged?page=0&size=20&sort=price,asc
```

---

### Get Single Product

Get product details by ID.

**Endpoint:** `GET /api/product/{id}`  
**Access:** Public

#### Axios Example

```javascript
const getProduct = async (productId) => {
  try {
    const response = await axios.get(`/product/${productId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('Product not found');
    }
    throw error;
  }
};

// Usage
const product = await getProduct(1);
console.log(`${product.name}: ${product.price} TL`);
```

#### Postman

```
GET http://localhost:8080/pizza/api/product/1
```

---

### Get Products by Category (Paginated)

Get products in a specific category with pagination.

**Endpoint:** `GET /api/product/category/{categoryId}/paged`  
**Access:** Public  
**Query Parameters:**
- `page` (optional, default: 0)
- `size` (optional, default: 10)

#### Axios Example

```javascript
const getProductsByCategoryPaged = async (categoryId, page = 0, size = 12) => {
  try {
    const response = await axios.get(`/product/category/${categoryId}/paged`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};

// Usage - Get pizzas with pagination
const pizzaPage = await getProductsByCategoryPaged(1, 0, 12);
```

#### Postman

```
GET http://localhost:8080/pizza/api/product/category/1/paged?page=0&size=12
```

---



## 4️⃣ Search Endpoints

The system uses Elasticsearch for advanced search capabilities including fuzzy search, multi-field search, and autocomplete suggestions.

### Search Products

Search products with advanced filters (Elasticsearch).

**Endpoint:** `GET /api/product/search`  
**Access:** Public  
**Query Parameters:**
- `query` (optional) - Search term (searches in name and description)
- `minPrice` (optional) - Minimum price filter
- `maxPrice` (optional) - Maximum price filter
- `categoryId` (optional) - Category filter
- `inStock` (optional, default: true) - Only show in-stock items

#### Axios Example

```javascript
const searchProducts = async (filters) => {
  try {
    const response = await axios.get('/product/search', {
      params: {
        query: filters.query,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        categoryId: filters.categoryId,
        inStock: filters.inStock ?? true
      }
    });
    return response.data;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
};

// Usage examples
// 1. Simple text search
const results1 = await searchProducts({ query: 'margherita' });

// 2. Price range filter
const results2 = await searchProducts({
  minPrice: 50,
  maxPrice: 100
});

// 3. Category + price filter
const results3 = await searchProducts({
  query: 'pizza',
  categoryId: 1,
  minPrice: 80
});

// 4. Include out-of-stock items
const results4 = await searchProducts({
  query: 'burger',
  inStock: false
});
```

#### JavaScript Fetch Example

```javascript
async function searchProducts(query, minPrice, maxPrice) {
  const url = new URL('http://localhost:8080/pizza/api/product/search');
  if (query) url.searchParams.append('query', query);
  if (minPrice) url.searchParams.append('minPrice', minPrice);
  if (maxPrice) url.searchParams.append('maxPrice', maxPrice);

  const response = await fetch(url);
  return await response.json();
}

// Usage
const results = await searchProducts('pizza', 50, 150);
```

#### Postman

```
# Simple search
GET http://localhost:8080/pizza/api/product/search?query=margherita

# With filters
GET http://localhost:8080/pizza/api/product/search?query=pizza&minPrice=50&maxPrice=150&categoryId=1

# Price range only
GET http://localhost:8080/pizza/api/product/search?minPrice=80&maxPrice=120
```

---

### Search Suggestions (Autocomplete)

Get search suggestions for autocomplete (Elasticsearch).

**Endpoint:** `GET /api/search/suggestions`  
**Access:** Public  
**Query Parameters:**
- `query` (required) - Search term (minimum 2 characters)
- `limit` (optional, default: 5) - Maximum number of suggestions

#### Axios Example

```javascript
const getSearchSuggestions = async (query, limit = 5) => {
  try {
    // Only search if query is at least 2 characters
    if (query.length < 2) return [];

    const response = await axios.get('/search/suggestions', {
      params: { query, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get suggestions:', error);
    return [];
  }
};

// Usage in search input
const SearchInput = () => {
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
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map(item => (
            <li key={item.id}>{item.name} - {item.price} TL</li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

#### Postman

```
GET http://localhost:8080/pizza/api/search/suggestions?query=marg&limit=5
```

#### Response

```json
[
  {
    "id": 1,
    "name": "Margherita Pizza",
    "price": 89.90,
    "img": "https://res.cloudinary.com/.../margherita.jpg",
    "categoryName": "Pizza"
  },
  {
    "id": 15,
    "name": "Margherita Special",
    "price": 109.90,
    "img": "https://res.cloudinary.com/.../special.jpg",
    "categoryName": "Pizza"
  }
]
```

---

### Fuzzy Search Suggestions

Get search suggestions with typo tolerance (Elasticsearch).

**Endpoint:** `GET /api/search/suggestions/fuzzy`  
**Access:** Public  
**Query Parameters:**
- `query` (required) - Search term (can have typos)
- `limit` (optional, default: 5) - Maximum results
- `fuzziness` (optional, default: 2) - Typo tolerance level (0-2)

#### Axios Example

```javascript
const getFuzzySearchSuggestions = async (query, limit = 5) => {
  try {
    const response = await axios.get('/search/suggestions/fuzzy', {
      params: { query, limit, fuzziness: 2 }
    });
    return response.data;
  } catch (error) {
    console.error('Fuzzy search failed:', error);
    return [];
  }
};

// Usage - Will find "Margherita" even with typos
const results1 = await getFuzzySearchSuggestions('margherit'); // typo
const results2 = await getFuzzySearchSuggestions('margarita'); // spelling mistake
const results3 = await getFuzzySearchSuggestions('piza'); // will find "pizza"
```

#### Postman

```
# Typo in "pizza"
GET http://localhost:8080/pizza/api/search/suggestions/fuzzy?query=piza&limit=5

# Typo in "margherita"
GET http://localhost:8080/pizza/api/search/suggestions/fuzzy?query=margrita&limit=5&fuzziness=2
```

---

## 5️⃣ Order Endpoints

### Create Order (Guest & Authenticated)

Create a new order. Supports both guest and authenticated users.

**Endpoint:** `POST /api/orders`  
**Access:** Public (Guest orders allowed)  
**Rate Limit:** 50 requests/minute

#### Request Body

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 5,
      "quantity": 1
    }
  ],
  "addressId": 1,
  "paymentMethod": "CREDIT_CARD",
  "notes": "Extra cheese please"
}
```

For **Guest Orders** (no authentication), provide `newAddress` instead of `addressId`:

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "newAddress": {
    "addressTitle": "Home",
    "fullAddress": "123 Main St, Apt 4B",
    "city": "Istanbul",
    "district": "Kadikoy",
    "postalCode": "34710",
    "phoneNumber": "+905551234567",
    "recipientName": "John Doe"
  },
  "paymentMethod": "CASH",
  "notes": "Ring the bell twice"
}
```

#### Axios Example

```javascript
// Authenticated user order (with saved address)
const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    console.log('Order created:', response.data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      console.error('Validation error:', error.response.data);
    } else if (error.response?.status === 409) {
      console.error('Stock insufficient:', error.response.data);
    }
    throw error;
  }
};

// Usage - Authenticated user
const order = await createOrder({
  items: [
    { productId: 1, quantity: 2 },
    { productId: 3, quantity: 1 }
  ],
  addressId: 1,
  paymentMethod: "CREDIT_CARD",
  notes: "Please call before delivery"
});

// Guest order (no authentication)
const guestOrder = await axios.post('http://localhost:8080/pizza/api/orders', {
  items: [
    { productId: 1, quantity: 1 }
  ],
  newAddress: {
    addressTitle: "Office",
    fullAddress: "Tech Plaza, Floor 5",
    city: "Istanbul",
    district: "Besiktas",
    postalCode: "34340",
    phoneNumber: "+905559876543",
    recipientName: "Jane Smith"
  },
  paymentMethod: "CASH",
  notes: "Delivery to reception"
});
```

#### JavaScript Fetch Example

```javascript
async function createOrder(orderData) {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:8080/pizza/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(orderData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}
```

#### Postman

```
POST http://localhost:8080/pizza/api/orders
Content-Type: application/json
Authorization: Bearer {accessToken}  # Optional for guest orders

Body (raw JSON) - Authenticated User:
{
  "items": [
    { "productId": 1, "quantity": 2 }
  ],
  "addressId": 1,
  "paymentMethod": "CREDIT_CARD",
  "notes": "Extra napkins please"
}

Body (raw JSON) - Guest Order:
{
  "items": [
    { "productId": 1, "quantity": 1 }
  ],
  "newAddress": {
    "addressTitle": "Home",
    "fullAddress": "123 Main St",
    "city": "Istanbul",
    "district": "Kadikoy",
    "postalCode": "34710",
    "phoneNumber": "+905551234567",
    "recipientName": "John Doe"
  },
  "paymentMethod": "CASH"
}
```

#### Response

```json
{
  "id": 42,
  "orderDate": "2025-12-17T14:30:00",
  "orderStatus": "PENDING",
  "totalAmount": 259.80,
  "notes": "Extra cheese please",
  "user": {
    "id": 1,
    "name": "John",
    "email": "john@example.com"
  },
  "deliveryAddress": {
    "id": 1,
    "addressTitle": "Home",
    "fullAddress": "123 Main St, Apt 4B",
    "city": "Istanbul",
    "district": "Kadikoy"
  },
  "items": [
    {
      "id": 101,
      "productName": "Margherita Pizza",
      "quantity": 2,
      "price": 89.90,
      "subtotal": 179.80
    },
    {
      "id": 102,
      "productName": "Coca Cola",
      "quantity": 1,
      "price": 80.00,
      "subtotal": 80.00
    }
  ],
  "payment": {
    "id": 84,
    "amount": 259.80,
    "paymentMethod": "CREDIT_CARD",
    "paymentStatus": "PENDING",
    "createdAt": "2025-12-17T14:30:00"
  }
}
```

---

### Get My Orders

Get orders for the authenticated user.

**Endpoint:** `GET /api/orders/my-orders`  
**Access:** Authenticated

#### Axios Example

```javascript
const getMyOrders = async () => {
  try {
    const response = await api.get('/orders/my-orders');
    console.log(`You have ${response.data.length} orders`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    throw error;
  }
};

// Usage
const orders = await getMyOrders();
orders.forEach(order => {
  console.log(`Order #${order.id}: ${order.totalAmount} TL - ${order.orderStatus}`);
});
```

#### Postman

```
GET http://localhost:8080/pizza/api/orders/my-orders
Authorization: Bearer {accessToken}
```

---

### Get My Orders (Paginated)

Get user's orders with pagination.

**Endpoint:** `GET /api/orders/my-orders/paged`  
**Access:** Authenticated  
**Query Parameters:**
- `page` (optional, default: 0)
- `size` (optional, default: 10)
- `sort` (optional, default: orderDate,desc)

#### Axios Example

```javascript
const getMyOrdersPaged = async (page = 0, size = 10) => {
  try {
    const response = await api.get('/orders/my-orders/paged', {
      params: { page, size, sort: 'orderDate,desc' }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    throw error;
  }
};

// Usage with pagination component
const OrderHistory = () => {
  const [page, setPage] = useState(0);
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await getMyOrdersPaged(page, 5);
      setOrders(data);
    };
    fetchOrders();
  }, [page]);

  return (
    <div>
      {orders?.content.map(order => (
        <div key={order.id}>
          Order #{order.id} - {order.totalAmount} TL
        </div>
      ))}
      <Pagination 
        currentPage={page}
        totalPages={orders?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};
```

#### Postman

```
GET http://localhost:8080/pizza/api/orders/my-orders/paged?page=0&size=10
Authorization: Bearer {accessToken}
```

---

### Get Order Details

Get detailed information about a specific order.

**Endpoint:** `GET /api/orders/{id}`  
**Access:** Authenticated (Owner or Admin)

#### Axios Example

```javascript
const getOrderDetails = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      console.error('Access denied - not your order');
    } else if (error.response?.status === 404) {
      console.error('Order not found');
    }
    throw error;
  }
};

// Usage
const order = await getOrderDetails(42);
console.log(`Order Status: ${order.orderStatus}`);
console.log(`Payment Status: ${order.payment.paymentStatus}`);
```

#### Postman

```
GET http://localhost:8080/pizza/api/orders/42
Authorization: Bearer {accessToken}
```

---

### Cancel Order

Cancel an order (only if status is PENDING).

**Endpoint:** `DELETE /api/orders/{id}/cancel`  
**Access:** Authenticated (Owner or Admin)

#### Axios Example

```javascript
const cancelOrder = async (orderId) => {
  try {
    const response = await api.delete(`/orders/${orderId}/cancel`);
    console.log('Order cancelled:', response.data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      console.error('Cannot cancel:', error.response.data.message);
      // Order might be already in preparation
    } else if (error.response?.status === 403) {
      console.error('Not authorized to cancel this order');
    }
    throw error;
  }
};

// Usage with confirmation
const handleCancelOrder = async (orderId) => {
  if (confirm('Are you sure you want to cancel this order?')) {
    try {
      await cancelOrder(orderId);
      alert('Order cancelled successfully');
    } catch (error) {
      alert('Failed to cancel order: ' + error.message);
    }
  }
};
```

#### Postman

```
DELETE http://localhost:8080/pizza/api/orders/42/cancel
Authorization: Bearer {accessToken}
```

#### Response

```json
{
  "success": true,
  "message": "Sipariş başarıyla iptal edildi"
}
```

---

## 6️⃣ User Management Endpoints

### Get Current User Profile

Get authenticated user's profile information.

**Endpoint:** `GET /api/user/me`  
**Access:** Authenticated

#### Axios Example

```javascript
const getCurrentUser = async () => {
  try {
    const response = await api.get('/user/me');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
};

// Usage
const user = await getCurrentUser();
console.log(`Welcome, ${user.name} ${user.surname}`);
console.log(`Email: ${user.email}`);
console.log(`Role: ${user.role}`);
console.log(`Status: ${user.status}`);
```

#### Postman

```
GET http://localhost:8080/pizza/api/user/me
Authorization: Bearer {accessToken}
```

#### Response

```json
{
  "id": 1,
  "name": "John",
  "surname": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+905551234567",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "addresses": [
    {
      "id": 1,
      "addressTitle": "Home",
      "fullAddress": "123 Main St, Apt 4B",
      "city": "Istanbul",
      "district": "Kadikoy",
      "postalCode": "34710",
      "phoneNumber": "+905551234567",
      "recipientName": "John Doe",
      "isDefault": true
    }
  ],
  "createdAt": "2025-01-15T10:30:00",
  "lastLoginAt": "2025-12-17T14:25:00"
}
```

---

### Update Profile

Update user profile information.

**Endpoint:** `PUT /api/user/profile`  
**Access:** Authenticated

#### Request Body

```json
{
  "name": "John",
  "surname": "Doe",
  "phoneNumber": "+905551234567"
}
```

#### Axios Example

```javascript
const updateProfile = async (userData) => {
  try {
    const response = await api.put('/user/profile', userData);
    console.log('Profile updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
};
```

#### Postman

```
PUT http://localhost:8080/pizza/api/user/profile
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (raw JSON):
{
  "name": "Jane",
  "surname": "Doe",
  "phoneNumber": "+905559876543"
}
```

---

### Add New Address

Add a new delivery address to user's account.

**Endpoint:** `POST /api/user/addresses`  
**Access:** Authenticated

#### Request Body

```json
{
  "addressTitle": "Office",
  "fullAddress": "Tech Plaza, Floor 5, Room 501",
  "city": "Istanbul",
  "district": "Besiktas",
  "postalCode": "34340",
  "phoneNumber": "+905559876543",
  "recipientName": "John Doe"
}
```

#### Axios Example

```javascript
const addAddress = async (addressData) => {
  try {
    const response = await api.post('/user/add-address', addressData);
    console.log('Address added:', response.data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      console.error('Validation error:', error.response.data);
    }
    throw error;
  }
};

// Usage
const newAddress = await addAddress({
  addressTitle: "Office",
  fullAddress: "Tech Plaza, Floor 5",
  city: "Istanbul",
  district: "Besiktas",
  postalCode: "34340",
  phoneNumber: "+905559876543",
  recipientName: "John Doe"
});
```

#### Postman

```
POST http://localhost:8080/pizza/api/user/add-address
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (raw JSON):
{
  "addressTitle": "Office",
  "fullAddress": "Tech Plaza, Floor 5",
  "city": "Istanbul",
  "district": "Besiktas",
  "postalCode": "34340",
  "phoneNumber": "+905559876543",
  "recipientName": "John Doe"
}
```

---

### Update Address

Update an existing address.

**Endpoint:** `PUT /api/user/addresses/{addressId}`  
**Access:** Authenticated (Owner only)

#### Axios Example

```javascript
const updateAddress = async (addressId, updatedData) => {
  try {
    const response = await api.put(`/user/address/${addressId}`, updatedData);
    console.log('Address updated:', response.data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      console.error('Not your address');
    } else if (error.response?.status === 404) {
      console.error('Address not found');
    }
    throw error;
  }
};

// Usage
await updateAddress(1, {
  addressTitle: "Home (Updated)",
  fullAddress: "456 New Street, Apt 10A",
  city: "Istanbul",
  district: "Kadikoy",
  postalCode: "34710",
  phoneNumber: "+905551234567",
  recipientName: "John Doe"
});
```

#### Postman

```
PUT http://localhost:8080/pizza/api/user/address/1
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (raw JSON):
{
  "addressTitle": "Home (Updated)",
  "fullAddress": "456 New Street, Apt 10A",
  "city": "Istanbul",
  "district": "Kadikoy",
  "postalCode": "34710",
  "phoneNumber": "+905551234567",
  "recipientName": "John Doe"
}
```

---

### Delete Address

Delete a delivery address.

**Endpoint:** `DELETE /api/user/addresses/{addressId}`  
**Access:** Authenticated (Owner only)

#### Axios Example

```javascript
const deleteAddress = async (addressId) => {
  try {
    await api.delete(`/user/address/${addressId}`);
    console.log('Address deleted successfully');
  } catch (error) {
    if (error.response?.status === 403) {
      console.error('Not your address');
    } else if (error.response?.status === 404) {
      console.error('Address not found');
    }
    throw error;
  }
};

// Usage with confirmation
const handleDeleteAddress = async (addressId) => {
  if (confirm('Are you sure you want to delete this address?')) {
    await deleteAddress(addressId);
    // Refresh address list
  }
};
```

#### Postman

```
DELETE http://localhost:8080/pizza/api/user/address/1
Authorization: Bearer {accessToken}
```

---

### Set Default Address

Set a specific address as default.

**Endpoint:** `PUT /api/user/addresses/{addressId}/default`  
**Access:** Authenticated (Owner only)

#### Axios Example

```javascript
const setDefaultAddress = async (addressId) => {
  try {
    const response = await api.put(`/user/addresses/${addressId}/default`);
    console.log('Default address set:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to set default address:', error);
    throw error;
  }
};
```

#### Postman

```
PUT http://localhost:8080/pizza/api/user/addresses/1/default
Authorization: Bearer {accessToken}
```

---

### Change Password

Change user's password.

**Endpoint:** `POST /api/user/password`  
**Access:** Authenticated

#### Request Body

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePass123!"
}
```

#### Axios Example

```javascript
const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/user/change-password', {
      currentPassword,
      newPassword
    });
    console.log('Password changed successfully');
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      console.error('Current password incorrect');
    }
    throw error;
  }
};

// Usage
await changePassword('OldPassword123!', 'NewSecurePass123!');
```

#### Postman

```
POST http://localhost:8080/pizza/api/user/change-password
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (raw JSON):
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePass123!"
}
```

---

## 7️⃣ Admin Endpoints

Admin endpoints require ADMIN role. Most also support PERSONAL role for certain operations.

### Get Dashboard Statistics

Get admin dashboard statistics.

**Endpoint:** `GET /api/admin/dashboard`  
**Access:** Admin

#### Axios Example

```javascript
const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    throw error;
  }
};

// Usage
const stats = await getDashboardStats();
console.log(`Total Users: ${stats.totalUsers}`);
console.log(`Total Orders: ${stats.totalOrders}`);
console.log(`Total Revenue: ${stats.totalRevenue} TL`);
console.log(`Pending Orders: ${stats.pendingOrders}`);
```

#### Postman

```
GET http://localhost:8080/pizza/api/admin/dashboard
Authorization: Bearer {adminAccessToken}
```

#### Response

```json
{
  "totalUsers": 1250,
  "totalOrders": 3840,
  "totalRevenue": 125680.50,
  "pendingOrders": 12,
  "todayOrders": 45,
  "todayRevenue": 4250.00,
  "popularProducts": [
    {
      "id": 1,
      "name": "Margherita Pizza",
      "orderCount": 345
    }
  ]
}
```

---

### Get All Users (Admin)

Get all users with pagination.

**Endpoint:** `GET /api/admin/users/paged`  
**Access:** Admin  
**Query Parameters:**
- `page` (optional, default: 0)
- `size` (optional, default: 20)
- `sort` (optional, default: id,desc)

#### Axios Example

```javascript
const getAllUsers = async (page = 0, size = 20) => {
  try {
    const response = await api.get('/admin/users/paged', {
      params: { page, size, sort: 'id,desc' }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};

// Usage
const usersPage = await getAllUsers(0, 20);
console.log(`Total users: ${usersPage.totalElements}`);
```

#### Postman

```
GET http://localhost:8080/pizza/api/admin/users/paged?page=0&size=20&sort=createdAt,desc
Authorization: Bearer {adminAccessToken}
```

---

### Search Users

Search users by name, surname, or email (Elasticsearch).

**Endpoint:** `GET /api/admin/users/search`  
**Access:** Admin  
**Query Parameters:**
- `query` (required) - Search term
- `role` (optional) - Filter by role (ADMIN, PERSONAL, CUSTOMER)
- `status` (optional) - Filter by status (ACTIVE, PENDING, SUSPENDED)

#### Axios Example

```javascript
const searchUsers = async (query, filters = {}) => {
  try {
    const response = await api.get('/admin/users/search', {
      params: {
        query,
        role: filters.role,
        status: filters.status
      }
    });
    return response.data;
  } catch (error) {
    console.error('User search failed:', error);
    throw error;
  }
};

// Usage examples
const results1 = await searchUsers('john'); // Search by name
const results2 = await searchUsers('john@', { status: 'ACTIVE' }); // Search active users
const results3 = await searchUsers('doe', { role: 'CUSTOMER' }); // Search customers only
```

#### Postman

```
# Simple search
GET http://localhost:8080/pizza/api/admin/users/search?query=john
Authorization: Bearer {adminAccessToken}

# With filters
GET http://localhost:8080/pizza/api/admin/users/search?query=john&role=CUSTOMER&status=ACTIVE
Authorization: Bearer {adminAccessToken}
```

---

### Get Pending Users

Get users awaiting approval.

**Endpoint:** `GET /api/admin/users/pending`  
**Access:** Admin

#### Axios Example

```javascript
const getPendingUsers = async () => {
  try {
    const response = await api.get('/admin/users/pending');
    console.log(`${response.data.length} users awaiting approval`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch pending users:', error);
    throw error;
  }
};

// Usage
const pendingUsers = await getPendingUsers();
pendingUsers.forEach(user => {
  console.log(`${user.name} ${user.surname} - ${user.email}`);
});
```

#### Postman

```
GET http://localhost:8080/pizza/api/admin/users/pending
Authorization: Bearer {adminAccessToken}
```

---

### Approve User

Approve a pending user registration.

**Endpoint:** `POST /api/admin/users/{userId}/approve`  
**Access:** Admin

#### Axios Example

```javascript
const approveUser = async (userId) => {
  try {
    const response = await api.post(`/admin/users/${userId}/approve`);
    console.log('User approved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to approve user:', error);
    throw error;
  }
};

// Usage
await approveUser(42);
```

#### Postman

```
POST http://localhost:8080/pizza/api/admin/users/42/approve
Authorization: Bearer {adminAccessToken}
```

---

### Reject User

Reject a pending user registration.

**Endpoint:** `POST /api/admin/users/{userId}/reject`  
**Access:** Admin

#### Axios Example

```javascript
const rejectUser = async (userId) => {
  try {
    const response = await api.post(`/admin/users/${userId}/reject`);
    console.log('User rejected:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to reject user:', error);
    throw error;
  }
};

// Usage
await rejectUser(42);
```

#### Postman

```
POST http://localhost:8080/pizza/api/admin/users/42/reject
Authorization: Bearer {adminAccessToken}
```

---

### Suspend User

Suspend an active user account.

**Endpoint:** `POST /api/admin/users/{userId}/suspend`  
**Access:** Admin

#### Axios Example

```javascript
const suspendUser = async (userId) => {
  try {
    const response = await api.post(`/admin/users/${userId}/suspend`);
    console.log('User suspended:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to suspend user:', error);
    throw error;
  }
};

// Usage with confirmation
const handleSuspendUser = async (userId) => {
  if (confirm('Are you sure you want to suspend this user?')) {
    await suspendUser(userId);
  }
};
```

#### Postman

```
POST http://localhost:8080/pizza/api/admin/users/42/suspend
Authorization: Bearer {adminAccessToken}
```

---

### Update User Role

Change a user's role.

**Endpoint:** `PUT /api/admin/users/{userId}/role`  
**Access:** Admin  
**Query Parameters:**
- `role` (required) - New role (ADMIN, PERSONAL, CUSTOMER)

#### Axios Example

```javascript
const updateUserRole = async (userId, newRole) => {
  try {
    const response = await api.put(`/admin/users/${userId}/role`, null, {
      params: { role: newRole }
    });
    console.log('Role updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to update role:', error);
    throw error;
  }
};

// Usage
await updateUserRole(42, 'PERSONAL');
```

#### Postman

```
PUT http://localhost:8080/pizza/api/admin/users/42/role?role=PERSONAL
Authorization: Bearer {adminAccessToken}
```

---

### Get All Orders (Admin)

Get all orders with pagination (Admin view).

**Endpoint:** `GET /api/admin/orders`  
**Access:** Admin

#### Axios Example

```javascript
const getAllOrders = async (page = 0, size = 20) => {
  try {
    const response = await api.get('/admin/orders', {
      params: { page, size, sort: 'orderDate,desc' }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    throw error;
  }
};
```

#### Postman

```
GET http://localhost:8080/pizza/api/admin/orders?page=0&size=20
Authorization: Bearer {adminAccessToken}
```

---

### Get Orders by Status

Filter orders by status.

**Endpoint:** `GET /api/admin/orders/status/{status}`  
**Access:** Admin  
**Status Values:** PENDING, PREPARING, READY, DELIVERED, CANCELLED

#### Axios Example

```javascript
const getOrdersByStatus = async (status) => {
  try {
    const response = await api.get(`/admin/orders/status/${status}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    throw error;
  }
};

// Usage
const pendingOrders = await getOrdersByStatus('PENDING');
const preparingOrders = await getOrdersByStatus('PREPARING');
```

#### Postman

```
GET http://localhost:8080/pizza/api/admin/orders/status/PENDING
Authorization: Bearer {adminAccessToken}
```

---

### Update Order Status

Update an order's status.

**Endpoint:** `PUT /api/admin/orders/{orderId}/status`  
**Access:** Admin  
**Query Parameters:**
- `status` (required) - New status (PENDING, PREPARING, READY, DELIVERED, CANCELLED)

#### Axios Example

```javascript
const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await api.put(`/admin/orders/${orderId}/status`, null, {
      params: { status: newStatus }
    });
    console.log('Order status updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw error;
  }
};

// Usage - Order workflow
await updateOrderStatus(42, 'PREPARING'); // Start preparing
await updateOrderStatus(42, 'READY');      // Ready for delivery
await updateOrderStatus(42, 'DELIVERED');  // Delivered
```

#### Postman

```
PUT http://localhost:8080/pizza/api/admin/orders/42/status?status=PREPARING
Authorization: Bearer {adminAccessToken}
```

---

### Search Orders

Search orders with advanced filtering using Elasticsearch.

**Endpoint:** `GET /api/orders/admin/search`  
**Access:** Admin  
**Query Parameters:**
- `userEmail` (optional) - Filter by user email
- `status` (optional) - Filter by order status
- `minPrice` (optional) - Minimum order amount
- `maxPrice` (optional) - Maximum order amount
- `page` (optional, default: 0)
- `size` (optional, default: 20)
- `sort` (optional, default: orderDate,desc)

#### Axios Example

```javascript
const searchOrders = async (filters = {}, page = 0, size = 20) => {
  try {
    const response = await api.get('/orders/admin/search', {
      params: { 
        ...filters,
        page, 
        size 
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search orders:', error);
    throw error;
  }
};

// Usage
const results = await searchOrders({ 
    status: 'CONFIRMED',
    minPrice: 100 
});
```

#### Postman

```
GET http://localhost:8080/pizza/api/orders/admin/search?status=CONFIRMED&minPrice=100
Authorization: Bearer {adminAccessToken}
```

---

### Get Search Analytics

Get search analytics data.

**Endpoint:** `GET /api/admin/analytics/search`  
**Access:** Admin  
**Query Parameters:**
- `days` (optional, default: 7) - Number of days to analyze

#### Axios Example

```javascript
const getSearchAnalytics = async (days = 7) => {
  try {
    const response = await api.get('/admin/analytics/search', {
      params: { days }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    throw error;
  }
};

// Usage
const analytics = await getSearchAnalytics(30);
console.log('Top searches:', analytics.topQueries);
console.log('Zero result queries:', analytics.zeroResultQueries);
```

#### Postman

```
GET http://localhost:8080/pizza/api/admin/analytics/search?days=30
Authorization: Bearer {adminAccessToken}
```

#### Response

```json
{
  "totalSearches": 1250,
  "uniqueQueries": 340,
  "averageResponseTime": 45,
  "topQueries": [
    {
      "query": "pizza",
      "count": 156,
      "averageResults": 12
    },
    {
      "query": "burger",
      "count": 98,
      "averageResults": 8
    }
  ],
  "zeroResultQueries": [
    {
      "query": "sushi",
      "count": 5
    }
  ],
  "categoryPopularity": [
    {
      "categoryId": 1,
      "categoryName": "Pizza",
      "searchCount": 456
    }
  ]
}
```

---

### Reindex Elasticsearch

Reindex products, categories, or users in Elasticsearch.

**Endpoints:**
- `POST /api/admin/product/reindex` - Reindex all products
- `POST /api/admin/category/reindex` - Reindex all categories
- `POST /api/admin/users/reindex` - Reindex all users
- `POST /api/orders/admin/reindex` - Reindex all orders

**Access:** Admin

#### Axios Example

```javascript
const reindexProducts = async () => {
  try {
    const response = await api.post('/admin/product/reindex');
    console.log('Products reindexed:', response.data);
    return response.data;
  } catch (error) {
    console.error('Reindex failed:', error);
    throw error;
  }
};

const reindexCategories = async () => {
  try {
    const response = await api.post('/admin/category/reindex');
    console.log('Categories reindexed:', response.data);
    return response.data;
  } catch (error) {
    console.error('Reindex failed:', error);
    throw error;
  }
};

const reindexUsers = async () => {
  try {
    const response = await api.post('/admin/users/reindex');
    console.log('Users reindexed:', response.data);
    return response.data;
  } catch (error) {
    console.error('Reindex failed:', error);
    throw error;
  }
};

const reindexOrders = async () => {
  try {
    const response = await api.post('/orders/admin/reindex');
    console.log('Orders reindexed:', response.data);
    return response.data;
  } catch (error) {
    console.error('Reindex failed:', error);
    throw error;
  }
};
```

#### Postman

```
POST http://localhost:8080/pizza/api/admin/product/reindex
Authorization: Bearer {adminAccessToken}

POST http://localhost:8080/pizza/api/admin/category/reindex
Authorization: Bearer {adminAccessToken}

POST http://localhost:8080/pizza/api/admin/users/reindex
Authorization: Bearer {adminAccessToken}

POST http://localhost:8080/pizza/api/orders/admin/reindex
Authorization: Bearer {adminAccessToken}
```

---

## 8️⃣ Payment Endpoints

### Create Payment Intent

Create a payment intent for an order.

**Endpoint:** `POST /api/payment/create`  
**Access:** Authenticated

#### Request Body

```json
{
  "orderId": 42,
  "paymentMethod": "ONLINE_CREDIT_CARD"
}
```

#### Axios Example

```javascript
const createPaymentIntent = async (orderId, paymentMethod) => {
  try {
    const response = await api.post('/payment/create', {
      orderId,
      paymentMethod
    });
    return response.data;
  } catch (error) {
    console.error('Payment creation failed:', error);
    throw error;
  }
};

// Usage
const paymentIntent = await createPaymentIntent(42, 'ONLINE_CREDIT_CARD');
console.log('Payment ID:', paymentIntent.paymentId);
```

#### Postman

```
POST http://localhost:8080/pizza/api/payment/create
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (raw JSON):
{
  "orderId": 42,
  "paymentMethod": "ONLINE_CREDIT_CARD"
}
```

---

### Process Payment (Iyzico 3D Secure)

Process payment with credit card (redirects to 3D Secure).

**Endpoint:** `POST /api/payment/{paymentId}/process`  
**Access:** Authenticated

#### Request Body

```json
{
  "cardHolderName": "John Doe",
  "cardNumber": "5528790000000008",
  "expireMonth": "12",
  "expireYear": "2030",
  "cvc": "123",
  "registerCard": false
}
```

#### Axios Example

```javascript
const processPayment = async (paymentId, cardDetails) => {
  try {
    const response = await api.post(`/payment/${paymentId}/process`, cardDetails);
    
    // If 3D Secure is required, redirect to payment page
    if (response.data.threeDSHtmlContent) {
      // Display 3D Secure iframe
      const iframe = document.createElement('div');
      iframe.innerHTML = response.data.threeDSHtmlContent;
      document.body.appendChild(iframe);
    }
    
    return response.data;
  } catch (error) {
    console.error('Payment processing failed:', error);
    throw error;
  }
};

// Usage
const result = await processPayment(84, {
  cardHolderName: "John Doe",
  cardNumber: "5528790000000008", // Test card
  expireMonth: "12",
  expireYear: "2030",
  cvc: "123",
  registerCard: false
});
```

#### Postman

```
POST http://localhost:8080/pizza/api/payment/84/process
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (raw JSON):
{
  "cardHolderName": "John Doe",
  "cardNumber": "5528790000000008",
  "expireMonth": "12",
  "expireYear": "2030",
  "cvc": "123",
  "registerCard": false
}
```

---

### 3D Secure Callback

This endpoint is called by Iyzico after 3D Secure authentication.

**Endpoint:** `POST /api/payment/3ds/callback`  
**Access:** Public (called by Iyzico)

This endpoint is automatically called by Iyzico and doesn't need to be called manually.

---

### Get Payment Status

Check payment status for an order.

**Endpoint:** `GET /api/payment/order/{orderId}/status`  
**Access:** Authenticated (Owner or Admin)

#### Axios Example

```javascript
const getPaymentStatus = async (orderId) => {
  try {
    const response = await api.get(`/payment/order/${orderId}/status`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch payment status:', error);
    throw error;
  }
};

// Usage - Poll payment status
const checkPaymentStatus = async (orderId) => {
  const status = await getPaymentStatus(orderId);
  console.log(`Payment Status: ${status.paymentStatus}`);
  console.log(`Amount: ${status.amount} TL`);
  return status.paymentStatus;
};
```

#### Postman

```
GET http://localhost:8080/pizza/api/payment/order/42/status
Authorization: Bearer {accessToken}
```

#### Response

```json
{
  "id": 84,
  "amount": 259.80,
  "paymentMethod": "ONLINE_CREDIT_CARD",
  "paymentStatus": "SUCCESS",
  "transactionId": "TXN123456789",
  "createdAt": "2025-12-17T14:30:00",
  "completedAt": "2025-12-17T14:31:15"
}
```

---

## 📊 Response Models

### UserResponse

```typescript
interface UserResponse {
  id: number;
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  role: "ADMIN" | "PERSONAL" | "CUSTOMER";
  status: "ACTIVE" | "PENDING" | "REJECTED" | "SUSPENDED";
  addresses: UserAddressResponse[];
  createdAt: string;
  lastLoginAt: string;
}
```

### UserAddressResponse

```typescript
interface UserAddressResponse {
  id: number;
  addressTitle: string;
  fullAddress: string;
  city: string;
  district: string;
  postalCode: string;
  phoneNumber: string;
  recipientName: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### ProductResponse

```typescript
interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  stock: number;
  img: string;
  categoryId: number;
  categoryName: string;
}
```

### CategoryResponse

```typescript
interface CategoryResponse {
  id: number;
  name: string;
  img: string;
  products?: ProductResponse[];
}
```

### OrderResponse

```typescript
interface OrderResponse {
  id: number;
  orderDate: string;
  orderStatus: "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  notes: string;
  user: UserResponse | null; // null for guest orders
  deliveryAddress: UserAddressResponse;
  items: OrderItemResponse[];
  payment: PaymentResponse;
}
```

### OrderItemResponse

```typescript
interface OrderItemResponse {
  id: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
}
```

### PaymentResponse

```typescript
interface PaymentResponse {
  id: number;
  amount: number;
  paymentMethod: "CASH" | "CREDIT_CARD" | "ONLINE_CREDIT_CARD" | "GIFT_CARD";
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  transactionId: string;
  createdAt: string;
  completedAt: string;
}
```

### PagedResponse<T>

```typescript
interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
```

---

## ⚠️ Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "timestamp": "2025-12-17T14:35:00.123",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/orders"
}
```

### HTTP Status Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation failed, invalid input |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry, stock insufficient |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Axios Error Handling

```javascript
try {
  const response = await api.get('/product');
  return response.data;
} catch (error) {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        console.error('Validation error:', data.message);
        break;
      case 401:
        console.error('Authentication failed');
        // Redirect to login
        window.location.href = '/login';
        break;
      case 403:
        console.error('Access denied:', data.message);
        break;
      case 404:
        console.error('Resource not found:', data.message);
        break;
      case 409:
        console.error('Conflict:', data.message);
        // e.g., "Insufficient stock for product: Pizza, requested: 10, available: 5"
        break;
      case 429:
        console.error('Rate limit exceeded. Please try again later.');
        break;
      case 500:
        console.error('Server error:', data.message);
        break;
      default:
        console.error('Unexpected error:', data.message);
    }
  } else if (error.request) {
    // Request made but no response
    console.error('Network error: No response from server');
  } else {
    // Error in request setup
    console.error('Error:', error.message);
  }
  throw error;
}
```

---

## 📈 Performance Tips

1. **Use Pagination**: Always use paginated endpoints for large datasets
2. **Cache Responses**: Categories and products are cached in Redis
3. **Batch Operations**: Use bulk endpoints when available
4. **Token Management**: Implement proper token refresh flow
5. **Connection Pooling**: HikariCP is pre-configured for optimal performance

---

## 🔒 Security Best Practices

1. **Never expose JWT secret** in client-side code
2. **Store tokens securely** (localStorage for web, Keychain for iOS)
3. **Implement token refresh** before expiration
4. **Use HTTPS** in production
5. **Validate all inputs** on client-side before sending
6. **Handle errors gracefully** without exposing sensitive info

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch 
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Burak Altıparmak**

- 🌐 Portfolio: [burakaltiparmak.site](https://burakaltiparmak.site)
- 📧 Email: mburakaltiparmak@gmail.com
- 💼 GitHub: [@mburakaltiparmak](https://github.com/mburakaltiparmak)

---

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- Iyzico for payment gateway integration
- Elasticsearch team for powerful search capabilities
- Redis for high-performance caching

---

**Version:** 2.0.0  
**Last Updated:** December 17, 2025  
**Status:** ✅ Production Ready

---

<div align="center">
  
Made with ❤️ by Burak Altıparmak

⭐ If you find this project helpful, please consider giving it a star!

</div>