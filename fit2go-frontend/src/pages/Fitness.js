import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import Chatbot from '../components/Chatbot';
import GoalCard from '../components/GoalCard';
import GoalProgressRing from '../components/GoalProgressRing';
import WorkoutPlanCard from '../components/WorkoutPlanCard';

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

  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  const handleProfileClick = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <header>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <svg style={{ width: '24px', height: '24px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2-14H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2z"></path>
        </svg>
        <h1>FitTrack</h1>
      </div>
      <div className="user" style={{ position: 'relative', cursor: 'pointer' }} onClick={handleProfileClick}>
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
        {showDropdown && (
          <div style={{ position: 'absolute', top: '100%', right: 0, background: 'white', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 10, minWidth: '120px', padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            <span
              style={{
                padding: '10px 20px',
                cursor: 'pointer',
                color: '#333',
                fontWeight: 500,
                borderRadius: '4px',
                transition: 'background 0.2s',
                textAlign: 'left',
              }}
              onClick={e => { e.stopPropagation(); handleLogout(); }}
              onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'}
              onMouseOut={e => e.currentTarget.style.background = 'white'}
            >
              Logout
            </span>
          </div>
        )}
      </div>
    </header>
  );
};


// Dashboard Stats Component
function getStartOfWeek(date, offset = 0) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay() + 1 + offset * 7); // Monday
  d.setHours(0, 0, 0, 0);
  return d;
}
function isInWeek(dateStr, weekStart) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d >= weekStart && d < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
}
const DashboardStats = ({ workouts, goals }) => {
  const now = new Date();
  const thisWeekStart = getStartOfWeek(now, 0);
  const lastWeekStart = getStartOfWeek(now, -1);
  const thisWeekWorkouts = workouts.filter(w => isInWeek(w.date, thisWeekStart));
  const lastWeekWorkouts = workouts.filter(w => isInWeek(w.date, lastWeekStart));
  const totalMinutes = thisWeekWorkouts.reduce((sum, workout) => sum + (typeof workout.duration === 'number' ? workout.duration : 0), 0);
  const lastWeekMinutes = lastWeekWorkouts.reduce((sum, workout) => sum + (typeof workout.duration === 'number' ? workout.duration : 0), 0);
  const totalCalories = thisWeekWorkouts.reduce((sum, workout) => sum + (typeof workout.calories === 'number' ? workout.calories : 0), 0);
  const lastWeekCalories = lastWeekWorkouts.reduce((sum, workout) => sum + (typeof workout.calories === 'number' ? workout.calories : 0), 0);
  const activeGoals = goals.filter(g => !g.achieved);
  const completedGoals = goals.filter(g => g.achieved);
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div>
          <h3>Weekly Workouts</h3>
          <p>{thisWeekWorkouts.length}</p>
          <p>{(thisWeekWorkouts.length - lastWeekWorkouts.length) >= 0 ? '+' : ''}{thisWeekWorkouts.length - lastWeekWorkouts.length} from last week</p>
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
          <p>{(totalMinutes - lastWeekMinutes) >= 0 ? '+' : ''}{totalMinutes - lastWeekMinutes} from last week</p>
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
          <p>{(totalCalories - lastWeekCalories) >= 0 ? '+' : ''}{totalCalories - lastWeekCalories} from last week</p>
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
          <p>{activeGoals.length}</p>
          <p>{activeGoals.length} in progress</p>
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

const COLORS = ['#3B82F6', '#10B981', '#F59E42', '#8B5CF6', '#F97316', '#EF4444'];

function getWeekData(workouts) {
  // Group workouts by day of week (Mon-Sun)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
  const data = days.map((day, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayWorkouts = workouts.filter(w => w.date === dateStr);
    return {
      day,
      workouts: dayWorkouts.length,
      calories: dayWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0)
    };
  });
  return data;
}

const ProgressTracking = ({ goals, workouts }) => {
  const weekData = getWeekData(workouts);
  const goalPieData = goals.map((g, i) => ({
    name: g.type + ' (' + g.unit + ')',
    value: Math.min(100, (g.progress || 0) / (g.target || 1) * 100),
    color: COLORS[i % COLORS.length]
  }));

  return (
    <div className="progress-grid">
      <div className="section">
        <h3>Workouts This Week</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weekData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <XAxis dataKey="day" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip />
            <Bar dataKey="workouts" fill="#3B82F6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="section">
        <h3>Calories Burned This Week</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weekData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <XAxis dataKey="day" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip />
            <Line type="monotone" dataKey="calories" stroke="#F97316" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="section">
        <h3>Goal Progress</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={goalPieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, value }) => `${name}: ${Math.round(value)}%`}
            >
              {goalPieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Workout Logs Component
const WorkoutLogs = ({ workouts, setWorkouts, fetchGoals }) => {
  const [newWorkout, setNewWorkout] = useState({ type: "Cardio", duration: 30, date: "2025-05-02" });
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const token = localStorage.getItem('token');

  // Toast floating at top center
  const Toast = ({ msg, type }) => (
    <div style={{
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: type === 'error' ? '#fee2e2' : '#d1fae5',
      color: type === 'error' ? '#b91c1c' : '#065f46',
      padding: '12px 32px',
      borderRadius: 12,
      fontWeight: 600,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>{msg}</div>
  );

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleAddWorkout = async () => {
    if (!newWorkout.type || !newWorkout.duration || !newWorkout.date) {
      showToast('Please fill all fields', 'error');
      return;
    }
    setLoading(true);
    const calories = newWorkout.type === "Cardio" ? newWorkout.duration * 7 :
      newWorkout.type === "Strength" ? newWorkout.duration * 7.5 :
        newWorkout.type === "Yoga" ? newWorkout.duration * 5 : newWorkout.duration * 12;
    const workoutData = {
      title: `${newWorkout.type} on ${newWorkout.date}`,
      date: newWorkout.date,
      type: newWorkout.type,
      duration: newWorkout.duration,
      calories: calories
    };
    try {
      if (editingWorkout) {
        const res = await fetch(`http://localhost:5000/api/workouts/${editingWorkout._id || editingWorkout.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(workoutData)
        });
        if (res.ok) {
          const updated = await res.json();
          setWorkouts(workouts.map(w => (w._id === updated.workout._id ? updated.workout : w)));
          setEditingWorkout(null);
          showToast('Workout updated!');
          if (fetchGoals) await fetchGoals();
        } else {
          showToast('Error updating workout', 'error');
        }
      } else {
        const res = await fetch('http://localhost:5000/api/workouts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(workoutData)
        });
        if (res.ok) {
          const data = await res.json();
          setWorkouts([data.workout, ...workouts]);
          showToast('Workout added!');
          if (fetchGoals) await fetchGoals();
        } else {
          showToast('Error adding workout', 'error');
        }
      }
    } catch (err) {
      showToast('Error saving workout', 'error');
    }
    setNewWorkout({ type: "Cardio", duration: 30, date: "2025-05-02" });
    setLoading(false);
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

  const handleDeleteWorkout = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/workouts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setWorkouts(workouts.filter(workout => (workout._id || workout.id) !== id));
        showToast('Workout deleted!');
      } else {
        showToast('Error deleting workout', 'error');
      }
    } catch (err) {
      showToast('Error deleting workout', 'error');
    }
    setLoading(false);
  };

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div className="section" style={{ marginBottom: '16px' }}>
        <h3>{editingWorkout ? "Edit Workout" : "Add New"}</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Workout Type</label>
            <select
              value={newWorkout.type}
              onChange={(e) => setNewWorkout({ ...newWorkout, type: e.target.value })}
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={newWorkout.date}
              onChange={(e) => setNewWorkout({ ...newWorkout, date: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>
        <div className="button-group">
          {editingWorkout && (
            <button className="cancel" onClick={handleCancelEdit} disabled={loading}>
              Cancel
            </button>
          )}
          <button className="primary" onClick={handleAddWorkout} disabled={loading}>
            {editingWorkout ? "Save Changes" : "Add Workout"}
          </button>
        </div>
      </div>

      <div className="section">
        <h3>Recent Workouts</h3>
        {loading && <div>Loading...</div>}
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
              <tr key={workout._id || workout.id}>
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
                <td>{typeof workout.calories === 'number' ? workout.calories : ''}</td>
                <td>
                  <button className="action-edit" onClick={() => handleEditWorkout(workout)} disabled={loading}>
                    Edit
                  </button>
                  <button className="action-delete" onClick={() => handleDeleteWorkout(workout._id || workout.id)} disabled={loading}>
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
  const [newGoal, setNewGoal] = useState({ type: "fitness", target: "", unit: "workouts", deadline: "2025-06-02", description: "" });
  const [editingGoal, setEditingGoal] = useState(null);
  const [progressInput, setProgressInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const token = localStorage.getItem('token');

  // Map goal type to allowed units
  const unitOptions = {
    weightLoss: ["kg", "lbs"],
    muscleGain: ["kg", "lbs"],
    fitness: ["workouts", "minutes", "km"],
    nutrition: ["calories", "protein (g)", "carbs (g)", "fat (g)"]
  };

  // Toast floating at top center
  const Toast = ({ msg, type }) => (
    <div style={{
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: type === 'error' ? '#fee2e2' : '#d1fae5',
      color: type === 'error' ? '#b91c1c' : '#065f46',
      padding: '12px 32px',
      borderRadius: 12,
      fontWeight: 600,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>{msg}</div>
  );

  const showToast = (msg, type = 'success', celebrate = false) => {
    setToast({ msg, type, celebrate });
    setTimeout(() => setToast(null), 2500);
  };

  const handleAddGoal = async () => {
    setLoading(true);
    const goalData = {
      type: newGoal.type,
      target: parseFloat(newGoal.target),
      unit: newGoal.unit,
      deadline: newGoal.deadline,
      description: newGoal.description
    };
    try {
      const res = await fetch('http://localhost:5000/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(goalData)
      });
      if (res.ok) {
        const data = await res.json();
        setGoals([data.goal, ...goals]);
        showToast('Goal created!');
      } else {
        showToast('Error creating goal', 'error');
      }
    } catch (err) {
      showToast('Error creating goal', 'error');
    }
    setNewGoal({ type: "fitness", target: "", unit: "workouts", deadline: "2025-06-02", description: "" });
    setLoading(false);
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setNewGoal({ ...newGoal, type, unit: unitOptions[type][0] });
  };

  const handleDeleteGoal = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/goals/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setGoals(goals.filter(g => (g._id || g.id) !== id));
        showToast('Goal deleted!');
      } else {
        showToast('Error deleting goal', 'error');
      }
    } catch (err) {
      showToast('Error deleting goal', 'error');
    }
    setLoading(false);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setNewGoal({
      type: goal.type,
      target: goal.target,
      unit: goal.unit,
      deadline: goal.deadline ? goal.deadline.slice(0, 10) : "2025-06-02",
      description: goal.description || ""
    });
  };

  const handleUpdateGoal = async () => {
    setLoading(true);
    const goalData = {
      type: newGoal.type,
      target: parseFloat(newGoal.target),
      unit: newGoal.unit,
      deadline: newGoal.deadline,
      description: newGoal.description
    };
    try {
      const res = await fetch(`http://localhost:5000/api/goals/${editingGoal._id || editingGoal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(goalData)
      });
      if (res.ok) {
        const data = await res.json();
        setGoals(goals.map(g => (g._id === data.goal._id ? data.goal : g)));
        showToast('Goal updated!');
        setEditingGoal(null);
      } else {
        showToast('Error updating goal', 'error');
      }
    } catch (err) {
      showToast('Error updating goal', 'error');
    }
    setNewGoal({ type: "fitness", target: "", unit: "workouts", deadline: "2025-06-02", description: "" });
    setLoading(false);
  };

  const handleProgressUpdate = async (goal) => {
    setLoading(true);
    const newProgress = parseFloat(progressInput);
    if (isNaN(newProgress)) {
      showToast('Enter a valid number', 'error');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/goals/${goal._id || goal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ progress: (goal.progress || 0) + newProgress })
      });
      if (res.ok) {
        const data = await res.json();
        setGoals(goals.map(g => (g._id === data.goal._id ? data.goal : g)));
        if (data.goal.achieved) {
          showToast('Goal Achieved! 🎉', 'success', true);
        } else {
          showToast('Progress updated!');
        }
        setProgressInput("");
      } else {
        showToast('Error updating progress', 'error');
      }
    } catch (err) {
      showToast('Error updating progress', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="progress-grid">
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div className="section">
        <h3>Current Goals</h3>
        {loading && <div>Loading...</div>}
        {goals.map(goal => (
          <GoalCard
            key={goal._id || goal.id}
            goal={goal}
            onEdit={() => handleEditGoal(goal)}
            onDelete={() => handleDeleteGoal(goal._id || goal.id)}
            onProgressUpdate={handleProgressUpdate}
            progressInput={progressInput}
            setProgressInput={setProgressInput}
            loading={loading}
            GoalProgressRing={GoalProgressRing}
            // Add more props as needed for details, history, actions
          />
        ))}
      </div>

      <div className="section">
        <h3>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Goal Type</label>
            <select
              value={newGoal.type}
              onChange={handleTypeChange}
              disabled={loading}
            >
              <option value="weightLoss">Weight Loss</option>
              <option value="muscleGain">Muscle Gain</option>
              <option value="fitness">Fitness</option>
              <option value="nutrition">Nutrition</option>
            </select>
          </div>
          <div className="form-group">
            <label>Target Value</label>
            <input
              type="number"
              placeholder="e.g., 5"
              value={newGoal.target}
              onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Unit</label>
            <select
              value={newGoal.unit}
              onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
              disabled={loading}
            >
              {unitOptions[newGoal.type].map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Deadline</label>
            <input
              type="date"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              placeholder="Add details about your goal..."
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              disabled={loading}
            />
          </div>
          <button className="primary" onClick={editingGoal ? handleUpdateGoal : handleAddGoal} disabled={loading}>
            {editingGoal ? 'Save Changes' : 'Create Goal'}
          </button>
          {editingGoal && (
            <button className="cancel" onClick={() => { setEditingGoal(null); setNewGoal({ type: "fitness", target: "", unit: "workouts", deadline: "2025-06-02", description: "" }); }} disabled={loading}>Cancel</button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const Fitness = () => {
  const [activeTab, setActiveTab] = useState("Progress Tracking");
  const [workouts, setWorkouts] = useState([]); // Start with empty, fetch from backend
  const [goals, setGoals] = useState([]); // Start with empty, fetch from backend
  const [user, setUser] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState([
    { day: 'Monday', type: 'Strength', duration: 60, exercises: ['Squats', 'Deadlifts', 'Bench Press'], done: false },
    { day: 'Tuesday', type: 'Yoga', duration: 45, exercises: ['Sun Salutation', 'Warrior Flow'], done: false },
    { day: 'Wednesday', type: 'Cardio', duration: 45, exercises: ['HIIT Sprints', 'Jump Rope'], done: false },
    { day: 'Thursday', type: 'Active Recovery', duration: 30, exercises: ['Walking', 'Stretching'], done: false },
    { day: 'Friday', type: 'Strength & Sculpt', duration: 60, exercises: ['Lunges', 'Shoulder Press'], done: false },
    { day: 'Saturday', type: 'Full-Body', duration: 60, exercises: ['Burpees', 'Plank', 'Pushups'], done: false },
    { day: 'Sunday', type: 'Mobility', duration: 30, exercises: ['Yoga Flow', 'Foam Rolling'], done: false },
  ]);

  async function fetchGoals() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('http://localhost:5000/api/goals', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setGoals(data);
    }
  }

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('http://localhost:5000/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    }
    async function fetchWorkouts() {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('http://localhost:5000/api/workouts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWorkouts(data);
      }
    }
    fetchProfile();
    fetchWorkouts();
    fetchGoals();
  }, []);

  // Handler to add a goal from chatbot
  const handleAddGoalFromChatbot = async (goal) => {
    const token = localStorage.getItem('token');
    const goalData = {
      type: 'fitness',
      target: goal.duration,
      unit: 'minutes',
      deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,10), // 1 week from now
      description: goal.title
    };
    const res = await fetch('http://localhost:5000/api/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(goalData)
    });
    if (res.ok) {
      const data = await res.json();
      setGoals([data.goal, ...goals]);
    }
  };

  const handleWorkoutDone = async (dayIndex) => {
    const plan = weeklyPlan[dayIndex];
    if (plan.done) return;
    // Log workout to backend
    const token = localStorage.getItem('token');
    const workoutData = {
      title: `${plan.type} (${plan.day})`,
      date: new Date(Date.now() - ((6 - dayIndex) * 24 * 60 * 60 * 1000)).toISOString().slice(0,10),
      type: plan.type,
      duration: plan.duration,
      calories: plan.duration * 7 // estimate
    };
    const res = await fetch('http://localhost:5000/api/workouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(workoutData)
    });
    if (res.ok) {
      const data = await res.json();
      setWorkouts([data.workout, ...workouts]);
      // Optionally update goal progress
      if (goals.some(g => g.type === 'fitness')) {
        // Find fitness goal and update progress
        const fitnessGoal = goals.find(g => g.type === 'fitness');
        const progress = (fitnessGoal.progress || 0) + 1;
        await fetch(`http://localhost:5000/api/goals/${fitnessGoal._id || fitnessGoal.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ progress })
        });
        fetchGoals();
      }
      // Mark as done in UI
      setWeeklyPlan(weeklyPlan.map((w, i) => i === dayIndex ? { ...w, done: true } : w));
    }
  };

  const handleAddToCalendar = (day, dayIndex) => {
    // Compute the date for this day in the current week
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    const workoutDate = new Date(weekStart);
    workoutDate.setDate(weekStart.getDate() + dayIndex);
    const yyyy = workoutDate.getFullYear();
    const mm = String(workoutDate.getMonth() + 1).padStart(2, '0');
    const dd = String(workoutDate.getDate()).padStart(2, '0');
    // Start time: 7am, End time: 7am + duration
    const startHour = 7;
    const endHour = 7 + Math.floor(day.duration / 60);
    const start = `${yyyy}${mm}${dd}T${String(startHour).padStart(2, '0')}0000`;
    const end = `${yyyy}${mm}${dd}T${String(endHour).padStart(2, '0')}0000`;
    const title = encodeURIComponent(`${day.type} Workout`);
    const details = encodeURIComponent(`Exercises: ${day.exercises.join(', ')}`);
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
    window.open(calendarUrl, '_blank');
  };

  return (
    <div>
      <Header user={user} />

      <div className="container">
        <h2 className="dashboard-title">Your Fitness Dashboard</h2>
        <WorkoutPlanCard weeklyPlan={weeklyPlan} onWorkoutDone={handleWorkoutDone} onAddToCalendar={handleAddToCalendar} />
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
        {activeTab === "Progress Tracking" && <ProgressTracking goals={goals} workouts={workouts} />}
        {activeTab === "Workout Logs" && <WorkoutLogs workouts={workouts} setWorkouts={setWorkouts} fetchGoals={fetchGoals} />}
        {activeTab === "Goals" && <Goals goals={goals} setGoals={setGoals} />}
      </div>
      {/* Floating Chatbot Button */}
      <button
        className={`fit2go-chatbot-fab${chatOpen ? ' hide' : ''}`}
        onClick={() => setChatOpen(true)}
        aria-label="Open Chatbot"
      >💬</button>
      <Chatbot
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        user={user}
        workouts={workouts}
        goals={goals}
        onGoalAdd={handleAddGoalFromChatbot}
      />
    </div>
  );
};

export default Fitness;