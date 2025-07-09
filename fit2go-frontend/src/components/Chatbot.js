import React, { useState, useRef, useEffect } from 'react';
import botAvatar from '../Fit2Go.jpg'; // Use your logo or a bot image

function isWorkoutRecommendationRequest(text) {
  const keywords = [
    'recommend', 'suggest', 'workout', 'exercise', 'routine', 'plan', 'give me a workout', 'what should I do', 'any workout', 'fitness idea'
  ];
  return keywords.some(k => text.toLowerCase().includes(k));
}
function isMealRecommendationRequest(text) {
  const keywords = [
    'meal', 'food', 'diet', 'nutrition', 'what should I eat', 'suggest a meal', 'recommend a meal', 'macro', 'protein', 'carbs', 'fat', 'calories', 'breakfast', 'lunch', 'dinner', 'snack'
  ];
  return keywords.some(k => text.toLowerCase().includes(k));
}

const Chatbot = ({ open, onClose, user, workouts, goals, onGoalAdd, onMealAdd }) => {
  const [messages, setMessages] = useState([
    { from: 'bot', text: `Hi${user?.name ? ', ' + user.name.split(' ')[0] : ''}! I am your Fit2Go AI assistant. How can I help you with your fitness today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingWorkout, setPendingWorkout] = useState(null);
  const [pendingMeal, setPendingMeal] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

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
    if (isMealRecommendationRequest(input)) {
      const prompt = `Suggest a personalized meal or nutrition plan for this user: ${user?.name || ''}, goals: ${goals.map(g=>g.type+':'+g.target+' '+g.unit).join(', ')}. Reply with a meal suggestion (title, description, macros if possible).`;
      const aiResponse = await fetchGeminiResponse(prompt);
      const lines = aiResponse.split('\n').filter(Boolean);
      let meal = null;
      if (lines.length > 0) {
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
    const aiResponse = await fetchGeminiResponse(input);
    setMessages(msgs => [...msgs, { from: 'bot', text: aiResponse }]);
    setInput('');
  };

  // --- UI ---
  // Floating button (always visible)
  if (!open) {
    return (
      <button
        className="fit2go-chatbot-fab"
        style={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          zIndex: 9998,
          background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: 60,
          height: 60,
          fontSize: 32,
          boxShadow: '0 4px 16px rgba(59,130,246,0.18)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'box-shadow 0.2s, transform 0.2s',
          animation: 'chat-fab-pop 0.5s',
        }}
        onClick={onClose ? onClose : () => {}}
        aria-label="Open Chatbot"
      >
        <span style={{fontSize: 28}}>💬</span>
      </button>
    );
  }

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
      </div>
    </div>
  );
};

export default Chatbot; 