import mongoose from 'mongoose';

const deckSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    default: null
  },
  subDecks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
deckSchema.index({ parent: 1 }); // For finding sub-decks
deckSchema.index({ createdAt: -1 }); // For sorting by creation date
deckSchema.index({ name: 1 }); // For name-based searches

const Deck = mongoose.model('Deck', deckSchema);

export default Deck; 