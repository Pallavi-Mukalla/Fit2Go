import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/signup', {
        name,
        email,
        password,
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/login');
      }
    } catch (error) {
      console.error(error);
      alert('Error during signup!');
    }
  };

  return (
    <div className="custom-container">
      <div className="custom-card">
        <div className="custom-header">
          <div className="logo-row">
            <div className="logo-circle"></div>
            <span className="brand-name">Fit2Go</span>
          </div>
          <h2 className="form-heading">Sign Up</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="submit-button" type="submit">
            Sign Up
          </button>
        </form>
        <p className="redirect-text">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
