// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth endpoints
  SIGNUP: `${API_BASE_URL}/signup`,
  LOGIN: `${API_BASE_URL}/login`,
  PROFILE: `${API_BASE_URL}/profile`,
  RESET_PASSWORD: `${API_BASE_URL}/api/reset-password`,
  
  // Meals endpoints
  MEALS: `${API_BASE_URL}/api/meals`,
  MEALS_COPY_YESTERDAY: `${API_BASE_URL}/api/meals/copy-yesterday`,
  
  // Water endpoints
  WATER: `${API_BASE_URL}/api/water`,
  
  // Workouts endpoints
  WORKOUTS: `${API_BASE_URL}/api/workouts`,
  WORKOUT_PLAN: `${API_BASE_URL}/api/workout-plan`,
  
  // Goals endpoints
  GOALS: `${API_BASE_URL}/api/goals`,
  
  // Recipes endpoints
  RECIPES: `${API_BASE_URL}/api/recipes`,
  
  // Conversations endpoints
  CONVERSATIONS: `${API_BASE_URL}/api/conversations`,
  
  // Groq Pose endpoints
  GROQ_POSE: `${API_BASE_URL}/api/groq-pose`,
  
  // GenAI endpoints
  GENAI: `${API_BASE_URL}/api/genai`,
};

export default API_ENDPOINTS; 