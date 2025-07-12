const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const Goal = require('./models/Goal');
dotenv.config();

const app = express();
app.use(cors());  // Allow all origins
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const User = require('./models/User');
const { Workout, WorkoutPlan } = require('./models/Workout');

app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during signup', error: err.message });
  }
});


// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

const auth = require('./middleware/auth');

app.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email'); // select only fields you want to send
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // You can also add initials on the server side
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

    res.json({ name: user.name, email: user.email, initials });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching profile', error: err.message });
  }
});

// Password reset endpoint
app.post('/api/reset-password', auth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while resetting password', error: err.message });
  }
});

const mealsRoute = require('./routes/meals');
app.use('/api/meals', mealsRoute);

const waterRoute = require('./routes/water');
app.use('/api/water', waterRoute);

const recipesRoute = require('./routes/recipes');
app.use('/api/recipes', recipesRoute);

const groqPoseRoute = require('./routes/groqPose');
app.use('/api/groq-pose', groqPoseRoute);

const conversationsRoute = require('./routes/conversations');
app.use('/api/conversations', conversationsRoute);

// Workout Management Routes
app.get('/api/workouts', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.userId });
    res.json(workouts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching workouts', error: err.message });
  }
});

app.post('/api/workouts', auth, async (req, res) => {
  const { date, type, duration, title } = req.body;

  try {
    if (!date || !type || !duration || !title) {
      return res.status(400).json({ message: 'Missing required fields: date, type, duration, or title' });
    }

    const calories = type === 'Cardio' ? duration * 7 :
                    type === 'Strength' ? duration * 7.5 :
                    type === 'Yoga' ? duration * 5 :
                    type === 'HIIT' ? duration * 12 : 0;

    const newWorkout = new Workout({ userId: req.userId, date, type, duration, calories, title });
    const savedWorkout = await newWorkout.save();
    console.log('Workout saved:', savedWorkout); // Log the saved document

    // --- Auto-update fitness goals ---
    // Find all active fitness goals for this user
    const now = new Date(date);
    const fitnessGoals = await Goal.find({
      userId: req.userId,
      type: 'fitness',
      achieved: false,
      deadline: { $gte: now }
    });
    for (const goal of fitnessGoals) {
      // Only auto-update if unit matches
      // For simplicity, if unit is 'workouts', increment by 1
      // If unit is 'minutes', increment by duration
      // If unit is 'km', increment by duration (if type is 'Running' or 'Cardio')
      let increment = 0;
      if (goal.unit === 'workouts') increment = 1;
      else if (goal.unit === 'minutes') increment = duration;
      else if (goal.unit === 'km' && (type.toLowerCase().includes('run') || type.toLowerCase().includes('cardio'))) increment = duration / 10; // Assume 10 min = 1 km as a placeholder
      if (increment > 0) {
        goal.progress = (goal.progress || 0) + increment;
        if (goal.progress >= goal.target) goal.achieved = true;
        goal.updatedAt = new Date();
        await goal.save();
      }
    }
    // --- End auto-update ---

    res.status(201).json({ message: 'Workout created successfully', workout: savedWorkout });
  } catch (err) {
    console.error('Error saving workout:', err);
    res.status(500).json({ message: 'Server error while creating workout', error: err.message });
  }
});

app.put('/api/workouts/:id', auth, async (req, res) => {
  const { date, type, duration, title } = req.body;
  const workoutId = req.params.id;

  try {
    const calories = type === 'Cardio' ? duration * 7 :
                    type === 'Strength' ? duration * 7.5 :
                    type === 'Yoga' ? duration * 5 :
                    type === 'HIIT' ? duration * 12 : 0;

    const updatedWorkout = await Workout.findOneAndUpdate(
      { _id: workoutId, userId: req.userId },
      { date, type, duration, calories, title },
      { new: true, runValidators: true }
    );
    if (!updatedWorkout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    res.json({ message: 'Workout updated successfully', workout: updatedWorkout });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating workout', error: err.message });
  }
});

app.delete('/api/workouts/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    res.json({ message: 'Workout deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting workout', error: err.message });
  }
});

// Goal Management Routes
app.get('/api/goals', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId });
    res.json(goals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching goals', error: err.message });
  }
});

app.post('/api/goals', auth, async (req, res) => {
  const { type, target, unit, deadline, description } = req.body;

  try {
    if (!type || !target || !unit || !deadline) {
      return res.status(400).json({ message: 'Missing required fields: type, target, unit, or deadline' });
    }
    const newGoal = new Goal({
      userId: req.userId,
      type,
      target,
      unit,
      deadline,
      description,
      progress: 0,
      achieved: false
    });
    await newGoal.save();
    res.status(201).json({ message: 'Goal created successfully', goal: newGoal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating goal', error: err.message });
  }
});

app.put('/api/goals/:id', auth, async (req, res) => {
  const { target, unit, deadline, description, progress } = req.body;
  const goalId = req.params.id;

  try {
    const goal = await Goal.findOne({ _id: goalId, userId: req.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    if (target !== undefined) goal.target = target;
    if (unit) goal.unit = unit;
    if (deadline) goal.deadline = deadline;
    if (description !== undefined) goal.description = description;
    if (progress !== undefined) goal.progress = progress;
    // Auto-mark as achieved if progress >= target
    if (goal.progress >= goal.target) {
      goal.achieved = true;
    } else {
      goal.achieved = false;
    }
    goal.updatedAt = new Date();
    await goal.save();
    res.json({ message: 'Goal updated successfully', goal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating goal', error: err.message });
  }
});

app.delete('/api/goals/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting goal', error: err.message });
  }
});

app.post('/api/genai', auth, async (req, res) => {
  const { prompt, user, workouts, goals, model } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ response: 'Gemini API key not configured.' });
  }
  try {
    // Compose a personalized prompt
    const fullPrompt = `User: ${user?.name || ''}
Email: ${user?.email || ''}
Workouts: ${JSON.stringify(workouts)}
Goals: ${JSON.stringify(goals)}
Prompt: ${prompt}`;

    // Use model from request or default
    const modelName = model || 'models/gemini-1.5-flash-8b';

    // Gemini API call
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }]
      })
    });

    const data = await geminiRes.json();
    console.log('Gemini raw response:', data);

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, no response from Gemini.';
    res.json({ response: text });

  } catch (err) {
    console.error('Error calling Gemini:', err);
    res.status(500).json({ response: 'Error calling Gemini: ' + err.message });
  }
});


app.get('/api/genai/models', auth, async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ response: 'Gemini API key not configured.' });
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models?key=' + apiKey, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ response: 'Error fetching Gemini models: ' + err.message });
  }
});

// --- Weekly Plan Route ---
app.get('/api/weekly-plan', auth, async (req, res) => {
  // For demo: mock data. In production, fetch/generate from DB or user profile.
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const exercisePool = [
    { name: 'Push Ups', min: 10, max: 20 },
    { name: 'Squats', min: 15, max: 30 },
    { name: 'Plank', min: 2, max: 5 },
    { name: 'Jumping Jacks', min: 20, max: 40 },
    { name: 'Burpees', min: 10, max: 20 },
    { name: 'Lunges', min: 12, max: 24 },
    { name: 'Mountain Climbers', min: 20, max: 40 },
    { name: 'Sit Ups', min: 15, max: 30 },
    { name: 'High Knees', min: 20, max: 40 },
    { name: 'Yoga', min: 20, max: 40 }
  ];
  // Use userId to seed randomization for user-specific plans (simple hash)
  function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
  function getSeed(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }
  const userSeed = getSeed(req.userId.toString());
  // Generate a plan for each day
  const plan = days.map((day, i) => {
    // Pick 2-3 exercises per day, random but user-seeded
    const exCount = 2 + Math.floor(seededRandom(userSeed + i) * 2); // 2 or 3
    let indices = [];
    while (indices.length < exCount) {
      let idx = Math.floor(seededRandom(userSeed + i * 10 + indices.length) * exercisePool.length);
      if (!indices.includes(idx)) indices.push(idx);
    }
    const exercises = indices.map(idx => {
      const ex = exercisePool[idx];
      // Duration random in range, user-seeded
      const duration = ex.min + Math.floor(seededRandom(userSeed + i * 100 + idx) * (ex.max - ex.min + 1));
      return { name: ex.name, duration };
    });
    return {
      day,
      exercises,
      done: false
    };
  });
  res.json(plan);
});

// Place this at the top of your server.js (after your imports)
const workoutVideoCache = {};
const WORKOUT_VIDEO_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const WORKOUT_VIDEO_ERROR_CACHE_TTL = 10 * 60 * 1000; // 10 minutes for errors

// Replace your /api/workout-video route with this:
app.get('/api/workout-video', async (req, res) => {
  const { name } = req.query;
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Pexels API key not configured.' });
  }

  const now = Date.now();
  // Check cache (success or error)
  if (
    workoutVideoCache[name] &&
    now - workoutVideoCache[name].timestamp <
      (workoutVideoCache[name].error ? WORKOUT_VIDEO_ERROR_CACHE_TTL : WORKOUT_VIDEO_CACHE_TTL)
  ) {
    return res.json({ videoUrl: workoutVideoCache[name].url });
  }

  try {
    const response = await axios.get('https://api.pexels.com/videos/search', {
      headers: { Authorization: apiKey },
      params: { query: name, per_page: 1, orientation: 'landscape' }
    });
    const video = response.data.videos[0];
    let videoUrl = null;
    if (video && video.video_files) {
      const shortClip = video.video_files.find(v => v.duration && v.duration <= 3);
      videoUrl = shortClip ? shortClip.link : video.video_files[0]?.link;
    }
    if (!videoUrl) {
      videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
    }
    // Save to cache (success)
    workoutVideoCache[name] = { url: videoUrl, timestamp: now, error: false };
    res.json({ videoUrl });
  } catch (err) {
    let fallbackUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
    // If 429, cache the fallback for a short period
    if (err.response && err.response.status === 429) {
      workoutVideoCache[name] = { url: fallbackUrl, timestamp: now, error: true };
      console.error('Pexels API rate limit hit. Caching fallback video for 10 minutes.');
      return res.json({ videoUrl: fallbackUrl });
    }
    // Cache all other errors for a short period to avoid hammering
    workoutVideoCache[name] = { url: fallbackUrl, timestamp: now, error: true };
    console.error('Error fetching workout video:', err.message);
    res.json({ videoUrl: fallbackUrl });
  }
});

// Personalized Weekly Workout Plan Endpoint
app.get('/api/workout-plan', auth, async (req, res) => {
  try {
    let planDoc = await WorkoutPlan.findOne({ userId: req.userId });
    const now = new Date();
    let shouldGenerate = false;
    if (!planDoc) {
      shouldGenerate = true;
    } else {
      // Check if plan is older than 7 days
      const ageMs = now - planDoc.generatedAt;
      if (ageMs > 7 * 24 * 60 * 60 * 1000) {
        shouldGenerate = true;
      }
    }
    if (shouldGenerate) {
      // --- Gemini Integration ---
      const apiKey = process.env.GEMINI_API_KEY;
      let geminiPlan = null;
      if (apiKey) {
        try {
          const prompt = `Generate a personalized weekly workout plan for a user. Each day should have a workout name and duration in minutes. Format as JSON: { week: 'YYYY-MM-DD', days: [ { day: 'Monday', workout: '...', duration: 45 }, ... ] }`;
          const modelName = 'models/gemini-1.5-flash-8b';
          const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          });
          const data = await geminiRes.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            // Try to parse JSON from Gemini's response
            try {
              geminiPlan = JSON.parse(text);
            } catch (e) {
              // If Gemini returns markdown or extra text, extract JSON
              const match = text.match(/\{[\s\S]*\}/);
              if (match) {
                geminiPlan = JSON.parse(match[0]);
              }
            }
          }
        } catch (err) {
          console.error('Error calling Gemini for workout plan:', err);
        }
      }
      // Fallback to dummy plan if Gemini fails
      const planToSave = geminiPlan || {
        week: now.toISOString().slice(0, 10),
        days: [
          { day: 'Monday', workout: 'Full Body Strength', duration: 45 },
          { day: 'Tuesday', workout: 'Cardio Intervals', duration: 30 },
          { day: 'Wednesday', workout: 'Rest or Yoga', duration: 30 },
          { day: 'Thursday', workout: 'Upper Body Strength', duration: 40 },
          { day: 'Friday', workout: 'HIIT', duration: 25 },
          { day: 'Saturday', workout: 'Lower Body Strength', duration: 40 },
          { day: 'Sunday', workout: 'Active Recovery', duration: 30 },
        ]
      };
      if (!planDoc) {
        planDoc = new WorkoutPlan({ userId: req.userId, plan: planToSave, generatedAt: now });
      } else {
        planDoc.plan = planToSave;
        planDoc.generatedAt = now;
      }
      await planDoc.save();
    }
    res.json(planDoc.plan);
  } catch (err) {
    console.error('Error fetching/generating workout plan:', err);
    res.status(500).json({ message: 'Server error while fetching/generating workout plan', error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
