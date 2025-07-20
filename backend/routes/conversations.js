const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');

// Save a new conversation
router.post('/', async (req, res) => {
  try {
    const { userId, type, messages } = req.body;
    console.log('POST /conversations - Received:', { userId, type, messageCount: messages?.length });
    
    if (!type) {
      return res.status(400).json({ error: 'Conversation type is required' });
    }
    const conversation = new Conversation({ userId, type, messages });
    await conversation.save();
    console.log('Conversation saved successfully:', conversation._id);
    res.status(201).json(conversation);
  } catch (err) {
    console.error('Error saving conversation:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update an existing conversation
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, type, messages } = req.body;
    console.log('PUT /conversations/:id - Received:', { id, userId, type, messageCount: messages?.length });
    
    if (!type) {
      return res.status(400).json({ error: 'Conversation type is required' });
    }
    
    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { userId, type, messages },
      { new: true, runValidators: true }
    );
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    console.log('Conversation updated successfully:', conversation._id);
    res.json(conversation);
  } catch (err) {
    console.error('Error updating conversation:', err);
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

// Get all conversations for a user and type
router.get('/', async (req, res) => {
  try {
    const { userId, type } = req.query;
    console.log('GET /conversations - Query:', { userId, type });
    
    if (!userId || !type) {
      return res.status(400).json({ error: 'userId and type are required' });
    }
    const convos = await Conversation.find({ userId, type }).sort({ createdAt: -1 });
    console.log('Found conversations:', convos.length);
    res.json(convos);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a conversation by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('DELETE /conversations/:id - Deleting conversation:', id);
    
    const conversation = await Conversation.findByIdAndDelete(id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    console.log('Conversation deleted successfully:', id);
    res.json({ message: 'Conversation deleted successfully' });
  } catch (err) {
    console.error('Error deleting conversation:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 