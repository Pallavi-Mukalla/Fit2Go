import React, { useState, useEffect } from 'react';

// Helper to get a placeholder or generated video URL for an exercise
const getDemoVideoUrl = (exercise) => {
  // In production, replace with real API call or lookup
  // For now, use a placeholder video or GIF (e.g., from Pexels, Unsplash, or a static asset)
  // Example: `/videos/${exercise.replace(/\s+/g, '_').toLowerCase()}.mp4`
  return 'https://www.w3schools.com/html/mov_bbb.mp4'; // Placeholder video
};

// Helper: Send file to Groq Cloud API for pose analysis
async function checkPoseWithGroqAPI(file, exercise) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('exercise', exercise);
  // Replace with your actual Groq Cloud API endpoint
  const apiUrl = 'http://localhost:5000/api/groq-pose';
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Groq API error: ' + response.statusText);
  }
  const data = await response.json();
  // Expecting { result: 'good' | 'needs_improvement' | 'error', message: string }
  return data;
}

const WorkoutPlanCard = ({ weeklyPlan, onWorkoutDone, onAddToCalendar }) => {
  const [formFeedback, setFormFeedback] = useState({}); // { exercise: { result, message, timestamp } }
  const [uploading, setUploading] = useState({}); // { exercise: bool }
  const [videoUrls, setVideoUrls] = useState({}); // { [exerciseName]: url }
  const [showDetailedFeedback, setShowDetailedFeedback] = useState({}); // { exercise: bool }

  // Normalize exercises: always objects with name and duration
  const normalizedWeeklyPlan = weeklyPlan.map(day => ({
    ...day,
    exercises: day.exercises.map(ex =>
      typeof ex === 'string' ? { name: ex, duration: '' } : ex
    )
  }));

  const handleFormVideoUpload = async (exercise, file) => {
    setUploading((prev) => ({ ...prev, [exercise]: true }));
    try {
      const result = await checkPoseWithGroqAPI(file, exercise);
      setFormFeedback((prev) => ({ 
        ...prev, 
        [exercise]: {
          result: result.result,
          message: result.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (err) {
      setFormFeedback((prev) => ({ 
        ...prev, 
        [exercise]: {
          result: 'error',
          message: 'Error analyzing form: ' + (err.message || 'Unknown error'),
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    }
    setUploading((prev) => ({ ...prev, [exercise]: false }));
  };

  const getFeedbackColor = (result) => {
    switch (result) {
      case 'good': return '#10B981';
      case 'needs_improvement': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getFeedbackIcon = (result) => {
    switch (result) {
      case 'good': return '✅';
      case 'needs_improvement': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getFeedbackSummary = (result, message) => {
    if (result === 'good') return 'Good form!';
    if (result === 'needs_improvement') return 'Form needs improvement';
    if (result === 'error') return 'Analysis failed';
    return 'No analysis yet';
  };

  useEffect(() => {
    // Gather all unique exercise names from the normalizedWeeklyPlan
    const allExercises = [];
    normalizedWeeklyPlan.forEach(day => {
      day.exercises.forEach(ex => {
        if (!allExercises.includes(ex.name)) {
          allExercises.push(ex.name);
        }
      });
    });

    allExercises.forEach(exName => {
      fetch(`/api/workout-video?name=${encodeURIComponent(exName)}`)
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(data => {
          setVideoUrls(prev => ({ ...prev, [exName]: data.videoUrl }));
        })
        .catch(err => {
          setVideoUrls(prev => ({ ...prev, [exName]: 'https://www.w3schools.com/html/mov_bbb.mp4' }));
          console.error('Error fetching video:', err);
        });
    });
  }, [weeklyPlan]);

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
  return (
    <div className="workout-plan-card" style={{ boxShadow: '0 4px 24px rgba(59,130,246,0.10)', borderRadius: 18, background: '#fff', marginBottom: 32, padding: 24 }}>
      <h3 style={{ marginBottom: 18, color: '#3B82F6', fontWeight: 700 }}>This Week's Workout Plan</h3>
      <div className="workout-plan-list">
        {normalizedWeeklyPlan.map((day, i) => {
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
                      <li key={ex.name} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                        <video
                          src={videoUrls[ex.name]}
                          width={48}
                          height={48}
                          style={{ borderRadius: 8, marginRight: 8, objectFit: 'cover', background: '#eee' }}
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                        <span>{ex.name} - {ex.duration} min</span>
                        <label style={{ marginLeft: 10, cursor: 'pointer', color: '#3B82F6', fontWeight: 500, fontSize: 14 }}>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={e => {
                              if (e.target.files && e.target.files[0]) {
                                handleFormVideoUpload(ex.name, e.target.files[0]);
                              }
                            }}
                          />
                          {uploading[ex.name] ? 'Analyzing...' : 'Check my form'}
                        </label>
                        {formFeedback[ex.name] && (
                          <div style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ color: getFeedbackColor(formFeedback[ex.name].result), fontWeight: 500, fontSize: 13 }}>
                              {getFeedbackIcon(formFeedback[ex.name].result)} {getFeedbackSummary(formFeedback[ex.name].result, formFeedback[ex.name].message)}
                            </span>
                            <button
                              onClick={() => setShowDetailedFeedback(prev => ({ ...prev, [ex.name]: !prev[ex.name] }))}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: '#3B82F6', 
                                cursor: 'pointer', 
                                fontSize: 12,
                                textDecoration: 'underline'
                              }}
                            >
                              {showDetailedFeedback[ex.name] ? 'Hide details' : 'Show details'}
                            </button>
                          </div>
                        )}
                        {formFeedback[ex.name] && showDetailedFeedback[ex.name] && (
                          <div style={{ 
                            marginTop: 8, 
                            marginLeft: 56, 
                            padding: 12, 
                            background: '#F8FAFC', 
                            borderRadius: 8, 
                            border: '1px solid #E2E8F0',
                            fontSize: 13,
                            color: '#374151',
                            whiteSpace: 'pre-line'
                          }}>
                            <div style={{ fontWeight: 600, marginBottom: 4, color: getFeedbackColor(formFeedback[ex.name].result) }}>
                              Form Analysis ({formFeedback[ex.name].timestamp})
                            </div>
                            {formFeedback[ex.name].message}
                          </div>
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