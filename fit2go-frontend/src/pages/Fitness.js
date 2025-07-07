import React, { useState, useEffect } from 'react';

// CSS styles as a string
const styles = `
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #F0F7FF;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
  }
  header {
    background: linear-gradient(to right, #3B82F6, #8B5CF6);
    color: white;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  header h1 {
    font-size: 20px;
    font-weight: bold;
    margin: 0;
  }
  header .user {
    display: flex;
    align-items: center;
  }
  header .user span {
    font-size: 14px;
    margin-right: 8px;
  }
  header .user .avatar {
    width: 32px;
    height: 32px;
    background-color: #A855F7;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }
  .dashboard-title {
    font-size: 24px;
    font-weight: bold;
    color: #1F2937;
    margin-bottom: 24px;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  .stat-card {
    background-color: white;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .stat-card div h3 {
    font-size: 14px;
    color: #6B7280;
    margin: 0 0 4px 0;
  }
  .stat-card div p:first-of-type {
    font-size: 30px;
    font-weight: bold;
    color: #1F2937;
    margin: 0;
  }
  .stat-card div p:last-of-type {
    font-size: 12px;
    color: #10B981;
    margin: 4px 0 0 0;
  }
  .stat-card .icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .stat-card .icon svg {
    width: 24px;
    height: 24px;
  }
  .tabs {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
  }
  .tabs button {
    background: none;
    border: none;
    padding-bottom: 8px;
    font-size: 14px;
    font-weight: medium;
    color: #6B7280;
    cursor: pointer;
  }
  .tabs button.active {
    color: #3B82F6;
    border-bottom: 2px solid #3B82F6;
  }
  .section {
    background-color: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .section h3 {
    font-size: 18px;
    font-weight: bold;
    color: #1F2937;
    margin-bottom: 16px;
  }
  .progress-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
  }
  .progress-grid .section {
    padding: 24px;
  }
  .progress-grid .section .timeframe {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  .progress-grid .section .timeframe button {
    background: none;
    border: none;
    font-size: 14px;
    color: #6B7280;
    cursor: pointer;
  }
  .progress-grid .section .timeframe button.active {
    color: #3B82F6;
    font-weight: medium;
  }
  .goal-item {
    margin-bottom: 24px;
  }
  .goal-item p:first-of-type {
    font-size: 16px;
    font-weight: medium;
    color: #1F2937;
    margin: 0 0 4px 0;
  }
  .goal-item p:nth-of-type(2) {
    font-size: 14px;
    color: #6B7280;
    margin: 0 0 4px 0;
  }
  .goal-item p:nth-of-type(3) {
    font-size: 14px;
    color: #6B7280;
    margin: 0 0 4px 0;
  }
  .progress-bar {
    width: 100%;
    background-color: #E5E7EB;
    border-radius: 9999px;
    height: 10px;
    margin-top: 4px;
  }
  .progress-bar div {
    height: 100%;
    border-radius: 9999px;
  }
  .overall {
    text-align: center;
    margin-top: 16px;
  }
  .overall p:first-of-type {
    font-size: 30px;
    font-weight: bold;
    color: #9CA3AF;
    margin: 0;
  }
  .overall p:last-of-type {
    font-size: 14px;
    color: #6B7280;
    margin: 4px 0 0 0;
  }
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }
  .form-group label {
    display: block;
    font-size: 14px;
    color: #6B7280;
    margin-bottom: 4px;
  }
  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #D1D5DB;
    border-radius: 8px;
    font-size: 14px;
    color: #1F2937;
  }
  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
  .form-group textarea {
    resize: none;
    height: 80px;
  }
  .form-group input[readonly] {
    background-color: #F3F4F6;
  }
  button.primary {
    background-color: #3B82F6;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-weight: medium;
    cursor: pointer;
  }
  button.primary:hover {
    background-color: #2563EB;
  }
  button.cancel {
    background-color: #E5E7EB;
    color: #1F2937;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-weight: medium;
    cursor: pointer;
    margin-right: 8px;
  }
  button.cancel:hover {
    background-color: #D1D5DB;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th {
    text-align: left;
    font-size: 14px;
    color: #6B7280;
    padding-bottom: 8px;
  }
  tr {
    border-top: 1px solid #E5E7EB;
  }
  td {
    padding: 8px 0;
    font-size: 14px;
    color: #1F2937;
  }
  td .type-label {
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: medium;
  }
  button.action-edit {
    color: #3B82F6;
    background: none;
    border: none;
    font-size: 14px;
    margin-right: 8px;
    cursor: pointer;
  }
  button.action-delete {
    color: #EF4444;
    background: none;
    border: none;
    font-size: 14px;
    cursor: pointer;
  }
  .button-group {
    display: flex;
    gap: 8px;
  }
`;

// Inject styles into the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// Initial data
const initialWorkouts = [
  { id: 1, date: "2023-06-15", type: "Cardio", duration: 45, calories: 320 },
  { id: 2, date: "2023-06-13", type: "Strength", duration: 60, calories: 450 },
  { id: 3, date: "2023-06-11", type: "Yoga", duration: 30, calories: 150 },
  { id: 4, date: "2023-06-10", type: "HIIT", duration: 25, calories: 320 }
];

const initialGoals = [
  { id: 1, title: "Weekly Workouts", description: "Complete 5 workouts every week", progress: 4, target: 5, status: "In Progress" },
  { id: 2, title: "Weight Loss", description: "Lose 10kg by September 2023", progress: 3.5, target: 10, unit: "kg", status: "In Progress" },
  { id: 3, title: "Run Distance", description: "Run 20km this month", progress: 18, target: 20, unit: "km", status: "Almost Done" }
];

// Header Component

const Header = ({ user }) => {
  // Compute initials safely
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '?';

  return (
    <header>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <svg style={{ width: '24px', height: '24px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2-14H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2z"></path>
        </svg>
        <h1>FitTrack</h1>
      </div>
      <div className="user">
        {user ? (
          <>
            <span>Welcome, {user.name.split(' ')[0]}</span>
            <div className="avatar">{initials}</div>
          </>
        ) : (
          <>
            <span>Welcome</span>
            <div className="avatar">?</div>
          </>
        )}
      </div>
    </header>
  );
};


// Dashboard Stats Component
const DashboardStats = ({ workouts, goals }) => {
  const totalMinutes = workouts.reduce((sum, workout) => sum + workout.duration, 0);
  const totalCalories = workouts.reduce((sum, workout) => sum + workout.calories, 0);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div>
          <h3>Weekly Workouts</h3>
          <p>{workouts.length}</p>
          <p>+1 from last week</p>
        </div>
        <div className="icon" style={{ backgroundColor: '#DBEAFE' }}>
          <svg fill="none" stroke="#3B82F6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
      </div>
      <div className="stat-card">
        <div>
          <h3>Total Minutes</h3>
          <p>{totalMinutes}</p>
          <p>+25 from last week</p>
        </div>
        <div className="icon" style={{ backgroundColor: '#F3E8FF' }}>
          <svg fill="none" stroke="#8B5CF6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
      <div className="stat-card">
        <div>
          <h3>Calories Burned</h3>
          <p>{totalCalories.toLocaleString()}</p>
          <p>+180 from last week</p>
        </div>
        <div className="icon" style={{ backgroundColor: '#FFEDD5' }}>
          <svg fill="none" stroke="#F97316" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
      </div>
      <div className="stat-card">
        <div>
          <h3>Active Goals</h3>
          <p>{goals.length}</p>
          <p>{goals.filter(g => g.status === "In Progress").length} in progress</p>
        </div>
        <div className="icon" style={{ backgroundColor: '#DBEAFE' }}>
          <svg fill="none" stroke="#3B82F6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

// Progress Tracking Component
const ProgressTracking = ({ goals }) => (
  <div className="progress-grid">
    <div className="section">
      <h3>Workout Progress</h3>
      <div className="timeframe">
        <button className="active">Week</button>
        <button>Month</button>
        <button>Year</button>
      </div>
      <div>
        <p style={{ color: '#6B7280' }}>Graph placeholder: Workouts (blue) and Calories Burned (orange) over the week.</p>
      </div>
    </div>
    <div className="section">
      <h3>Goal Progress</h3>
      {goals.map(goal => (
        <div key={goal.id} className="goal-item">
          <p>{goal.title}</p>
          <p>{`${goal.progress}/${goal.target} ${goal.unit || ""}`}</p>
          <div className="progress-bar">
            <div
              style={{
                width: `${(goal.progress / goal.target) * 100}%`,
                backgroundColor: goal.id === 1 ? '#3B82F6' : goal.id === 2 ? '#10B981' : '#8B5CF6'
              }}
            ></div>
          </div>
        </div>
      ))}
      <div className="overall">
        <p>75%</p>
        <p>Overall</p>
      </div>
    </div>
  </div>
);

// Workout Logs Component
const WorkoutLogs = ({ workouts, setWorkouts }) => {
  const [newWorkout, setNewWorkout] = useState({ type: "Cardio", duration: 30, date: "2025-05-02" });
  const [editingWorkout, setEditingWorkout] = useState(null);

  const handleAddWorkout = () => {
    const calories = newWorkout.type === "Cardio" ? newWorkout.duration * 7 : 
                    newWorkout.type === "Strength" ? newWorkout.duration * 7.5 : 
                    newWorkout.type === "Yoga" ? newWorkout.duration * 5 : newWorkout.duration * 12;
    const workout = {
      id: editingWorkout ? editingWorkout.id : workouts.length + 1,
      date: newWorkout.date,
      type: newWorkout.type,
      duration: newWorkout.duration,
      calories: calories
    };

    if (editingWorkout) {
      // Update existing workout
      setWorkouts(workouts.map(w => (w.id === editingWorkout.id ? workout : w)));
      setEditingWorkout(null);
    } else {
      // Add new workout
      setWorkouts([workout, ...workouts]);
    }
    // Reset form
    setNewWorkout({ type: "Cardio", duration: 30, date: "2025-05-02" });
  };

  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout);
    setNewWorkout({
      type: workout.type,
      duration: workout.duration,
      date: workout.date
    });
  };

  const handleCancelEdit = () => {
    setEditingWorkout(null);
    setNewWorkout({ type: "Cardio", duration: 30, date: "2025-05-02" });
  };

  const handleDeleteWorkout = (id) => {
    setWorkouts(workouts.filter(workout => workout.id !== id));
  };

  return (
    <div>
      <div className="section" style={{ marginBottom: '16px' }}>
        <h3>{editingWorkout ? "Edit Workout" : "Add New"}</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Workout Type</label>
            <select
              value={newWorkout.type}
              onChange={(e) => setNewWorkout({ ...newWorkout, type: e.target.value })}
            >
              <option>Cardio</option>
              <option>Strength</option>
              <option>Yoga</option>
              <option>HIIT</option>
            </select>
          </div>
          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={newWorkout.duration}
              onChange={(e) => setNewWorkout({ ...newWorkout, duration: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={newWorkout.date}
              onChange={(e) => setNewWorkout({ ...newWorkout, date: e.target.value })}
            />
          </div>
        </div>
        <div className="button-group">
          {editingWorkout && (
            <button className="cancel" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
          <button className="primary" onClick={handleAddWorkout}>
            {editingWorkout ? "Save Changes" : "Add Workout"}
          </button>
        </div>
      </div>

      <div className="section">
        <h3>Recent Workouts</h3>
        <table>
          <thead>
            <tr>
              <th>DATE</th>
              <th>TYPE</th>
              <th>DURATION</th>
              <th>CALORIES</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {workouts.map(workout => (
              <tr key={workout.id}>
                <td>{workout.date}</td>
                <td>
                  <span
                    className="type-label"
                    style={{
                      backgroundColor: workout.type === "Cardio" ? '#DCFCE7' :
                                      workout.type === "Strength" ? '#F3E8FF' :
                                      workout.type === "Yoga" ? '#DBEAFE' : '#FEE2E2',
                      color: workout.type === "Cardio" ? '#16A34A' :
                             workout.type === "Strength" ? '#8B5CF6' :
                             workout.type === "Yoga" ? '#3B82F6' : '#EF4444'
                    }}
                  >
                    {workout.type}
                  </span>
                </td>
                <td>{workout.duration} min</td>
                <td>{workout.calories}</td>
                <td>
                  <button className="action-edit" onClick={() => handleEditWorkout(workout)}>
                    Edit
                  </button>
                  <button className="action-delete" onClick={() => handleDeleteWorkout(workout.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Goals Component
const Goals = ({ goals, setGoals }) => {
  const [newGoal, setNewGoal] = useState({ title: "", type: "Workout Count", target: "", unit: "times", date: "2025-06-02", description: "" });

  const handleAddGoal = () => {
    const goal = {
      id: goals.length + 1,
      title: newGoal.title,
      description: newGoal.description,
      progress: 0,
      target: parseFloat(newGoal.target),
      unit: newGoal.unit,
      status: "In Progress"
    };
    setGoals([...goals, goal]);
    setNewGoal({ title: "", type: "Workout Count", target: "", unit: "times", date: "2025-06-02", description: "" });
  };

  return (
    <div className="progress-grid">
      <div className="section">
        <h3>Current Goals</h3>
        {goals.map(goal => (
          <div key={goal.id} className="goal-item">
            <p>{goal.title}</p>
            <p>{goal.description}</p>
            <p>{goal.status}</p>
            <p>{`${goal.progress}/${goal.target} ${goal.unit || ""}`}</p>
            <div className="progress-bar">
              <div
                style={{
                  width: `${(goal.progress / goal.target) * 100}%`,
                  backgroundColor: goal.id === 1 ? '#3B82F6' : goal.id === 2 ? '#10B981' : '#8B5CF6'
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="section">
        <h3>Create New Goal</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Goal Title</label>
            <input
              type="text"
              placeholder="e.g., Run a 5K"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Goal Type</label>
            <select
              value={newGoal.type}
              onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value, unit: e.target.value === "Workout Count" ? "times" : e.target.value === "Weight Loss" ? "kg" : "km" })}
            >
              <option>Workout Count</option>
              <option>Weight Loss</option>
              <option>Run Distance</option>
            </select>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Target Value</label>
              <input
                type="number"
                placeholder="e.g., 5"
                value={newGoal.target}
                onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input
                type="text"
                value={newGoal.unit}
                readOnly
              />
            </div>
          </div>
          <div className="form-group">
            <label>Target Date</label>
            <input
              type="date"
              value={newGoal.date}
              onChange={(e) => setNewGoal({ ...newGoal, date: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              placeholder="Add details about your goal..."
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
            />
          </div>
          <button className="primary" onClick={handleAddGoal}>
            Create Goal
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const Fitness = () => {
  const [activeTab, setActiveTab] = useState("Progress Tracking");
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [goals, setGoals] = useState(initialGoals);
  const [user, setUser] = useState(null);

  useEffect(() => {
  async function fetchProfile() {
    const token = localStorage.getItem('token'); // Make sure you store the token at login
    if (!token) return;

    const res = await fetch('http://localhost:5000/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      console.log('Profile data:', data);
      setUser(data);
    } else {
      console.error('Failed to fetch profile');
    }
  }

  fetchProfile();
}, []);


  return (
    <div>
      <Header user={user} />

      <div className="container">
        <h2 className="dashboard-title">Your Fitness Dashboard</h2>
        <DashboardStats workouts={workouts} goals={goals} />
        <div className="tabs">
          {["Progress Tracking", "Workout Logs", "Goals"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? "active" : ""}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab === "Progress Tracking" && <ProgressTracking goals={goals} />}
        {activeTab === "Workout Logs" && <WorkoutLogs workouts={workouts} setWorkouts={setWorkouts} />}
        {activeTab === "Goals" && <Goals goals={goals} setGoals={setGoals} />}
      </div>
    </div>
  );
};

export default Fitness;