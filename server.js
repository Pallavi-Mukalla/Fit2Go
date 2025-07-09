const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());  // Allow all origins
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const User = require('./models/User');

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

const mealsRoute = require('./routes/meals');
app.use('/api/meals', mealsRoute);

const waterRoute = require('./routes/water');
app.use('/api/water', waterRoute);

const recipesRoute = require('./routes/recipes');
app.use('/api/recipes', recipesRoute);

const Workout = require('./models/Workout');
const Goal = require('./models/Goal');  
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


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
