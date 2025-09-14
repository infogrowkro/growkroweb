import React, { useState, useEffect } from 'react';
import './App.css';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [creators, setCreators] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    verified_only: false
  });

  // Fetch creators on component mount
  useEffect(() => {
    fetchCreators();
    fetchPackages();
  }, []);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/creators`);
      if (response.ok) {
        const data = await response.json();
        setCreators(data);
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
    }
    setLoading(false);
  };

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/packages`);
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const searchCreators = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filters.category) params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);
      if (filters.verified_only) params.append('verified_only', 'true');

      const response = await fetch(`${BACKEND_URL}/api/search/creators?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCreators(data.results);
      }
    } catch (error) {
      console.error('Error searching creators:', error);
    }
    setLoading(false);
  };

  const HomePage = () => (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <img 
            src="https://images.pexels.com/photos/5475810/pexels-photo-5475810.jpeg" 
            alt="Content creators collaborating"
            className="hero-bg-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            Collaborate. <span className="gradient-text">Grow.</span> Monetize.
          </h1>
          <p className="hero-subtitle">
            Connect with local content creators, build meaningful collaborations, and grow your reach together.
          </p>
          <div className="hero-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => setCurrentPage('creators')}
            >
              Join as Creator
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setCurrentPage('about')}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose GrowKro?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Direct Chat</h3>
              <p>Connect directly with creators for seamless collaboration planning</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Smart Matchmaking</h3>
              <p>AI-powered matching based on content style, audience, and location</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Profile Highlighting</h3>
              <p>Stand out with Silver, Gold, and Platinum highlight packages</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Profile Verification</h3>
              <p>Build trust with verified creator badges for just ₹199</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Annual Subscription</h3>
              <p>Premium features and unlimited collaborations for ₹49/year</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏢</div>
              <h3>Business Connect</h3>
              <p>Connect brands with local influencers (Coming January 2024)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="container">
          <h2 className="section-title">Highlight Packages</h2>
          <div className="pricing-grid">
            {packages.map((pkg) => (
              <div key={pkg.id} className={`pricing-card ${pkg.id}`}>
                <div className="pricing-header">
                  <h3>{pkg.name}</h3>
                  <div className="price">
                    ₹{pkg.price}<span>/package</span>
                  </div>
                </div>
                <ul className="features-list">
                  {pkg.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                <button className="btn btn-outline">Choose Plan</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const CreatorsPage = () => (
    <div className="creators-page">
      <div className="container">
        <div className="page-header">
          <h1>Discover Creators</h1>
          <p>Connect with talented content creators in your area</p>
        </div>

        {/* Search and Filters */}
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button onClick={searchCreators} className="search-btn">
              🔍
            </button>
          </div>
          
          <div className="filters">
            <select 
              value={filters.category} 
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="fashion">Fashion</option>
              <option value="tech">Tech</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="food">Food</option>
              <option value="travel">Travel</option>
              <option value="fitness">Fitness</option>
            </select>
            
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="filter-input"
            />
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.verified_only}
                onChange={(e) => setFilters({...filters, verified_only: e.target.checked})}
              />
              Verified Only
            </label>
          </div>
        </div>

        {/* Creators Grid */}
        <div className="creators-grid">
          {loading ? (
            <div className="loading">Loading creators...</div>
          ) : creators.length > 0 ? (
            creators.map((creator) => (
              <CreatorCard 
                key={creator.id} 
                creator={creator} 
                onClick={() => {
                  setSelectedCreator(creator);
                  setCurrentPage('profile');
                }}
              />
            ))
          ) : (
            <div className="no-results">
              <p>No creators found. Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const CreatorCard = ({ creator, onClick }) => (
    <div className="creator-card" onClick={onClick}>
      <div className="creator-avatar">
        {creator.profile_picture ? (
          <img src={creator.profile_picture} alt={creator.name} />
        ) : (
          <div className="avatar-placeholder">
            {creator.name.charAt(0).toUpperCase()}
          </div>
        )}
        {creator.verification_status && (
          <div className="verified-badge">✅</div>
        )}
      </div>
      
      <div className="creator-info">
        <h3 className="creator-name">{creator.name}</h3>
        {creator.location && (
          <p className="creator-location">📍 {creator.location}</p>
        )}
        {creator.category && (
          <span className="creator-category">{creator.category}</span>
        )}
        
        <div className="social-stats">
          {creator.instagram_handle && (
            <div className="social-stat">
              <span className="social-icon">📸</span>
              <span>{creator.instagram_followers.toLocaleString()}</span>
            </div>
          )}
          {creator.youtube_handle && (
            <div className="social-stat">
              <span className="social-icon">🎥</span>
              <span>{creator.youtube_subscribers.toLocaleString()}</span>
            </div>
          )}
        </div>
        
        {creator.highlight_package && (
          <div className={`highlight-badge ${creator.highlight_package}`}>
            {creator.highlight_package.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );

  const ProfilePage = () => {
    if (!selectedCreator) return <div>Creator not found</div>;

    return (
      <div className="profile-page">
        <div className="container">
          <button 
            className="back-btn"
            onClick={() => setCurrentPage('creators')}
          >
            ← Back to Creators
          </button>
          
          <div className="profile-header">
            <div className="profile-avatar-large">
              {selectedCreator.profile_picture ? (
                <img src={selectedCreator.profile_picture} alt={selectedCreator.name} />
              ) : (
                <div className="avatar-placeholder-large">
                  {selectedCreator.name.charAt(0).toUpperCase()}
                </div>
              )}
              {selectedCreator.verification_status && (
                <div className="verified-badge-large">✅ Verified</div>
              )}
            </div>
            
            <div className="profile-info">
              <h1 className="profile-name">{selectedCreator.name}</h1>
              {selectedCreator.location && (
                <p className="profile-location">📍 {selectedCreator.location}</p>
              )}
              {selectedCreator.category && (
                <span className="profile-category">{selectedCreator.category}</span>
              )}
              
              {selectedCreator.highlight_package && (
                <div className={`highlight-badge-large ${selectedCreator.highlight_package}`}>
                  {selectedCreator.highlight_package.toUpperCase()} CREATOR
                </div>
              )}
            </div>
          </div>
          
          <div className="profile-content">
            <div className="profile-section">
              <h3>About</h3>
              <p className="profile-bio">
                {selectedCreator.bio || "This creator hasn't added a bio yet."}
              </p>
            </div>
            
            <div className="profile-section">
              <h3>Social Media</h3>
              <div className="social-links">
                {selectedCreator.instagram_handle && (
                  <a 
                    href={`https://instagram.com/${selectedCreator.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link instagram"
                  >
                    <span className="social-icon">📸</span>
                    <div>
                      <div className="social-handle">@{selectedCreator.instagram_handle}</div>
                      <div className="social-followers">
                        {selectedCreator.instagram_followers.toLocaleString()} followers
                      </div>
                    </div>
                  </a>
                )}
                
                {selectedCreator.youtube_handle && (
                  <a 
                    href={`https://youtube.com/@${selectedCreator.youtube_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link youtube"
                  >
                    <span className="social-icon">🎥</span>
                    <div>
                      <div className="social-handle">@{selectedCreator.youtube_handle}</div>
                      <div className="social-followers">
                        {selectedCreator.youtube_subscribers.toLocaleString()} subscribers
                      </div>
                    </div>
                  </a>
                )}
              </div>
            </div>
            
            <div className="profile-actions">
              <button className="btn btn-primary">Message Creator</button>
              <button className="btn btn-secondary">Collaborate</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Navigation = () => (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo" onClick={() => setCurrentPage('home')}>
          <span className="logo-text">GrowKro</span>
        </div>
        
        <div className="nav-links">
          <button 
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            Home
          </button>
          <button 
            className={`nav-link ${currentPage === 'creators' ? 'active' : ''}`}
            onClick={() => setCurrentPage('creators')}
          >
            Creators
          </button>
          <button 
            className={`nav-link ${currentPage === 'pricing' ? 'active' : ''}`}
            onClick={() => setCurrentPage('pricing')}
          >
            Pricing
          </button>
          <button className="btn btn-primary nav-btn">
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="App">
      <Navigation />
      
      <main className="main-content">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'creators' && <CreatorsPage />}
        {currentPage === 'profile' && <ProfilePage />}
        {currentPage === 'pricing' && <HomePage />} {/* Pricing is in homepage */}
      </main>
      
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>GrowKro</h4>
              <p>Connecting content creators for meaningful collaborations</p>
            </div>
            <div className="footer-section">
              <h4>Features</h4>
              <ul>
                <li>Creator Profiles</li>
                <li>Collaboration Matching</li>
                <li>Profile Highlighting</li>
                <li>Verification</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>WhatsApp: +91 99999 99999</li>
                <li>Email: hello@growkro.com</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 GrowKro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;