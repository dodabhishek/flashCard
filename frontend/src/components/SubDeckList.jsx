import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { deckApi, cardApi } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const SubDeckList = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cardCounts, setCardCounts] = useState({});
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const fetchDeckAndCounts = async () => {
      setIsLoading(true);
      try {
        const data = await deckApi.getDeck(deckId);
        setDeck(data.deck);
        setError(null);
        // Fetch card counts for each sub-deck
        if (data.deck && data.deck.subDecks && data.deck.subDecks.length > 0) {
          const counts = {};
          await Promise.all(
            data.deck.subDecks.map(async (subDeck) => {
              const cards = await cardApi.getDeckCards(subDeck._id);
              counts[subDeck._id] = cards.length;
            })
          );
          setCardCounts(counts);
        }
      } catch (err) {
        setError('Failed to load deck or sub-decks.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeckAndCounts();
  }, [deckId]);

  const handleDeleteSubDeck = async (subDeckId) => {
    if (!window.confirm('Are you sure you want to delete this sub-deck?')) return;
    setDeleting(subDeckId);
    try {
      await deckApi.deleteDeck(subDeckId);
      setDeck((prev) => ({
        ...prev,
        subDecks: prev.subDecks.filter((sd) => sd._id !== subDeckId)
      }));
      setCardCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[subDeckId];
        return newCounts;
      });
    } catch (err) {
      alert('Failed to delete sub-deck.');
    } finally {
      setDeleting(null);
    }
  };

  if (isLoading) return <LoadingSpinner text="Loading sub-decks..." />;

  if (error) return (
    <div className="deck-manager-error">
      <p><strong>Error:</strong> {error}</p>
      <button className="button" onClick={() => navigate(-1)}>Back</button>
    </div>
  );

  return (
    <div className="subdeck-list-container">
      <div className="add-subdeck-header">
        <h1>All Sub-decks of {deck?.name}</h1>
        <div style={{ display: 'flex', gap: '1em' }}>
          <button className="button" onClick={() => navigate(`/deck/${deckId}/add-subdeck`)}>+ Add Sub-deck</button>
          <button className="button" onClick={() => navigate(-1)}>⬅️ Back</button>
        </div>
      </div>
      {deck.subDecks && deck.subDecks.length > 0 ? (
        <div className="subdeck-list-grid">
          {deck.subDecks.map((subDeck) => (
            <div key={subDeck._id} className="subdeck-list-item" style={{ position: 'relative' }}>
              <Link
                to={`/deck/${subDeck._id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="subdeck-list-title">{subDeck.name}</div>
                <div className="subdeck-list-desc">{subDeck.description || 'No description'}</div>
                <div className="subdeck-list-count">{typeof cardCounts[subDeck._id] === 'number' ? `${cardCounts[subDeck._id]} cards` : '...'}</div>
              </Link>
              <button
                className="button button-danger"
                style={{ position: 'absolute', top: '1em', right: '1em', padding: '0.4em 1em', fontSize: '0.95em' }}
                onClick={() => handleDeleteSubDeck(subDeck._id)}
                disabled={deleting === subDeck._id}
              >
                {deleting === subDeck._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flashcard-empty">No sub-decks found for this deck.</div>
      )}
    </div>
  );
};

export default SubDeckList; 