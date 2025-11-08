import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Leaf, Clock, Sun } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DietChart() {
  const navigate = useNavigate();
  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDietPlan();
  }, []);

  const fetchDietPlan = async () => {
    try {
      const response = await axios.get(`${API}/diet-plan`, { withCredentials: true });
      setDietPlan(response.data);
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Please complete Prakriti analysis first');
        setTimeout(() => navigate('/prakriti-analysis'), 2000);
      } else {
        toast.error('Failed to load diet plan');
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

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your diet plan...</p>
      </div>
    );
  }

  if (!dietPlan) {
    return null;
  }

  return (
    <div className="diet-chart-container" data-testid="diet-chart">
      <div className="diet-content">
        <button className="back-btn" onClick={() => navigate('/dashboard')} data-testid="back-button">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="diet-header">
          <Leaf size={48} color={getPrakritiColor(dietPlan.prakriti_type)} />
          <h1 data-testid="diet-title">Your Personalized Diet Chart</h1>
          <span
            className={`badge badge-${dietPlan.prakriti_type.toLowerCase()}`}
            data-testid="prakriti-badge"
          >
            {dietPlan.prakriti_type} Constitution
          </span>
        </div>

        <div className="diet-sections">
          <div className="diet-section card" data-testid="recommended-foods">
            <div className="section-header">
              <Leaf size={32} color="#059669" />
              <h2>Recommended Foods</h2>
            </div>
            <p className="section-desc">Foods that balance your {dietPlan.prakriti_type} dosha</p>
            <ul className="food-list">
              {dietPlan.recommended_foods.map((food, index) => (
                <li key={index} data-testid={`recommended-${index}`}>
                  {food}
                </li>
              ))}
            </ul>
          </div>

          <div className="diet-section card" data-testid="avoid-foods">
            <div className="section-header">
              <Leaf size={32} color="#dc2626" />
              <h2>Foods to Avoid</h2>
            </div>
            <p className="section-desc">Foods that may aggravate your {dietPlan.prakriti_type} dosha</p>
            <ul className="food-list avoid">
              {dietPlan.avoid_foods.map((food, index) => (
                <li key={index} data-testid={`avoid-${index}`}>
                  {food}
                </li>
              ))}
            </ul>
          </div>

          <div className="diet-section card" data-testid="meal-timings">
            <div className="section-header">
              <Clock size={32} color="#d97706" />
              <h2>Meal Timings</h2>
            </div>
            <p className="section-desc">Optimal times for your meals</p>
            <div className="timing-grid">
              {Object.entries(dietPlan.meal_timings).map(([meal, time]) => (
                <div key={meal} className="timing-card" data-testid={`timing-${meal}`}>
                  <span className="meal-name">{meal.charAt(0).toUpperCase() + meal.slice(1)}</span>
                  <span className="meal-time">{time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="diet-section card" data-testid="seasonal-tips">
            <div className="section-header">
              <Sun size={32} color="#2b7a9b" />
              <h2>Seasonal Tips</h2>
            </div>
            <p className="section-desc">Additional guidance for seasonal wellness</p>
            <ul className="tips-list">
              {dietPlan.seasonal_tips.map((tip, index) => (
                <li key={index} data-testid={`tip-${index}`}>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .diet-chart-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f3ed 0%, #e8e4d9 100%);
          padding: 40px 20px;
        }

        .diet-content {
          max-width: 1000px;
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

        .diet-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .diet-header h1 {
          font-size: 42px;
          color: #2c3e3a;
          margin: 16px 0;
        }

        .diet-sections {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .diet-section {
          padding: 32px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 12px;
        }

        .section-header h2 {
          font-size: 28px;
          color: #2c3e3a;
        }

        .section-desc {
          font-size: 16px;
          color: #5a6b66;
          margin-bottom: 24px;
        }

        .food-list {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .food-list li {
          padding: 12px 16px;
          background: #e8f4e8;
          border-left: 4px solid #059669;
          border-radius: 8px;
          color: #2c3e3a;
          font-size: 15px;
        }

        .food-list.avoid li {
          background: #fee2e2;
          border-left-color: #dc2626;
        }

        .timing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .timing-card {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 20px;
          background: linear-gradient(135deg, #fff4e6 0%, #ffe4c4 100%);
          border-radius: 12px;
          border: 2px solid #d97706;
        }

        .meal-name {
          font-size: 16px;
          font-weight: 600;
          color: #2c3e3a;
        }

        .meal-time {
          font-size: 18px;
          color: #d97706;
          font-weight: 500;
        }

        .tips-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tips-list li {
          padding: 16px;
          background: #e8f4f8;
          border-left: 4px solid #2b7a9b;
          border-radius: 8px;
          color: #2c3e3a;
          font-size: 15px;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .diet-header h1 {
            font-size: 32px;
          }

          .section-header h2 {
            font-size: 24px;
          }

          .food-list,
          .timing-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
