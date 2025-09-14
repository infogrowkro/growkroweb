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
              <h3>User Management</h3>
              
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

              <h4>Pending Approvals</h4>
              {pendingCreators.length > 0 ? (
                <div className="pending-creators-list">
                  {pendingCreators.map((creator) => (
                    <div key={creator.id} className="pending-creator-card">
                      <div className="creator-info">
                        <h5>{creator.name}</h5>
                        <p>{creator.email} • {creator.category} • {creator.location}</p>
                        <div className="social-summary">
                          {creator.instagram_handle && <span>📸 {creator.instagram_followers.toLocaleString()}</span>}
                          {creator.youtube_handle && <span>🎥 {creator.youtube_subscribers.toLocaleString()}</span>}
                          {creator.twitter_handle && <span>🐦 {creator.twitter_followers.toLocaleString()}</span>}
                          {creator.tiktok_handle && <span>🎵 {creator.tiktok_followers.toLocaleString()}</span>}
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
              <h3>Financial Overview</h3>
              
              <div className="revenue-stats">
                <div className="stat-card">
                  <div className="stat-number">₹{revenueStats.total_revenue || 0}</div>
                  <div className="stat-label">Total Revenue</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">₹{revenueStats.monthly_revenue || 0}</div>
                  <div className="stat-label">This Month</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{revenueStats.total_transactions || 0}</div>
                  <div className="stat-label">Total Transactions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">₹{revenueStats.average_transaction || 0}</div>
                  <div className="stat-label">Avg Transaction</div>
                </div>
              </div>

              <h4>Recent Transactions</h4>
              <div className="transactions-list">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="transaction-item">
                      <div className="transaction-info">
                        <span className="transaction-type">{transaction.type}</span>
                        <span className="transaction-user">{transaction.user_name}</span>
                        <span className="transaction-date">{new Date(transaction.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="transaction-amount">₹{transaction.amount}</div>
                    </div>
                  ))
                ) : (
                  <div className="no-transactions">No transactions found</div>
                )}
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