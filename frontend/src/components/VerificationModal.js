import React, { useState } from 'react';
import './VerificationModal.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const VerificationModal = ({ isOpen, onClose, creator, onVerificationSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVerificationPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create payment order for verification
      const orderResponse = await fetch(`${BACKEND_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_type: 'verification',
          creator_id: creator.id,
          amount: 19900 // ₹199 in paise
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create verification payment order');
      }

      const orderData = await orderResponse.json();

      // Initialize Razorpay
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: 'INR',
        name: 'GrowKro',
        description: 'Profile Verification - Get verified creator badge',
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
              alert('🎉 Profile verification payment successful! Your profile will be verified within 24 hours.');
              onVerificationSuccess();
              onClose();
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: creator.name,
          email: creator.email
        },
        notes: {
          creator_id: creator.id,
          payment_type: 'verification'
        },
        theme: {
          color: '#4CAF50'
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
      console.error('Verification payment error:', error);
      alert('Verification payment initialization failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="verification-modal-overlay" onClick={onClose}>
      <div className="verification-modal" onClick={(e) => e.stopPropagation()}>
        <button className="verification-modal-close" onClick={onClose}>×</button>
        
        <div className="verification-header">
          <div className="verification-icon">✅</div>
          <h2>Get Verified</h2>
          <p>Boost your credibility with a verified creator badge</p>
        </div>

        <div className="verification-benefits">
          <h3>Benefits of Profile Verification:</h3>
          <div className="benefits-list">
            <div className="benefit-item">
              <span className="benefit-icon">✅</span>
              <div>
                <strong>Verified Badge</strong>
                <p>Display a blue checkmark on your profile</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🚀</span>
              <div>
                <strong>Higher Visibility</strong>
                <p>Appear higher in search results and recommendations</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🤝</span>
              <div>
                <strong>Build Trust</strong>
                <p>Increase collaboration opportunities with verified status</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">⭐</span>
              <div>
                <strong>Priority Support</strong>
                <p>Get faster customer support and feature access</p>
              </div>
            </div>
          </div>
        </div>

        <div className="verification-pricing">
          <div className="pricing-card">
            <h3>Profile Verification</h3>
            <div className="price">
              <span className="currency">₹</span>
              <span className="amount">199</span>
              <span className="period">one-time</span>
            </div>
            <ul className="features-list">
              <li>✅ Instant verification process</li>
              <li>✅ Permanent verified badge</li>
              <li>✅ Priority in search results</li>
              <li>✅ Enhanced profile visibility</li>
              <li>✅ Build trust with collaborators</li>
            </ul>
            <button 
              className="verify-btn"
              onClick={handleVerificationPayment}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Get Verified - ₹199'}
            </button>
          </div>
        </div>

        <div className="verification-process">
          <h4>Verification Process:</h4>
          <div className="process-steps">
            <div className="step">
              <span className="step-number">1</span>
              <span>Complete Payment</span>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <span>Profile Review (24 hours)</span>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <span>Verification Badge Added</span>
            </div>
          </div>
        </div>

        <div className="verification-footer">
          <p className="guarantee">
            🛡️ 100% Secure Payment • Instant Processing • 7-day Money-back Guarantee
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;