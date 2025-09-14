import React, { useState, useEffect } from 'react';
import './BusinessOwners.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faYoutube, faTwitter, faTiktok, faSnapchat } from '@fortawesome/free-brands-svg-icons';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const BusinessOwners = ({ user }) => {
  const [activeTab, setActiveTab] = useState('browse');
  const [businessOwners, setBusinessOwners] = useState([]);
  const [matchedCreators, setMatchedCreators] = useState([]);
  const [collaborationRequests, setCollaborationRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  // Registration form state
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    email: '',
    company_name: '',
    company_description: '',
    industry: 'fashion',
    location: '',
    budget_range: 'medium',
    collaboration_type: 'sponsored_posts',
    target_audience: '',
    preferred_platforms: [],
    min_followers: 10000,
    max_followers: 500000,
    contact_phone: '',
    website: ''
  });

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchBusinessOwners();
    }
  }, [activeTab]);

  const fetchBusinessOwners = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/business-owners`);
      if (response.ok) {
        const data = await response.json();
        setBusinessOwners(data);
      }
    } catch (error) {
      console.error('Error fetching business owners:', error);
    }
    setLoading(false);
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/business-owners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationForm)
      });

      if (response.ok) {
        alert('Business registration submitted successfully! Your profile will be reviewed within 24 hours.');
        setRegistrationForm({
          name: '',
          email: '',
          company_name: '',
          company_description: '',
          industry: 'fashion',
          location: '',
          budget_range: 'medium',
          collaboration_type: 'sponsored_posts',
          target_audience: '',
          preferred_platforms: [],
          min_followers: 10000,
          max_followers: 500000,
          contact_phone: '',
          website: ''
        });
        setActiveTab('browse');
      } else {
        const error = await response.json();
        alert(`Registration failed: ${error.detail}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const handlePlatformToggle = (platform) => {
    setRegistrationForm(prev => ({
      ...prev,
      preferred_platforms: prev.preferred_platforms.includes(platform)
        ? prev.preferred_platforms.filter(p => p !== platform)
        : [...prev.preferred_platforms, platform]
    }));
  };

  const findMatchingCreators = async (businessId) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/creators/match-business/${businessId}`);
      if (response.ok) {
        const creators = await response.json();
        setMatchedCreators(creators);
        setSelectedBusiness(businessId);
        setActiveTab('matches');
      }
    } catch (error) {
      console.error('Error finding matching creators:', error);
    }
    setLoading(false);
  };

  const sendCollaborationRequest = async (creatorId) => {
    if (!selectedBusiness) return;

    const campaignTitle = prompt('Enter campaign title:');
    const campaignDescription = prompt('Enter campaign description:');
    
    if (!campaignTitle || !campaignDescription) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/collaboration-requests?business_owner_id=${selectedBusiness}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: creatorId,
          campaign_title: campaignTitle,
          campaign_description: campaignDescription,
          collaboration_type: 'sponsored_posts',
          budget_amount: 5000,
          duration_days: 30,
          requirements: ['Professional photo/video content', 'Caption approval required']
        })
      });

      if (response.ok) {
        alert('Collaboration request sent successfully!');
      }
    } catch (error) {
      console.error('Error sending collaboration request:', error);
      alert('Failed to send collaboration request.');
    }
  };

  return (
    <div className="business-owners-section">
      <div className="container">
        <div className="business-header">
          <h1>🏢 Business & Brand Collaborations</h1>
          <p>Connect with content creators for authentic brand partnerships</p>
        </div>

        <div className="business-tabs">
          <button 
            className={`business-tab ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            Browse Businesses
          </button>
          <button 
            className={`business-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register Your Business
          </button>
          <button 
            className={`business-tab ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            Creator Matches
          </button>
        </div>

        <div className="business-content">
          {/* Browse Businesses */}
          {activeTab === 'browse' && (
            <div className="browse-businesses">
              <h3>Active Brand Partnerships</h3>
              <p className="tab-description">Discover businesses looking for creator collaborations</p>
              
              {loading ? (
                <div className="loading">Loading businesses...</div>
              ) : businessOwners.length > 0 ? (
                <div className="business-grid">
                  {businessOwners.map((business) => (
                    <div key={business.id} className="business-card">
                      <div className="business-header">
                        <h4>{business.company_name}</h4>
                        <span className={`industry-tag ${business.industry}`}>
                          {business.industry}
                        </span>
                      </div>
                      
                      <div className="business-details">
                        <p><strong>Contact:</strong> {business.name}</p>
                        <p><strong>Location:</strong> {business.location || 'Remote'}</p>
                        <p><strong>Budget:</strong> {business.budget_range} range</p>
                        <p><strong>Looking for:</strong> {business.collaboration_type.replace('_', ' ')}</p>
                      </div>

                      <div className="business-requirements">
                        <h5>Follower Requirements:</h5>
                        <p>{business.min_followers.toLocaleString()} - {business.max_followers.toLocaleString()} followers</p>
                        
                        <h5>Preferred Platforms:</h5>
                        <div className="platform-icons">
                          {business.preferred_platforms.map(platform => (
                            <span key={platform} className={`platform-icon ${platform}`}>
                              {platform === 'instagram' && <FontAwesomeIcon icon={faInstagram} />}
                              {platform === 'youtube' && <FontAwesomeIcon icon={faYoutube} />}
                              {platform === 'twitter' && <FontAwesomeIcon icon={faTwitter} />}
                              {platform === 'tiktok' && <FontAwesomeIcon icon={faTiktok} />}
                              {platform === 'snapchat' && <FontAwesomeIcon icon={faSnapchat} />}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="business-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => findMatchingCreators(business.id)}
                        >
                          Find Matching Creators
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-businesses">
                  <div className="empty-state">
                    <h4>No businesses registered yet</h4>
                    <p>Be the first to register your business for creator collaborations!</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setActiveTab('register')}
                    >
                      Register Your Business
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Register Business */}
          {activeTab === 'register' && (
            <div className="register-business">
              <h3>Register Your Business</h3>
              <p className="tab-description">Join GrowKro to connect with content creators</p>

              <form onSubmit={handleRegistrationSubmit} className="registration-form">
                <div className="form-section">
                  <h4>Business Information</h4>
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={registrationForm.name}
                      onChange={(e) => setRegistrationForm({...registrationForm, name: e.target.value})}
                      required
                      className="form-input"
                    />
                    <input
                      type="email"
                      placeholder="Business Email"
                      value={registrationForm.email}
                      onChange={(e) => setRegistrationForm({...registrationForm, email: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={registrationForm.company_name}
                      onChange={(e) => setRegistrationForm({...registrationForm, company_name: e.target.value})}
                      required
                      className="form-input"
                    />
                    <input
                      type="text"
                      placeholder="Location (City, Country)"
                      value={registrationForm.location}
                      onChange={(e) => setRegistrationForm({...registrationForm, location: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <textarea
                    placeholder="Company Description"
                    value={registrationForm.company_description}
                    onChange={(e) => setRegistrationForm({...registrationForm, company_description: e.target.value})}
                    className="form-textarea"
                    rows="3"
                  />
                </div>

                <div className="form-section">
                  <h4>Collaboration Preferences</h4>
                  <div className="form-row">
                    <select
                      value={registrationForm.industry}
                      onChange={(e) => setRegistrationForm({...registrationForm, industry: e.target.value})}
                      className="form-select"
                    >
                      <option value="fashion">Fashion</option>
                      <option value="tech">Technology</option>
                      <option value="food">Food & Beverage</option>
                      <option value="lifestyle">Lifestyle</option>
                      <option value="fitness">Fitness & Health</option>
                      <option value="beauty">Beauty</option>
                      <option value="travel">Travel</option>
                      <option value="gaming">Gaming</option>
                    </select>
                    
                    <select
                      value={registrationForm.collaboration_type}
                      onChange={(e) => setRegistrationForm({...registrationForm, collaboration_type: e.target.value})}
                      className="form-select"
                    >
                      <option value="sponsored_posts">Sponsored Posts</option>
                      <option value="product_reviews">Product Reviews</option>
                      <option value="brand_ambassador">Brand Ambassador</option>
                      <option value="events">Events & Appearances</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <select
                      value={registrationForm.budget_range}
                      onChange={(e) => setRegistrationForm({...registrationForm, budget_range: e.target.value})}
                      className="form-select"
                    >
                      <option value="low">Low Budget (₹1K-10K)</option>
                      <option value="medium">Medium Budget (₹10K-50K)</option>
                      <option value="high">High Budget (₹50K+)</option>
                      <option value="custom">Custom Budget</option>
                    </select>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Creator Requirements</h4>
                  <div className="form-row">
                    <input
                      type="number"
                      placeholder="Minimum Followers"
                      value={registrationForm.min_followers}
                      onChange={(e) => setRegistrationForm({...registrationForm, min_followers: parseInt(e.target.value) || 0})}
                      className="form-input"
                    />
                    <input
                      type="number"
                      placeholder="Maximum Followers"
                      value={registrationForm.max_followers}
                      onChange={(e) => setRegistrationForm({...registrationForm, max_followers: parseInt(e.target.value) || 1000000})}
                      className="form-input"
                    />
                  </div>

                  <div className="platform-selection">
                    <label>Preferred Platforms:</label>
                    <div className="platform-checkboxes">
                      {['instagram', 'youtube', 'twitter', 'tiktok', 'snapchat'].map(platform => (
                        <label key={platform} className="platform-checkbox">
                          <input
                            type="checkbox"
                            checked={registrationForm.preferred_platforms.includes(platform)}
                            onChange={() => handlePlatformToggle(platform)}
                          />
                          <span className="platform-label">
                            {platform === 'instagram' && <FontAwesomeIcon icon={faInstagram} />}
                            {platform === 'youtube' && <FontAwesomeIcon icon={faYoutube} />}
                            {platform === 'twitter' && <FontAwesomeIcon icon={faTwitter} />}
                            {platform === 'tiktok' && <FontAwesomeIcon icon={faTiktok} />}
                            {platform === 'snapchat' && <FontAwesomeIcon icon={faSnapchat} />}
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <textarea
                    placeholder="Target Audience Description"
                    value={registrationForm.target_audience}
                    onChange={(e) => setRegistrationForm({...registrationForm, target_audience: e.target.value})}
                    className="form-textarea"
                    rows="3"
                  />
                </div>

                <div className="form-section">
                  <h4>Contact Information</h4>
                  <div className="form-row">
                    <input
                      type="tel"
                      placeholder="Contact Phone"
                      value={registrationForm.contact_phone}
                      onChange={(e) => setRegistrationForm({...registrationForm, contact_phone: e.target.value})}
                      className="form-input"
                    />
                    <input
                      type="url"
                      placeholder="Company Website"
                      value={registrationForm.website}
                      onChange={(e) => setRegistrationForm({...registrationForm, website: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary registration-submit">
                  {loading ? 'Submitting...' : 'Register Business'}
                </button>
              </form>
            </div>
          )}

          {/* Creator Matches */}
          {activeTab === 'matches' && (
            <div className="creator-matches">
              <h3>Matching Creators</h3>
              <p className="tab-description">Content creators that match your business requirements</p>

              {matchedCreators.length > 0 ? (
                <div className="matches-grid">
                  {matchedCreators.map((creator) => (
                    <div key={creator.id} className="match-creator-card">
                      <div className="creator-info">
                        <h4>{creator.name}</h4>
                        <p>{creator.category} • {creator.location}</p>
                        
                        <div className="creator-social-stats">
                          {creator.instagram_handle && (
                            <span className="social-stat">
                              <FontAwesomeIcon icon={faInstagram} />
                              {creator.instagram_followers.toLocaleString()}
                            </span>
                          )}
                          {creator.youtube_handle && (
                            <span className="social-stat">
                              <FontAwesomeIcon icon={faYoutube} />
                              {creator.youtube_subscribers.toLocaleString()}
                            </span>
                          )}
                          {creator.twitter_handle && (
                            <span className="social-stat">
                              <FontAwesomeIcon icon={faTwitter} />
                              {creator.twitter_followers.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {creator.highlight_package && (
                          <div className={`creator-badge ${creator.highlight_package}`}>
                            {creator.highlight_package.toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="match-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => sendCollaborationRequest(creator.id)}
                        >
                          Send Collaboration Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-matches">
                  <p>Select a business to find matching creators</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessOwners;