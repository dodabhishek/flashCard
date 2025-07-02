import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { deckApi } from '../services/api';
import Loader from './LoadingSpinner';
import DeckCard from './DeckCard';

const DeckList = React.memo(() => {
  const [decks, setDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDecks = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    console.log('DeckList component mounted');
    fetchDecks();
  }, [fetchDecks]);

  const handleCreateDeck = useCallback(async (e) => {
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
      setDecks(prevDecks => [...prevDecks, newDeck]);
      setNewDeckName('');
      setNewDeckDescription('');
      setError(null);
    } catch (error) {
      console.error('Error creating deck:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [newDeckName, newDeckDescription]);

  const handleDeleteDeck = useCallback(async (deckId) => {
    if (!window.confirm('Are you sure you want to delete this deck?')) {
      return;
    }
    try {
      console.log('Deleting deck:', deckId);
      await deckApi.deleteDeck(deckId);
      console.log('Deck deleted successfully');
      setDecks(prevDecks => prevDecks.filter(deck => deck._id !== deckId));
      setError(null);
    } catch (error) {
      console.error('Error deleting deck:', error);
      setError(error.message);
    }
  }, []);

  const handleNameChange = useCallback((e) => {
    setNewDeckName(e.target.value);
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    setNewDeckDescription(e.target.value);
  }, []);

  // Memoize the decks grid to prevent unnecessary re-renders
  const decksGrid = useMemo(() => {
    if (decks.length === 0) {
      return (
        <div className="card text-center">
          <p>No decks yet. Create your first deck to get started!</p>
        </div>
      );
    }

    return (
      <div className="grid">
        {decks.map((deck) => (
          <DeckCard
            key={deck._id}
            deck={deck}
            onDelete={handleDeleteDeck}
          />
        ))}
      </div>
    );
  }, [decks, handleDeleteDeck]);

  if (isLoading) {
    console.log('Loading state:', isLoading);
    return <Loader />;
  }

  console.log('Current decks state:', decks);

  return (
    <div className="container">
      {error && (
        <div style={{ background: '#ffe5e5', color: '#b91c1c', padding: '1em', borderRadius: '8px', marginBottom: '1em' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="create-deck-card">
        <h2>Create New Deck</h2>
        <form onSubmit={handleCreateDeck}>
          <label htmlFor="deckName">Deck Name</label>
          <input
            id="deckName"
            type="text"
            value={newDeckName}
            onChange={handleNameChange}
            required
            disabled={isSubmitting}
            placeholder="Enter deck name"
          />
          <label htmlFor="deckDescription">Description</label>
          <textarea
            id="deckDescription"
            value={newDeckDescription}
            onChange={handleDescriptionChange}
            disabled={isSubmitting}
            placeholder="Enter deck description"
            rows="3"
          />
          <button
            type="submit"
            className="button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Deck'}
          </button>
        </form>
      </div>

      <h2>Your Decks</h2>
      {decksGrid}
    </div>
  );
});

DeckList.displayName = 'DeckList';

export default DeckList;
