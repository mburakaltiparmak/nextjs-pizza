import { BaseService } from './BaseService';

class OrderService extends BaseService {
  constructor() {
    super('/orders');
  }

  async fetchUserOrders() {
    return this.get('/my-orders');
  }

  async fetchById(orderId) {
    return this.get(`/${orderId}`);
  }

  async fetchGuestOrder(orderId, email) {
    // Check if UUID
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(orderId);
    
    if (isUuid) {
      return this.get(`/track/${orderId}`);
    } else {
      return this.get(`/${orderId}`, { params: { email } });
    }
  }

  async create(orderData) {
    return this.post('', orderData);
  }

  async cancel(uuid) {
    return this.post(`/${uuid}/cancel`);
  }

  async cancelGuest(uuid, email) {
    return this.post(`/${uuid}/cancel`, { email });
  }

  async reindex() {
    return this.post('/admin/reindex');
  }
}

const orderService = new OrderService();
export default orderService;
