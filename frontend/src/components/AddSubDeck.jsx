import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deckApi } from '../services/api';
import Loader from './LoadingSpinner';

const AddSubDeck = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const data = await deckApi.getDeck(deckId);
        setDeck(data.deck);
        setError(null);
      } catch (err) {
        setError('Failed to load deck information.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeck();
  }, [deckId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Sub-deck name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await deckApi.createDeck({
        ...formData,
        parentId: deckId
      });
      navigate(-1);
    } catch (err) {
      setError(err.message || 'Failed to create sub-deck');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="add-subdeck-container">
      <div className="add-subdeck-header">
        <h1>Add Sub-deck to {deck?.name}</h1>
        <button 
          className="button" 
          onClick={() => navigate(`/`)}
        >
          ⬅️ Back to Deck
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-subdeck-form">
        <div className="form-group">
          <label htmlFor="name">Sub-deck Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter sub-deck name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (optional):</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter sub-deck description"
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="button"
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
            {isSubmitting ? 'Creating...' : 'Create Sub-deck'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSubDeck; 