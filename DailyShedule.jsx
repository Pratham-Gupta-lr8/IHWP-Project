import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DailySchedule() {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`${API}/daily-schedule`, { withCredentials: true });
      setSchedule(response.data);
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Please complete Prakriti analysis first');
        setTimeout(() => navigate('/prakriti-analysis'), 2000);
      } else {
        toast.error('Failed to load schedule');
      }
    } finally {
      setLoading(false);
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

  const getTimeIcon = (time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 18) {
      return <Sun size={24} color="#d97706" />;
    }
    return <Moon size={24} color="#2b7a9b" />;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your daily schedule...</p>
      </div>
    );
  }

  if (!schedule) {
    return null;
  }

  return (
    <div className="schedule-container" data-testid="daily-schedule">
      <div className="schedule-content">
        <button className="back-btn" onClick={() => navigate('/dashboard')} data-testid="back-button">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="schedule-header">
          <Clock size={48} color={getPrakritiColor(schedule.prakriti_type)} />
          <h1 data-testid="schedule-title">Your Daily Routine (Dinacharya)</h1>
          <span
            className={`badge badge-${schedule.prakriti_type.toLowerCase()}`}
            data-testid="prakriti-badge"
          >
            {schedule.prakriti_type} Constitution
          </span>
        </div>

        <div className="sleep-times card" data-testid="sleep-times">
          <div className="sleep-time">
            <Sun size={32} color="#d97706" />
            <div>
              <span className="label">Wake Time</span>
              <span className="time" data-testid="wake-time">{schedule.wake_time}</span>
            </div>
          </div>
          <div className="sleep-time">
            <Moon size={32} color="#2b7a9b" />
            <div>
              <span className="label">Sleep Time</span>
              <span className="time" data-testid="sleep-time">{schedule.sleep_time}</span>
            </div>
          </div>
        </div>

        <div className="activities-section">
          <h2>Daily Activities</h2>
          <div className="timeline" data-testid="activities-timeline">
            {schedule.activities.map((activity, index) => (
              <div key={index} className="timeline-item" data-testid={`activity-${index}`}>
                <div className="timeline-marker">
                  {getTimeIcon(activity.time)}
                </div>
                <div className="timeline-content card">
                  <span className="activity-time" data-testid={`activity-time-${index}`}>
                    {activity.time}
                  </span>
                  <p className="activity-desc" data-testid={`activity-desc-${index}`}>
                    {activity.activity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .schedule-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f3ed 0%, #e8e4d9 100%);
          padding: 40px 20px;
        }

        .schedule-content {
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

        .schedule-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .schedule-header h1 {
          font-size: 42px;
          color: #2c3e3a;
          margin: 16px 0;
        }

        .sleep-times {
          display: flex;
          justify-content: space-around;
          padding: 32px;
          margin-bottom: 48px;
        }

        .sleep-time {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .sleep-time .label {
          display: block;
          font-size: 14px;
          color: #5a6b66;
          margin-bottom: 4px;
        }

        .sleep-time .time {
          display: block;
          font-size: 24px;
          font-weight: 600;
          color: #2c3e3a;
        }

        .activities-section h2 {
          font-size: 32px;
          color: #2c3e3a;
          margin-bottom: 32px;
          text-align: center;
        }

        .timeline {
          position: relative;
          padding-left: 60px;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 20px;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #7ca982 0%, #6b8e6f 100%);
        }

        .timeline-item {
          position: relative;
          margin-bottom: 32px;
        }

        .timeline-marker {
          position: absolute;
          left: -52px;
          width: 44px;
          height: 44px;
          background: white;
          border: 3px solid #6b8e6f;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .timeline-content {
          padding: 20px;
        }

        .activity-time {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #6b8e6f;
          margin-bottom: 8px;
        }

        .activity-desc {
          font-size: 15px;
          color: #2c3e3a;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .schedule-header h1 {
            font-size: 32px;
          }

          .sleep-times {
            flex-direction: column;
            gap: 24px;
            align-items: flex-start;
          }

          .timeline {
            padding-left: 40px;
          }

          .timeline::before {
            left: 10px;
          }

          .timeline-marker {
            left: -30px;
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </div>
  );
}
