import { BaseService } from './BaseService';

class PromoCodeService extends BaseService {
  constructor() {
    super('/promo-codes');
  }

  async fetchAll() {
    return this.get('');
  }

  async validate(code, amount) {
    return this.get('/validate', { params: { code, amount } });
  }

  async create(data) {
    return this.post('', data);
  }

  async update(id, data) {
    return this.put(`/${id}`, data);
  }

  async remove(id) {
    return this.delete(`/${id}`);
  }
}

const promoCodeService = new PromoCodeService();
export default promoCodeService;
