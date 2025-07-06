import {Link, useState } from "react";
import "./Nutrition.css"; // Assuming you have a global CSS for all sections

function Nutrition() {
  // State for Section 1
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Section 2 State
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const macros = [
    { name: "Carbs", value: 120, goal: 150, color: "#28a745" },
    { name: "Protein", value: 88, goal: 100, color: "#007bff" },
    { name: "Fat", value: 45, goal: 55, color: "#ff9500" },
  ];

  const totalCalories = 2000;
  const consumedCalories = 1450;
  const waterIntake = 1.2;
  const waterGoal = 2.5;

  // Section 3 State
  const [activeTab, setActiveTab] = useState("Breakfast");

  const tabs = ["Breakfast", "Lunch", "Dinner", "Snacks"];
  const meals = [
    { name: "Greek Yogurt with Berries", description: "1 cup yogurt, 1/2 cup mixed berries", kcal: 220, protein: 18, carbs: 24, fat: 5 },
    { name: "Whole Grain Toast", description: "2 slices with avocado", kcal: 310, protein: 8, carbs: 30, fat: 15 },
  ];

  const recipes = [
    { name: "Protein-Packed Quinoa Bowl", tags: "High protein", kcal: 420 },
    { name: "Mediterranean Salad", tags: "Low carb", kcal: 310 },
    { name: "Grilled Chicken & Veggies", tags: "Balanced", kcal: 450 },
  ];

  // Section 4 Insights
  const insights = [
    {
      icon: "checkmark",
      title: "Protein Intake",
      description: "You’ve been consistently meeting your protein goals this week!",
      linkText: "View details",
      linkColor: "#007bff",
      backgroundColor: "#e6f4ea",
    },
    {
      icon: "exclamation",
      title: "Sugar Intake",
      description: "Your sugar intake is higher than recommended. Try reducing sugary snacks.",
      linkText: "View suggestions",
      linkColor: "#007bff",
      backgroundColor: "#fff3e6",
    },
    {
      icon: "water",
      title: "Hydration",
      description: "You’re 40% below your water intake goal. Remember to drink more water!",
      linkText: "Set reminder",
      linkColor: "#007bff",
      backgroundColor: "#e6f0ff",
    },
    {
      icon: "grid",
      title: "Meal Balance",
      description: "Your meals have good macronutrient balance. Keep up the good work!",
      linkText: "View analysis",
      linkColor: "#007bff",
      backgroundColor: "#f2e6ff",
    },
  ];

  // Section 5 Meal Plan and Insights
  const mealPlanItems = [
    "Increase protein intake to 120g daily",
    "Add post-workout protein shake with banana",
    "Include more complex carbs on training days",
    "Try our high-protein breakfast recipes",
  ];

  const progressInsightsItems = [
    "You’re 15% closer to your protein goals",
    "Calorie intake is consistent with muscle gain",
    "Consider adding more healthy fats to diet",
    "Your meal timing aligns well with workouts",
  ];

  return (
    <div>
      {/* Section 1: Header with Chat */}
      <header className="section1-header">
        <div className="logo">Fit2Go</div>
        <nav className="nav">
          <ul>
            <li><a href="#" className="active">Dashboard</a></li>
            <li><a href="#">Nutrition</a></li>
            <li><a href="#">Workouts</a></li>
            <li><a href="#">Progress</a></li>
          </ul>
        </nav>
        <div className="user-profile">
          <div className="chat-icon" onClick={toggleChat}></div>
          <div className="user-initials">JS</div>
          <span>John Smith</span>
        </div>
        {isChatOpen && (
          <div className="chat-window">
            <div className="chat-header">
              <h3>Chat Support</h3>
              <button className="close-chat" onClick={toggleChat}>×</button>
            </div>
            <div className="chat-body">
              <p>Chat support coming soon!</p>
            </div>
          </div>
        )}
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
                    <div key={index}>
                      {macro.name}: {macro.value}g
                    </div>
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
                style={{
                  width: `${(consumedCalories / totalCalories) * 100}%`,
                }}
              ></div>
            </div>
            <div className="calorie-goal">Goal: {totalCalories}</div>
            <div className="calorie-remaining">
              {totalCalories - consumedCalories} calories remaining
            </div>
          </div>
          <div className="water-intake">
            <div className="water-header">
              <div className="cloud-icon"></div>
              <h3>Water Intake</h3>
            </div>
            <div className="water-amount">{waterIntake}L</div>
            <div className="water-progress">
              <div
                className="progress-bar"
                style={{
                  width: `${(waterIntake / waterGoal) * 100}%`,
                }}
              ></div>
            </div>
            <div className="water-goal">of {waterGoal}L daily goal</div>
            <button>Add Water</button>
          </div>
        </div>
      </section>

      {/* Section 3: Today's Meals and Recipes */}
      <section className="section3-container">
        <div className="meals-recipes-grid">
          {/* Today's Meals Section */}
          <div className="todays-meals">
            <div className="meals-header">
              <h2>Today's Meals</h2>
              <button className="add-meal-btn">+ Add Meal</button>
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
              {meals.map((meal, index) => (
                <div key={index} className="meal-item">
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
                </div>
              ))}
              <button className="add-item-btn">+ Add Breakfast Item</button>
            </div>
          </div>

          {/* Find Recipes Section */}
          <div className="find-recipes">
            <h2>Find Recipes</h2>
            <input type="text" placeholder="Search for recipes..." className="search-bar" />
            <div className="filters">
              <h4>Popular Filters</h4>
              <div className="filter-tags">
                <span>High Protein</span>
                <span>Low Carb</span>
                <span>Vegetarian</span>
                <span>Quick & Easy</span>
                <span>Gluten Free</span>
              </div>
            </div>
            <div className="recipes">
              <h4>Recommended for You</h4>
              <div className="recipe-list">
                {recipes.map((recipe, index) => (
                  <div key={index} className="recipe-card">
                    <div className="recipe-icon"></div>
                    <div className="recipe-details">
                      <h4>{recipe.name}</h4>
                      <p>{recipe.tags} • {recipe.kcal} kcal</p>
                      <a href="#" className="view-recipe">View Recipe</a>
                    </div>
                  </div>
                ))}
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
            <div
              key={index}
              className="insight-card"
              style={{ backgroundColor: insight.backgroundColor }}
            >
              <div className="insight-icon">
                {/* Icon can be added based on insight.icon */}
              </div>
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

      {/* Section 5: Meal Plan and Progress Insights */}
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
    </div>
  );
}

export default Nutrition;
