const express = require('express');
const multer = require('multer');
const { Groq } = require('groq-sdk');
const router = express.Router();
const upload = multer();

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { exercise } = req.body;
    const file = req.file;
    
    console.log('Form check request received:', { 
      exercise, 
      fileName: file?.originalname, 
      fileSize: file?.size,
      mimeType: file?.mimetype 
    });
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert image to base64 for the prompt
    const base64Image = file.buffer.toString('base64');
    const mimeType = file.mimetype;

    // Validate file type
    if (!mimeType.startsWith('image/')) {
      return res.status(400).json({ 
        error: 'Invalid file type. Please upload an image file.',
        result: 'error',
        message: 'Only image files are supported for form analysis.'
      });
    }

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return res.status(400).json({ 
        error: 'File too large. Please upload an image smaller than 10MB.',
        result: 'error',
        message: 'Image file is too large. Please use a smaller image.'
      });
    }

    // Create a comprehensive prompt for form analysis
    const prompt = `You are a professional fitness trainer and form expert. Analyze this image of someone performing the exercise: "${exercise}".

Please provide a detailed analysis of their form and technique. Consider the following aspects:

1. **Overall Form Assessment**: Is the form correct, partially correct, or incorrect?
2. **Specific Issues**: What specific form problems do you see (if any)?
3. **Improvements**: What specific corrections would you recommend?
4. **Safety Concerns**: Are there any safety issues with the current form?
5. **Positive Aspects**: What is being done correctly?

Please provide your analysis in a clear, constructive manner. Be specific about what needs to be improved and how to improve it.

Exercise being performed: ${exercise}`;

    // Create the chat completion with the image
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false
    });

    const analysis = chatCompletion.choices[0]?.message?.content || 'Unable to analyze form.';

    // Determine if form is good based on the analysis
    const isGoodForm = analysis.toLowerCase().includes('correct') && 
                      !analysis.toLowerCase().includes('incorrect') &&
                      !analysis.toLowerCase().includes('problem') &&
                      !analysis.toLowerCase().includes('issue');

    const result = {
      result: isGoodForm ? 'good' : 'needs_improvement',
      message: analysis,
      exercise: exercise
    };

    console.log('Form analysis completed:', { 
      exercise, 
      result: result.result, 
      messageLength: analysis.length 
    });

    res.json(result);

  } catch (err) {
    console.error('Groq pose analysis error:', err);
    res.status(500).json({ 
      error: 'Server error during form analysis', 
      details: err.message,
      result: 'error',
      message: 'Unable to analyze form due to technical issues.'
    });
  }
});

module.exports = router; 