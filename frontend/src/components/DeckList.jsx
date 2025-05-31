import React, { useState, useEffect } from 'react';
import { deckApi } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import DeckCard from './DeckCard';

const DeckList = () => {
  const [decks, setDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('DeckList component mounted');
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    console.log('Fetching decks...');
    try {
      const data = await deckApi.getAllDecks();
      console.log('Fetched decks:', data);
      setDecks(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching decks:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    if (!newDeckName.trim()) {
      setError('Deck name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Creating new deck:', { name: newDeckName, description: newDeckDescription });
      const newDeck = await deckApi.createDeck({
        name: newDeckName.trim(),
        description: newDeckDescription.trim(),
      });
      console.log('Created new deck:', newDeck);
      setDecks([...decks, newDeck]);
      setNewDeckName('');
      setNewDeckDescription('');
      setError(null);
    } catch (error) {
      console.error('Error creating deck:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDeck = async (deckId) => {
    if (!window.confirm('Are you sure you want to delete this deck?')) {
      return;
    }
    try {
      console.log('Deleting deck:', deckId);
      await deckApi.deleteDeck(deckId);
      console.log('Deck deleted successfully');
      setDecks(decks.filter(deck => deck._id !== deckId));
      setError(null);
    } catch (error) {
      console.error('Error deleting deck:', error);
      setError(error.message);
    }
  };

  if (isLoading) {
    console.log('Loading state:', isLoading);
    return <LoadingSpinner text="Loading your decks..." />;
  }

  console.log('Current decks state:', decks);

  return (
    <div className="container">
      {error && (
        <div style={{ background: '#ffe5e5', color: '#b91c1c', padding: '1em', borderRadius: '8px', marginBottom: '1em' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="card">
        <h2>Create New Deck</h2>
        <form onSubmit={handleCreateDeck}>
          <label htmlFor="deckName">Deck Name</label>
          <input
            id="deckName"
            type="text"
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            required
            disabled={isSubmitting}
            placeholder="Enter deck name"
          />
          <label htmlFor="deckDescription">Description</label>
          <textarea
            id="deckDescription"
            value={newDeckDescription}
            onChange={(e) => setNewDeckDescription(e.target.value)}
            disabled={isSubmitting}
            placeholder="Enter deck description"
            rows="3"
          />
          <button
            type="submit"
            className="button"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '1em' }}
          >
            {isSubmitting ? 'Creating...' : 'Create Deck'}
          </button>
        </form>
      </div>

      <h2>Your Decks</h2>
      {decks.length === 0 ? (
        <div className="card text-center">
          <p>No decks yet. Create your first deck to get started!</p>
        </div>
      ) : (
        <div className="grid">
          {decks.map((deck) => (
            <DeckCard
              key={deck._id}
              deck={deck}
              onDelete={handleDeleteDeck}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DeckList;
