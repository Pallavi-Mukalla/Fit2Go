const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { filter } = req.body;
  console.log('Received filter from frontend:', filter);

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b-001:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
                role: "user",
              parts: [
                {
                  text: `Give ONLY a JSON array, no explanation, of 3 ${filter} recipes. 
Each recipe must include fields: name, description, kcal (number), protein (number), carbs (number), fat (number).
Example: [{"name":"...", "description":"...", "kcal":100, "protein":10, "carbs":20, "fat":5}]`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await geminiRes.json();
    //console.log('Gemini full response:', JSON.stringify(data));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    //console.log('Parsed text from Gemini:', text);

    if (!text) {
      return res.status(500).json({ error: 'No response from Gemini' });
    }

    let recipes;
    try {
      recipes = JSON.parse(text);
    } catch (e) {
      const match = text.match(/\[([\s\S]*?)\]/);
      if (match) {
        try {
          recipes = JSON.parse(match[0]);
        } catch (err) {
          console.error('Failed to parse extracted JSON:', text);
          return res.status(500).json({ error: 'Failed to parse recipes after extraction' });
        }
      } else {
        console.error('No JSON array found in Gemini response:', text);
        return res.status(500).json({ error: 'No JSON array found in response' });
      }
    }

    res.json(recipes);
  } catch (error) {
    console.error('Error fetching from Gemini:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
