import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function FollowUps() {
  const navigate = useNavigate();
  const [followUps, setFollowUps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    notes: '',
    progress_rating: 3,
    feedback: ''
  });

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    try {
      const response = await axios.get(`${API}/follow-ups`, { withCredentials: true });
      setFollowUps(response.data);
    } catch (error) {
      toast.error('Failed to load follow-ups');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/follow-ups`, formData, { withCredentials: true });
      toast.success('Follow-up added successfully!');
      setShowForm(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        notes: '',
        progress_rating: 3,
        feedback: ''
      });
      fetchFollowUps();
    } catch (error) {
      toast.error('Failed to add follow-up');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#059669';
    if (rating >= 3) return '#d97706';
    return '#dc2626';
  };

  return (
    <div className="follow-ups-container" data-testid="follow-ups-page">
      <div className="follow-ups-content">
        <button className="back-btn" onClick={() => navigate('/dashboard')} data-testid="back-button">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="header-section">
          <div>
            <h1>Progress Follow-ups</h1>
            <p>Track your wellness journey</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)} data-testid="add-followup-button">
            <Plus size={20} />
            Add Follow-up
          </button>
        </div>

        {showForm && (
          <div className="follow-up-form card" data-testid="followup-form">
            <h2>New Follow-up Entry</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  data-testid="input-date"
                />
              </div>

              <div className="form-group">
                <label>Progress Rating (1-5)</label>
                <div className="rating-selector">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className={`rating-btn ${formData.progress_rating === rating ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, progress_rating: rating })}
                      data-testid={`rating-${rating}`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  placeholder="How are you feeling? Any changes in your routine?"
                  data-testid="input-notes"
                />
              </div>

              <div className="form-group">
                <label>Feedback</label>
                <textarea
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  rows="3"
                  placeholder="What's working well? What needs adjustment?"
                  data-testid="input-feedback"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} data-testid="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" data-testid="submit-button">
                  Save Follow-up
                </button>
              </div>
            </form>
          </div>
        )}

        {followUps.length === 0 && !showForm ? (
          <div className="empty-state card" data-testid="empty-state">
            <TrendingUp size={64} color="#d4cbb7" />
            <h3>No Follow-ups Yet</h3>
            <p>Start tracking your progress by adding your first follow-up entry</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Add Your First Follow-up
            </button>
          </div>
        ) : (
          <div className="follow-ups-list" data-testid="followups-list">
            {followUps.map((followUp, index) => (
              <div key={followUp.id} className="follow-up-card card" data-testid={`followup-${index}`}>
                <div className="card-header">
                  <div className="date-section">
                    <Calendar size={20} color="#6b8e6f" />
                    <span data-testid={`followup-date-${index}`}>{formatDate(followUp.date)}</span>
                  </div>
                  <div
                    className="rating-badge"
                    style={{ background: getRatingColor(followUp.progress_rating) }}
                    data-testid={`followup-rating-${index}`}
                  >
                    {followUp.progress_rating}/5
                  </div>
                </div>

                {followUp.notes && (
                  <div className="card-section">
                    <h4>Notes</h4>
                    <p data-testid={`followup-notes-${index}`}>{followUp.notes}</p>
                  </div>
                )}

                {followUp.feedback && (
                  <div className="card-section">
                    <h4>Feedback</h4>
                    <p data-testid={`followup-feedback-${index}`}>{followUp.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .follow-ups-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f3ed 0%, #e8e4d9 100%);
          padding: 40px 20px;
        }

        .follow-ups-content {
          max-width: 900px;
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

        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .header-section h1 {
          font-size: 42px;
          color: #2c3e3a;
          margin-bottom: 4px;
        }

        .header-section p {
          font-size: 16px;
          color: #5a6b66;
        }

        .header-section button {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .follow-up-form {
          margin-bottom: 32px;
        }

        .follow-up-form h2 {
          font-size: 24px;
          color: #2c3e3a;
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #2c3e3a;
          font-weight: 500;
          font-size: 15px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
        }

        .rating-selector {
          display: flex;
          gap: 12px;
        }

        .rating-btn {
          width: 50px;
          height: 50px;
          border: 2px solid #e5e1d8;
          background: white;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 600;
          color: #5a6b66;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rating-btn:hover {
          border-color: #6b8e6f;
        }

        .rating-btn.selected {
          background: #6b8e6f;
          border-color: #6b8e6f;
          color: white;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .empty-state {
          text-align: center;
          padding: 80px 40px;
        }

        .empty-state h3 {
          font-size: 28px;
          color: #2c3e3a;
          margin: 24px 0 12px;
        }

        .empty-state p {
          font-size: 16px;
          color: #5a6b66;
          margin-bottom: 32px;
        }

        .follow-ups-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .follow-up-card .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e1d8;
        }

        .date-section {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #2c3e3a;
        }

        .rating-badge {
          padding: 8px 16px;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        .card-section {
          margin-bottom: 16px;
        }

        .card-section:last-child {
          margin-bottom: 0;
        }

        .card-section h4 {
          font-size: 14px;
          color: #5a6b66;
          margin-bottom: 8px;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .card-section p {
          font-size: 15px;
          color: #2c3e3a;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .header-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }

          .header-section h1 {
            font-size: 32px;
          }

          .rating-selector {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}
