import { useEffect, useState } from 'react';
import { Leaf, Heart, Sun, Moon } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${API}/auth/me`, { withCredentials: true });
        setIsAuthenticated(true);
        window.location.href = '/dashboard';
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="container">
          <div className="logo">
            <Leaf size={32} color="#6b8e6f" />
            <span>Wellness Rhythm</span>
          </div>
          <button data-testid="login-button" className="btn-secondary" onClick={handleLogin}>
            Sign In
          </button>
        </div>
      </header>

      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 data-testid="hero-title">Discover Your Ayurvedic Path to Wellness</h1>
            <p data-testid="hero-description">
              Experience personalized health guidance based on ancient Ayurvedic wisdom.
              Understand your unique body constitution and receive tailored recommendations
              for diet, lifestyle, and daily routines.
            </p>
            <button data-testid="get-started-button" className="btn-primary" onClick={handleLogin}>
              Get Started
            </button>
          </div>
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHx5b2dhJTIwbWVkaXRhdGlvbnxlbnwwfHx8fDE3NjI1Nzg1Mjh8MA&ixlib=rb-4.1.0&q=85"
              alt="Meditation"
            />
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2>Your Journey to Balance</h2>
          <div className="features-grid">
            <div className="feature-card" data-testid="feature-profile">
              <div className="feature-icon">
                <Heart size={40} color="#6b8e6f" />
              </div>
              <h3>Personal Profile</h3>
              <p>Create your wellness profile with health information and lifestyle details</p>
            </div>

            <div className="feature-card" data-testid="feature-prakriti">
              <div className="feature-icon">
                <Leaf size={40} color="#6b8e6f" />
              </div>
              <h3>Prakriti Analysis</h3>
              <p>Discover your unique Ayurvedic constitution through AI-powered analysis</p>
            </div>

            <div className="feature-card" data-testid="feature-diet">
              <div className="feature-icon">
                <Sun size={40} color="#6b8e6f" />
              </div>
              <h3>Diet & Schedule</h3>
              <p>Get personalized diet charts and daily routines for optimal health</p>
            </div>

            <div className="feature-card" data-testid="feature-followup">
              <div className="feature-icon">
                <Moon size={40} color="#6b8e6f" />
              </div>
              <h3>Track Progress</h3>
              <p>Regular follow-ups and progress tracking to maintain your wellness journey</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Begin Your Wellness Journey Today</h2>
          <p>Join thousands discovering balance through Ayurveda</p>
          <button data-testid="cta-button" className="btn-primary" onClick={handleLogin}>
            Start Free Assessment
          </button>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2025 Wellness Rhythm. Embrace natural healing.</p>
        </div>
      </footer>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #fdfbf7 0%, #f5f3ed 100%);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .landing-header {
          padding: 24px 0;
          border-bottom: 1px solid #e5e1d8;
        }

        .landing-header .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          color: #2c3e3a;
        }

        .hero-section {
          padding: 80px 0;
        }

        .hero-section .container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .hero-content h1 {
          font-size: 56px;
          line-height: 1.1;
          color: #2c3e3a;
          margin-bottom: 24px;
        }

        .hero-content p {
          font-size: 18px;
          line-height: 1.7;
          color: #5a6b66;
          margin-bottom: 32px;
        }

        .hero-image img {
          width: 100%;
          height: 500px;
          object-fit: cover;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .features-section {
          padding: 80px 0;
          background: white;
        }

        .features-section h2 {
          text-align: center;
          font-size: 42px;
          color: #2c3e3a;
          margin-bottom: 60px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 32px;
        }

        .feature-card {
          text-align: center;
          padding: 40px 24px;
          background: #fdfbf7;
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(108, 142, 111, 0.15);
        }

        .feature-card h3 {
          font-size: 24px;
          color: #2c3e3a;
          margin-bottom: 12px;
        }

        .feature-card p {
          font-size: 15px;
          color: #5a6b66;
          line-height: 1.6;
        }

        .cta-section {
          padding: 100px 0;
          text-align: center;
          background: linear-gradient(135deg, #e8f4e8 0%, #d4e9d4 100%);
        }

        .cta-section h2 {
          font-size: 42px;
          color: #2c3e3a;
          margin-bottom: 16px;
        }

        .cta-section p {
          font-size: 18px;
          color: #5a6b66;
          margin-bottom: 32px;
        }

        .landing-footer {
          padding: 40px 0;
          text-align: center;
          background: #2c3e3a;
          color: #d4cbb7;
        }

        @media (max-width: 968px) {
          .hero-section .container {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .hero-content h1 {
            font-size: 42px;
          }

          .hero-image img {
            height: 400px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .hero-content h1 {
            font-size: 36px;
          }

          .features-section h2,
          .cta-section h2 {
            font-size: 32px;
          }
        }
      `}</style>
    </div>
  );
}
