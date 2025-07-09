import React, { useState } from 'react';

// Helper to get a placeholder or generated video URL for an exercise
const getDemoVideoUrl = (exercise) => {
  // In production, replace with real API call or lookup
  // For now, use a placeholder video or GIF (e.g., from Pexels, Unsplash, or a static asset)
  // Example: `/videos/${exercise.replace(/\s+/g, '_').toLowerCase()}.mp4`
  return 'https://www.w3schools.com/html/mov_bbb.mp4'; // Placeholder video
};

const WorkoutPlanCard = ({ weeklyPlan, onWorkoutDone, onAddToCalendar }) => {
  const [formFeedback, setFormFeedback] = useState({}); // { exercise: feedback }
  const [uploading, setUploading] = useState({}); // { exercise: bool }

  const handleFormVideoUpload = async (exercise, file) => {
    setUploading((prev) => ({ ...prev, [exercise]: true }));
    // TODO: Integrate with AI form correction API
    // For now, simulate feedback
    setTimeout(() => {
      setFormFeedback((prev) => ({ ...prev, [exercise]: 'Good form! (demo)' }));
      setUploading((prev) => ({ ...prev, [exercise]: false }));
    }, 1500);
  };

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
  return (
    <div className="workout-plan-card" style={{ boxShadow: '0 4px 24px rgba(59,130,246,0.10)', borderRadius: 18, background: '#fff', marginBottom: 32, padding: 24 }}>
      <h3 style={{ marginBottom: 18, color: '#3B82F6', fontWeight: 700 }}>This Week's Workout Plan</h3>
      <div className="workout-plan-list">
        {weeklyPlan.map((day, i) => {
          const workoutDate = new Date(weekStart);
          workoutDate.setDate(weekStart.getDate() + i);
          const isPast = workoutDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          return (
            <div key={day.day} className="workout-plan-row" style={{ display: 'flex', alignItems: 'center', marginBottom: 14, borderRadius: 12, background: day.done ? '#d1fae5' : '#F3F4F6', padding: 14, boxShadow: day.done ? '0 2px 8px #bbf7d0' : 'none', transition: 'background 0.3s' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 17, color: '#6366F1' }}>{day.day}</div>
                <div style={{ fontSize: 15, margin: '2px 0' }}><b>{day.type}</b> &middot; {day.duration} min</div>
                <div style={{ fontSize: 14, color: '#6B7280' }}>
                  Exercises:
                  <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none' }}>
                    {day.exercises.map((ex, idx) => (
                      <li key={ex} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                        <video
                          src={getDemoVideoUrl(ex)}
                          width={48}
                          height={48}
                          style={{ borderRadius: 8, marginRight: 8, objectFit: 'cover', background: '#eee' }}
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                        <span>{ex}</span>
                        <label style={{ marginLeft: 10, cursor: 'pointer', color: '#3B82F6', fontWeight: 500, fontSize: 14 }}>
                          <input
                            type="file"
                            accept="video/*"
                            style={{ display: 'none' }}
                            onChange={e => {
                              if (e.target.files && e.target.files[0]) {
                                handleFormVideoUpload(ex, e.target.files[0]);
                              }
                            }}
                          />
                          {uploading[ex] ? 'Uploading...' : 'Check my form'}
                        </label>
                        {formFeedback[ex] && (
                          <span style={{ marginLeft: 8, color: '#10B981', fontWeight: 500, fontSize: 13 }}>{formFeedback[ex]}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                className="calendar-btn"
                style={{ marginRight: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}
                title="Add to Google Calendar"
                onClick={() => onAddToCalendar && onAddToCalendar(day, i)}
              >
                <span role="img" aria-label="calendar">📅</span>
              </button>
              {day.done ? (
                <span style={{ color: '#10B981', fontSize: 22, fontWeight: 700, marginLeft: 8 }}>✔ Done</span>
              ) : isPast ? (
                <span style={{ color: '#EF4444', fontSize: 16, fontWeight: 600, marginLeft: 8 }}>Not completed</span>
              ) : (
                <button
                  className="primary"
                  style={{ marginLeft: 8, padding: '6px 18px', borderRadius: 8, fontWeight: 600, fontSize: 15 }}
                  onClick={() => onWorkoutDone(i)}
                >Done</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutPlanCard; 