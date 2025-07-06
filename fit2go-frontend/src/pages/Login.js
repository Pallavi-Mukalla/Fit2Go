import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate(); // Use useNavigate instead of useHistory
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Login successful, redirect to the dashboard
      navigate('/dashboard');
    } else {
      // Display error message
      setError(data.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="form-card">
        <div className="form-header">
          <div className="logo-circle"></div>
          <span className="app-title">Fit2Go</span>
        </div>
        <h2 className="form-title">Log In</h2>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="form-button" onClick={handleLogin}>Log In</button>
        {error && <p className="error-message">{error}</p>}
        <p className="form-footer">
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
