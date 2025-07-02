import mongoose from 'mongoose'

const flashcardSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true
  },
  category: {
    type: String,
    default: 'general'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
flashcardSchema.index({ deck: 1 }); // For finding cards by deck
flashcardSchema.index({ category: 1 }); // For category-based queries
flashcardSchema.index({ createdAt: -1 }); // For sorting by creation date
flashcardSchema.index({ deck: 1, category: 1 }); // Compound index for deck + category queries

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

export default Flashcard;
