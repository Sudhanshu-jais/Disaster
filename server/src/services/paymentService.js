// DisasterOS Razorpay Payment Gateway Service
import crypto from 'crypto';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

let razorpayInstance = null;
if (keyId && keySecret && !keyId.includes('placeholder')) {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  } catch (err) {
    console.warn('[Razorpay] Initialization warning:', err.message);
  }
}

export const paymentService = {
  /**
   * Get public Razorpay Key ID for client checkout
   */
  getPublicKey() {
    return keyId || 'rzp_test_disasteros_demo';
  },

  /**
   * Check if live/test credentials are configured
   */
  isConfigured() {
    return Boolean(razorpayInstance && keyId && keySecret);
  },

  /**
   * Create a Razorpay Order
   * @param {Object} params - { amount, currency, receipt, notes }
   */
  async createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
    // Razorpay requires amount in smallest currency sub-unit (paise for INR, cents for USD)
    const amountInSubunits = Math.round(Number(amount) * 100);

    if (this.isConfigured()) {
      try {
        const order = await razorpayInstance.orders.create({
          amount: amountInSubunits,
          currency: currency.toUpperCase(),
          receipt: receipt || `rcpt_${Date.now()}`,
          notes
        });

        return {
          success: true,
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          key_id: keyId,
          is_mock: false
        };
      } catch (err) {
        console.error('[Razorpay] Order creation error:', err);
        // Fallback to simulated test order if API fails (e.g. invalid test keys)
        return {
          success: true,
          order_id: `order_test_${Date.now()}`,
          amount: amountInSubunits,
          currency: currency.toUpperCase(),
          key_id: keyId || 'rzp_test_disasteros_demo',
          is_mock: true,
          warning: err.message
        };
      }
    }

    // Interactive Demo / Test Mode when API keys are pending
    return {
      success: true,
      order_id: `order_sim_${Date.now()}`,
      amount: amountInSubunits,
      currency: currency.toUpperCase(),
      key_id: 'rzp_test_disasteros_demo',
      is_mock: true,
      note: 'Running in DisasterOS Razorpay Test Sandbox (Set RAZORPAY_KEY_ID in .env for live gateway)'
    };
  },

  /**
   * Verify Razorpay Payment Signature
   * @param {Object} params - { order_id, payment_id, signature }
   */
  verifyPaymentSignature({ order_id, payment_id, signature }) {
    if (!order_id || !payment_id) {
      return false;
    }

    // In demo/test mode with simulated order, accept test payment
    if (!this.isConfigured() || order_id.startsWith('order_sim_') || order_id.startsWith('order_test_')) {
      return true;
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${order_id}|${payment_id}`)
        .digest('hex');

      return generatedSignature === signature;
    } catch (err) {
      console.error('[Razorpay] Signature verification error:', err);
      return false;
    }
  }
};
