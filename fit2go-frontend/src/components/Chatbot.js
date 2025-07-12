import React, { useState, useRef, useEffect } from 'react';
import botAvatar from '../Fit2Go.jpg'; // Use your logo or a bot image

function isWorkoutRecommendationRequest(text) {
  const lower = text.toLowerCase();
  // Only trigger workout if it's clearly about workouts
  const workoutKeywords = [
    'workout', 'exercise', 'routine', 'give me a workout', 'what should i do', 'any workout', 'fitness idea', 'workout plan', 'exercise plan', 'fitness plan'
  ];
  // Avoid triggering on 'plan' alone
  if (lower.includes('diet')) return false;
  return workoutKeywords.some(k => lower.includes(k));
}
function isMealRecommendationRequest(text) {
  const lower = text.toLowerCase();
  // Prioritize diet/diet plan
  if (lower.includes('diet plan') || lower.includes('diet')) return true;
  const mealKeywords = [
    'meal', 'food', 'nutrition', 'what should i eat', 'suggest a meal', 'recommend a meal', 'macro', 'protein', 'carbs', 'fat', 'calories', 'breakfast', 'lunch', 'dinner', 'snack', 'weight loss', 'healthy eating', 'lose weight', 'gain weight', 'bulking', 'cutting'
  ];
  return mealKeywords.some(k => lower.includes(k));
}
function isRecentWorkoutRequest(text) {
  const lower = text.toLowerCase();
  return (
    lower.includes('recent workout') ||
    lower.includes('last workout') ||
    lower.includes('most recent workout') ||
    lower.includes('previous workout')
  );
}
function isRecentMealRequest(text) {
  const lower = text.toLowerCase();
  return (
    lower.includes('recent meal') ||
    lower.includes('last meal') ||
    lower.includes('most recent meal') ||
    lower.includes('previous meal')
  );
}
function isGoalRequest(text) {
  const lower = text.toLowerCase();
  return (
    lower.includes('my goals') ||
    lower.includes('current goals') ||
    lower.includes('what are my goals') ||
    lower.includes('show my goals')
  );
}
function isProteinIntakeRequest(text) {
  const lower = text.toLowerCase();
  return lower.includes('protein intake') || lower.includes('how much protein') || lower.includes('protein today');
}
function isCarbIntakeRequest(text) {
  const lower = text.toLowerCase();
  return lower.includes('carb intake') || lower.includes('how many carbs') || lower.includes('carbs today');
}
function isFatIntakeRequest(text) {
  const lower = text.toLowerCase();
  return lower.includes('fat intake') || lower.includes('how much fat') || lower.includes('fat today');
}
function isCalorieIntakeRequest(text) {
  const lower = text.toLowerCase();
  return lower.includes('calorie intake') || lower.includes('how many calories') || lower.includes('calories today');
}

const Chatbot = ({ open, onClose, user, workouts, goals, meals,setMeals, onGoalAdd, onMealAdd, waterIntake, totalProtein, totalCarbs, totalFat, consumedCalories }) => {
  const [messages, setMessages] = useState([
    { from: 'bot', text: `Hi${user?.name ? ', ' + user.name.split(' ')[0] : ''}! I am your Fit2Go AI assistant. How can I help you with your fitness today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingWorkout, setPendingWorkout] = useState(null);
  const [pendingMeal, setPendingMeal] = useState(null);
  const messagesEndRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false); // NEW: track TTS on/off
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // --- Text-to-Speech (TTS) ---
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speak only if TTS is enabled
  useEffect(() => {
    if (isTTSEnabled && messages.length > 0 && messages[messages.length - 1].from === 'bot') {
      speak(messages[messages.length - 1].text);
    }
    // eslint-disable-next-line
  }, [messages]);

  // --- Speech-to-Text (STT) ---
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      // NEW: handle voice commands
      if (transcript.includes('enable voice')) {
        setIsTTSEnabled(true);
        setMessages(msgs => [...msgs, { from: 'bot', text: 'Voice response has been enabled.' }]);
      } else if (transcript.includes('disable voice')) {
        setIsTTSEnabled(false);
        setMessages(msgs => [...msgs, { from: 'bot', text: 'Voice response has been disabled.' }]);
      } else {
        setInput(transcript);
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const fetchGeminiResponse = async (prompt) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/genai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ prompt, user, workouts, goals })
      });
      if (res.ok) {
        const data = await res.json();
        setLoading(false);
        return data.response;
      } else {
        setLoading(false);
        return 'Sorry, I could not get a response from the AI service.';
      }
    } catch (err) {
      setLoading(false);
      return 'Sorry, there was an error connecting to the AI service.';
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'user', text: input }]);
    // --- Direct context answers ---
    if (isRecentWorkoutRequest(input)) {
      if (workouts && workouts.length > 0) {
        // Sort by date descending (ISO format)
        const sorted = [...workouts].sort((a, b) => (b.date > a.date ? 1 : -1));
        const recent = sorted[0];
        setMessages(msgs => [
          ...msgs,
          { from: 'bot', text: `Your most recent workout was on ${recent.date}: ${recent.type} for ${recent.duration} min, ${recent.calories} calories.` }
        ]);
      } else {
        setMessages(msgs => [
          ...msgs,
          { from: 'bot', text: "I couldn't find any recent workouts in your history." }
        ]);
      }
      setInput('');
      return;
    }
    if (isRecentMealRequest(input)) {
      if (meals && meals.length > 0) {
        // Sort by date descending if available, else use order
        const sorted = meals[0].date ? [...meals].sort((a, b) => (b.date > a.date ? 1 : -1)) : meals;
        const recent = sorted[0];
        setMessages(msgs => [
          ...msgs,
          { from: 'bot', text: `Your most recent meal was${recent.date ? ' on ' + recent.date : ''}: ${recent.name || recent.title} (${recent.kcal || '?'} kcal, P: ${recent.protein || '?'}g, C: ${recent.carbs || '?'}g, F: ${recent.fat || '?'}g).` }
        ]);
      } else {
        setMessages(msgs => [
          ...msgs,
          { from: 'bot', text: "I couldn't find any recent meals in your history." }
        ]);
      }
      setInput('');
      return;
    }
    if (isGoalRequest(input)) {
      if (goals && goals.length > 0) {
        const lines = goals.map(g => `• ${g.type} goal: ${g.target} ${g.unit}${g.description ? ' (' + g.description + ')' : ''}${g.achieved ? ' [Achieved]' : ''}`);
        setMessages(msgs => [
          ...msgs,
          { from: 'bot', text: `Here are your current goals:\n${lines.join('\n')}` }
        ]);
      } else {
        setMessages(msgs => [
          ...msgs,
          { from: 'bot', text: "You don't have any goals set yet." }
        ]);
      }
      setInput('');
      return;
    }
    if (pendingWorkout && input.toLowerCase().startsWith('yes')) {
      if (onGoalAdd) {
        await onGoalAdd(pendingWorkout);
        setMessages(msgs => [...msgs, { from: 'bot', text: `Great! I've added "${pendingWorkout.title}" as a goal for you.` }]);
      }
      setPendingWorkout(null);
      setInput('');
      return;
    }
    if (pendingWorkout && input.toLowerCase().startsWith('no')) {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'No problem! Let me know if you need anything else.' }]);
      setPendingWorkout(null);
      setInput('');
      return;
    }
    if (pendingMeal && Array.isArray(pendingMeal) && input.toLowerCase() === 'yes') {
  try {
    for (const meal of pendingMeal) {
      // POST to backend
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tab: meal.tab,
          name: meal.name,
          description: meal.description,
          kcal: meal.kcal,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat
        })
      });

      if (!response.ok) {
        console.error('Failed to add meal:', await response.text());
        continue;
      }

      const savedMeal = await response.json();
      // Add saved meal to local state so it appears in meal list
      setMeals(prev => [...prev, savedMeal]);
    }

    setMessages(msgs => [...msgs, { from: 'bot', text: "Awesome! I've added the meal plan to your day." }]);
    setPendingMeal(null); // clear pending
  } catch (err) {
    console.error('Error adding meals:', err);
    setMessages(msgs => [...msgs, { from: 'bot', text: "Oops! Something went wrong while adding your meal plan." }]);
  }
  setInput('');
  return;
}

    if (pendingMeal && input.toLowerCase().startsWith('no')) {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'No worries! Ask me for another meal anytime.' }]);
      setPendingMeal(null);
      setInput('');
      return;
    }
    // --- Nutrition detail queries: check BEFORE meal recommendation ---
    if (isProteinIntakeRequest(input)) {
      const protein = typeof totalProtein === 'number' ? totalProtein : meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
      setMessages(msgs => [
        ...msgs,
        { from: 'bot', text: `Your total protein intake today is ${protein}g.` }
      ]);
      setInput('');
      return;
    }
    if (isCarbIntakeRequest(input)) {
      const carbs = typeof totalCarbs === 'number' ? totalCarbs : meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
      setMessages(msgs => [
        ...msgs,
        { from: 'bot', text: `Your total carb intake today is ${carbs}g.` }
      ]);
      setInput('');
      return;
    }
    if (isFatIntakeRequest(input)) {
      const fat = typeof totalFat === 'number' ? totalFat : meals.reduce((sum, meal) => sum + (meal.fat || 0), 0);
      setMessages(msgs => [
        ...msgs,
        { from: 'bot', text: `Your total fat intake today is ${fat}g.` }
      ]);
      setInput('');
      return;
    }
    if (isCalorieIntakeRequest(input)) {
      const calories = typeof consumedCalories === 'number' ? consumedCalories : meals.reduce((sum, meal) => sum + (meal.kcal || 0), 0);
      setMessages(msgs => [
        ...msgs,
        { from: 'bot', text: `Your total calorie intake today is ${calories}kcal.` }
      ]);
      setInput('');
      return;
    }
    if (input.toLowerCase().includes('water intake') || input.toLowerCase().includes('how much water')) {
      const water = typeof waterIntake === 'number' ? waterIntake : 0;
      setMessages(msgs => [
        ...msgs,
        { from: 'bot', text: `Your total water intake today is ${water} liters.` }
      ]);
      setInput('');
      return;
    }
    // --- Meal recommendation (after nutrition details) ---
if (isMealRecommendationRequest(input)) {
  const lowerInput = input.toLowerCase();

  // Try to extract goal from input text
  let userGoal = '';
  if (lowerInput.includes('weight loss')) userGoal = 'weight loss';
  else if (lowerInput.includes('muscle gain')) userGoal = 'muscle gain';
  else if (lowerInput.includes('maintain')) userGoal = 'maintain current weight';
  else if (lowerInput.includes('energy')) userGoal = 'improve energy levels';

  // Fallback to user's goals if no direct goal found
  let goalText = userGoal || goals.map(g => `${g.type}: ${g.target} ${g.unit}`).join(', ');
  if (!goalText) goalText = 'weight loss'; // final default
  const prompt = `Suggest a complete daily meal plan for ${goalText}, including Breakfast, Lunch, Dinner, and Snacks.
For each meal, provide:
- Meal type (Breakfast, Lunch, Dinner, Snacks)
- Name of the dish
- Short description
- Protein (P: xx g)
- Carbs (C: xx g)
- Fat (F: xx g)
- Calories (xxx kcal)

Format exactly like this:
Breakfast
Name
Description
P: xx g
C: xx g
F: xx g
xxx kcal

Lunch
Name
Description
P: xx g
C: xx g
F: xx g
xxx kcal

Dinner
Name
Description
P: xx g
C: xx g
F: xx g
xxx kcal

Snacks
Name
Description
P: xx g
C: xx g
F: xx g
xxx kcal

Do not add extra text or explanations.`



  const aiResponse = await fetchGeminiResponse(prompt);

const lines = aiResponse.split('\n').filter(Boolean);
let mealsToAdd = [];

let i = 0;
while (i < lines.length) {
  let tab = lines[i].trim();

  if (tab === 'Breakfast' || tab === 'Lunch' || tab === 'Dinner') {
    const name = lines[i+1]?.trim() || '';
    const description = lines[i+2]?.trim() || '';
    const protein = parseInt((lines[i+3]?.match(/\d+/) || [0])[0]);
    const carbs = parseInt((lines[i+4]?.match(/\d+/) || [0])[0]);
    const fat = parseInt((lines[i+5]?.match(/\d+/) || [0])[0]);
    const kcal = parseInt((lines[i+6]?.match(/\d+/) || [0])[0]);
    
    mealsToAdd.push({
      _id: Date.now().toString() + Math.random().toString(36).substr(2,5),
      tab,
      name,
      description,
      protein,
      carbs,
      fat,
      kcal,
      checked: false,
      date: new Date().toISOString().slice(0,10)
    });
    
    i += 7;
  }
  else if (tab === 'Snacks') {
    i++;
    while (i < lines.length && lines[i]) {
      const name = lines[i]?.trim() || '';
      const description = lines[i+1]?.trim() || '';
      const protein = parseInt((lines[i+2]?.match(/\d+/) || [0])[0]);
      const carbs = parseInt((lines[i+3]?.match(/\d+/) || [0])[0]);
      const fat = parseInt((lines[i+4]?.match(/\d+/) || [0])[0]);
      const kcal = parseInt((lines[i+5]?.match(/\d+/) || [0])[0]);

      mealsToAdd.push({
        _id: Date.now().toString() + Math.random().toString(36).substr(2,5),
        tab: 'Snacks',
        name,
        description,
        protein,
        carbs,
        fat,
        kcal,
        checked: false,
        date: new Date().toISOString().slice(0,10)
      });

      i += 6;
    }
  }
  else {
    i++;
  }
}


if (mealsToAdd.length > 0) {
  setPendingMeal(mealsToAdd); // now pendingMeal is an array
  setMessages(msgs => [...msgs, { from: 'bot', text: aiResponse + '\n\nWould you like to add this full meal plan to your day? (yes/no)' }]);
}


  setMessages(msgs => [
    ...msgs,
    { from: 'bot', text: aiResponse + (mealsToAdd ? '\n\nWould you like to add this to your meal plan? (yes/no)' : '') }
  ]);

  if (mealsToAdd)
    {
       setPendingMeal(mealsToAdd);
       console.log("Set pending meal:", mealsToAdd);
    }

  setInput('');
  return;
}

    if (isWorkoutRecommendationRequest(input)) {
      const prompt = `Suggest a personalized workout for this user: ${user?.name || ''}, goals: ${goals.map(g=>g.type+':'+g.target+' '+g.unit).join(', ')}, recent workouts: ${workouts.slice(0,3).map(w=>w.type+ ' on '+w.date).join(', ')}. Reply with a short workout plan (type, duration, and a motivating title).`;
      const aiResponse = await fetchGeminiResponse(prompt);
      const match = aiResponse.match(/(\w+)(?: workout| session| routine)?[,\s]+(\d+)[- ]?(minutes|min)?/i);
      let workout = null;
      if (match) {
        workout = {
          type: match[1],
          duration: parseInt(match[2]),
          title: aiResponse.split('\n')[0] || `${match[1]} for ${match[2]} min`,
          date: new Date().toISOString().slice(0,10)
        };
      }
      setMessages(msgs => [...msgs, { from: 'bot', text: aiResponse + (workout ? '\n\nWould you like to add this as a goal? (yes/no)' : '') }]);
      if (workout) setPendingWorkout(workout);
      setInput('');
      return;
    }
    const aiResponse = await fetchGeminiResponse(input);
    setMessages(msgs => [...msgs, { from: 'bot', text: aiResponse }]);
    setInput('');
  };

  if (!open) return null;

  return (
  <div
    className="fit2go-chatbot-modal"
    style={{
      position: 'fixed',
      bottom: 30,
      right: 30,
      width: 370,
      height: 500,
      background: 'rgba(255,255,255,0.85)',
      borderRadius: 20,
      boxShadow: '0 8px 32px rgba(59,130,246,0.18)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backdropFilter: 'blur(8px)',
      border: '1.5px solid #e0e7ff',
      animation: 'chat-modal-in 0.4s',
    }}
  >
    {/* Header */}
    <div style={{
      background: 'linear-gradient(90deg,#3B82F6,#8B5CF6)',
      color: 'white',
      padding: 16,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid #e0e7ff',
      minHeight: 60
    }}>
      <img src={botAvatar} alt="Bot" style={{ width: 38, height: 38, borderRadius: '50%', marginRight: 14, border: '2px solid #fff', boxShadow: '0 2px 8px rgba(59,130,246,0.10)' }} />
      <span style={{ fontSize: 18, letterSpacing: 0.5 }}>Fit2Go Chatbot</span>
      <span
        style={{ marginLeft: 'auto', fontSize: 26, cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.2s' }}
        onClick={onClose}
        title="Close"
      >×</span>
    </div>

    {/* Messages */}
    <div style={{ flex: 1, padding: 18, overflowY: 'auto', background: 'linear-gradient(135deg,#f0f7ff 60%,#e0e7ff 100%)' }}>
      {messages.map((msg, i) => (
        <div
          key={i}
          style={{
            marginBottom: 14,
            display: 'flex',
            flexDirection: msg.from === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-end',
            gap: 8
          }}
        >
          {msg.from === 'bot' && (
            <img src={botAvatar} alt="Bot" style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #e0e7ff', background: '#fff' }} />
          )}
          <span
            style={{
              display: 'inline-block',
              background: msg.from === 'user' ? 'linear-gradient(90deg,#3B82F6,#8B5CF6)' : 'rgba(255,255,255,0.95)',
              color: msg.from === 'user' ? 'white' : '#333',
              borderRadius: 16,
              padding: '10px 18px',
              maxWidth: 240,
              fontSize: 15,
              boxShadow: msg.from === 'user' ? '0 2px 8px #c7d2fe' : '0 2px 8px #e0e7ff',
              border: msg.from === 'user' ? 'none' : '1.5px solid #e0e7ff',
              wordBreak: 'break-word',
              whiteSpace: 'pre-line',
              marginLeft: msg.from === 'user' ? 0 : 4,
              marginRight: msg.from === 'user' ? 4 : 0
            }}
          >{msg.text}</span>
        </div>
      ))}
      {loading && (
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={botAvatar} alt="Bot" style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #e0e7ff', background: '#fff' }} />
          <span style={{ background: 'rgba(255,255,255,0.95)', color: '#333', borderRadius: 16, padding: '10px 18px', fontSize: 15, border: '1.5px solid #e0e7ff', boxShadow: '0 2px 8px #e0e7ff' }}>Thinking...</span>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>

    {/* Input */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      borderTop: '1.5px solid #e0e7ff',
      background: 'rgba(255,255,255,0.95)',
      padding: '8px 8px',
      gap: 6
    }}>
      <input
        style={{
          flex: 1,
          border: 'none',
          padding: '10px 12px',
          fontSize: 15,
          borderRadius: 10,
          outline: 'none',
          background: 'rgba(243,244,246,0.7)',
          boxShadow: '0 1px 4px #e0e7ff',
          color: '#222',
          minWidth: 0
        }}
        placeholder="Type your message..."
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
        disabled={loading}
      />
      <button
        style={{
          background: 'linear-gradient(90deg,#3B82F6,#8B5CF6)',
          color: 'white',
          border: 'none',
          borderRadius: 10,
          fontWeight: 600,
          fontSize: 14,
          padding: '8px 14px',
          cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
          opacity: loading || !input.trim() ? 0.7 : 1,
          boxShadow: '0 2px 6px #c7d2fe',
        }}
        onClick={handleSend}
        disabled={loading || !input.trim()}
      >Send</button>
      <button
        style={{
          background: isListening ? '#3B82F6' : '#e0e7ff',
          color: isListening ? 'white' : '#333',
          border: 'none',
          borderRadius: '50%',
          width: 34,
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          boxShadow: isListening ? '0 2px 6px #3B82F6' : '0 2px 6px #e0e7ff',
          cursor: 'pointer',
        }}
        onClick={isListening ? stopListening : startListening}
        title={isListening ? 'Stop Listening' : 'Speak'}
      >
        {isListening ? '🎤' : '🎙️'}
      </button>
      <button
        style={{
          background: isTTSEnabled ? '#3B82F6' : '#e0e7ff',
          color: isTTSEnabled ? 'white' : '#333',
          border: 'none',
          borderRadius: '50%',
          width: 34,
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          boxShadow: isTTSEnabled ? '0 2px 6px #3B82F6' : '0 2px 6px #e0e7ff',
          cursor: 'pointer',
        }}
        onClick={() => setIsTTSEnabled(prev => !prev)}
        title={isTTSEnabled ? 'Disable Voice Response' : 'Enable Voice Response'}
      >
        🔈
      </button>
    </div>
  </div>
);
}

export default Chatbot;