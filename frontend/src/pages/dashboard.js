import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // We'll style it separately

const Dashboard = () => {
  const navigate = useNavigate();

  const handleExploreFitness = () => {
    navigate('/Fitness'); // Navigate to the FitnessApp component
  };
  const handleExploreNutrition = () => {
    navigate('/Nutrition'); // Navigate to the FitnessApp component
  };

  return (
    <div className="dashboard-container">
      <div className="overlay">
        <div className="content">
          {/* Fitness Card */}
          <div className="card-container">
            <div className="glass-card">
              <div className="card-body">
                <h3 className="card-title text-primary">Fitness</h3>
                <p className="card-text text-muted">
                  Monitor workouts, plan exercises, and achieve fitness goals with our smart tracking system.
                </p>
                <button className="custom-button" onClick={handleExploreFitness}>
                  Explore Fitness
                </button>
              </div>
            </div>
          </div>

          {/* Nutrition Card */}
          <div className="card-container">
            <div className="glass-card">
              <div className="card-body">
                <h3 className="card-title text-primary">Nutrition</h3>
                <p className="card-text text-muted">
                  Track your daily intake, calories, and macros with ease. Get personalized meal suggestions.
                </p>
                <button className="custom-button"onClick={handleExploreNutrition}>Explore Nutrition</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;