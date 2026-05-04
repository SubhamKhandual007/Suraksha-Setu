const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { auth } = require('../middleware/auth');

// Create a PaymentIntent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, currency = 'inr', hotelName } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents/paise
      currency: currency.toLowerCase(),
      metadata: {
        userId: req.user._id.toString(),
        hotelName: hotelName || 'Hotel Booking',
        type: 'hotel_booking'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
});

module.exports = router;
