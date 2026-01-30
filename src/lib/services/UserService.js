import { BaseService } from './BaseService';

class UserService extends BaseService {
  constructor() {
    super('/user');
  }

  async fetchProfile() {
    return this.get('/profile');
  }

  async updateProfile(data) {
    return this.put('/profile', data);
  }

  async changePassword(passwordData) {
    return this.post('/password', passwordData);
  }

  async fetchAddresses() {
    return this.get('/addresses');
  }

  async createAddress(data) {
    return this.post('/addresses', data);
  }

  async updateAddress(id, data) {
    return this.put(`/addresses/${id}`, data);
  }

  async deleteAddress(id) {
    return this.delete(`/addresses/${id}`);
  }
}

export default new UserService();
