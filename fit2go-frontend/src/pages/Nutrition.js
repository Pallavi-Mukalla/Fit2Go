import React, { useEffect, useState } from "react";
import "./Nutrition.css";
import { useNavigate } from 'react-router-dom';
import Chatbot from '../components/Chatbot';
import Popup from '../components/Popup';

function Nutrition() {
  const [user, setUser] = useState(null);
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [meals, setMeals] = useState([]);
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [isDoneConfirmModalOpen, setIsDoneConfirmModalOpen] = useState(false);
  const [mealToMarkDone, setMealToMarkDone] = useState(null);
  const [dontShowDoneWarning, setDontShowDoneWarning] = useState(
    localStorage.getItem('dontShowDoneWarning') === 'true'
  );
  const [newMeal, setNewMeal] = useState({
    name: "",
    description: "",
    kcal: "",
    protein: "",
    carbs: "",
    fat: ""
  });
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [waterIntakeEntries, setWaterIntakeEntries] = useState([]);
  const [newWaterAmount, setNewWaterAmount] = useState('');
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Totals: count only meals marked as done
  const totalProtein = meals.reduce((sum, m) => m.checked ? sum + (m.protein || 0) : sum, 0);
  const totalCarbs = meals.reduce((sum, m) => m.checked ? sum + (m.carbs || 0) : sum, 0);
  const totalFat = meals.reduce((sum, m) => m.checked ? sum + (m.fat || 0) : sum, 0);
  const consumedCalories = meals.reduce((sum, m) => m.checked ? sum + (m.kcal || 0) : sum, 0);

  // Fetch meals for the current day
  const fetchMeals = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/meals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMeals(data.map(m => ({ ...m, checked: m.checked || false })));
      } else {
        const text = await res.text();
        console.error('Failed to fetch meals:', text);
        alert('Failed to fetch meals: Server returned an error');
      }
    } catch (err) {
      console.error('Error fetching meals:', err);
      alert('Error fetching meals: ' + err.message);
    }
  };

  // Fetch water intake for the current day
  const fetchWater = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/water', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWaterIntakeEntries(data);
      } else {
        const text = await res.text();
        console.error('Failed to fetch water entries:', text);
        alert('Failed to fetch water entries: Server returned an error');
      }
    } catch (err) {
      console.error('Error fetching water entries:', err);
      alert('Error fetching water entries: ' + err.message);
    }
  };

  // Reset meals and water intake if the date has changed
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = localStorage.getItem('nutritionDate');
    if (lastDate !== today) {
      setMeals([]);
      setWaterIntakeEntries([]);
      localStorage.setItem('nutritionDate', today);
    }
    fetchMeals();
    fetchWater();
  }, []);

  // Fetch profile
  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          console.error('Failed to fetch profile:', await res.text());
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }
    fetchProfile();
  }, []);

  // Fetch workouts and goals
  useEffect(() => {
    async function fetchWorkouts() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/workouts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setWorkouts(data);
        } else {
          console.error('Failed to fetch workouts:', await res.text());
        }
      } catch (err) {
        console.error('Error fetching workouts:', err);
      }
    }
    async function fetchGoals() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/goals', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setGoals(data);
        } else {
          console.error('Failed to fetch goals:', await res.text());
        }
      } catch (err) {
        console.error('Error fetching goals:', err);
      }
    }
    fetchWorkouts();
    fetchGoals();
  }, []);

 const handleMealAdd = async (meal) => {
  const text = (meal.description || '') + ' ' + (meal.title || '');

  // Try to decide which tab
  let tab = "Lunch"; // default
  if (/breakfast/i.test(text)) tab = "Breakfast";
  else if (/dinner|supper/i.test(text)) tab = "Dinner";
  else if (/snack|nuts|parfait|yogurt|smoothie/i.test(text)) tab = "Snacks";
  else if (/lunch/i.test(text)) tab = "Lunch";

  // Extract numbers
  const proteinMatch = text.match(/P:\s*(\d+)/i);
  const carbsMatch = text.match(/C:\s*(\d+)/i);
  const fatMatch = text.match(/F:\s*(\d+)/i);
  const kcalMatch = text.match(/(\d+)\s*kcal/i);

  const mealWithParsed = {
    ...meal,
    name: meal.title || meal.name || "Suggested Meal",
    tab,
    protein: proteinMatch ? parseInt(proteinMatch[1]) : 0,
    carbs: carbsMatch ? parseInt(carbsMatch[1]) : 0,
    fat: fatMatch ? parseInt(fatMatch[1]) : 0,
    kcal: kcalMatch ? parseInt(kcalMatch[1]) : 0,
    checked: false,
    date: new Date().toISOString().slice(0,10)
  };

  console.log("Meal added:", mealWithParsed);
  setMeals(prev => [...prev, mealWithParsed]);
};



  // Copy yesterday's meals
  const handleCopyYesterdayMeals = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to copy meals');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/meals/copy-yesterday', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      if (res.ok) {
        const copied = await res.json();
        setMeals(copied.map(m => ({ ...m, checked: false })));
        setPopupMessage('Meals copied successfully');
        setShowPopup(true);
      } else {
        const text = await res.text();
        try {
          const error = JSON.parse(text);
          console.error('Failed to copy meals:', error);
          alert(error.message || 'Failed to copy meals');
        } catch {
          console.error('Failed to copy meals: Non-JSON response:', text);
          alert('Failed to copy meals: Server returned an error');
        }
      }
    } catch (err) {
      console.error('Error copying meals:', err);
      alert('Error copying meals: ' + err.message);
    }
  };

  // Mark meal as done (irreversible)
  const markMealDone = async (meal) => {
    if (!meal.checked) {
      if (dontShowDoneWarning) {
        await confirmMarkMealDone(meal);
      } else {
        setMealToMarkDone(meal);
        setIsDoneConfirmModalOpen(true);
      }
    }
  };

  // Confirm marking meal as done
  const confirmMarkMealDone = async (meal) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/meals/${meal._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      });
      if (res.ok) {
        setMeals(prev =>
          prev.map(m => m._id === meal._id ? { ...m, checked: true } : m)
        );
        setIsDoneConfirmModalOpen(false);
        setMealToMarkDone(null);
        setPopupMessage('Meal marked as done');
        setShowPopup(true);
      } else {
        const text = await res.text();
        try {
          const error = JSON.parse(text);
          console.error('Failed to mark meal as done:', error);
          alert(error.message || 'Failed to mark meal as done');
        } catch {
          console.error('Failed to mark meal as done: Non-JSON response:', text);
          alert('Failed to mark meal as done: Server returned an error');
        }
      }
    } catch (err) {
      console.error('Error marking meal as done:', err);
      alert('Error marking meal as done: ' + err.message);
    }
  };

  // Handle "Don't show again" checkbox
  const handleDontShowAgain = (e) => {
    const checked = e.target.checked;
    setDontShowDoneWarning(checked);
    localStorage.setItem('dontShowDoneWarning', checked);
  };

  // Delete meal
  const handleDeleteMeal = async (mealId) => {
    const token = localStorage.getItem('token');
    if (!mealId) {
      console.error('Invalid meal ID:', mealId);
      alert('Invalid meal ID');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/meals/${mealId}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      if (res.ok) {
        setMeals(prev => prev.filter(m => m._id !== mealId));
        setPopupMessage('Meal deleted successfully');
        setShowPopup(true);
      } else {
        const text = await res.text();
        try {
          const error = JSON.parse(text);
          console.error('Failed to delete meal:', error);
          alert(error.message || 'Failed to delete meal');
        } catch {
          console.error('Failed to delete meal: Non-JSON response:', text);
          alert('Failed to delete meal: Server returned an error');
        }
      }
    } catch (err) {
      console.error('Error deleting meal:', err);
      alert('Error deleting meal: ' + err.message);
    }
  };

  // Add meal
  const handleSaveMeal = async (recipe = null) => {
    const token = localStorage.getItem('token');
    try {
      const mealData = recipe ? {
        tab: activeTab,
        name: recipe.name,
        description: recipe.description,
        kcal: parseInt(recipe.kcal, 10) || 0,
        protein: parseInt(recipe.protein, 10) || 0,
        carbs: parseInt(recipe.carbs, 10) || 0,
        fat: parseInt(recipe.fat, 10) || 0
      } : {
        tab: activeTab,
        name: newMeal.name,
        description: newMeal.description,
        kcal: parseInt(newMeal.kcal, 10) || 0,
        protein: parseInt(newMeal.protein, 10) || 0,
        carbs: parseInt(newMeal.carbs, 10) || 0,
        fat: parseInt(newMeal.fat, 10) || 0
      };
      const res = await fetch('http://localhost:5000/api/meals', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(mealData)
      });
      if (res.ok) {
        const saved = await res.json();
        setMeals(prev => [...prev, { ...saved, checked: false }]);
        setIsAddMealModalOpen(false);
        setNewMeal({ name: "", description: "", kcal: "", protein: "", carbs: "", fat: "" });
        setPopupMessage('Meal added successfully');
        setShowPopup(true);
      } else {
        const text = await res.text();
        try {
          const error = JSON.parse(text);
          console.error('Failed to add meal:', error);
          alert(error.message || 'Failed to add meal');
        } catch {
          console.error('Failed to add meal: Non-JSON response:', text);
          alert('Failed to add meal: Server returned an error');
        }
      }
    } catch (err) {
      console.error('Error adding meal:', err);
      alert('Error adding meal: ' + err.message);
    }
  };

  // Add water
  const handleAddWater = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/water', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          amount: parseFloat(newWaterAmount), 
          date: new Date().toISOString().slice(0, 10) 
        })
      });
      if (res.ok) {
        const savedWater = await res.json();
        setWaterIntakeEntries(prev => [...prev, savedWater]);
        setNewWaterAmount('');
        setPopupMessage('Water added successfully');
        setShowPopup(true);
      } else {
        const text = await res.text();
        try {
          const error = JSON.parse(text);
          console.error('Failed to add water:', error);
          alert(error.message || 'Failed to add water');
        } catch {
          console.error('Failed to add water: Non-JSON response:', text);
          alert('Failed to add water: Server returned an error');
        }
      }
    } catch (err) {
      console.error('Error adding water:', err);
      alert('Error adding water: ' + err.message);
    }
  };

  // Fetch recipes
  const fetchRecipesByFilter = async (filter) => {
    setRecommendedRecipes([]);
    setIsLoadingRecipes(true);
    try {
      const res = await fetch('http://localhost:5000/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendedRecipes(data);
      } else {
        const text = await res.text();
        console.error('Failed to get recipes:', text);
        alert('Failed to fetch recipes: Server returned an error');
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
      alert('Error fetching recipes: ' + err.message);
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  // Handle goal from chatbot
  const handleAddGoalFromChatbot = async (goal) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found. User must be logged in.');
      alert('Please log in to add goals');
      return;
    }
    const goalData = {
      type: 'fitness',
      target: goal.duration,
      unit: 'minutes',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      description: goal.title,
    };
    try {
      const res = await fetch('http://localhost:5000/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(goalData),
      });
      if (res.ok) {
        const data = await res.json();
        setGoals((prevGoals) => [data.goal, ...prevGoals]);
        setPopupMessage('Goal added successfully');
        setShowPopup(true);
      } else {
        const text = await res.text();
        try {
          const error = JSON.parse(text);
          console.error('Failed to add goal:', error);
          alert(error.message || 'Failed to add goal');
        } catch {
          console.error('Failed to add goal: Non-JSON response:', text);
          alert('Failed to add goal: Server returned an error');
        }
      }
    } catch (err) {
      console.error('Error adding goal:', err);
      alert('Error adding goal: ' + err.message);
    }
  };

  // Loading progress for recipes
  useEffect(() => {
    let interval;
    if (isLoadingRecipes) {
      setLoadingProgress(0);
      interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 90) {
            const increment = Math.floor(Math.random() * 2) + 1;
            return Math.min(prev + increment, 90);
          }
          return prev;
        });
      }, 200);
    } else {
      setLoadingProgress(100);
      setTimeout(() => setLoadingProgress(0), 300);
    }
    return () => clearInterval(interval);
  }, [isLoadingRecipes]);

  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const macros = [
    { name: "Carbs", value: totalCarbs, goal: 150, color: "#28a745" },
    { name: "Protein", value: totalProtein, goal: 100, color: "#007bff" },
    { name: "Fat", value: totalFat, goal: 55, color: "#ff9500" },
  ];
  const totalCalories = 2000;
  const waterGoal = 2.5;

  const [activeTab, setActiveTab] = useState("Breakfast");
  const tabs = ["Breakfast", "Lunch", "Dinner", "Snacks"];

  const dailyWater = waterIntakeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const remainingWater = waterGoal - dailyWater;
  const totalSugar = meals.reduce((sum, meal) => meal.checked ? sum + (meal.sugar || 0) : sum, 0);
  const proteinGoal = 100;
  const carbsGoal = 150;
  const fatGoal = 55;

  const insights = [
    {
      title: "Protein Intake",
      description: totalProtein >= proteinGoal 
        ? "You've been consistently meeting your protein goals today!"
        : `You're below your protein goal by ${proteinGoal - totalProtein}g.`,
      linkText: "View details",
      linkColor: "#007bff",
      backgroundColor: totalProtein >= proteinGoal ? "#e6f4ea" : "#fff3e6"
    },
    {
      title: "Sugar Intake",
      description: totalSugar > 50
        ? "Your sugar intake is higher than recommended. Try reducing sugary snacks."
        : "Your sugar intake is within recommended levels. Good job!",
      linkText: "View details",
      linkColor: "#007bff",
      backgroundColor: totalSugar > 50 ? "#fff3e6" : "#e6f4ea"
    },
    {
      title: "Hydration",
      description: remainingWater > 0
        ? `You're ${Math.round((remainingWater / waterGoal) * 100)}% below your water intake goal. Drink more water!`
        : "You've reached your water intake goal today!",
      linkText: "view hydration",
      linkColor: "#007bff",
      backgroundColor: remainingWater > 0 ? "#e6f0ff" : "#e6f4ea"
    },
    {
      title: "Meal Balance",
      description: (totalCarbs <= carbsGoal && totalProtein <= proteinGoal && totalFat <= fatGoal)
        ? "Your meals have good macronutrient balance. Keep it up!"
        : "Your macros are off balance today. Try adjusting meal portions.",
      linkText: "View analysis",
      linkColor: "#007bff",
      backgroundColor: (totalCarbs <= carbsGoal && totalProtein <= proteinGoal && totalFat <= fatGoal) ? "#f2e6ff" : "#fff3e6"
    }
  ];

  const mealPlanItems = [
    "Increase protein intake to 120g daily",
    "Add post-workout protein shake with banana",
    "Include more complex carbs on training days",
    "Try our high-protein breakfast recipes",
  ];
  const progressInsightsItems = [
    "You're 15% closer to your protein goals",
    "Calorie intake is consistent with muscle gain",
    "Consider adding more healthy fats to diet",
    "Your meal timing aligns well with workouts",
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('dontShowDoneWarning');
    navigate('/login');
  };

  const handleProfileClick = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <div>
      {/* Popup Component */}
      {showPopup && (
        <Popup
          message={popupMessage}
          onClose={() => setShowPopup(false)}
        />
      )}

      {/* Section 1: Header */}
      <header className="section1-header">
        <div className="logo">Fit2Go</div>
        <nav className="nav">
          <ul>
            <li><button onClick={() => navigate('/dashboard')}>Dashboard</button></li>
            <li><button onClick={() => navigate('/fitness')}>Workouts</button></li>
          </ul>
        </nav>
        <div
          className="user-profile"
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={handleProfileClick}
        >
          <div className="user-initials">{initials}</div>
          <span>{user ? user.name : 'Guest'}</span>
          {showDropdown && (
            <div style={{
              position: 'absolute', top: '100%', right: 0,
              background: 'white', border: '1px solid #ccc',
              borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 10, minWidth: '120px', padding: '8px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'stretch'
            }}>
              <span
                style={{
                  padding: '10px 20px', cursor: 'pointer', color: '#333',
                  fontWeight: 500, borderRadius: '4px', transition: 'background 0.2s',
                  textAlign: 'left'
                }}
                onClick={e => { e.stopPropagation(); navigate('/profile'); setShowDropdown(false); }}
                onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'}
                onMouseOut={e => e.currentTarget.style.background = 'white'}
              >
                Profile
              </span>
              <span
                style={{
                  padding: '10px 20px', cursor: 'pointer', color: '#333',
                  fontWeight: 500, borderRadius: '4px', transition: 'background 0.2s',
                  textAlign: 'left'
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

      {/* Section 2: Today's Nutrition */}
      <section className="section2-nutrition">
        <h2>Today's Nutrition</h2>
        <div className="nutrition-grid">
          <div className="macros">
            <div
              className="progress-circle"
              onMouseEnter={() => setIsTooltipVisible(true)}
              onMouseLeave={() => setIsTooltipVisible(false)}
            >
              <div className="circle-inner">
                <span className="circle-label">Macros</span>
              </div>
              {isTooltipVisible && (
                <div className="tooltip">
                  {macros.map((macro, index) => (
                    <div key={index}>{macro.name}: {macro.value}g</div>
                  ))}
                </div>
              )}
            </div>
            <div className="macros-details">
              {macros.map((macro, index) => (
                <p key={index}>
                  {macro.name} <span>{macro.value}g</span> Goal: {macro.goal}g
                </p>
              ))}
            </div>
          </div>
          <div className="calories">
            <h3>Calories</h3>
            <div className="calorie-count">{consumedCalories}</div>
            <div className="calorie-progress">
              <div
                className="progress-bar"
                style={{ width: `${(consumedCalories / totalCalories) * 100}%` }}
              ></div>
            </div>
            <div className="calorie-goal">Goal: {totalCalories}</div>
            <div className="calorie-remaining">{totalCalories - consumedCalories} calories remaining</div>
          </div>
          <div className="water-intake">
            <div className="water-header">
              <div className="cloud-icon"></div>
              <h3>Water Intake</h3>
            </div>
            <div className="water-amount">{dailyWater.toFixed(1)} L</div>
            <div className="water-progress">
              <div
                className="progress-bar"
                style={{ width: `${(dailyWater / waterGoal) * 100}%` }}
              ></div>
            </div>
            <div className="water-goal">of {waterGoal}L daily goal</div>
            <input
              type="number"
              step="0.1"
              placeholder="Add water (L)"
              value={newWaterAmount}
              onChange={e => setNewWaterAmount(e.target.value)}
            />
            <button onClick={handleAddWater}>Add Water</button>
          </div>
        </div>
      </section>

      {/* Section 3: Today's Meals and Recipes */}
      <section className="section3-container">
        <div className="meals-recipes-grid">
          <div className="todays-meals">
            <div className="meals-header">
              <h2>Today's Meals</h2>
              <div>
                <button className="add-meal-btn" onClick={() => setIsAddMealModalOpen(true)}>+ Add Meal</button>
                <button className="copy-meals-btn" onClick={handleCopyYesterdayMeals}>Copy Yesterday</button>
              </div>
            </div>
            <div className="tabs">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={tab === activeTab ? "active" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="meal-list">
              {meals.filter(meal => meal.tab === activeTab).length > 0 ? (
                meals.filter(meal => meal.tab === activeTab).map((meal, index) => (
                  <div key={meal._id || index} className={`meal-item ${meal.checked ? 'done' : ''}`}>
                    <div className="meal-icon"></div>
                    <div className="meal-details">
                      <h4>{meal.name}</h4>
                      <p>{meal.description}</p>
                      <div className="meal-nutrition">
                        <span>P: {meal.protein}g</span>
                        <span>C: {meal.carbs}g</span>
                        <span>F: {meal.fat}g</span>
                      </div>
                    </div>
                    <div className="meal-kcal">{meal.kcal} kcal</div>
                    <div className="meal-actions">
                      {!meal.checked && (
                        <button
                          className="done-btn"
                          onClick={() => markMealDone(meal)}
                        >
                          Done
                        </button>
                      )}
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteMeal(meal._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No meals added yet. Add a meal or copy yesterday's meals.</p>
              )}
            </div>
          </div>

          <div className="find-recipes">
            <h2>Find Recipes</h2>
            <input
              type="text"
              placeholder="Search for recipes..."
              className="search-bar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={() => fetchRecipesByFilter(searchQuery)}>Search</button>
            <div className="filters">
              <h4>Popular Filters</h4>
              <div className="filter-tags">
                <span onClick={() => fetchRecipesByFilter('High Protein')}>High Protein</span>
                <span onClick={() => fetchRecipesByFilter('Low Carb')}>Low Carb</span>
                <span onClick={() => fetchRecipesByFilter('Vegetarian')}>Vegetarian</span>
                <span onClick={() => fetchRecipesByFilter('Quick & Easy')}>Quick & Easy</span>
                <span onClick={() => fetchRecipesByFilter('Gluten Free')}>Gluten Free</span>
              </div>
            </div>
            <div className="recipes">
              <h4>Recommended for You</h4>
              {isLoadingRecipes && (
                <div className="loader-container">
                  <svg className="progress-ring" width="80" height="80">
                    <circle
                      className="progress-ring__circle"
                      stroke="#007bff"
                      strokeWidth="8"
                      fill="transparent"
                      r="35"
                      cx="40"
                      cy="40"
                      style={{
                        strokeDasharray: 2 * Math.PI * 35,
                        strokeDashoffset: 2 * Math.PI * 35 * (1 - loadingProgress / 100),
                        transition: 'stroke-dashoffset 0.1s linear'
                      }}
                    />
                  </svg>
                  <div className="loader-text">{loadingProgress}%</div>
                </div>
              )}
              <div className="recipe-list">
                {recommendedRecipes.length > 0 ? recommendedRecipes.map((recipe, index) => (
                  <div key={index} className="recipe-card">
                    <div className="recipe-icon"></div>
                    <div className="recipe-details">
                      <h4>{recipe.name}</h4>
                      <p>{recipe.description} • {recipe.kcal} kcal</p>
                      <div className="meal-nutrition">
                        <span>P: {recipe.protein}g</span>
                        <span>C: {recipe.carbs}g</span>
                        <span>F: {recipe.fat}g</span>
                      </div>
                      <button
                        onClick={() => handleSaveMeal(recipe)}
                      >
                        Add to Meals
                      </button>
                    </div>
                  </div>
                )) : <div>No recommendations yet. Click a filter above!</div>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Nutrition Insights */}
      <section className="section4-container">
        <h2>Your Nutrition Insights</h2>
        <div className="insights-grid">
          {insights.map((insight, index) => (
            <div key={index} className="insight-card" style={{ backgroundColor: insight.backgroundColor }}>
              <div className="insight-icon"></div>
              <div className="insight-content">
                <h3>{insight.title}</h3>
                <p>{insight.description}</p>
                <a href="#" className="insight-link" style={{ color: insight.linkColor }}>
                  {insight.linkText}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: Meal Plan and Progress */}
      <section className="section5-container">
        <div className="meal-plan">
          <h2>Meal Plan</h2>
          <ul>
            {mealPlanItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="progress-insights">
          <h2>Progress Insights</h2>
          <ul>
            {progressInsightsItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Add Meal Modal */}
      {isAddMealModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Meal to {activeTab}</h3>
            <input type="text" placeholder="Meal Name" value={newMeal.name} onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })} />
            <input type="text" placeholder="Description" value={newMeal.description} onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })} />
            <input type="number" placeholder="Calories" value={newMeal.kcal} onChange={(e) => setNewMeal({ ...newMeal, kcal: e.target.value })} />
            <input type="number" placeholder="Protein (g)" value={newMeal.protein} onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })} />
            <input type="number" placeholder="Carbs (g)" value={newMeal.carbs} onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })} />
            <input type="number" placeholder="Fat (g)" value={newMeal.fat} onChange={(e) => setNewMeal({ ...newMeal, fat: e.target.value })} />
            <div className="modal-buttons">
              <button onClick={() => handleSaveMeal()}>Save</button>
              <button onClick={() => setIsAddMealModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Done Confirmation Modal */}
      {isDoneConfirmModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Marking Meal as Done</h3>
            <p>Marking this meal as done is irreversible. Are you sure you want to proceed?</p>
            <label>
              <input
                type="checkbox"
                checked={dontShowDoneWarning}
                onChange={handleDontShowAgain}
              />
              Don't show this warning again
            </label>
            <div className="modal-buttons">
              <button onClick={() => confirmMarkMealDone(mealToMarkDone)}>Confirm</button>
              <button onClick={() => {
                setIsDoneConfirmModalOpen(false);
                setMealToMarkDone(null);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Chatbot
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        user={user}
        meals={meals}
        workouts={workouts}
        goals={goals}
        onGoalAdd={handleAddGoalFromChatbot}
        setMeals={setMeals}  
         onMealAdd={handleMealAdd}
        waterIntake={dailyWater}
        totalProtein={totalProtein}
        totalCarbs={totalCarbs}
        totalFat={totalFat}
        consumedCalories={consumedCalories}
      />

      {!isChatOpen && (
        <button
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
          onClick={() => setIsChatOpen(true)}
          aria-label="Open Chatbot"
        >
          <span style={{fontSize: 28}}>💬</span>
        </button>
      )}
    </div>
  );
}

export default Nutrition;