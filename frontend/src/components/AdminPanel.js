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

          {/* Content Management */}
          {activeTab === 'content' && (
            <div className="content-management">
              <h3>Content Moderation</h3>
              
              <div className="content-stats">
                <div className="stat-card">
                  <div className="stat-number">{contentReports.total_reports || 0}</div>
                  <div className="stat-label">Total Reports</div>
                </div>
                <div className="stat-card pending">
                  <div className="stat-number">{contentReports.pending_reports || 0}</div>
                  <div className="stat-label">Pending Review</div>
                </div>
                <div className="stat-card resolved">
                  <div className="stat-number">{contentReports.resolved_reports || 0}</div>
                  <div className="stat-label">Resolved</div>
                </div>
              </div>

              <h4>Recent Reports</h4>
              <div className="reports-list">
                {contentReports.recent_reports?.length > 0 ? (
                  contentReports.recent_reports.map((report) => (
                    <div key={report.id} className="report-item">
                      <div className="report-info">
                        <span className="report-type">{report.type}</span>
                        <span className="report-reason">{report.reason}</span>
                        <span className="report-date">{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="report-actions">
                        <button className="resolve-btn">Resolve</button>
                        <button className="dismiss-btn">Dismiss</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-reports">No reports found</div>
                )}
              </div>
            </div>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <div className="analytics-dashboard">
              <h3>Platform Analytics</h3>
              
              <div className="analytics-grid">
                <div className="stat-card">
                  <div className="stat-number">{analyticsData.user_growth?.total_creators || 0}</div>
                  <div className="stat-label">Total Creators</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{analyticsData.user_growth?.monthly_signups || 0}</div>
                  <div className="stat-label">Monthly Signups</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{analyticsData.engagement_metrics?.active_users || 0}</div>
                  <div className="stat-label">Active Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{analyticsData.engagement_metrics?.profile_views || 0}</div>
                  <div className="stat-label">Profile Views</div>
                </div>
              </div>

              <div className="growth-metrics">
                <h4>Growth Metrics</h4>
                <div className="metrics-list">
                  <div className="metric-item">
                    <span>User Retention Rate</span>
                    <span>{analyticsData.engagement_metrics?.retention_rate || 0}%</span>
                  </div>
                  <div className="metric-item">
                    <span>Average Session Duration</span>
                    <span>{analyticsData.engagement_metrics?.avg_session_duration || 0} min</span>
                  </div>
                  <div className="metric-item">
                    <span>Conversion Rate</span>
                    <span>{analyticsData.revenue_metrics?.conversion_rate || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="notifications-management">
              <h3>Notification Center</h3>
              
              <div className="notification-form">
                <h4>Send Notification</h4>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                    placeholder="Notification title"
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                    placeholder="Notification message"
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label>Target</label>
                  <select
                    value={notificationForm.target}
                    onChange={(e) => setNotificationForm({...notificationForm, target: e.target.value})}
                  >
                    <option value="all">All Users</option>
                    <option value="verified">Verified Creators</option>
                    <option value="premium">Premium Members</option>
                    <option value="pending">Pending Approval</option>
                  </select>
                </div>
                <button className="send-notification-btn" onClick={sendNotification}>
                  Send Notification
                </button>
              </div>

              <h4>Notification History</h4>
              <div className="notification-history">
                {notificationHistory.length > 0 ? (
                  notificationHistory.map((notification) => (
                    <div key={notification.id} className="notification-item">
                      <div className="notification-info">
                        <h5>{notification.title}</h5>
                        <p>{notification.message}</p>
                        <span className="notification-meta">
                          Sent to {notification.target} • {new Date(notification.sent_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="notification-stats">
                        <span>Delivered: {notification.delivered_count}</span>
                        <span>Opened: {notification.opened_count}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-notifications">No notifications sent yet</div>
                )}
              </div>
            </div>
          )}

          {/* Verification Management */}
          {activeTab === 'verification' && (
            <div className="verification-management">
              <h3>Verification Management</h3>
              
              <div className="verification-stats">
                <div className="stat-card">
                  <div className="stat-number">{userStats.total_creators || 0}</div>
                  <div className="stat-label">Total Creators</div>
                </div>
                <div className="stat-card verified">
                  <div className="stat-number">{analyticsData.engagement_metrics?.verified_creators || 0}</div>
                  <div className="stat-label">Verified</div>
                </div>
                <div className="stat-card pending">
                  <div className="stat-number">{userStats.pending_verification || 0}</div>
                  <div className="stat-label">Pending Verification</div>
                </div>
              </div>

              <div className="verification-criteria">
                <h4>Verification Criteria</h4>
                <div className="criteria-list">
                  <div className="criteria-item">
                    <span>✅ Minimum 10K followers on any platform</span>
                  </div>
                  <div className="criteria-item">
                    <span>✅ Complete profile with bio and contact info</span>
                  </div>
                  <div className="criteria-item">
                    <span>✅ Active content creation (last 30 days)</span>
                  </div>
                  <div className="criteria-item">
                    <span>✅ No policy violations</span>
                  </div>
                </div>
              </div>

              <div className="bulk-actions">
                <h4>Bulk Actions</h4>
                <div className="bulk-action-buttons">
                  <button className="bulk-verify-btn">Verify All Eligible</button>
                  <button className="bulk-notify-btn">Notify Pending Users</button>
                  <button className="export-btn">Export Verification Report</button>
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