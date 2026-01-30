import { BaseService } from './BaseService';

class AdminService extends BaseService {
  constructor() {
    super('/admin');
  }

  // Dashboard
  async fetchDashboard() {
    return this.get('/dashboard');
  }

  // Users
  async fetchAllUsers(page = 0, size = 10, search = '') {
    return this.get('/users/paged', {
      params: { page, size, search, sort: 'id,desc' }
    });
  }

  async fetchPendingUsers(page = 0, size = 10) {
    return this.get('/users/pending', {
      params: { page, size, sort: 'id,desc' }
    });
  }

  async approveUser(userId) {
    return this.post(`/users/${userId}/approve`);
  }

  async rejectUser(userId) {
    return this.post(`/users/${userId}/reject`);
  }

  async updateUserRole(userId, role) {
    return this.put(`/users/${userId}/role`, null, { params: { role } });
  }

  async getUsersByRole(role, page = 0, size = 10) {
    return this.get(`/users/role/${role}`, {
      params: { page, size, sort: 'id,desc' }
    });
  }

  async getUsersByStatus(status, page = 0, size = 10) {
    return this.get(`/users/status/${status}`, {
      params: { page, size, sort: 'id,desc' }
    });
  }

  async createUser(userData) {
    return this.post('/users', userData);
  }

  async updateUser(userId, userData) {
    return this.put(`/users/${userId}`, userData);
  }

  async deleteUser(userId) {
    return this.delete(`/users/${userId}`);
  }

  async searchUsers(search) {
    return this.get('/users/search', { params: { search, sort: 'id,desc' } });
  }

  async reindexUsers() {
    return this.post('/users/reindex');
  }

  // Analytics
  async getTotalRevenue() {
    return this.get('/analytics/revenue/total');
  }

  async getOutOfStockCount() {
    return this.get('/analytics/stock/out-of-stock');
  }

  async getLowStockCount() {
    return this.get('/analytics/stock/low');
  }

  async getTotalStockByCategory(categoryId) {
    return this.get(`/analytics/stock/category/${categoryId}`);
  }

  async getUserCountByRole(role) {
    return this.get(`/analytics/users/role/${role}/count`);
  }

  async getPendingUsersCount() {
    return this.get('/analytics/users/pending/count');
  }
}

const adminService = new AdminService();
export default adminService;
