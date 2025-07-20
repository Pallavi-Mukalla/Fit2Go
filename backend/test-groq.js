const { Groq } = require('groq-sdk');
require('dotenv').config();

// Test script to verify Groq integration
async function testGroqIntegration() {
  console.log('Testing Groq integration...');
  
  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not found in environment variables');
    return;
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    console.log('✅ Groq client initialized successfully');
    
    // Test with a simple text prompt first
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Hello! Can you confirm you're working? Just respond with 'Yes, I'm working!'"
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.7,
      max_tokens: 50,
      top_p: 1,
      stream: false
    });

    const response = chatCompletion.choices[0]?.message?.content;
    console.log('✅ Groq API test successful');
    console.log('Response:', response);
    
    console.log('\n🎉 Groq integration is working correctly!');
    console.log('You can now use the form checking feature in your application.');
    
  } catch (error) {
    console.error('❌ Groq integration test failed:', error.message);
    console.error('Please check your GROQ_API_KEY and internet connection.');
  }
}

// Run the test
testGroqIntegration(); 