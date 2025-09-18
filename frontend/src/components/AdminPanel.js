import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faYoutube, faTwitter, faTiktok, faSnapchat } from '@fortawesome/free-brands-svg-icons';

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
  
  // New states for filtering and export
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [availableInterests, setAvailableInterests] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [filterForm, setFilterForm] = useState({
    city: '',
    interests: '',
    category: '',
    profile_status: ''
  });
  const [showAllCreators, setShowAllCreators] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

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

  const fetchFilteredCreators = async () => {
    try {
      const params = new URLSearchParams();
      if (filterForm.city) params.append('city', filterForm.city);
      if (filterForm.interests) params.append('interests', filterForm.interests);
      if (filterForm.category) params.append('category', filterForm.category);
      if (filterForm.profile_status) params.append('profile_status', filterForm.profile_status);
      params.append('limit', '100');

      const response = await fetch(`${BACKEND_URL}/api/admin/creators/filter?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setFilteredCreators(data.creators);
      }
    } catch (error) {
      console.error('Error fetching filtered creators:', error);
    }
  };

  const fetchAvailableOptions = async () => {
    try {
      const [interestsResponse, citiesResponse] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/creators/interests/available`),
        fetch(`${BACKEND_URL}/api/admin/creators/cities/available`)
      ]);

      if (interestsResponse.ok) {
        const interestsData = await interestsResponse.json();
        setAvailableInterests(interestsData.interests || []);
      }

      if (citiesResponse.ok) {
        const citiesData = await citiesResponse.json();
        setAvailableCities(citiesData.cities || []);
      }
    } catch (error) {
      console.error('Error fetching available options:', error);
    }
  };

  const handleExportCreators = async () => {
    try {
      setExportLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/admin/creators/export`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `growkro_creators_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert('Creator data exported successfully!');
      } else {
        alert('Failed to export creator data');
      }
    } catch (error) {
      console.error('Error exporting creators:', error);
      alert('Error exporting creator data');
    } finally {
      setExportLoading(false);
    }
  };

  const handleFilterSubmit = () => {
    fetchFilteredCreators();
    setShowAllCreators(true);
  };

  const handleFilterReset = () => {
    setFilterForm({ city: '', interests: '', category: '', profile_status: '' });
    setFilteredCreators([]);
    setShowAllCreators(false);
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
        fetchAvailableOptions();
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
          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-overview">
              <h3>Platform Overview</h3>
              <div className="overview-stats">
                <div className="stat-card">
                  <div className="stat-number">{analyticsData.user_growth?.total_creators || 0}</div>
                  <div className="stat-label">Total Creators</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">₹{analyticsData.revenue_metrics?.total_revenue || 0}</div>
                  <div className="stat-label">Total Revenue</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{userStats.pending_approval || 0}</div>
                  <div className="stat-label">Pending Approvals</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{analyticsData.engagement_metrics?.verified_creators || 0}</div>
                  <div className="stat-label">Verified Creators</div>
                </div>
              </div>
              
              <div className="recent-activity">
                <h4>Recent Activity</h4>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-icon">👤</span>
                    <span>New creator registration - Pending approval</span>
                    <span className="activity-time">2 hours ago</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">💰</span>
                    <span>Payment received - Subscription</span>
                    <span className="activity-time">4 hours ago</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">✅</span>
                    <span>Creator verified - Profile approved</span>
                    <span className="activity-time">6 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Management */}
          {activeTab === 'users' && (
            <div className="user-management">
              <div className="user-management-header">
                <h3>User Management</h3>
                <button 
                  className="export-btn"
                  onClick={handleExportCreators}
                  disabled={exportLoading}
                >
                  {exportLoading ? '📊 Exporting...' : '📊 Export to Excel'}
                </button>
              </div>
              
              <div className="user-stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{userStats.total_creators || 0}</div>
                  <div className="stat-label">Total Creators</div>
                </div>
                <div className="stat-card pending">
                  <div className="stat-number">{userStats.pending_approval || 0}</div>
                  <div className="stat-label">Pending Approval</div>
                </div>
                <div className="stat-card approved">
                  <div className="stat-number">{userStats.approved_creators || 0}</div>
                  <div className="stat-label">Approved</div>
                </div>
                <div className="stat-card rejected">
                  <div className="stat-number">{userStats.rejected_creators || 0}</div>
                  <div className="stat-label">Rejected</div>
                </div>
                <div className="stat-card suspended">
                  <div className="stat-number">{userStats.suspended_creators || 0}</div>
                  <div className="stat-label">Suspended</div>
                </div>
              </div>

              {/* Creator Filtering Section */}
              <div className="creator-filtering">
                <h4>🔍 Filter Creators</h4>
                <div className="filter-form">
                  <div className="filter-row">
                    <div className="filter-group">
                      <label>City:</label>
                      <select
                        value={filterForm.city}
                        onChange={(e) => setFilterForm({...filterForm, city: e.target.value})}
                        className="filter-select"
                      >
                        <option value="">All Cities</option>
                        {availableCities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="filter-group">
                      <label>Interests:</label>
                      <select
                        value={filterForm.interests}
                        onChange={(e) => setFilterForm({...filterForm, interests: e.target.value})}
                        className="filter-select"
                      >
                        <option value="">All Interests</option>
                        {availableInterests.map((interest) => (
                          <option key={interest} value={interest}>{interest}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="filter-group">
                      <label>Category:</label>
                      <input
                        type="text"
                        value={filterForm.category}
                        onChange={(e) => setFilterForm({...filterForm, category: e.target.value})}
                        placeholder="e.g., fashion, tech"
                        className="filter-input"
                      />
                    </div>
                    
                    <div className="filter-group">
                      <label>Status:</label>
                      <select
                        value={filterForm.profile_status}
                        onChange={(e) => setFilterForm({...filterForm, profile_status: e.target.value})}
                        className="filter-select"
                      >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="filter-actions">
                    <button onClick={handleFilterSubmit} className="filter-btn apply">
                      🔍 Apply Filters
                    </button>
                    <button onClick={handleFilterReset} className="filter-btn reset">
                      🔄 Reset Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Filtered Creators Results */}
              {showAllCreators && (
                <div className="filtered-creators">
                  <h4>📋 All Creators ({filteredCreators.length} found)</h4>
                  {filteredCreators.length > 0 ? (
                    <div className="all-creators-list">
                      {filteredCreators.map((creator) => (
                        <div key={creator.id} className="creator-card-compact">
                          <div className="creator-main-info">
                            <div className="creator-name-status">
                              <h5>{creator.name}</h5>
                              <span className={`status-badge ${creator.profile_status}`}>
                                {creator.profile_status}
                              </span>
                            </div>
                            <p className="creator-details">
                              {creator.email} • {creator.category} • {creator.location}
                            </p>
                            {creator.interests && creator.interests.length > 0 && (
                              <p className="creator-interests">
                                <strong>Interests:</strong> {creator.interests.join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="creator-social-compact">
                            {creator.instagram_handle && (
                              <span className="admin-social-stat-compact">
                                <FontAwesomeIcon icon={faInstagram} style={{color: '#E4405F'}} />
                                {creator.instagram_followers.toLocaleString()}
                              </span>
                            )}
                            {creator.youtube_handle && (
                              <span className="admin-social-stat-compact">
                                <FontAwesomeIcon icon={faYoutube} style={{color: '#FF0000'}} />
                                {creator.youtube_subscribers.toLocaleString()}
                              </span>
                            )}
                            {creator.twitter_handle && (
                              <span className="admin-social-stat-compact">
                                <FontAwesomeIcon icon={faTwitter} style={{color: '#1DA1F2'}} />
                                {creator.twitter_followers.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-results">No creators found matching the filters</div>
                  )}
                </div>
              )}

              <h4>Pending Approvals</h4>
              {pendingCreators.length > 0 ? (
                <div className="pending-creators-list">
                  {pendingCreators.map((creator) => (
                    <div key={creator.id} className="pending-creator-card">
                      <div className="creator-info">
                        <h5>{creator.name}</h5>
                        <p>{creator.email} • {creator.category} • {creator.location}</p>
                        <div className="social-summary">
                          {creator.instagram_handle && (
                            <span className="admin-social-stat">
                              <FontAwesomeIcon icon={faInstagram} style={{color: '#E4405F'}} />
                              {creator.instagram_followers.toLocaleString()}
                            </span>
                          )}
                          {creator.youtube_handle && (
                            <span className="admin-social-stat">
                              <FontAwesomeIcon icon={faYoutube} style={{color: '#FF0000'}} />
                              {creator.youtube_subscribers.toLocaleString()}
                            </span>
                          )}
                          {creator.twitter_handle && (
                            <span className="admin-social-stat">
                              <FontAwesomeIcon icon={faTwitter} style={{color: '#1DA1F2'}} />
                              {creator.twitter_followers.toLocaleString()}
                            </span>
                          )}
                          {creator.tiktok_handle && (
                            <span className="admin-social-stat">
                              <FontAwesomeIcon icon={faTiktok} style={{color: '#000000'}} />
                              {creator.tiktok_followers.toLocaleString()}
                            </span>
                          )}
                          {creator.snapchat_handle && (
                            <span className="admin-social-stat">
                              <FontAwesomeIcon icon={faSnapchat} style={{color: '#FFFC00'}} />
                              {creator.snapchat_followers.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="creator-bio">{creator.bio}</p>
                      </div>
                      <div className="approval-actions">
                        <button 
                          className="approve-btn"
                          onClick={() => handleCreatorAction(creator.id, 'approve')}
                        >
                          ✅ Approve
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleCreatorAction(creator.id, 'reject', 'Profile rejected by admin')}
                        >
                          ❌ Reject
                        </button>
                        <button 
                          className="suspend-btn"
                          onClick={() => handleCreatorAction(creator.id, 'suspend', 'Profile suspended for review')}
                        >
                          ⏸️ Suspend
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-pending">No pending approvals</div>
              )}
            </div>
          )}

          {/* Financial Management */}
          {activeTab === 'financial' && (
            <div className="financial-management">
              <h3>Financial Management</h3>
              
              <div className="revenue-overview">
                <div className="stat-card">
                  <div className="stat-number">₹{revenueStats.total_revenue || 0}</div>
                  <div className="stat-label">Total Revenue</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">₹{revenueStats.subscription_revenue || 0}</div>
                  <div className="stat-label">Subscription Revenue</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">₹{revenueStats.verification_revenue || 0}</div>
                  <div className="stat-label">Verification Revenue</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">₹{revenueStats.package_revenue || 0}</div>
                  <div className="stat-label">Package Revenue</div>
                </div>
              </div>

              <h4>Recent Transactions</h4>
              <div className="transactions-list">
                {transactions.length > 0 ? (
                  transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="transaction-item">
                      <div className="transaction-info">
                        <span className="transaction-type">{transaction.payment_type}</span>
                        <span className="transaction-amount">₹{(transaction.amount / 100).toFixed(2)}</span>
                        <span className={`transaction-status ${transaction.status}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-transactions">No transactions found</div>
                )}
              </div>
            </div>
          )}

          {/* Content Management */}
          {activeTab === 'content' && (
            <div className="content-management">
              <h3>Content & Community Management</h3>
              
              <div className="content-stats">
                <div className="stat-card">
                  <div className="stat-number">{contentReports.spam_reports || 0}</div>
                  <div className="stat-label">Spam Reports</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{contentReports.flagged_profiles || 0}</div>
                  <div className="stat-label">Flagged Profiles</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{contentReports.content_violations || 0}</div>
                  <div className="stat-label">Content Violations</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{contentReports.pending_reviews || 0}</div>
                  <div className="stat-label">Pending Reviews</div>
                </div>
              </div>

              <div className="content-actions">
                <h4>Moderation Actions</h4>
                <div className="moderation-tools">
                  <button className="moderation-btn">Review Flagged Content</button>
                  <button className="moderation-btn">Resolve Spam Reports</button>
                  <button className="moderation-btn">Moderate Comments</button>
                  <button className="moderation-btn">Content Policy Settings</button>
                </div>
              </div>
            </div>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <div className="analytics-dashboard">
              <h3>Analytics & Reports</h3>
              
              <div className="analytics-sections">
                <div className="analytics-section">
                  <h4>User Growth</h4>
                  <div className="analytics-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total Creators:</span>
                      <span className="stat-value">{analyticsData.user_growth?.total_creators || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Active Creators:</span>
                      <span className="stat-value">{analyticsData.user_growth?.active_creators || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Growth Rate:</span>
                      <span className="stat-value">{analyticsData.user_growth?.growth_rate || '0%'}</span>
                    </div>
                  </div>
                </div>

                <div className="analytics-section">
                  <h4>Revenue Metrics</h4>
                  <div className="analytics-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total Revenue:</span>
                      <span className="stat-value">₹{analyticsData.revenue_metrics?.total_revenue || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Monthly Revenue:</span>
                      <span className="stat-value">₹{analyticsData.revenue_metrics?.monthly_revenue || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Transactions:</span>
                      <span className="stat-value">{analyticsData.revenue_metrics?.transaction_count || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="analytics-section">
                  <h4>Engagement Metrics</h4>
                  <div className="analytics-stats">
                    <div className="stat-item">
                      <span className="stat-label">Verified Creators:</span>
                      <span className="stat-value">{analyticsData.engagement_metrics?.verified_creators || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Premium Creators:</span>
                      <span className="stat-value">{analyticsData.engagement_metrics?.premium_creators || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Collaboration Requests:</span>
                      <span className="stat-value">{analyticsData.engagement_metrics?.collaboration_requests || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="notifications-management">
              <h3>Notifications & Communication</h3>
              
              <div className="notification-form">
                <h4>Send Notification</h4>
                <div className="form-group">
                  <label>Title:</label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                    placeholder="Notification title"
                    className="notification-input"
                  />
                </div>
                <div className="form-group">
                  <label>Message:</label>
                  <textarea
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                    placeholder="Notification message"
                    className="notification-textarea"
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label>Target:</label>
                  <select
                    value={notificationForm.target}
                    onChange={(e) => setNotificationForm({...notificationForm, target: e.target.value})}
                    className="notification-select"
                  >
                    <option value="all">All Users</option>
                    <option value="subscribed">Subscribed Users</option>
                    <option value="creators">All Creators</option>
                    <option value="specific_users">Specific Users</option>
                  </select>
                </div>
                <button onClick={sendNotification} className="send-notification-btn">
                  Send Notification
                </button>
              </div>

              <div className="notification-history">
                <h4>Notification History</h4>
                {notificationHistory.length > 0 ? (
                  <div className="history-list">
                    {notificationHistory.map((notification) => (
                      <div key={notification.id} className="history-item">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-details">
                          {notification.message} • Sent to {notification.target_count} users
                        </div>
                        <div className="notification-time">
                          {new Date(notification.sent_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-history">No notifications sent yet</div>
                )}
              </div>
            </div>
          )}

          {/* Verification */}
          {activeTab === 'verification' && (
            <div className="verification-management">
              <h3>Verification & Compliance</h3>
              
              <div className="verification-tools">
                <div className="verification-section">
                  <h4>OTP Verification</h4>
                  <div className="otp-form">
                    <input
                      type="email"
                      placeholder="Email address for OTP"
                      className="otp-input"
                    />
                    <button className="otp-btn">Send OTP</button>
                  </div>
                </div>

                <div className="verification-section">
                  <h4>Verification Criteria</h4>
                  <div className="criteria-list">
                    <div className="criteria-item">
                      <span className="criteria-check">✅</span>
                      <span>Social media account verification</span>
                    </div>
                    <div className="criteria-item">
                      <span className="criteria-check">✅</span>
                      <span>Profile completeness check</span>
                    </div>
                    <div className="criteria-item">
                      <span className="criteria-check">✅</span>
                      <span>Content quality assessment</span>
                    </div>
                    <div className="criteria-item">
                      <span className="criteria-check">✅</span>
                      <span>Community guidelines compliance</span>
                    </div>
                  </div>
                </div>

                <div className="verification-section">
                  <h4>Bulk Actions</h4>
                  <div className="bulk-actions">
                    <button className="bulk-btn">Verify All Pending</button>
                    <button className="bulk-btn">Send Verification Reminders</button>
                    <button className="bulk-btn">Export Verification Report</button>
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