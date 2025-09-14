import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AdminPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Data states for different modules
  const [dashboardData, setDashboardData] = useState({});
  const [userStats, setUserStats] = useState({});
  const [pendingCreators, setPendingCreators] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [revenueStats, setRevenueStats] = useState({});
  const [contentReports, setContentReports] = useState({});
  const [analyticsData, setAnalyticsData] = useState({});
  const [notificationHistory, setNotificationHistory] = useState([]);

  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    target: 'all'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch dashboard analytics
      const analyticsResponse = await fetch(`${BACKEND_URL}/api/admin/analytics/dashboard`);
      if (analyticsResponse.ok) {
        const analytics = await analyticsResponse.json();
        setAnalyticsData(analytics);
      }

      // Fetch user stats
      const userStatsResponse = await fetch(`${BACKEND_URL}/api/admin/users/stats`);
      if (userStatsResponse.ok) {
        const stats = await userStatsResponse.json();
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchPendingCreators = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/creators/pending`);
      if (response.ok) {
        const creators = await response.json();
        setPendingCreators(creators);
      }
    } catch (error) {
      console.error('Error fetching pending creators:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/financial/transactions`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
      }

      const revenueResponse = await fetch(`${BACKEND_URL}/api/admin/financial/revenue`);
      if (revenueResponse.ok) {
        const revenue = await revenueResponse.json();
        setRevenueStats(revenue);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchContentReports = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/content/reports`);
      if (response.ok) {
        const reports = await response.json();
        setContentReports(reports);
      }
    } catch (error) {
      console.error('Error fetching content reports:', error);
    }
  };

  const fetchNotificationHistory = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/notifications/history`);
      if (response.ok) {
        const history = await response.json();
        setNotificationHistory(history);
      }
    } catch (error) {
      console.error('Error fetching notification history:', error);
    }
  };

  const handleCreatorAction = async (creatorId, action, notes = '') => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/creators/${creatorId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_id: creatorId, action, notes })
      });

      if (response.ok) {
        alert(`Creator ${action}d successfully!`);
        fetchPendingCreators();
        fetchInitialData();
      }
    } catch (error) {
      console.error('Error handling creator action:', error);
      alert('Error processing action');
    }
  };

  const sendNotification = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationForm)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Notification sent to ${result.target_count} users!`);
        setNotificationForm({ title: '', message: '', target: 'all' });
        fetchNotificationHistory();
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error sending notification');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Fetch data based on tab
    switch (tab) {
      case 'users':
        fetchPendingCreators();
        break;
      case 'financial':
        fetchTransactions();
        break;
      case 'content':
        fetchContentReports();
        break;
      case 'notifications':
        fetchNotificationHistory();
        break;
      default:
        break;
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
            className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => handleTabChange('users')}
          >
            👥 Users ({userStats.pending_approval || 0})
          </button>
          <button 
            className={`admin-tab ${activeTab === 'financial' ? 'active' : ''}`}
            onClick={() => handleTabChange('financial')}
          >
            💰 Financial
          </button>
          <button 
            className={`admin-tab ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => handleTabChange('content')}
          >
            📝 Content
          </button>
          <button 
            className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => handleTabChange('analytics')}
          >
            📈 Analytics
          </button>
          <button 
            className={`admin-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => handleTabChange('notifications')}
          >
            🔔 Notifications
          </button>
          <button 
            className={`admin-tab ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => handleTabChange('verification')}
          >
            ✅ Verification
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