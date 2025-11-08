import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PrakritiAnalysis() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchQuestions();
    fetchProfile();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API}/prakriti/questions`, { withCredentials: true });
      setQuestions(response.data);
    } catch (error) {
      toast.error('Failed to load questions');
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/profile`, { withCredentials: true });
      setProfile(response.data);
      if (response.data.prakriti_analysis) {
        setResult(response.data.prakriti_analysis);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleAnswer = (questionIndex, answer) => {
    setAnswers({ ...answers, [questionIndex]: answer });
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error('Please answer all questions');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/prakriti/analyze`,
        { answers },
        { withCredentials: true }
      );
      setResult(response.data);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze results');
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

  if (result) {
    return (
      <div className="prakriti-result-container" data-testid="prakriti-result">
        <div className="result-content">
          <button className="back-btn" onClick={() => navigate('/dashboard')} data-testid="back-button">
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="result-header">
            <Sparkles size={48} color={getPrakritiColor(result.prakriti_type)} />
            <h1 data-testid="prakriti-type">Your Prakriti: {result.prakriti_type}</h1>
          </div>

          <div className="scores-grid">
            {Object.entries(result.scores).map(([dosha, score]) => (
              <div key={dosha} className="score-card" data-testid={`score-${dosha.toLowerCase()}`}>
                <h3>{dosha}</h3>
                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{
                      width: `${(score / 10) * 100}%`,
                      background: getPrakritiColor(dosha)
                    }}
                  />
                </div>
                <span className="score-value">{score}/10</span>
              </div>
            ))}
          </div>

          <div className="ai-insights card" data-testid="ai-insights">
            <h2>Personalized Insights</h2>
            <p>{result.ai_insights}</p>
          </div>

          <div className="next-steps">
            <button className="btn-primary" onClick={() => navigate('/diet-chart')} data-testid="view-diet-button">
              View Your Diet Chart
            </button>
            <button className="btn-secondary" onClick={() => navigate('/daily-schedule')} data-testid="view-schedule-button">
              View Daily Schedule
            </button>
          </div>
        </div>

        <style jsx>{`
          .prakriti-result-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #f5f3ed 0%, #e8e4d9 100%);
            padding: 40px 20px;
          }

          .result-content {
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

          .result-header {
            text-align: center;
            margin-bottom: 48px;
          }

          .result-header h1 {
            font-size: 42px;
            color: #2c3e3a;
            margin-top: 16px;
          }

          .scores-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            margin-bottom: 40px;
          }

          .score-card {
            background: white;
            padding: 24px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }

          .score-card h3 {
            font-size: 20px;
            color: #2c3e3a;
            margin-bottom: 16px;
          }

          .score-bar {
            height: 12px;
            background: #e5e1d8;
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 8px;
          }

          .score-fill {
            height: 100%;
            border-radius: 6px;
            transition: width 0.5s ease;
          }

          .score-value {
            font-size: 16px;
            font-weight: 600;
            color: #5a6b66;
          }

          .ai-insights {
            margin-bottom: 40px;
          }

          .ai-insights h2 {
            font-size: 28px;
            color: #2c3e3a;
            margin-bottom: 20px;
          }

          .ai-insights p {
            font-size: 17px;
            line-height: 1.8;
            color: #2c3e3a;
          }

          .next-steps {
            display: flex;
            gap: 16px;
            justify-content: center;
          }

          @media (max-width: 768px) {
            .scores-grid {
              grid-template-columns: 1fr;
            }

            .next-steps {
              flex-direction: column;
            }

            .result-header h1 {
              font-size: 32px;
            }
          }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-screen" data-testid="loading-analysis">
        <Loader2 size={48} className="spinner" color="#6b8e6f" />
        <p>Analyzing your responses...</p>
      </div>
    );
  }

  return (
    <div className="prakriti-analysis-container" data-testid="prakriti-questionnaire">
      <div className="analysis-content">
        <button className="back-btn" onClick={() => navigate('/dashboard')} data-testid="back-button">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="header-section">
          <h1>Discover Your Prakriti</h1>
          <p>Answer these questions to understand your Ayurvedic body constitution</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              data-testid="progress-bar"
            />
          </div>
          <span className="progress-text" data-testid="progress-text">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>

        {questions.length > 0 && (
          <div className="question-card card" data-testid="question-card">
            <h2 data-testid="question-text">{questions[currentQuestion].question}</h2>
            <div className="options-grid">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${answers[currentQuestion] === option ? 'selected' : ''}`}
                  onClick={() => handleAnswer(currentQuestion, option)}
                  data-testid={`option-${index}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="navigation-buttons">
          {currentQuestion > 0 && (
            <button
              className="btn-secondary"
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              data-testid="previous-button"
            >
              Previous
            </button>
          )}
          {currentQuestion === questions.length - 1 && Object.keys(answers).length === questions.length && (
            <button className="btn-primary" onClick={handleSubmit} data-testid="submit-button">
              Analyze Results
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .prakriti-analysis-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f3ed 0%, #e8e4d9 100%);
          padding: 40px 20px;
        }

        .analysis-content {
          max-width: 800px;
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
          text-align: center;
          margin-bottom: 48px;
        }

        .header-section h1 {
          font-size: 42px;
          color: #2c3e3a;
          margin-bottom: 12px;
        }

        .header-section p {
          font-size: 17px;
          color: #5a6b66;
          margin-bottom: 32px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e5e1d8;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #7ca982 0%, #6b8e6f 100%);
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 14px;
          color: #5a6b66;
          font-weight: 500;
        }

        .question-card {
          margin-bottom: 32px;
        }

        .question-card h2 {
          font-size: 24px;
          color: #2c3e3a;
          margin-bottom: 32px;
          text-align: center;
        }

        .options-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .option-btn {
          width: 100%;
          padding: 20px;
          background: white;
          border: 2px solid #e5e1d8;
          border-radius: 12px;
          font-size: 16px;
          color: #2c3e3a;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .option-btn:hover {
          border-color: #6b8e6f;
          background: #f5f3ed;
        }

        .option-btn.selected {
          background: #e8f4e8;
          border-color: #6b8e6f;
          font-weight: 500;
        }

        .navigation-buttons {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        @media (max-width: 640px) {
          .header-section h1 {
            font-size: 32px;
          }
        }
      `}</style>
    </div>
  );
}
