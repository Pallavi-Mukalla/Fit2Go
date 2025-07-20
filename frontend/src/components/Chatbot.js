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

const Chatbot = ({ open, onClose, user, userId, type, workouts, goals, meals, setMeals, onGoalAdd, onMealAdd, waterIntake, totalProtein, totalCarbs, totalFat, consumedCalories }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingWorkout, setPendingWorkout] = useState(null);
  const [pendingMeal, setPendingMeal] = useState(null);
  const messagesEndRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const recognitionRef = useRef(null);
  const [showPreviousChats, setShowPreviousChats] = useState(false);
  const [previousChats, setPreviousChats] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [hasUserMessages, setHasUserMessages] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);

  // Reset chatbot when opened
  useEffect(() => {
    if (open) {
      // Always start with a fresh welcome message when opened
      setMessages([{ from: 'bot', text: `Hi${user?.name ? ', ' + user.name.split(' ')[0] : ''}! I am your Fit2Go AI assistant. How can I help you with your fitness today?` }]);
      setCurrentConversationId(null);
      setHasUserMessages(false);
      setShowPreviousChats(false);
      setInput('');
      setPendingWorkout(null);
      setPendingMeal(null);
      
      // Debug logging
      console.log('Chatbot opened with:', { userId, type, user: user?._id, userName: user?.name });
    }
  }, [open, user?.name, userId, type]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Load previous conversations when chatbot opens or userId/type changes
  useEffect(() => {
    if (open && userId && type) {
      console.log('Loading previous chats with:', { userId, type });
      fetchPreviousChats();
    } else if (open) {
      console.log('Cannot load previous chats - missing:', { userId, type });
    }
  }, [open, userId, type]);

  // Fetch previous chats
  const fetchPreviousChats = async () => {
    if (!userId || !type) {
      console.log('Cannot fetch previous chats - missing userId or type:', { userId, type });
      return;
    }
    try {
      console.log('Fetching previous chats for:', { userId, type });
      const res = await fetch(`http://localhost:5000/api/conversations?userId=${userId}&type=${type}`);
      if (res.ok) {
        const data = await res.json();
        console.log('Previous chats loaded:', data.length);
        setPreviousChats(data || []);
      } else {
        console.error('Failed to fetch previous chats:', res.status, res.statusText);
      }
    } catch (err) {
      console.error('Error fetching previous chats:', err);
    }
  };

  // Text-to-Speech
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
  }, [messages, isTTSEnabled]);

  // Speech-to-Text
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
    
    const userMessage = { from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setHasUserMessages(true);
    
    // Handle direct context answers
    if (isRecentWorkoutRequest(input)) {
      if (workouts && workouts.length > 0) {
        const sorted = [...workouts].sort((a, b) => (b.date > a.date ? 1 : -1));
        const recent = sorted[0];
        const botMessage = { from: 'bot', text: `Your most recent workout was on ${recent.date}: ${recent.type} for ${recent.duration} min, ${recent.calories} calories.` };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const botMessage = { from: 'bot', text: "I couldn't find any recent workouts in your history." };
        setMessages(prev => [...prev, botMessage]);
      }
      setInput('');
      return;
    }

    if (isRecentMealRequest(input)) {
      if (meals && meals.length > 0) {
        const sorted = meals[0].date ? [...meals].sort((a, b) => (b.date > a.date ? 1 : -1)) : meals;
        const recent = sorted[0];
        const botMessage = { from: 'bot', text: `Your most recent meal was${recent.date ? ' on ' + recent.date : ''}: ${recent.name || recent.title} (${recent.kcal || '?'} kcal, P: ${recent.protein || '?'}g, C: ${recent.carbs || '?'}g, F: ${recent.fat || '?'}g).` };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const botMessage = { from: 'bot', text: "I couldn't find any recent meals in your history." };
        setMessages(prev => [...prev, botMessage]);
      }
      setInput('');
      return;
    }

    if (isGoalRequest(input)) {
      if (goals && goals.length > 0) {
        const lines = goals.map(g => `• ${g.type} goal: ${g.target} ${g.unit}${g.description ? ' (' + g.description + ')' : ''}${g.achieved ? ' [Achieved]' : ''}`);
        const botMessage = { from: 'bot', text: `Your current goals:\n${lines.join('\n')}` };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const botMessage = { from: 'bot', text: "You don't have any goals set yet. Would you like me to help you create some?" };
        setMessages(prev => [...prev, botMessage]);
      }
      setInput('');
      return;
    }

    if (pendingWorkout && input.toLowerCase().startsWith('yes')) {
      if (onGoalAdd) {
        await onGoalAdd(pendingWorkout);
        const botMessage = { from: 'bot', text: `Great! I've added "${pendingWorkout.title}" as a goal for you.` };
        setMessages(prev => [...prev, botMessage]);
      }
      setPendingWorkout(null);
      setInput('');
      return;
    }

    if (pendingWorkout && input.toLowerCase().startsWith('no')) {
      const botMessage = { from: 'bot', text: 'No problem! Let me know if you need anything else.' };
      setMessages(prev => [...prev, botMessage]);
      setPendingWorkout(null);
      setInput('');
      return;
    }

    if (pendingMeal && Array.isArray(pendingMeal) && input.toLowerCase() === 'yes') {
      try {
        for (const meal of pendingMeal) {
          const response = await fetch('http://localhost:5000/api/meals', {
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
          setMeals(prev => [...prev, savedMeal]);
        }

        const botMessage = { from: 'bot', text: "Awesome! I've added the meal plan to your day." };
        setMessages(prev => [...prev, botMessage]);
        setPendingMeal(null);
      } catch (err) {
        console.error('Error adding meals:', err);
        const botMessage = { from: 'bot', text: "Oops! Something went wrong while adding your meal plan." };
        setMessages(prev => [...prev, botMessage]);
      }
      setInput('');
      return;
    }

    if (pendingMeal && input.toLowerCase().startsWith('no')) {
      const botMessage = { from: 'bot', text: 'No worries! Ask me for another meal anytime.' };
      setMessages(prev => [...prev, botMessage]);
      setPendingMeal(null);
      setInput('');
      return;
    }
    
    if (isProteinIntakeRequest(input)) {
      const botMessage = { from: 'bot', text: `Today you've consumed ${totalProtein || 0}g of protein.` };
      setMessages(prev => [...prev, botMessage]);
      setInput('');
      return;
    }

    if (isCarbIntakeRequest(input)) {
      const botMessage = { from: 'bot', text: `Today you've consumed ${totalCarbs || 0}g of carbohydrates.` };
      setMessages(prev => [...prev, botMessage]);
      setInput('');
      return;
    }

    if (isFatIntakeRequest(input)) {
      const botMessage = { from: 'bot', text: `Today you've consumed ${totalFat || 0}g of fat.` };
      setMessages(prev => [...prev, botMessage]);
      setInput('');
      return;
    }

    if (isCalorieIntakeRequest(input)) {
      const botMessage = { from: 'bot', text: `Today you've consumed ${consumedCalories || 0} calories.` };
      setMessages(prev => [...prev, botMessage]);
      setInput('');
      return;
    }

    if (input.toLowerCase().includes('water intake') || input.includes('how much water')) {
      const water = typeof waterIntake === 'number' ? waterIntake : 0;
      const botMessage = { from: 'bot', text: `Your total water intake today is ${water} liters.` };
      setMessages(prev => [...prev, botMessage]);
      setInput('');
      return;
    }
    
    // Handle meal recommendations
    if (isMealRecommendationRequest(input)) {
      const lowerInput = input.toLowerCase();
      let userGoal = '';
      let isWeightGain = false;
      let isWeightLoss = false;
      
      if (lowerInput.includes('weight gain') || lowerInput.includes('gain weight') || lowerInput.includes('bulk') || lowerInput.includes('muscle gain')) {
        userGoal = 'weight gain';
        isWeightGain = true;
      } else if (lowerInput.includes('weight loss') || lowerInput.includes('lose weight') || lowerInput.includes('cut') || lowerInput.includes('slim')) {
        userGoal = 'weight loss';
        isWeightLoss = true;
      } else if (lowerInput.includes('maintain')) {
        userGoal = 'maintain current weight';
      } else if (lowerInput.includes('energy')) {
        userGoal = 'improve energy levels';
      } else {
        const userGoals = goals.map(g => g.type).join(', ');
        if (userGoals.includes('weight loss')) {
          userGoal = 'weight loss';
          isWeightLoss = true;
        } else if (userGoals.includes('muscle gain')) {
          userGoal = 'weight gain';
          isWeightGain = true;
        } else {
          userGoal = 'maintain current weight';
        }
      }

      const prompt = isWeightGain 
        ? `Suggest a high-calorie meal plan for weight gain and muscle building. Include:
- Higher calorie meals (600-800 kcal per meal)
- More protein (30-40g per meal)
- Healthy fats and complex carbs
- Calorie-dense foods like nuts, avocados, whole grains

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

Do not add extra text.`
        : isWeightLoss
        ? `Suggest a calorie-controlled meal plan for weight loss. Include:
- Lower calorie meals (300-500 kcal per meal)
- High protein (25-35g per meal)
- Low to moderate carbs
- Plenty of vegetables and fiber

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

Do not add extra text.`
        : `Suggest a balanced meal plan for ${userGoal}. Include:
- Balanced macronutrients
- Moderate calories (400-600 kcal per meal)
- Good protein sources
- Whole foods

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

Do not add extra text.`;

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
        setPendingMeal(mealsToAdd);
        const botMessage = { from: 'bot', text: aiResponse + '\n\nWould you like to add this full meal plan to your day? (yes/no)' };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const botMessage = { from: 'bot', text: aiResponse };
        setMessages(prev => [...prev, botMessage]);
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
      const botMessage = { from: 'bot', text: aiResponse + (workout ? '\n\nWould you like to add this as a goal? (yes/no)' : '') };
      setMessages(prev => [...prev, botMessage]);
      if (workout) setPendingWorkout(workout);
      setInput('');
      return;
    }

    // Default AI response
    const aiResponse = await fetchGeminiResponse(input);
    const botMessage = { from: 'bot', text: aiResponse };
    setMessages(prev => [...prev, botMessage]);
    setInput('');
  };

  const loadPreviousChat = (conversation) => {
    console.log('Loading previous chat:', conversation);
    if (conversation.messages && conversation.messages.length > 0) {
      const formattedMessages = conversation.messages.map(m => ({ 
        from: m.sender === 'bot' ? 'bot' : 'user', 
        text: m.text 
      }));
      console.log('Formatted messages:', formattedMessages.length);
      setMessages(formattedMessages);
      setCurrentConversationId(conversation._id);
      setHasUserMessages(true);
    } else {
      console.log('No messages found in conversation');
    }
    setShowPreviousChats(false);
  };

  const deletePreviousChat = async (conversationId, event) => {
    event.stopPropagation(); // Prevent loading the chat when clicking delete
    
    // Find the conversation to get its preview for the modal
    const conversation = previousChats.find(chat => chat._id === conversationId);
    setConversationToDelete(conversation);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!conversationToDelete) return;

    try {
      console.log('Deleting conversation:', conversationToDelete._id);
      const response = await fetch(`http://localhost:5000/api/conversations/${conversationToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        console.log('Conversation deleted successfully');
        // Remove from local state
        setPreviousChats(prev => prev.filter(chat => chat._id !== conversationToDelete._id));
        
        // If this was the currently loaded conversation, reset to welcome message
        if (currentConversationId === conversationToDelete._id) {
          setMessages([{ from: 'bot', text: `Hi${user?.name ? ', ' + user.name.split(' ')[0] : ''}! I am your Fit2Go AI assistant. How can I help you with your fitness today?` }]);
          setCurrentConversationId(null);
          setHasUserMessages(false);
        }
      } else {
        console.error('Failed to delete conversation:', response.status, response.statusText);
        alert('Failed to delete conversation. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      alert('Error deleting conversation. Please try again.');
    } finally {
      setShowDeleteConfirm(false);
      setConversationToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setConversationToDelete(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getConversationPreview = (conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return 'No messages';
    }
    
    const firstUserMessage = conversation.messages.find(m => m.sender === 'user');
    if (!firstUserMessage) {
      return 'No user messages';
    }
    
    const text = firstUserMessage.text.toLowerCase();
    if (text.includes('meal') && text.includes('weight loss')) {
      return 'Meal for weight loss';
    } else if (text.includes('meal') && text.includes('weight gain')) {
      return 'Meal for weight gain';
    } else if (text.includes('workout') || text.includes('exercise')) {
      return 'Workout recommendation';
    } else if (text.includes('goal')) {
      return 'Goal discussion';
    } else if (text.includes('protein') || text.includes('carbs') || text.includes('calories')) {
      return 'Nutrition info';
    } else {
      return firstUserMessage.text.substring(0, 30) + (firstUserMessage.text.length > 30 ? '...' : '');
    }
  };

  const saveConversation = async (msgs) => {
    console.log('Attempting to save conversation with:', { 
      userId, 
      type, 
      hasUserMessages: msgs.some(m => m.from === 'user'),
      messageCount: msgs.length,
      currentConversationId 
    });
    
    if (!userId || !type || !msgs.some(m => m.from === 'user')) {
      console.log('Skipping save - missing userId, type, or no user messages');
      console.log('Details:', { 
        userId: userId || 'undefined', 
        type: type || 'undefined', 
        userMessages: msgs.filter(m => m.from === 'user').length 
      });
      return;
    }

    try {
      console.log('Saving conversation:', { userId, type, messageCount: msgs.length });
      
      const conversationData = {
        userId,
        type,
        messages: msgs.map(m => ({ sender: m.from, text: m.text }))
      };

      let response;
      if (currentConversationId) {
        console.log('Updating existing conversation:', currentConversationId);
        response = await fetch(`http://localhost:5000/api/conversations/${currentConversationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(conversationData)
        });
      } else {
        console.log('Creating new conversation');
        response = await fetch('http://localhost:5000/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(conversationData)
        });
      }

      if (response.ok) {
        const savedConversation = await response.json();
        console.log('Conversation saved successfully:', savedConversation._id);
        
        if (!currentConversationId) {
          setCurrentConversationId(savedConversation._id);
        }
        
        // Refresh previous chats list
        await fetchPreviousChats();
      } else {
        console.error('Failed to save conversation:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Error saving conversation:', err);
    }
  };

  const startNewChat = async () => {
    // Save previous chat if needed
    if (hasUserMessages && messages.length > 1) {
      await saveConversation(messages);
    }
    
    // Reset to welcome message
    setMessages([{ from: 'bot', text: `Hi${user?.name ? ', ' + user.name.split(' ')[0] : ''}! I am your Fit2Go AI assistant. How can I help you with your fitness today?` }]);
    setCurrentConversationId(null);
    setHasUserMessages(false);
    setShowPreviousChats(false);
  };

  const handleClose = async () => {
    if (hasUserMessages && messages.length > 1) {
      await saveConversation(messages);
    }
    if (onClose) onClose();
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
        {/* New Chat Icon */}
        <button
          style={{
            marginLeft: 'auto',
            marginRight: 8,
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: 20,
            cursor: 'pointer',
            padding: 4,
            borderRadius: 4,
            opacity: 0.8,
            transition: 'opacity 0.2s'
          }}
          onClick={startNewChat}
          title="New Chat"
        >
          🆕
        </button>
        {/* Previous Chats Icon */}
        <button
          style={{
            marginRight: 8,
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: 20,
            cursor: 'pointer',
            padding: 4,
            borderRadius: 4,
            opacity: 0.8,
            transition: 'opacity 0.2s'
          }}
          onClick={() => setShowPreviousChats(!showPreviousChats)}
          title="Previous Chats"
        >
          📚
        </button>
        <span
          style={{ fontSize: 26, cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.2s' }}
          onClick={handleClose}
          title="Close"
        >×</span>
      </div>

      {/* Previous Chats Dropdown */}
      {showPreviousChats && (
        <div style={{
          position: 'absolute',
          top: 60,
          right: 0,
          width: 300,
          maxHeight: 200,
          background: 'white',
          border: '1px solid #e0e7ff',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 10000,
          overflowY: 'auto'
        }}>
          <div style={{ padding: 12, borderBottom: '1px solid #e0e7ff', fontWeight: 600, color: '#333' }}>
            Previous Chats
          </div>
          {previousChats.length > 0 ? (
            previousChats.map((chat, index) => (
              <div
                key={chat._id || index}
                style={{
                  padding: 12,
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onClick={() => loadPreviousChat(chat)}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8f9ff'}
                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#333', marginBottom: 4 }}>
                    {formatDate(chat.createdAt)}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {getConversationPreview(chat)}
                  </div>
                </div>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff6b6b',
                    fontSize: 16,
                    cursor: 'pointer',
                    padding: 4,
                    borderRadius: 4,
                    opacity: 0.7,
                    transition: 'opacity 0.2s',
                    marginLeft: 8,
                    flexShrink: 0
                  }}
                  onClick={(e) => deletePreviousChat(chat._id, e)}
                  onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                  onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
                  title="Delete conversation"
                >
                  🗑️
                </button>
              </div>
            ))
          ) : (
            <div style={{ padding: 12, color: '#666', textAlign: 'center' }}>
              No previous chats
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 24,
            maxWidth: 400,
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e0e7ff',
            animation: 'modal-in 0.3s ease-out'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <span style={{ fontSize: 20, color: 'white' }}>⚠️</span>
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#333'
                }}>
                  Delete Conversation
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: 14,
                  color: '#666'
                }}>
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Content */}
            <div style={{ marginBottom: 24 }}>
              <p style={{
                margin: 0,
                fontSize: 15,
                color: '#333',
                lineHeight: 1.5
              }}>
                Are you sure you want to delete this conversation?
              </p>
              {conversationToDelete && (
                <div style={{
                  marginTop: 12,
                  padding: 12,
                  background: '#f8f9ff',
                  borderRadius: 8,
                  border: '1px solid #e0e7ff'
                }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#333',
                    marginBottom: 4
                  }}>
                    {formatDate(conversationToDelete.createdAt)}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    "{getConversationPreview(conversationToDelete)}"
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={cancelDelete}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #e0e7ff',
                  background: 'white',
                  color: '#666',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8f9ff'}
                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
                  color: 'white',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Delete Conversation
              </button>
            </div>
          </div>
        </div>
      )}

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
};

export default Chatbot;