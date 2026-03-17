import { BaseService } from './BaseService';

class CategoryService extends BaseService {
  constructor() {
    super('/category');
  }

  /**
   * Fetch paginated categories (full data with images etc.)
   */
  async fetchPaged(page = 0, size = 10) {
    const params = this.buildPageParams(page, size, 'name,asc');
    return this.get('/paged', { params });
  }

  /**
   * Fetch lightweight category list (id + name only)
   * Dashboard, dropdown, filter gibi yerlerde kullanılır
   */
  async fetchSimple() {
    return this.get('/simple');
  }

  async fetchById(id) {
    return this.get(`/${id}`);
  }

  async create(formData) {
    return this.post('', formData);
  }

  async update(id, formData) {
    return this.put(`/${id}`, formData);
  }

  async remove(id) {
    return this.delete(`/${id}`);
  }

  async reindex() {
    return this.post('/reindex');
  }
}

const categoryService = new CategoryService();
export default categoryService;