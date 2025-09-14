import React, { useState, useEffect } from 'react';
import './App.css';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import SubscriptionModal from './components/SubscriptionModal';

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

  // Auth and Admin states
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [authType, setAuthType] = useState('login');

  // Blog/CMS states
  const [blogPosts, setBlogPosts] = useState([
    {
      id: 1,
      title: "10 Tips to Grow Your Instagram Following Organically",
      excerpt: "Learn the proven strategies that top creators use to build engaged audiences without buying followers.",
      content: "Content creation is an art and a science. Here are the top strategies that successful creators use...",
      author: "GrowKro Team",
      date: "2024-01-15",
      category: "Growth Tips",
      image: "https://images.pexels.com/photos/5475810/pexels-photo-5475810.jpeg"
    },
    {
      id: 2,
      title: "Collaboration Success Stories: How Creators 10X Their Reach",
      excerpt: "Real case studies of creators who multiplied their audience through strategic collaborations.",
      content: "Collaborations are the secret weapon of successful content creators...",
      author: "Priya Sharma",
      date: "2024-01-10",
      category: "Collaboration",
      image: "https://images.pexels.com/photos/8728245/pexels-photo-8728245.jpeg"
    },
    {
      id: 3,
      title: "Monetization Strategies for Content Creators in 2024",
      excerpt: "Discover the latest trends and platforms for creators to generate sustainable income.",
      content: "The creator economy is booming. Here's how to make money from your content...",
      author: "Rahul Tech",
      date: "2024-01-05",
      category: "Monetization",
      image: "https://images.pexels.com/photos/5475816/pexels-photo-5475816.jpeg"
    }
  ]);

  // Check for existing user on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('growkro_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
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

  // Auth functions
  const handleLogin = (type = 'login') => {
    setAuthType(type);
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('growkro_user');
    setUser(null);
    alert('Logged out successfully!');
  };

  const openAdminPanel = () => {
    if (user && user.isAdmin) {
      setShowAdminPanel(true);
    } else {
      alert('Admin access required');
    }
  };

  const handleSubscription = async (planType = 'annual') => {
    try {
      // For demo purposes - simulate subscription payment
      const updatedUser = {
        ...user,
        isSubscribed: true,
        subscriptionType: planType,
        subscriptionDate: new Date().toISOString(),
        subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
      };
      
      localStorage.setItem('growkro_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowSubscriptionModal(false);
      alert('Subscription activated successfully! You can now access all creator features.');
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Subscription failed. Please try again.');
    }
  };

  const checkSubscriptionAccess = () => {
    if (!user) {
      alert('Please sign up first to access creator features');
      handleLogin('signup');
      return false;
    }
    
    if (!user.isSubscribed) {
      setShowSubscriptionModal(true);
      return false;
    }
    
    return true;
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

  const CreatorsPage = () => {
    // Check subscription access when trying to view creators
    if (!user || !user.isSubscribed) {
      return (
        <div className="subscription-required">
          <div className="container">
            <div className="subscription-prompt">
              <div className="subscription-icon">🔒</div>
              <h2>Subscription Required</h2>
              <p>To access creator profiles and messaging features, you need an active subscription.</p>
              <div className="subscription-features">
                <div className="feature-highlight">
                  <span className="feature-icon">👥</span>
                  <span>Browse All Creators</span>
                </div>
                <div className="feature-highlight">
                  <span className="feature-icon">💬</span>
                  <span>Direct Messaging</span>
                </div>
                <div className="feature-highlight">
                  <span className="feature-icon">🔍</span>
                  <span>Advanced Search</span>
                </div>
              </div>
              {!user ? (
                <div className="auth-prompt">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleLogin('signup')}
                  >
                    Sign Up First
                  </button>
                  <p>Already have an account?{' '}
                    <button 
                      className="link-btn"
                      onClick={() => handleLogin('login')}
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              ) : (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowSubscriptionModal(true)}
                >
                  Subscribe Now - Only ₹49/year
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="creators-page">
        <div className="container">
          <div className="page-header">
            <h1>Discover Creators</h1>
            <p>Connect with talented content creators in your area</p>
            <div className="subscription-status">
              ✅ Subscribed • Premium Access Active
            </div>
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
                  showMessageButton={true}
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
  };

  const CreatorCard = ({ creator, onClick, showMessageButton = false }) => (
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

        {showMessageButton && (
          <button 
            className="message-btn"
            onClick={(e) => {
              e.stopPropagation();
              alert(`Messaging feature coming soon! You can message ${creator.name} directly.`);
            }}
          >
            💬 Message
          </button>
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
              {user && user.isSubscribed ? (
                <>
                  <button className="btn btn-primary">Message Creator</button>
                  <button className="btn btn-secondary">Collaborate</button>
                </>
              ) : (
                <div className="subscription-required-actions">
                  <p className="subscription-notice">🔒 Subscribe to message creators and access collaboration tools</p>
                  {!user ? (
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleLogin('signup')}
                    >
                      Sign Up & Subscribe
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowSubscriptionModal(true)}
                    >
                      Subscribe Now - ₹49/year
                    </button>
                  )}
                </div>
              )}
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
          <img 
            src="https://customer-assets.emergentagent.com/job_creator-hub-147/artifacts/chmrtsob_Grow_Kro_2.png" 
            alt="GrowKro" 
            className="logo-image"
          />
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
            className={`nav-link ${currentPage === 'blog' ? 'active' : ''}`}
            onClick={() => setCurrentPage('blog')}
          >
            Blog
          </button>
          <button 
            className={`nav-link ${currentPage === 'contact' ? 'active' : ''}`}
            onClick={() => setCurrentPage('contact')}
          >
            Contact
          </button>
          
          {user ? (
            <div className="user-menu">
              <span className="user-name">Hello, {user.name}! 👋</span>
              {user.isAdmin && (
                <button 
                  className="btn btn-secondary nav-btn"
                  onClick={openAdminPanel}
                >
                  Admin Panel
                </button>
              )}
              <button 
                className="btn btn-outline nav-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button 
                className="btn btn-outline nav-btn"
                onClick={() => handleLogin('login')}
              >
                Sign In
              </button>
              <button 
                className="btn btn-primary nav-btn"
                onClick={() => handleLogin('signup')}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );

  const BlogPage = () => (
    <div className="blog-page">
      <div className="container">
        <div className="page-header">
          <h1>Creator Resources & Blog</h1>
          <p>Tips, strategies, and insights to grow your content reach</p>
        </div>

        <div className="blog-grid">
          {blogPosts.map((post) => (
            <article key={post.id} className="blog-card">
              <div className="blog-image">
                <img src={post.image} alt={post.title} />
                <div className="blog-category">{post.category}</div>
              </div>
              <div className="blog-content">
                <h3 className="blog-title">{post.title}</h3>
                <p className="blog-excerpt">{post.excerpt}</p>
                <div className="blog-meta">
                  <span className="blog-author">By {post.author}</span>
                  <span className="blog-date">{new Date(post.date).toLocaleDateString()}</span>
                </div>
                <button className="blog-read-more">Read More</button>
              </div>
            </article>
          ))}
        </div>

        <div className="blog-categories">
          <h3>Browse by Category</h3>
          <div className="category-tags">
            <button className="category-tag active">All Posts</button>
            <button className="category-tag">Growth Tips</button>
            <button className="category-tag">Collaboration</button>
            <button className="category-tag">Monetization</button>
            <button className="category-tag">Tech Reviews</button>
            <button className="category-tag">Social Media</button>
          </div>
        </div>
      </div>
    </div>
  );

  const ContactPage = () => (
    <div className="contact-page">
      <div className="container">
        <div className="page-header">
          <h1>Contact & Support</h1>
          <p>Get in touch with our team for any questions or support</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <h3>Get in Touch</h3>
            <div className="contact-item">
              <div className="contact-icon">📧</div>
              <div>
                <strong>Email Support</strong>
                <p>hello@growkro.com</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">📱</div>
              <div>
                <strong>WhatsApp Support</strong>
                <p>+91 99999 99999</p>
                <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
                  Chat on WhatsApp
                </a>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">🕒</div>
              <div>
                <strong>Support Hours</strong>
                <p>Monday - Friday: 9 AM - 6 PM IST</p>
              </div>
            </div>
          </div>

          <div className="contact-form">
            <h3>Send us a Message</h3>
            <form className="support-form">
              <div className="form-row">
                <input type="text" placeholder="Your Name" required className="form-input" />
                <input type="email" placeholder="Your Email" required className="form-input" />
              </div>
              <select className="form-input" required>
                <option value="">Select Topic</option>
                <option value="general">General Inquiry</option>
                <option value="technical">Technical Support</option>
                <option value="billing">Billing Question</option>
                <option value="partnership">Partnership</option>
                <option value="bug">Bug Report</option>
              </select>
              <textarea 
                placeholder="Your Message" 
                required 
                className="form-textarea"
                rows="5"
              ></textarea>
              <button type="submit" className="btn btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      <Navigation />
      
      <main className="main-content">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'creators' && <CreatorsPage />}
        {currentPage === 'profile' && <ProfilePage />}
        {currentPage === 'blog' && <BlogPage />}
        {currentPage === 'contact' && <ContactPage />}
      </main>
      
      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        type={authType}
      />
      
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
      
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