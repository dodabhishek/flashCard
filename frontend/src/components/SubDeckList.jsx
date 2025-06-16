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
  const [selectedSubDeck, setSelectedSubDeck] = useState(null);
  const [subDeckCards, setSubDeckCards] = useState([]);
  const [selectedCardIdx, setSelectedCardIdx] = useState(0);

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
      if (selectedSubDeck === subDeckId) {
        setSelectedSubDeck(null);
        setSubDeckCards([]);
      }
    } catch (err) {
      alert('Failed to delete sub-deck.');
    } finally {
      setDeleting(null);
    }
  };

  const handleSelectSubDeck = async (subDeckId) => {
    setSelectedSubDeck(subDeckId);
    setSelectedCardIdx(0);
    setIsLoading(true);
    try {
      const cards = await cardApi.getDeckCards(subDeckId);
      setSubDeckCards(cards);
    } catch (err) {
      setError('Failed to load cards for sub-deck.');
      setSubDeckCards([]);
    } finally {
      setIsLoading(false);
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
    <div className="subdeck-list-container" style={{ display: 'flex', minHeight: '60vh' }}>
      <div style={{ flex: '0 0 260px', borderRight: '1px solid #eee', paddingRight: '1.5em' }}>
        <div className="add-subdeck-header">
          <h1 style={{ fontSize: '1.2em' }}>Sub-decks of {deck?.name}</h1>
          <div style={{ display: 'flex', gap: '1em' }}>
            <button className="button" onClick={() => navigate(`/deck/${deckId}/add-subdeck`)}>+ Add Sub-deck</button>
            <button className="button" onClick={() => navigate(-1)}>⬅️ Back</button>
          </div>
        </div>
        {deck.subDecks && deck.subDecks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
            {deck.subDecks.map((subDeck) => (
              <button
                key={subDeck._id}
                className={`subdeck-list-item${selectedSubDeck === subDeck._id ? ' selected' : ''}`}
                style={{ textAlign: 'left', padding: '1em', background: selectedSubDeck === subDeck._id ? '#e0e7ff' : '#f4f6fb', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '0.5em' }}
                onClick={() => handleSelectSubDeck(subDeck._id)}
                disabled={deleting === subDeck._id}
              >
                <div className="subdeck-list-title">{subDeck.name}</div>
                <div className="subdeck-list-desc">{subDeck.description || 'No description'}</div>
                <div className="subdeck-list-count">{typeof cardCounts[subDeck._id] === 'number' ? `${cardCounts[subDeck._id]} cards` : '...'}</div>
                <button
                  className="button button-danger"
                  style={{ position: 'absolute', top: '1em', right: '1em', padding: '0.4em 1em', fontSize: '0.95em' }}
                  onClick={e => { e.stopPropagation(); handleDeleteSubDeck(subDeck._id); }}
                  disabled={deleting === subDeck._id}
                >
                  {deleting === subDeck._id ? 'Deleting...' : 'Delete'}
                </button>
              </button>
            ))}
          </div>
        ) : (
          <div className="flashcard-empty">No sub-decks found for this deck.</div>
        )}
      </div>
      <div style={{ flex: 1, paddingLeft: '2em' }}>
        {selectedSubDeck && subDeckCards.length > 0 ? (
          <div>
            <h2>Cards in Sub-deck</h2>
            <div style={{ display: 'flex' }}>
              <div style={{ minWidth: 180, borderRight: '1px solid #eee', marginRight: 20 }}>
                {subDeckCards.map((card, idx) => (
                  <div
                    key={card._id}
                    style={{
                      padding: '0.7em 1em',
                      background: idx === selectedCardIdx ? '#e0e7ff' : 'transparent',
                      cursor: 'pointer',
                      borderRadius: 6,
                      marginBottom: 4
                    }}
                    onClick={() => setSelectedCardIdx(idx)}
                  >
                    <div style={{ fontWeight: 500, color: '#2563eb' }}>Q: {card.question?.slice(0, 30)}{card.question?.length > 30 ? '...' : ''}</div>
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, padding: '1em' }}>
                <h3>Question</h3>
                <div style={{ marginBottom: 12, whiteSpace: 'pre-wrap', fontWeight: 500 }}>{subDeckCards[selectedCardIdx]?.question}</div>
                <h3>Answer</h3>
                <div style={{ whiteSpace: 'pre-wrap' }}>{subDeckCards[selectedCardIdx]?.answer}</div>
              </div>
            </div>
          </div>
        ) : selectedSubDeck && subDeckCards.length === 0 ? (
          <div>No cards in this sub-deck.</div>
        ) : (
          <div style={{ color: '#888', fontStyle: 'italic' }}>Select a sub-deck to view its cards.</div>
        )}
      </div>
    </div>
  );
};

export default SubDeckList; 