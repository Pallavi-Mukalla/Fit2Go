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

const Chatbot = ({ open, onClose, user, workouts, goals, meals, onGoalAdd, onMealAdd, waterIntake, totalProtein, totalCarbs, totalFat, consumedCalories }) => {
  const [messages, setMessages] = useState([
    { from: 'bot', text: `Hi${user?.name ? ', ' + user.name.split(' ')[0] : ''}! I am your Fit2Go AI assistant. How can I help you with your fitness today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingWorkout, setPendingWorkout] = useState(null);
  const [pendingMeal, setPendingMeal] = useState(null);
  const messagesEndRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
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
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
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

  // --- Speak bot responses ---
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].from === 'bot') {
      speak(messages[messages.length - 1].text);
    }
    // eslint-disable-next-line
  }, [messages]);

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
    if (pendingMeal && input.toLowerCase().startsWith('yes')) {
      if (onMealAdd) {
        await onMealAdd(pendingMeal);
        setMessages(msgs => [...msgs, { from: 'bot', text: `Awesome! I've added "${pendingMeal.title}" to your meal plan.` }]);
      }
      setPendingMeal(null);
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
      // Try to extract a goal from the user's input
      const lowerInput = input.toLowerCase();
      let userGoal = '';
      if (lowerInput.includes('weight loss')) userGoal = 'weight loss';
      else if (lowerInput.includes('muscle gain')) userGoal = 'muscle gain';
      else if (lowerInput.includes('maintain')) userGoal = 'maintain current weight';
      else if (lowerInput.includes('energy')) userGoal = 'improve energy levels';
      // If no goal in input, try to use user's goals
      let goalText = userGoal || goals.map(g=>g.type+':'+g.target+' '+g.unit).join(', ');
      // If still no goal, use a default
      if (!goalText) goalText = 'weight loss';
      const prompt = `Suggest a variety of healthy meals or foods for ${goalText} (or based on the user's request). Do not ask the user for any personal information or dietary details. Respond casually and helpfully, as if chatting with a friend. Always provide a direct and varied suggestion.`;
      const aiResponse = await fetchGeminiResponse(prompt);
      // Only offer to add to meal plan if the response contains a real suggestion
      const lines = aiResponse.split('\n').filter(Boolean);
      let meal = null;
      // Heuristic: if the first line is a food/meal name and not a question/request
      if (lines.length > 0 && !/please specify|provide|can't|cannot|need more info|what is your goal|what are your goals|dietary restriction|preference/i.test(aiResponse)) {
        meal = {
          title: lines[0],
          description: lines.slice(1).join(' ')
        };
      }
      setMessages(msgs => [...msgs, { from: 'bot', text: aiResponse + (meal ? '\n\nWould you like to add this to your meal plan? (yes/no)' : '') }]);
      if (meal) setPendingMeal(meal);
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
      <div style={{ display: 'flex', borderTop: '1.5px solid #e0e7ff', background: 'rgba(255,255,255,0.95)', padding: 10, alignItems: 'center' }}>
        <input
          style={{
            flex: 1,
            border: 'none',
            padding: '12px 14px',
            fontSize: 16,
            borderRadius: 12,
            outline: 'none',
            background: 'rgba(243,244,246,0.7)',
            marginRight: 10,
            boxShadow: '0 1px 4px #e0e7ff',
            color: '#222'
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
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 16,
            padding: '10px 22px',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !input.trim() ? 0.7 : 1,
            boxShadow: '0 2px 8px #c7d2fe',
            transition: 'opacity 0.2s'
          }}
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >Send</button>
        <button
          style={{
            marginLeft: 8,
            background: isListening ? '#3B82F6' : '#e0e7ff',
            color: isListening ? 'white' : '#333',
            border: 'none',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            boxShadow: isListening ? '0 2px 8px #3B82F6' : '0 2px 8px #e0e7ff',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s'
          }}
          onClick={isListening ? stopListening : startListening}
          title={isListening ? 'Stop Listening' : 'Speak'}
        >
          {isListening ? '🎤' : '🎙️'}
        </button>
      </div>
    </div>
  );
};

export default Chatbot; 