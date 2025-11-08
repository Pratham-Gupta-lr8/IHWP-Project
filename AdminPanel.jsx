import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Users, Activity, TrendingUp, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminPanel() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`, { withCredentials: true });
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load statistics');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`, { withCredentials: true });
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      const response = await axios.get(`${API}/admin/user/${userId}/details`, { withCredentials: true });
      setUserDetails(response.data);
      setSelectedUser(userId);
      setShowDialog(true);
    } catch (error) {
      toast.error('Failed to load user details');
    }
  };

  const getPrakritiColor = (type) => {
    const colors = {
      Vata: '#2b7a9b',
      Pitta: '#d97706',
      Kapha: '#059669'
    };
    return colors[type] || '#6b8e6f';
  };

  return (
    <div className="admin-panel-container" data-testid="admin-panel">
      <div className="admin-content">
        <button className="back-btn" onClick={() => navigate('/dashboard')} data-testid="back-button">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="admin-header">
          <h1>Admin Panel</h1>
          <p>Manage users and monitor progress</p>
        </div>

        {stats && (
          <div className="stats-grid" data-testid="stats-section">
            <div className="stat-card card" data-testid="stat-users">
              <div className="stat-icon" style={{ background: '#e8f4f8' }}>
                <Users size={32} color="#2b7a9b" />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Users</span>
                <span className="stat-value">{stats.total_users}</span>
              </div>
            </div>

            <div className="stat-card card" data-testid="stat-profiles">
              <div className="stat-icon" style={{ background: '#f0f9f4' }}>
                <Activity size={32} color="#059669" />
              </div>
              <div className="stat-content">
                <span className="stat-label">Profiles Completed</span>
                <span className="stat-value">{stats.profiles_completed}</span>
              </div>
            </div>

            <div className="stat-card card" data-testid="stat-followups">
              <div className="stat-icon" style={{ background: '#fff4e6' }}>
                <TrendingUp size={32} color="#d97706" />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Follow-ups</span>
                <span className="stat-value">{stats.total_follow_ups}</span>
              </div>
            </div>
          </div>
        )}

        {stats && (
          <div className="prakriti-distribution card" data-testid="prakriti-distribution">
            <h2>Prakriti Distribution</h2>
            <div className="distribution-grid">
              {Object.entries(stats.prakriti_distribution).map(([type, count]) => (
                <div key={type} className="distribution-item" data-testid={`prakriti-${type.toLowerCase()}`}>
                  <div className="distribution-bar">
                    <div
                      className="distribution-fill"
                      style={{
                        width: `${(count / stats.profiles_completed) * 100}%`,
                        background: getPrakritiColor(type)
                      }}
                    />
                  </div>
                  <div className="distribution-info">
                    <span className={`badge badge-${type.toLowerCase()}`}>{type}</span>
                    <span className="distribution-count">{count} users</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="users-section card" data-testid="users-section">
          <h2>All Users</h2>
          <div className="users-table">
            <div className="table-header">
              <span>Name</span>
              <span>Email</span>
              <span>Actions</span>
            </div>
            {users.map((user, index) => (
              <div key={user.id} className="table-row" data-testid={`user-${index}`}>
                <span className="user-name">
                  {user.picture && <img src={user.picture} alt={user.name} className="user-avatar" />}
                  {user.name}
                </span>
                <span className="user-email" data-testid={`user-email-${index}`}>{user.email}</span>
                <button
                  className="view-btn"
                  onClick={() => viewUserDetails(user.id)}
                  data-testid={`view-user-${index}`}
                >
                  <Eye size={18} />
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent data-testid="user-details-dialog">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {userDetails && (
            <div className="user-details">
              <div className="detail-section">
                <h3>Profile Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span data-testid="detail-name">{userDetails.user.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span data-testid="detail-email">{userDetails.user.email}</span>
                  </div>
                  {userDetails.profile && (
                    <>
                      <div className="detail-item">
                        <span className="detail-label">Age:</span>
                        <span data-testid="detail-age">{userDetails.profile.age || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Gender:</span>
                        <span data-testid="detail-gender">{userDetails.profile.gender || 'N/A'}</span>
                      </div>
                      {userDetails.profile.prakriti_type && (
                        <div className="detail-item">
                          <span className="detail-label">Prakriti:</span>
                          <span className={`badge badge-${userDetails.profile.prakriti_type.toLowerCase()}`} data-testid="detail-prakriti">
                            {userDetails.profile.prakriti_type}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {userDetails.follow_ups && userDetails.follow_ups.length > 0 && (
                <div className="detail-section">
                  <h3>Recent Follow-ups ({userDetails.follow_ups.length})</h3>
                  <div className="follow-ups-summary">
                    {userDetails.follow_ups.slice(0, 3).map((followUp, index) => (
                      <div key={followUp.id} className="follow-up-item" data-testid={`detail-followup-${index}`}>
                        <span className="followup-date">
                          {new Date(followUp.date).toLocaleDateString()}
                        </span>
                        <span className="followup-rating">Rating: {followUp.progress_rating}/5</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .admin-panel-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f3ed 0%, #e8e4d9 100%);
          padding: 40px 20px;
        }

        .admin-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          color: #6b8e6f;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 32px;
        }

        .back-btn:hover {
          background: #f5f3ed;
        }

        .admin-header {
          margin-bottom: 40px;
        }

        .admin-header h1 {
          font-size: 42px;
          color: #2c3e3a;
          margin-bottom: 8px;
        }

        .admin-header p {
          font-size: 16px;
          color: #5a6b66;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #5a6b66;
          font-weight: 500;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #2c3e3a;
        }

        .prakriti-distribution {
          margin-bottom: 32px;
        }

        .prakriti-distribution h2 {
          font-size: 24px;
          color: #2c3e3a;
          margin-bottom: 24px;
        }

        .distribution-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .distribution-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .distribution-bar {
          flex: 1;
          height: 32px;
          background: #e5e1d8;
          border-radius: 16px;
          overflow: hidden;
        }

        .distribution-fill {
          height: 100%;
          transition: width 0.5s ease;
        }

        .distribution-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 150px;
        }

        .distribution-count {
          font-size: 14px;
          color: #5a6b66;
          font-weight: 500;
        }

        .users-section h2 {
          font-size: 24px;
          color: #2c3e3a;
          margin-bottom: 24px;
        }

        .users-table {
          display: flex;
          flex-direction: column;
        }

        .table-header,
        .table-row {
          display: grid;
          grid-template-columns: 2fr 3fr 1fr;
          gap: 16px;
          padding: 16px;
          align-items: center;
        }

        .table-header {
          background: #f5f3ed;
          border-radius: 8px;
          font-weight: 600;
          color: #2c3e3a;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table-row {
          border-bottom: 1px solid #e5e1d8;
          transition: background 0.2s ease;
        }

        .table-row:hover {
          background: #fdfbf7;
        }

        .user-name {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
          color: #2c3e3a;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-email {
          color: #5a6b66;
          font-size: 14px;
        }

        .view-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #e8f4e8;
          border: none;
          border-radius: 6px;
          color: #6b8e6f;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-btn:hover {
          background: #d4e9d4;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .detail-section h3 {
          font-size: 18px;
          color: #2c3e3a;
          margin-bottom: 16px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-label {
          font-size: 13px;
          color: #5a6b66;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-item > span:not(.detail-label) {
          font-size: 15px;
          color: #2c3e3a;
          font-weight: 500;
        }

        .follow-ups-summary {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .follow-up-item {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: #f5f3ed;
          border-radius: 8px;
        }

        .followup-date,
        .followup-rating {
          font-size: 14px;
          color: #2c3e3a;
        }

        @media (max-width: 968px) {
          .admin-header h1 {
            font-size: 32px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .table-header {
            display: none;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
