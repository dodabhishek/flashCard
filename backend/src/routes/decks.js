import express from 'express';
import Deck from '../models/Deck.js';
import Flashcard from '../models/Flashcard.js';

const router = express.Router();

// Get all decks
router.get('/', async (req, res) => {
  try {
    const decks = await Deck.find();
    res.json(decks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific deck with its cards
router.get('/:id', async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    const cards = await Flashcard.find({ deck: req.params.id });
    res.json({ deck, cards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new deck
router.post('/', async (req, res) => {
  console.log('Received request body:', req.body);
  
  if (!req.body.name) {
    return res.status(400).json({ message: 'Deck name is required' });
  }

  const deck = new Deck({
    name: req.body.name,
    description: req.body.description || ''
  });

  try {
    const newDeck = await deck.save();
    console.log('Created new deck:', newDeck);
    res.status(201).json(newDeck);
  } catch (error) {
    console.error('Error creating deck:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a deck and its cards
router.delete('/:id', async (req, res) => {
  try {
    await Deck.findByIdAndDelete(req.params.id);
    await Flashcard.deleteMany({ deck: req.params.id });
    res.json({ message: 'Deck and its cards deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a deck
router.patch('/:id', async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    if (req.body.name) deck.name = req.body.name;
    if (req.body.description) deck.description = req.body.description;
    
    const updatedDeck = await deck.save();
    res.json(updatedDeck);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router; 