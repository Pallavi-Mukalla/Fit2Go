import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/dashboard';
import Fitness from './pages/Fitness';
import Nutrition from './pages/Nutrition';

const App = () => {
  return (
    <div>
    
      {/* Routing */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Fitness" element={<Fitness />} />
        <Route path="/Nutrition" element={<Nutrition />}/>
      </Routes>
    </div>
  );
};

export default App;
