import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import './Checkout.css';

const stripePromise = loadStripe('pk_test_51RNSOJDAdOV3FO8kgdJjDvdT9EOeQ0drUnIe7JGz9gZWmt4mZqzur74OHteHO5MkMBtSrBIqcIylHLYRufJJ3Pdi00aN0T0Nnn');

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [clientSecret, setClientSecret] = useState('');
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [orderId, setOrderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(savedCartItems);

    if (savedCartItems.length > 0) {
      createPaymentIntent(savedCartItems);
    }
  }, []);

  const createPaymentIntent = async (items) => {
    const amount = items.reduce((total, item) => {
      const price = parseFloat(item.price.replace('$', '').replace(',', ''));
      return total + price * item.quantity;
    }, 0) * 100;

    try {
      const response = await fetch('http://localhost:5000/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error('Error creating payment intent:', err);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Create order and send confirmation email
      const response = await fetch('http://localhost:5000/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingInfo,
          items: cartItems,
          total: totalBill,
        }),
      });
      
      const data = await response.json();
      setOrderId(data.orderId);
      
      // Clear cart
      localStorage.removeItem('cartItems');
      setCartItems([]);
      
      // Move to confirmation step
      setCurrentStep(3);
    } catch (err) {
      console.error('Error creating order:', err);
    }
  };

  const totalBill = cartItems.reduce((total, item) => {
    const price = parseFloat(item.price.replace('$', '').replace(',', ''));
    return total + price * item.quantity;
  }, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleBackToCart = () => navigate('/cart');
  const handleNextStep = () => {
    if (currentStep === 1) {
      const { name, email, address, city, postalCode } = shippingInfo;
      if (!name || !email || !address || !city || !postalCode) {
        alert('Please fill out all shipping information');
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        alert('Please enter a valid email address');
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };
  const handlePrevStep = () => setCurrentStep((prev) => prev - 1);

  if (cartItems.length === 0 && currentStep !== 3) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/new-phones')} className="continue-shopping-btn">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <div className="checkout-steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1. Shipping</div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2. Payment</div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3. Confirmation</div>
        </div>
      </div>

      <div className="checkout-content">
        <div className="shipping-section">
          {currentStep === 1 && (
            <>
              <h2>Shipping Information</h2>
              <form className="shipping-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" value={shippingInfo.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={shippingInfo.email} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" name="address" value={shippingInfo.address} onChange={handleInputChange} required />
                </div>
                <div className="form-group-row">
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" name="city" value={shippingInfo.city} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Postal Code</label>
                    <input type="text" name="postalCode" value={shippingInfo.postalCode} onChange={handleInputChange} required />
                  </div>
                </div>
              </form>
            </>
          )}

          {currentStep === 2 && (
            <>
              <h2>Payment Method</h2>
              <div className="payment-section">
                {clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm
                      onPaymentSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                )}
              </div>
            </>
          )}

          {currentStep === 3 && (
            <div className="confirmation-section">
              <h2>Order Confirmation</h2>
              <div className="confirmation-message">
                <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
                <h3>Thank you for your order!</h3>
                <p>Your order #{orderId} has been placed successfully.</p>
                <p>A confirmation email has been sent to {shippingInfo.email}.</p>
                <button onClick={() => navigate('/')} className="continue-shopping-btn">
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

          {currentStep < 3 && currentStep !== 2 && (
            <div className="step-navigation">
              {currentStep > 1 && <button onClick={handlePrevStep} className="back-btn">Back</button>}
              {currentStep === 1 && <button onClick={handleBackToCart} className="back-btn">Back to Cart</button>}
              {currentStep < 2 && <button onClick={handleNextStep} className="next-btn">Next: Payment</button>}
            </div>
          )}
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cartItems.map((item) => (
              <div key={item.id} className="order-item">
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Qty: {item.quantity}</p>
                </div>
                <div className="item-price">
                  ${(parseFloat(item.price.replace('$', '').replace(',', '')) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="order-totals">
            <div className="total-row"><span>Subtotal</span><span>${totalBill.toFixed(2)}</span></div>
            <div className="total-row"><span>Shipping</span><span>Free</span></div>
            <div className="total-row grand-total"><span>Total</span><span>${totalBill.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutForm = ({ onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (error) {
      setError(error.message);
      setProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      onPaymentSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <PaymentElement />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={!stripe || processing} className="next-btn">
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default CheckoutPage;