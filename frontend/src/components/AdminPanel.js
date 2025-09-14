import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AdminPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('creators');
  const [creators, setCreators] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'creators') {
      fetchCreators();
    }
  }, [activeTab]);

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

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleVerifyCreator = async (creatorId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/creators/${creatorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_status: true })
      });
      
      if (response.ok) {
        alert('Creator verified successfully!');
        fetchCreators();
        fetchStats();
      }
    } catch (error) {
      console.error('Error verifying creator:', error);
      alert('Error verifying creator');
    }
  };

  const handleUpgradePackage = async (creatorId, packageId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/creators/${creatorId}/upgrade-package/${packageId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        alert(`Creator upgraded to ${packageId} package!`);
        fetchCreators();
        fetchStats();
      }
    } catch (error) {
      console.error('Error upgrading package:', error);
      alert('Error upgrading package');
    }
  };

  const handleDeleteCreator = async (creatorId) => {
    if (window.confirm('Are you sure you want to delete this creator?')) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/creators/${creatorId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert('Creator deleted successfully!');
          fetchCreators();
          fetchStats();
        }
      } catch (error) {
        console.error('Error deleting creator:', error);
        alert('Error deleting creator');
      }
    }
  };

  return (
    <div className="admin-panel-overlay">
      <div className="admin-panel">
        <div className="admin-header">
          <h2>GrowKro Admin Panel</h2>
          <button className="admin-close" onClick={onClose}>×</button>
        </div>

        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'creators' ? 'active' : ''}`}
            onClick={() => setActiveTab('creators')}
          >
            Creators ({stats.total_creators || 0})
          </button>
          <button 
            className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
          <button 
            className={`admin-tab ${activeTab === 'packages' ? 'active' : ''}`}
            onClick={() => setActiveTab('packages')}
          >
            Packages
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'creators' && (
            <div className="creators-management">
              <h3>Creator Management</h3>
              {loading ? (
                <div className="admin-loading">Loading creators...</div>
              ) : (
                <div className="creators-table">
                  {creators.length > 0 ? (
                    creators.map((creator) => (
                      <div key={creator.id} className="creator-row">
                        <div className="creator-info">
                          <div className="creator-name">
                            {creator.name}
                            {creator.verification_status && (
                              <span className="verified-badge">✅ Verified</span>
                            )}
                          </div>
                          <div className="creator-details">
                            {creator.email} • {creator.category} • {creator.location}
                          </div>
                          <div className="creator-stats">
                            📸 {creator.instagram_followers?.toLocaleString() || 0} • 
                            🎥 {creator.youtube_subscribers?.toLocaleString() || 0}
                          </div>
                          {creator.highlight_package && (
                            <div className={`package-badge ${creator.highlight_package}`}>
                              {creator.highlight_package.toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        <div className="creator-actions">
                          {!creator.verification_status && (
                            <button 
                              className="action-btn verify-btn"
                              onClick={() => handleVerifyCreator(creator.id)}
                            >
                              Verify
                            </button>
                          )}
                          
                          <select 
                            onChange={(e) => {
                              if (e.target.value) {
                                handleUpgradePackage(creator.id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            className="package-select"
                          >
                            <option value="">Upgrade Package</option>
                            <option value="silver">Silver (₹4999)</option>
                            <option value="gold">Gold (₹9999)</option>
                            <option value="platinum">Platinum (₹9999)</option>
                          </select>
                          
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteCreator(creator.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-creators">No creators found</div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="stats-dashboard">
              <h3>Platform Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.total_creators || 0}</div>
                  <div className="stat-label">Total Creators</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.verified_creators || 0}</div>
                  <div className="stat-label">Verified Creators</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.highlight_packages?.silver || 0}</div>
                  <div className="stat-label">Silver Members</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.highlight_packages?.gold || 0}</div>
                  <div className="stat-label">Gold Members</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.highlight_packages?.platinum || 0}</div>
                  <div className="stat-label">Platinum Members</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    ₹{((stats.highlight_packages?.silver || 0) * 4999 + 
                       (stats.highlight_packages?.gold || 0) * 9999 + 
                       (stats.highlight_packages?.platinum || 0) * 9999 +
                       (stats.verified_creators || 0) * 199).toLocaleString()}
                  </div>
                  <div className="stat-label">Total Revenue</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'packages' && (
            <div className="packages-management">
              <h3>Highlight Packages</h3>
              <div className="packages-overview">
                <div className="package-card silver">
                  <h4>Silver Package</h4>
                  <div className="package-price">₹4,999</div>
                  <div className="package-features">
                    <div>30 days highlighting</div>
                    <div>Priority in search</div>
                    <div>Silver badge</div>
                    <div>Basic analytics</div>
                  </div>
                  <div className="package-stats">
                    {stats.highlight_packages?.silver || 0} active subscriptions
                  </div>
                </div>
                
                <div className="package-card gold">
                  <h4>Gold Package</h4>
                  <div className="package-price">₹9,999</div>
                  <div className="package-features">
                    <div>60 days highlighting</div>
                    <div>Top priority in search</div>
                    <div>Gold badge</div>
                    <div>Advanced analytics</div>
                    <div>Newsletter feature</div>
                  </div>
                  <div className="package-stats">
                    {stats.highlight_packages?.gold || 0} active subscriptions
                  </div>
                </div>
                
                <div className="package-card platinum">
                  <h4>Platinum Package</h4>
                  <div className="package-price">₹9,999</div>
                  <div className="package-features">
                    <div>90 days highlighting</div>
                    <div>Maximum priority</div>
                    <div>Platinum badge</div>
                    <div>Premium analytics</div>
                    <div>Newsletter feature</div>
                    <div>Direct collaborations</div>
                  </div>
                  <div className="package-stats">
                    {stats.highlight_packages?.platinum || 0} active subscriptions
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;