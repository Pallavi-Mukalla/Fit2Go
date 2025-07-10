const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');

// Save a new conversation
router.post('/', async (req, res) => {
  try {
    const { userId, messages } = req.body;
    const conversation = new Conversation({ userId, messages });
    await conversation.save();
    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get the most recent conversation for a user
router.get('/recent', async (req, res) => {
  try {
    const { userId } = req.query;
    const convo = await Conversation.findOne(userId ? { userId } : {})
      .sort({ createdAt: -1 });
    if (!convo) return res.status(404).json({ message: 'No conversation found' });
    res.json(convo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 