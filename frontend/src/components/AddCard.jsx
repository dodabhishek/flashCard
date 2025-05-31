import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cardApi } from '../services/api';

const AddCard = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) {
      setError('Both front and back are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        question: front.trim(),
        answer: back.trim(),
        deck: deckId
      };
      await cardApi.createCard(payload);
      navigate(`/deck/${deckId}`);
    } catch (error) {
      setError(error.message);
      console.error('Error creating card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-card-container">
      <div className="add-card-card">
        <div className="add-card-header">
          <h1>Add New Card</h1>
          <button
            type="button"
            className="button add-card-back-btn"
            onClick={() => navigate(`/deck/${deckId}`)}
          >
            ⬅️ Back to Deck
          </button>
        </div>
        {error && (
          <div className="add-card-error">
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="add-card-form">
          <div className="add-card-field">
            <label htmlFor="front">Front of Card</label>
            <textarea
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="Enter the front of the card"
              rows="3"
            />
          </div>
          <div className="add-card-field">
            <label htmlFor="back">Back of Card</label>
            <textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="Enter the back of the card"
              rows="3"
            />
          </div>
          <div className="add-card-actions">
            <button
              type="button"
              className="button button-danger"
              onClick={() => navigate(`/deck/${deckId}`)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCard; 