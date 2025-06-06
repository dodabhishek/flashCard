import express from 'express';
import Deck from '../models/Deck.js';
import Flashcard from '../models/Flashcard.js';

const router = express.Router();

// Get all root decks (decks without parents)
router.get('/', async (req, res) => {
  try {
    const decks = await Deck.find({ parent: null }).populate('subDecks');
    res.json(decks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific deck with its cards and sub-decks
router.get('/:id', async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id)
      .populate('subDecks')
      .populate('parent');
    const cards = await Flashcard.find({ deck: req.params.id });
    res.json({ deck, cards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new deck (can be a sub-deck if parentId is provided)
router.post('/', async (req, res) => {
  try {
    const { name, description, parentId } = req.body;
    const deckData = {
      name,
      description,
      parent: parentId || null
    };

    const newDeck = new Deck(deckData);
    const savedDeck = await newDeck.save();

    // If this is a sub-deck, update the parent deck's subDecks array
    if (parentId) {
      await Deck.findByIdAndUpdate(parentId, {
        $push: { subDecks: savedDeck._id }
      });
    }

    res.status(201).json(savedDeck);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a deck and its sub-decks
router.delete('/:id', async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    
    // Recursively delete all sub-decks
    const deleteSubDecks = async (deckId) => {
      const subDecks = await Deck.find({ parent: deckId });
      for (const subDeck of subDecks) {
        await deleteSubDecks(subDeck._id);
        await Flashcard.deleteMany({ deck: subDeck._id });
        await Deck.findByIdAndDelete(subDeck._id);
      }
    };

    await deleteSubDecks(req.params.id);
    
    // Delete the deck's cards
    await Flashcard.deleteMany({ deck: req.params.id });
    
    // Remove the deck from its parent's subDecks array if it has a parent
    if (deck.parent) {
      await Deck.findByIdAndUpdate(deck.parent, {
        $pull: { subDecks: deck._id }
      });
    }
    
    // Delete the deck itself
    await Deck.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Deck and its sub-decks deleted' });
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