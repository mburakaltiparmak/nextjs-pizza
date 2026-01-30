import { instance } from '@/lib/hooks';

/**
 * Base Service Class
 * Tüm service'ler bu class'ı extend eder
 */
export class BaseService {
  constructor(basePath) {
    this.basePath = basePath;
    this.instance = instance;
  }

  /**
   * GET request
   * @param {string} endpoint - Endpoint path
   * @param {object} config - Axios config
   * @returns {Promise<AxiosResponse>}
   */
  async get(endpoint = '', config = {}) {
    return this.instance.get(`${this.basePath}${endpoint}`, config);
  }

  /**
   * POST request
   */
  async post(endpoint = '', data = null, config = {}) {
    return this.instance.post(`${this.basePath}${endpoint}`, data, config);
  }

  /**
   * PUT request
   */
  async put(endpoint = '', data = null, config = {}) {
    return this.instance.put(`${this.basePath}${endpoint}`, data, config);
  }

  /**
   * DELETE request
   */
  async delete(endpoint = '', config = {}) {
    return this.instance.delete(`${this.basePath}${endpoint}`, config);
  }

  /**
   * Build query params for pagination
   */
  buildPageParams(page = 0, size = 10, sort = 'id,desc') {
    return { page, size, sort };
  }
}
