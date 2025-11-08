import { useEffect, useState } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import PrakritiAnalysis from './components/PrakritiAnalysis';
import DietChart from './components/DietChart';
import DailySchedule from './components/DailySchedule';
import FollowUps from './components/FollowUps';
import AdminPanel from './components/AdminPanel';
import { Toaster } from './components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

function AuthHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const sessionId = params.get('session_id');

      if (sessionId) {
        try {
          const response = await axios.get(`${API}/auth/session?session_id=${sessionId}`);
          if (response.data.success) {
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Auth error:', error);
          setLoading(false);
        }
      } else {
        try {
          await axios.get(`${API}/auth/me`);
          if (location.pathname === '/') {
            navigate('/dashboard');
          } else {
            setLoading(false);
          }
        } catch (error) {
          setLoading(false);
        }
      }
    };

    handleAuth();
  }, [navigate, location]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return null;
}

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${API}/auth/me`);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" />;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthHandler />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prakriti-analysis"
            element={
              <ProtectedRoute>
                <PrakritiAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diet-chart"
            element={
              <ProtectedRoute>
                <DietChart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daily-schedule"
            element={
              <ProtectedRoute>
                <DailySchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/follow-ups"
            element={
              <ProtectedRoute>
                <FollowUps />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;