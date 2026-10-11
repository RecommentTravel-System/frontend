import { api } from '../shared/lib/api.js';

/**
 * Service handling Payment and Subscription API calls
 */
export const paymentService = {
  /**
   * Create a new subscription
   * @param {Object} data - { planName, planType, price, status }
   */
  async createSubscription({ planName, planType = 'PREMIUM', price }) {
    const payload = {
      planName,
      planType,
      price,
      status: 'PENDING',
    };
    const response = await api.post('/api/v1/subscriptions', payload);
    return response?.data || response;
  },

  /**
   * Create a PayOS payment link for a given subscription
   * @param {number|string} subscriptionId
   */
  async createPaymentLink(subscriptionId) {
    const response = await api.post(`/api/payments/subscriptions/${subscriptionId}/pay`);
    return response?.data || response;
  },

  /**
   * Check payment details & status by paymentId (orderCode)
   * @param {number|string} paymentId
   */
  async getPaymentStatus(paymentId) {
    const response = await api.get(`/api/payments/${paymentId}`);
    return response?.data || response;
  },

  /**
   * Cancel pending payment
   * @param {number|string} paymentId
   */
  async cancelPayment(paymentId) {
    const response = await api.post(`/api/payments/${paymentId}/cancel`);
    return response?.data || response;
  },

  /**
   * Get active subscription of current user
   */
  async getMyActiveSubscription() {
    try {
      const response = await api.get('/api/v1/subscriptions/me/active');
      return response?.data || response;
    } catch {
      return null;
    }
  },

  /**
   * Get all subscriptions of current user
   */
  async getMySubscriptions() {
    try {
      const response = await api.get('/api/v1/subscriptions/me');
      return response?.data || response || [];
    } catch {
      return [];
    }
  },

  /**
   * Get payment history of current user
   */
  async getMyPayments(page = 0, size = 10) {
    try {
      const response = await api.get(`/api/payments/my-payments?page=${page}&size=${size}`);
      return response?.data || response;
    } catch {
      return null;
    }
  }
};
