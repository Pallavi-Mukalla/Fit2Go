# FIT2GO 
A Fitness and Nutrition tracking web application.
---
## 🚀 Tech Stack
- Frontend: React 
- Backend: Node.js + Express
- Database: MongoDB
---
## 🛠 Setup

Clone the repository:

```bash
git clone https://github.com/YourUsernam/fit2go.git
cd fit2go
```

🛠 Install Backend Dependencies:

```bash
npm install
```

🛠 Install Frontend Dependencies:

```bash
cd fit2go-frontend
npm install
```

▶️ Run backend

```bash
node server.js
```
▶️ Run frontend

```bash
cd fit2go-frontend
npm start
```

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
PEXELS_API_KEY=your_pexels_api_key
```

## 🏋️ Form Checking Feature

The application includes an AI-powered form checking feature using Groq's Llama model:

### How to Use:
1. Navigate to the Fitness page
2. In the workout plan, click "Check my form" next to any exercise
3. Upload an image of yourself performing the exercise
4. The AI will analyze your form and provide detailed feedback

### Features:
- **Real-time Analysis**: Uses Groq's Llama 4 Scout model for accurate form assessment
- **Detailed Feedback**: Provides specific improvements and corrections
- **Safety Assessment**: Identifies potential safety concerns
- **Visual Feedback**: Color-coded results (green for good, yellow for needs improvement, red for errors)

### Supported Image Formats:
- JPEG, PNG, GIF, WebP
- Maximum file size: 10MB
- Clear, well-lit images work best

---
## Contribution

## ✏️ Step 1: Fork the repository
 
- Click on **Fork** (top right).  
- This creates **your own copy** of the repository.

 ## 📦 Step 2: Clone your fork

```bash
git clone https://github.com/your-username/fit2go.git
cd fit2go
```

## 🌱 Step 3: Create a new branch

```bash
git checkout -b feature/your-feature-name
```

## ✍ Step 4: Make your changes locally

## 📤 Step 5: Commit and push your changes

```bash
git add .
git commit -m "commit message"
git push origin feature/your-feature-name
```
🔄 Step 6: Create a Pull Request (PR)
---
