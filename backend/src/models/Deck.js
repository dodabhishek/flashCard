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

const Deck = mongoose.model('Deck', deckSchema);

export default Deck; 