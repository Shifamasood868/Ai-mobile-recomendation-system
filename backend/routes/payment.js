const express = require('express');
const router = express.Router();
const stripe = require('stripe')('sk_test_51RNSOJDAdOV3FO8kno7MLNd7DkIfv64IuynDPv9AuZgwE1uJBfZ9V38imr4IB70LTgG7KHG4ymmcSRZxKfbfSOuZ00JQYaGXr2');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

// Email configuration
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'ajunu534@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'ebonzkoesihwlocx'
  }
};

const transporter = nodemailer.createTransport(emailConfig);

// Verify email configuration
transporter.verify((error) => {
  if (error) {
    console.error('Error with email configuration:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

router.post('/create-payment-intent', async (req, res) => {
  try {
    console.log('Payment intent request:', req.body);
    
    const { amount, currency = 'pkr' } = req.body;
    
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ 
        success: false,
        error: 'Valid amount is required' 
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents/paisa
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('PaymentIntent created:', paymentIntent.id);
    
    res.json({ 
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    });
    
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Payment processing failed',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

router.post('/create-order', async (req, res) => {
  try {
    const { shippingInfo, items, total } = req.body;
    
    console.log('Order creation request:', { shippingInfo, items, total });
    
    // Validate required fields
    if (!shippingInfo || !items || !total) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields' 
      });
    }

    // Validate shipping info structure
    const requiredShippingFields = ['name', 'email', 'address', 'city', 'postalCode'];
    const missingFields = requiredShippingFields.filter(field => !shippingInfo[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing shipping fields: ${missingFields.join(', ')}`
      });
    }

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(shippingInfo.email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Generate order ID
    const orderId = uuidv4().substring(0, 8).toUpperCase();
    console.log('Generated order ID:', orderId);

    // Send confirmation email
    await sendConfirmationEmail(
      shippingInfo.email,
      orderId,
      items,
      total,
      shippingInfo
    );

    // In production, you would save the order to a database here
    // await saveOrderToDatabase(orderId, shippingInfo, items, total);

    console.log('Order processed successfully:', orderId);
    
    res.json({ 
      success: true,
      orderId,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Order processing failed',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

async function sendConfirmationEmail(toEmail, orderId, items, total, shippingInfo) {
  try {
    console.log('Preparing confirmation email for:', toEmail);
    
    // Format currency for display
    const formatCurrency = (amount) => {
      return 'PKR ' + parseFloat(amount).toLocaleString('en-PK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Thank you for your order!</h1>
        <p>Your order <strong>#${orderId}</strong> has been confirmed.</p>
        
        <h2 style="color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
          Shipping Information
        </h2>
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <p><strong>${shippingInfo.name}</strong></p>
          <p>${shippingInfo.address}</p>
          <p>${shippingInfo.city}, ${shippingInfo.postalCode}</p>
          <p>Email: ${shippingInfo.email}</p>
        </div>
        
        <h2 style="color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
          Order Summary
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Item</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Quantity</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${item.name}</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${item.quantity}</td>
                <td style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">
                  ${formatCurrency(parseFloat(item.price.replace(/[^\d.]/g, '')) * item.quantity)}
                </td>
              </tr>
            `).join('')}
            <tr style="font-weight: bold;">
              <td colspan="2" style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">Total</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">
                ${formatCurrency(total)}
              </td>
            </tr>
          </tbody>
        </table>
        
        <p style="color: #6b7280; font-size: 14px;">
          We'll notify you when your items ship. If you have any questions, please contact our support team.
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          Thank you for shopping with us!
        </p>
      </div>
    `;

    const mailOptions = {
      from: `"Phone Store" <${emailConfig.auth.user}>`,
      to: toEmail,
      subject: `Your Order Confirmation #${orderId}`,
      html: emailHtml
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);

  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    throw error;
  }
}

module.exports = router;