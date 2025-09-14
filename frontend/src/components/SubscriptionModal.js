import React from 'react';
import './SubscriptionModal.css';

const SubscriptionModal = ({ isOpen, onClose, onSubscribe, user }) => {
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