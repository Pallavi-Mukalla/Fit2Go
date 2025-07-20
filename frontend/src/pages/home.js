import React from 'react';
import '../App.css';
import { Link } from 'react-router-dom';

import Fit2GoLogo from '../Fit2Go.jpg'; // Import the image

const Header = () => {
  return (
    <header className="d-flex justify-content-between align-items-center p-3 bg-white shadow-sm">
      <div className="d-flex align-items-center">
        <img
          src={Fit2GoLogo}
          alt="Fit2Go Logo"
          className="me-2"
          style={{
            width: '48px', // Increased size for better visibility
            height: '48px',
            borderRadius: '50%', // Keep the circular shape
            objectFit: 'cover', // Prevent distortion by maintaining aspect ratio
            border: '2px solid #00C4B4', // Add a subtle border matching the button color
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
          }}
        />
        <span className="fs-4 fw-bold text-dark">Fit2Go</span>
      </div>
      <div>
        <Link to="/login">
          <button
            className="btn me-3"
            style={{
              backgroundColor: '#00C4B4',
              color: 'white',
            }}
          >
            Log In
          </button>
        </Link>
        <Link to="/signup">
          <button
            className="btn"
            style={{
              background: 'linear-gradient(to right, #00C4B4, #00A3E0)',
              color: 'white',
            }}
          >
            Sign Up
          </button>
        </Link>
      </div>
    </header>
  );
};


const Hero = () => {
  return (
    <section className="d-flex flex-column flex-md-row align-items-center justify-content-between p-4 bg-light">
      <div className="col-md-6">
        <h1 className="display-4 fw-bold text-dark mb-3">
          Your Personal Fitness <br />
          <span className="text-success">& Nutrition</span> Coach
        </h1>
        <p className="text-muted mb-4">
          Track workouts, plan meals, and achieve your fitness goals with AI-powered recommendations tailored just for you.
        </p>
        <div className="d-flex gap-3">
          <Link to="/signup">
            <button
              className="btn px-4 py-2"
              style={{
                backgroundColor: '#00C4B4',
                color: 'white',
              }}
            >
              Get Started Free
            </button>
          </Link>
          <button className="btn btn-link text-muted d-flex align-items-center">
            <span className="bg-success rounded-circle me-2" style={{ width: '16px', height: '16px' }}></span>
            Watch Demo
          </button>
        </div>
      </div>
      <div className="col-md-6 mt-4 mt-md-0">
  <div className="card p-4 shadow-lg rounded-3 bg-gradient">
    <h2 className="h5 fw-semibold text-white mb-3">FIT2GO DASHBOARD</h2>
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h3 className="text-muted">Your Progress</h3>
      <span className="text-muted">THIS WEEK</span>
    </div>

    <div className="bg-light rounded p-3 mb-3 position-relative" style={{ height: '220px' }}>
      <svg width="100%" height="100%" viewBox="0 0 300 150" className="p-2">
        {/* Y-Axis Labels */}
        <text x="-20" y="30" fontSize="10" fill="#6c757d" transform="translate(20, 0)">500</text>
        <text x="-20" y="60" fontSize="10" fill="#6c757d" transform="translate(20, 0)">400</text>
        <text x="-20" y="90" fontSize="10" fill="#6c757d" transform="translate(20, 0)">300</text>
        <text x="-20" y="120" fontSize="10" fill="#6c757d" transform="translate(20, 0)">200</text>

        {/* Grid Lines inside the axis */}
        <line x1="0" y1="30" x2="300" y2="30" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="5,5" />
        <line x1="0" y1="60" x2="300" y2="60" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="5,5" />
        <line x1="0" y1="90" x2="300" y2="90" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="5,5" />
        <line x1="0" y1="120" x2="300" y2="120" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="5,5" />

        {/* Data Lines */}
        <polyline points="30,120 50,80 100,100 150,60 200,90 250,50 300,70" fill="none" stroke="#A7F3D0" strokeWidth="2" />
        <polyline points="50,130 50,110 100,120 150,100 200,110 250,90 300,100" fill="none" stroke="#BAE6FD" strokeWidth="2" />

        {/* X-Axis Labels */}
        <text x="0" y="140" fontSize="10" fill="#6c757d">Mon</text>
        <text x="50" y="140" fontSize="10" fill="#6c757d">Tue</text>
        <text x="100" y="140" fontSize="10" fill="#6c757d">Wed</text>
        <text x="150" y="140" fontSize="10" fill="#6c757d">Thu</text>
        <text x="200" y="140" fontSize="10" fill="#6c757d">Fri</text>
        <text x="250" y="140" fontSize="10" fill="#6c757d">Sat</text>
        <text x="300" y="140" fontSize="10" fill="#6c757d">Sun</text>
      </svg>

      {/* Legend */}
      <div className="position-absolute top-0 start-0 p-2 d-flex gap-3">
        <div className="d-flex align-items-center">
          <span className="d-inline-block me-1" style={{ width: '12px', height: '12px', backgroundColor: '#A7F3D0' }}></span>
          <small className="text-muted">Calories Burned</small>
        </div>
        <div className="d-flex align-items-center">
          <span className="d-inline-block me-1" style={{ width: '12px', height: '12px', backgroundColor: '#BAE6FD' }}></span>
          <small className="text-muted">Protein (g)</small>
        </div>
      </div>
    </div>

    <div className="d-flex justify-content-between">
      <div className="text-center">
        <p className="fs-4 fw-bold text-dark">1,842</p>
        <p className="text-muted">CALORIES</p>
      </div>
      <div className="text-center">
        <p className="fs-4 fw-bold text-dark">4/5</p>
        <p className="text-muted">WORKOUTS</p>
      </div>
      <div className="text-center">
        <p className="fs-4 fw-bold text-dark">86g</p>
        <p className="text-muted">PROTEIN</p>
      </div>
    </div>
  </div>
</div>

    </section>
  );
};

const Features = () => {
  return (
    <section className="p-4 bg-white">
      <h2 className="text-center display-5 fw-bold text-dark mb-3">Everything You Need to Reach Your Goals</h2>
      <p className="text-center text-muted mb-5">
        Fit2Go combines workout tracking, nutrition planning, and AI recommendations in one seamless platform.
      </p>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        <div className="col">
          <div className="card h-100 p-3 bg-light text-center">
            <div className="display-1 mb-3">🧪</div>
            <h3 className="h5 fw-semibold text-dark mb-2">Workout Tracking</h3>
            <p className="text-muted">
              Log your exercises, sets, reps, and weights. Track your progress with interactive charts and see your improvements over time.
            </p>
          </div>
        </div>
        <div className="col">
          <div className="card h-100 p-3 bg-light text-center">
            <div className="display-1 mb-3">⚖</div>
            <h3 className="h5 fw-semibold text-dark mb-2">Nutrition Planning</h3>
            <p className="text-muted">
              Search for meals, get detailed nutritional information, and create balanced meal plans that align with your fitness goals.
            </p>
          </div>
        </div>
        <div className="col">
          <div className="card h-100 p-3 bg-light text-center">
            <div className="display-1 mb-3">✨</div>
            <h3 className="h5 fw-semibold text-dark mb-2">AI Recommendations</h3>
            <p className="text-muted">
              Receive personalized workout and meal recommendations based on your goals, preferences, and progress.
            </p>
          </div>
        </div>
        <div className="col">
          <div className="card h-100 p-3 bg-light text-center">
            <div className="display-1 mb-3">📊</div>
            <h3 className="h5 fw-semibold text-dark mb-2">Progress Visualization</h3>
            <p className="text-muted">
              Track your fitness journey with interactive charts and detailed statistics. See your improvements and stay motivated.
            </p>
          </div>
        </div>
        <div className="col">
          <div className="card h-100 p-3 bg-light text-center">
            <div className="display-1 mb-3">👥</div>
            <h3 className="h5 fw-semibold text-dark mb-2">Community Support</h3>
            <p className="text-muted">
              Connect with like-minded fitness enthusiasts, share your achievements, and get inspired by others’ journeys.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  return (
    <section className="py-5 bg-light text-center">
      <h2 className="display-5 fw-bold text-dark mb-3">How Fit2Go Works</h2>
      <p className="text-muted mb-5">Our intelligent platform adapts to your unique fitness journey</p>
      <div className="row justify-content-center">
        <div className="col-md-4 mb-4">
          <div className="card p-4 shadow-sm text-center">
            <div className="rounded-circle bg-primary bg-gradient text-white d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
              <span className="fs-4">1</span>
            </div>
            <h3 className="h5 fw-semibold text-dark mb-2">Set Your Goals</h3>
            <p className="text-muted">
              Tell us about your fitness goals, preferences, and dietary restrictions. We'll use this information to personalize your experience.
            </p>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card p-4 shadow-sm text-center">
            <div className="rounded-circle bg-success bg-gradient text-white d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
              <span className="fs-4">2</span>
            </div>
            <h3 className="h5 fw-semibold text-dark mb-2">Track Your Activity</h3>
            <p className="text-muted">
              Log your workouts and meals. Our system analyzes your data to understand your habits and progress.
            </p>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card p-4 shadow-sm text-center">
            <div className="rounded-circle bg-info bg-gradient text-white d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
              <span className="fs-4">3</span>
            </div>
            <h3 className="h5 fw-semibold text-dark mb-2">Get Smart Recommendations</h3>
            <p className="text-muted">
              Receive AI-powered workout and meal suggestions tailored to your goals, preferences, and progress.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const NutritionPlanning = () => {
  return (
    <section className="py-5 bg-white">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h2 className="display-5 fw-bold text-dark mb-3">Personalized Nutrition Planning</h2>
            <p className="text-muted mb-4">
              Find meals that match your goals and preferences. Get detailed nutritional information and add them to your daily plan with a single click.
            </p>
            <ul className="list-unstyled">
              <li className="text-success mb-2"><i className="bi bi-check-circle-fill me-2"></i>Search from thousands of recipes</li>
              <li className="text-success mb-2"><i className="bi bi-check-circle-fill me-2"></i>View detailed macro and micronutrient information</li>
              <li className="text-success mb-2"><i className="bi bi-check-circle-fill me-2"></i>Get meal recommendations based on your goals</li>
              <li className="text-success mb-2"><i className="bi bi-check-circle-fill me-2"></i>Track your daily calorie and nutrient intake</li>
            </ul>
          </div>
          <div className="col-md-6">
            <div className="card p-4 shadow-sm">
              <h3 className="h5 fw-semibold text-muted mb-3">Meal Recommendations</h3>
              <div className="row row-cols-2 g-3">
                <div className="col">
                  <div className="card bg-warning text-white p-3">
                    <div className="text-center mb-2"><i className="bi bi-book fs-2"></i></div>
                    <h4 className="h6">Grilled Chicken Bowl</h4>
                    <p className="mb-0">420 cal | 38g protein</p>
                    <button className="btn btn-success mt-2 w-100">Add to Plan</button>
                  </div>
                </div>
                <div className="col">
                  <div className="card bg-danger text-white p-3">
                    <div className="text-center mb-2"><i className="bi bi-book fs-2"></i></div>
                    <h4 className="h6">Salmon & Quinoa</h4>
                    <p className="mb-0">480 cal | 32g protein</p>
                    <button className="btn btn-success mt-2 w-100">Add to Plan</button>
                  </div>
                </div>
                <div className="col">
                  <div className="card bg-success text-white p-3">
                    <div className="text-center mb-2"><i className="bi bi-book fs-2"></i></div>
                    <h4 className="h6">Tofu Stir Fry</h4>
                    <p className="mb-0">380 cal | 24g protein</p>
                    <button className="btn btn-success mt-2 w-100">Add to Plan</button>
                  </div>
                </div>
                <div className="col">
                  <div className="card bg-info text-white p-3">
                    <div className="text-center mb-2"><i className="bi bi-book fs-2"></i></div>
                    <h4 className="h6">Greek Yogurt Bowl</h4>
                    <p className="mb-0">320 cal | 22g protein</p>
                    <button className="btn btn-success mt-2 w-100">Add to Plan</button>
                  </div>
                </div>
              </div>
              <small className="text-muted d-block mt-3">For Muscle Gain</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  return (
    <section className="py-5 bg-light text-center">
      <h2 className="display-5 fw-bold text-dark mb-3">What Our Users Say</h2>
      <p className="text-muted mb-5">Join thousands of satisfied users who have transformed their fitness journey with Fit2Go</p>
      <div className="row justify-content-center">
        <div className="col-md-4 mb-4">
          <div className="card p-4 shadow-sm">
            <div className="rounded-circle bg-primary bg-gradient text-white d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
              <span className="fs-5">J</span>
            </div>
            <h3 className="h6 fw-semibold text-dark mb-2">Jessica K.</h3>
            <p className="text-muted mb-2">Lost 15 lbs in 3 months</p>
            <p className="text-muted">"The AI recommendations are spot on! I love how Fit2Go suggests meals based on my workout history. It's like having a personal trainer and nutritionist in my pocket."</p>
            <div className="text-warning">
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card p-4 shadow-sm">
            <div className="rounded-circle bg-success bg-gradient text-white d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
              <span className="fs-5">M</span>
            </div>
            <h3 className="h6 fw-semibold text-dark mb-2">Michael T.</h3>
            <p className="text-muted mb-2">Gained 8 lbs of muscle</p>
            <p className="text-muted">"As someone who struggled with nutrition planning, Fit2Go has been a game-changer. The meal recommendations align perfectly with my strength training goals."</p>
            <div className="text-warning">
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card p-4 shadow-sm">
            <div className="rounded-circle bg-info bg-gradient text-white d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
              <span className="fs-5">S</span>
            </div>
            <h3 className="h6 fw-semibold text-dark mb-2">Sarah L.</h3>
            <p className="text-muted mb-2">Marathon runner</p>
            <p className="text-muted">"The progress tracking is incredible! Being able to see my improvements over time keeps me motivated. The nutrition recommendations are exactly what I needed."</p>
            <div className="text-warning">
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
              <i className="bi bi-star-fill"></i>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function Home() {
  return (
    <div>
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <NutritionPlanning />
      <Testimonials />
    </div>
  );
}

export default Home;