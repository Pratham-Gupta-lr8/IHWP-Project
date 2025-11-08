import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Activity, Calendar, BarChart3, LogOut, Leaf } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    contact: '',
    body_type: '',
    lifestyle: '',
    health_concerns: []
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userRes = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(userRes.data);

      const profileRes = await axios.get(`${API}/profile`, { withCredentials: true });
      setProfile(profileRes.data);
      
      if (profileRes.data.age) {
        setFormData({
          age: profileRes.data.age || '',
          gender: profileRes.data.gender || '',
          contact: profileRes.data.contact || '',
          body_type: profileRes.data.body_type || '',
          lifestyle: profileRes.data.lifestyle || '',
          health_concerns: profileRes.data.health_concerns || []
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/profile`, formData, { withCredentials: true });
      toast.success('Profile updated successfully!');
      setShowProfileForm(false);
      fetchUserData();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleHealthConcernToggle = (concern) => {
    setFormData(prev => ({
      ...prev,
      health_concerns: prev.health_concerns.includes(concern)
        ? prev.health_concerns.filter(c => c !== concern)
        : [...prev.health_concerns, concern]
    }));
  };

  if (!user) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard-container" data-testid="dashboard-page">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Leaf size={32} color="#6b8e6f" />
          <span>Wellness Rhythm</span>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active" onClick={() => navigate('/dashboard')} data-testid="nav-dashboard">
            <Activity size={20} />
            Dashboard
          </button>
          <button className="nav-item" onClick={() => navigate('/prakriti-analysis')} data-testid="nav-prakriti">
            <User size={20} />
            Prakriti Analysis
          </button>
          <button className="nav-item" onClick={() => navigate('/diet-chart')} data-testid="nav-diet">
            <Calendar size={20} />
            Diet Chart
          </button>
          <button className="nav-item" onClick={() => navigate('/daily-schedule')} data-testid="nav-schedule">
            <Calendar size={20} />
            Daily Schedule
          </button>
          <button className="nav-item" onClick={() => navigate('/follow-ups')} data-testid="nav-followups">
            <BarChart3 size={20} />
            Follow-ups
          </button>
          <button className="nav-item" onClick={() => navigate('/admin')} data-testid="nav-admin">
            <BarChart3 size={20} />
            Admin Panel
          </button>
        </nav>
        <button className="logout-btn" onClick={handleLogout} data-testid="logout-button">
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 data-testid="dashboard-welcome">Welcome, {user.name}!</h1>
            <p>Your personalized Ayurvedic wellness dashboard</p>
          </div>
          <div className="user-avatar">
            {user.picture ? (
              <img src={user.picture} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">{user.name.charAt(0)}</div>
            )}
          </div>
        </header>

        <div className="dashboard-content">
          {!showProfileForm ? (
            <>
              <div className="profile-overview card" data-testid="profile-section">
                <div className="card-header">
                  <h2>Your Profile</h2>
                  <button className="btn-secondary" onClick={() => setShowProfileForm(true)} data-testid="edit-profile-button">
                    {profile?.age ? 'Edit Profile' : 'Complete Profile'}
                  </button>
                </div>
                {profile?.age ? (
                  <div className="profile-info">
                    <div className="info-item">
                      <span className="info-label">Age:</span>
                      <span data-testid="profile-age">{profile.age}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Gender:</span>
                      <span data-testid="profile-gender">{profile.gender}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Contact:</span>
                      <span data-testid="profile-contact">{profile.contact}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Body Type:</span>
                      <span data-testid="profile-body-type">{profile.body_type}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Lifestyle:</span>
                      <span data-testid="profile-lifestyle">{profile.lifestyle}</span>
                    </div>
                    {profile.prakriti_type && (
                      <div className="info-item">
                        <span className="info-label">Prakriti Type:</span>
                        <span className={`badge badge-${profile.prakriti_type.toLowerCase()}`} data-testid="profile-prakriti">
                          {profile.prakriti_type}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="empty-state">Complete your profile to get personalized recommendations</p>
                )}
              </div>

              <div className="quick-actions">
                <div className="action-card card" onClick={() => navigate('/prakriti-analysis')} data-testid="action-prakriti">
                  <User size={32} color="#6b8e6f" />
                  <h3>Prakriti Analysis</h3>
                  <p>Discover your Ayurvedic body type</p>
                </div>
                <div className="action-card card" onClick={() => navigate('/diet-chart')} data-testid="action-diet">
                  <Calendar size={32} color="#6b8e6f" />
                  <h3>Diet Chart</h3>
                  <p>View personalized diet recommendations</p>
                </div>
                <div className="action-card card" onClick={() => navigate('/daily-schedule')} data-testid="action-schedule">
                  <Calendar size={32} color="#6b8e6f" />
                  <h3>Daily Schedule</h3>
                  <p>Follow your Dinacharya routine</p>
                </div>
              </div>
            </>
          ) : (
            <div className="profile-form card" data-testid="profile-form">
              <h2>Update Your Profile</h2>
              <form onSubmit={handleProfileSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Age *</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                      required
                      data-testid="input-age"
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      required
                      data-testid="input-gender"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    data-testid="input-contact"
                  />
                </div>

                <div className="form-group">
                  <label>Body Type</label>
                  <select
                    value={formData.body_type}
                    onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                    data-testid="input-body-type"
                  >
                    <option value="">Select</option>
                    <option value="Slim">Slim</option>
                    <option value="Medium">Medium</option>
                    <option value="Heavy">Heavy</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Lifestyle</label>
                  <select
                    value={formData.lifestyle}
                    onChange={(e) => setFormData({ ...formData, lifestyle: e.target.value })}
                    data-testid="input-lifestyle"
                  >
                    <option value="">Select</option>
                    <option value="Sedentary">Sedentary</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Active">Active</option>
                    <option value="Very Active">Very Active</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Health Concerns</label>
                  <div className="checkbox-group">
                    {['Stress', 'Sleep Issues', 'Digestion', 'Joint Pain', 'Skin Problems', 'Weight Management'].map(concern => (
                      <label key={concern} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.health_concerns.includes(concern)}
                          onChange={() => handleHealthConcernToggle(concern)}
                          data-testid={`checkbox-${concern.toLowerCase().replace(' ', '-')}`}
                        />
                        {concern}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowProfileForm(false)} data-testid="cancel-button">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" data-testid="save-profile-button">
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          background: #fdfbf7;
        }

        .sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid #e5e1d8;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          left: 0;
          top: 0;
        }

        .sidebar-header {
          padding: 32px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 600;
          color: #2c3e3a;
          border-bottom: 1px solid #e5e1d8;
        }

        .sidebar-nav {
          flex: 1;
          padding: 24px 0;
        }

        .nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 24px;
          background: none;
          border: none;
          color: #5a6b66;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .nav-item:hover {
          background: #f5f3ed;
          color: #6b8e6f;
        }

        .nav-item.active {
          background: #e8f4e8;
          color: #6b8e6f;
          border-right: 3px solid #6b8e6f;
        }

        .logout-btn {
          margin: 24px;
          padding: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #f5f3ed;
          border: none;
          border-radius: 8px;
          color: #5a6b66;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: #e5e1d8;
        }

        .dashboard-main {
          flex: 1;
          margin-left: 280px;
          padding: 40px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        .dashboard-header h1 {
          font-size: 36px;
          color: #2c3e3a;
          margin-bottom: 4px;
        }

        .dashboard-header p {
          color: #5a6b66;
          font-size: 16px;
        }

        .user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #6b8e6f;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #7ca982 0%, #6b8e6f 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: 600;
        }

        .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .card-header h2 {
          font-size: 24px;
          color: #2c3e3a;
        }

        .profile-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .info-label {
          font-size: 14px;
          color: #5a6b66;
          font-weight: 500;
        }

        .info-item > span:not(.info-label) {
          font-size: 16px;
          color: #2c3e3a;
          font-weight: 500;
        }

        .empty-state {
          text-align: center;
          color: #5a6b66;
          padding: 40px;
          font-size: 16px;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .action-card {
          cursor: pointer;
          text-align: center;
          padding: 32px;
          transition: all 0.3s ease;
        }

        .action-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }

        .action-card h3 {
          font-size: 20px;
          color: #2c3e3a;
          margin: 16px 0 8px;
        }

        .action-card p {
          font-size: 14px;
          color: #5a6b66;
        }

        .profile-form {
          max-width: 800px;
          margin: 0 auto;
        }

        .profile-form h2 {
          font-size: 28px;
          color: #2c3e3a;
          margin-bottom: 32px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #2c3e3a;
          font-weight: 500;
          font-size: 15px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
        }

        .checkbox-group {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 8px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: #2c3e3a;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
          margin-top: 32px;
        }

        @media (max-width: 968px) {
          .sidebar {
            display: none;
          }

          .dashboard-main {
            margin-left: 0;
            padding: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
