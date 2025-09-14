import React, { useState } from 'react';
import './SubscriptionModal.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const SubscriptionModal = ({ isOpen, onClose, onSubscribe, user }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRazorpayPayment = async (planType) => {
    setIsProcessing(true);
    
    try {
      // Create payment order
      const orderResponse = await fetch(`${BACKEND_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_type: 'subscription',
          amount: planType === 'annual' ? 4900 : 4900 // ₹49 in paise
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderResponse.json();

      // Initialize Razorpay
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: 'INR',
        name: 'GrowKro',
        description: 'Annual Subscription - Access all creator features',
        order_id: orderData.order_id,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await fetch(`${BACKEND_URL}/api/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature
              })
            });

            if (verifyResponse.ok) {
              // Call the subscription success handler
              await onSubscribe(planType);
              alert('🎉 Subscription activated successfully! You now have access to all creator features.');
              onClose();
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: user ? {
          name: user.name,
          email: user.email
        } : {},
        notes: {
          user_id: user?.id,
          user_email: user?.email
        },
        theme: {
          color: '#667eea'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment initialization failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="subscription-modal-overlay" onClick={onClose}>
      <div className="subscription-modal" onClick={(e) => e.stopPropagation()}>
        <button className="subscription-modal-close" onClick={onClose}>×</button>
        
        <div className="subscription-header">
          <h2>🚀 Unlock Creator Access</h2>
          <p>Subscribe to connect with content creators and unlock all features</p>
        </div>

        <div className="subscription-benefits">
          <h3>What you get with subscription:</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <span className="benefit-icon">👥</span>
              <div>
                <strong>Access All Creators</strong>
                <p>Browse and view detailed profiles of all content creators</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💬</span>
              <div>
                <strong>Direct Messaging</strong>
                <p>Message creators directly for collaboration opportunities</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🔍</span>
              <div>
                <strong>Advanced Search</strong>
                <p>Filter creators by location, category, and follower count</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📊</span>
              <div>
                <strong>Creator Analytics</strong>
                <p>View detailed creator statistics and engagement data</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🤝</span>
              <div>
                <strong>Collaboration Tools</strong>
                <p>Access collaboration management and project tracking</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">⭐</span>
              <div>
                <strong>Priority Support</strong>
                <p>Get priority customer support and feature requests</p>
              </div>
            </div>
          </div>
        </div>

        <div className="subscription-plan">
          <div className="plan-card featured">
            <div className="plan-badge">Most Popular</div>
            <h3>Annual Subscription</h3>
            <div className="plan-price">
              <span className="currency">₹</span>
              <span className="amount">49</span>
              <span className="period">/year</span>
            </div>
            <div className="plan-savings">Save ₹539 compared to monthly</div>
            <ul className="plan-features">
              <li>✅ All creator profiles access</li>
              <li>✅ Unlimited messaging</li>
              <li>✅ Advanced search filters</li>
              <li>✅ Collaboration tools</li>
              <li>✅ Priority support</li>
              <li>✅ Analytics dashboard</li>
            </ul>
            <button 
              className="subscribe-btn"
              onClick={() => onSubscribe('annual')}
            >
              Subscribe Now - ₹49/year
            </button>
          </div>
        </div>

        <div className="subscription-footer">
          <p className="secure-payment">
            🔒 Secure payment processing • Cancel anytime • 7-day money-back guarantee
          </p>
          <p className="terms">
            By subscribing, you agree to our{' '}
            <a href="#terms" className="terms-link">Terms of Service</a>
            {' '}and{' '}
            <a href="#privacy" className="terms-link">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;