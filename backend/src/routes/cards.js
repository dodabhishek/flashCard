import express from 'express';
import Flashcard from '../models/Flashcard.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all cards for a specific deck
router.get('/deck/:deckId', async (req, res) => {
  try {
    const cards = await Flashcard.find({ deck: req.params.deckId });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new card to a deck
router.post('/', async (req, res) => {
  try {
    // Validate deck ID
    if (!req.body.deck || !mongoose.Types.ObjectId.isValid(req.body.deck)) {
      return res.status(400).json({ 
        message: 'Invalid deck ID',
        received: req.body.deck 
      });
    }

    // Create new card
    const card = new Flashcard({
      question: req.body.question,
      answer: req.body.answer,
      deck: req.body.deck,
      category: req.body.category || 'general'
    });

    // Save card
    const newCard = await card.save();
    res.status(201).json(newCard);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors || 'Unknown error'
    });
  }
});

// Delete a card
router.delete('/:id', async (req, res) => {
  try {
    await Flashcard.findByIdAndDelete(req.params.id);
    res.json({ message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a card
router.patch('/:id', async (req, res) => {
  try {
    const card = await Flashcard.findById(req.params.id);
    if (req.body.question) card.question = req.body.question;
    if (req.body.answer) card.answer = req.body.answer;
    if (req.body.category) card.category = req.body.category;
    
    const updatedCard = await card.save();
    res.json(updatedCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router; 