import { BaseService } from './BaseService';

/**
 * Product Service
 * Tüm product-related API calls
 */
class ProductService extends BaseService {
  constructor() {
    super('/product');
  }

  /**
   * Fetch paginated products
   */
  async fetchPaged(page = 0, size = 10, filters = {}) {
    const params = {
      ...this.buildPageParams(page, size),
      ...(filters.search && { name: filters.search }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.sort && { sort: filters.sort }),
    };
    
    return this.get('/paged', { params });
  }

  /**
   * Fetch product by ID
   */
  async fetchById(id) {
    return this.get(`/${id}`);
  }

  /**
   * Fetch products by category
   */
  async fetchByCategory(categoryId, page = 0, size = 10, filters = {}) {
    const params = {
      ...this.buildPageParams(page, size),
      ...(filters.search && { name: filters.search }),
    };
    
    return this.get(`/paged/category/${categoryId}`, { params });
  }

  /**
   * Create new product
   */
  async create(formData) {
    return this.post('', formData);
  }

  /**
   * Update product
   */
  async update(id, formData) {
    return this.put(`/${id}`, formData);
  }

  /**
   * Delete product
   */
  async remove(id) {
    return this.delete(`/${id}`);
  }

  /**
   * Create custom pizza
   */
  async createCustomPizza(data) {
    return this.post('/custom-pizza', data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Reindex products (Elasticsearch)
   */
  async reindex() {
    return this.post('/reindex');
  }
}

export default new ProductService();
