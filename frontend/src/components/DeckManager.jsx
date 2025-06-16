import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deckApi, cardApi } from '../services/api';
import Loader from './LoadingSpinner';
import { Settings } from 'lucide-react';

const TIMER_DURATION = 30; // seconds

const DeckManager = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [modalAnswer, setModalAnswer] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [selectedSubDeck, setSelectedSubDeck] = useState(null);
  const timerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchDeckAndCards = async () => {
      setIsLoading(true);
      try {
        const [deckData, cardsData] = await Promise.all([
          deckApi.getDeck(deckId),
          cardApi.getDeckCards(deckId),
        ]);
        setDeck(deckData.deck);
        setCards(cardsData);
        setError(null);
      } catch (err) {
        setError('Failed to load deck or cards.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeckAndCards();
  }, [deckId]);

  // Timer logic
  useEffect(() => {
    setTimer(TIMER_DURATION);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isFlipped && !showAnswerModal && cards.length > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleShowAnswer(cards[currentCardIndex].back || cards[currentCardIndex].answer, false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentCardIndex, cards, isFlipped, showAnswerModal]);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCardIndex((idx) => Math.min(idx + 1, cards.length - 1));
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentCardIndex((idx) => Math.max(idx - 1, 0));
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Delete this card?')) return;
    try {
      await cardApi.deleteCard(cardId);
      const newCards = cards.filter((c) => c._id !== cardId);
      setCards(newCards);
      setCurrentCardIndex((idx) => Math.max(0, idx - 1));
    } catch (err) {
      setError('Failed to delete card.');
    }
  };

  const handleShowEdit = () => {
    const card = cards[currentCardIndex];
    setEditFront(card.front || card.question || '');
    setEditBack(card.back || card.answer || '');
    setShowEditModal(true);
    document.body.style.overflow = 'hidden';
    stopTimer();
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditFront('');
    setEditBack('');
    document.body.style.overflow = '';
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    const card = cards[currentCardIndex];
    try {
      const updated = await cardApi.updateCard(card._id, {
        question: editFront,
        answer: editBack,
      });
      setCards(cards.map((c, idx) => idx === currentCardIndex ? { ...c, question: editFront, answer: editBack, front: editFront, back: editBack } : c));
      handleCloseEdit();
    } catch (err) {
      setError('Failed to update card.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleShowAnswer = (answer, fromTimer = false) => {
    stopTimer();
    if (fromTimer) {
      setIsFlipped(true);
    } else {
      setModalAnswer(answer);
      setShowAnswerModal(true);
      document.body.style.overflow = 'hidden';
    }
  };

  const handleCloseModal = () => {
    setShowAnswerModal(false);
    setModalAnswer('');
    document.body.style.overflow = '';
    stopTimer();
  };

  const handleFlip = () => {
    setIsFlipped((prev) => {
      if (!prev) stopTimer();
      return !prev;
    });
  };

  const handleSubDeckSelect = async (subDeckId) => {
    setSelectedSubDeck(subDeckId);
    setIsLoading(true);
    try {
      const cardsData = await cardApi.getDeckCards(subDeckId);
      setCards(cardsData);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (err) {
      setError('Failed to load sub-deck cards.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  if (isLoading) return <Loader />;
  if (error) {
    return (
      <div className="deck-manager-error">
        <p><strong>Error:</strong> {error}</p>
        <button className="button" onClick={() => navigate('/')}>Back to Decks</button>
      </div>
    );
  }
  if (!deck) {
    return (
      <div className="deck-manager-error">
        <h2>Deck not found</h2>
        <button className="button" onClick={() => navigate('/')}>Back to Decks</button>
      </div>
    );
  }

  return (
    <div className={`deck-manager${showAnswerModal || showEditModal ? ' blurred-bg' : ''}`}>
      <div className="deck-header">
        <h1>{deck.name}</h1>
        <p className="deck-desc">{deck.description || 'No description provided'}</p>
        <div className="deck-actions">
          <button
            className="button deck-nav-btn"
            style={{ fontWeight: 'bold', padding: '0.6em 1.5em', fontSize: '1em', background: '#e0e7ff', color: '#1749b1', border: '1px solid #b6c6e6' }}
            onClick={() => navigate(`/deck/${deckId}/add-card`)}
          >
            Add Card
          </button>
          <button
            className="button deck-nav-btn"
            style={{ fontWeight: 'bold', padding: '0.6em 1.5em', fontSize: '1em', background: '#e0e7ff', color: '#1749b1', border: '1px solid #b6c6e6' }}
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>

      {deck.subDecks && deck.subDecks.length > 0 && (
        <div className="sub-decks-section">
          <h2>Sub-decks</h2>
          <div className="sub-decks-grid">
            {deck.subDecks.map((subDeck) => (
              <div 
                key={subDeck._id} 
                className={`sub-deck-card ${selectedSubDeck === subDeck._id ? 'selected' : ''}`}
                onClick={() => handleSubDeckSelect(subDeck._id)}
              >
                <h3>{subDeck.name}</h3>
                <p>{subDeck.description || 'No description'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {cards.length === 0 ? (
        <div className="flashcard-empty">
          <p>No cards in this deck yet. Add your first card to get started!</p>
          <button className="button" onClick={() => navigate(`/deck/${deckId}/add-card`)}>Add Your First Card</button>
        </div>
      ) : (
        <div className="flashcard-section">
          <div className="flashcard-nav" style={{ justifyContent: 'center', gap: '1.5em', marginBottom: '1.5em', alignItems: 'center', display: 'flex' }}>
            <button
              className="button"
              style={{ fontWeight: 'bold', padding: '0.6em 1.5em', fontSize: '1em', background: '#e0e7ff', color: '#1749b1', border: '1px solid #b6c6e6' }}
              onClick={handlePrevious}
              disabled={cards.length <= 1 || currentCardIndex === 0}
            >
              Previous 
            </button>
            <button
              className="button"
              style={{ fontWeight: 'bold', padding: '0.6em 1.5em', fontSize: '1em', background: '#e0e7ff', color: '#1749b1', border: '1px solid #b6c6e6' }}
              onClick={handleNext}
              disabled={cards.length <= 1 || currentCardIndex === cards.length - 1}
            >
              Next 
            </button>
            <div className="menu-container" ref={menuRef} style={{ position: 'relative', marginLeft: '1em' }}>
              <button
                className="menu-dot-btn"
                style={{ background: '#e0e7ff', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 22, color: '#1749b1', boxShadow: '0 1px 4px rgba(60,60,130,0.07)' }}
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Show actions"
                type="button"
              >
                <Settings size={24} />
              </button>
              {menuOpen && (
                <div className="card-menu-column" style={{ minWidth: 160 }}>
                  <button
                    className="button button-danger"
                    style={{ fontWeight: 'bold', letterSpacing: '0.5px', padding: '0.6em 1.5em', fontSize: '1em', marginBottom: '0.5em' }}
                    onClick={() => { setMenuOpen(false); handleDeleteCard(cards[currentCardIndex]._id); }}
                  >
                    Delete Card
                  </button>
                  <button
                    className="button"
                    style={{ fontWeight: 'bold', letterSpacing: '0.5px', padding: '0.6em 1.5em', fontSize: '1em', marginBottom: '0.5em', background: '#f3f4f6', color: '#2563eb' }}
                    onClick={() => { setMenuOpen(false); handleShowAnswer(cards[currentCardIndex].back || cards[currentCardIndex].answer); }}
                  >
                    Show Answer
                  </button>
                  <button
                    className="button"
                    style={{ fontWeight: 'bold', letterSpacing: '0.5px', padding: '0.6em 1.5em', fontSize: '1em', background: '#e0e7ff', color: '#1749b1' }}
                    onClick={() => { setMenuOpen(false); handleShowEdit(); }}
                  >
                    Edit Card
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flashcard" onClick={() => {
            if (!isFlipped) {
              handleShowAnswer(cards[currentCardIndex].back || cards[currentCardIndex].answer);
            } else {
              handleFlip();
            }
          }}>
            <div className="flashcard-inner">
              <div className={`flashcard-front${isFlipped ? ' flashcard-flipped' : ''}`} style={{ whiteSpace: 'pre-wrap' }}>
                {isFlipped ? (cards[currentCardIndex].back || cards[currentCardIndex].answer) : (cards[currentCardIndex].front || cards[currentCardIndex].question)}
              </div>
            </div>
            <div className="flashcard-timer">{!isFlipped && !showAnswerModal && <span>⏳ {timer}s</span>}</div>
          </div>
        </div>
      )}

      {showAnswerModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Answer</h3>
            <p className="modal-answer" style={{ whiteSpace: 'pre-wrap' }}>{modalAnswer}</p>
            <button className="button" onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={handleCloseEdit}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Edit Card</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Question:</label>
                <textarea
                  value={editFront}
                  onChange={(e) => setEditFront(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Answer:</label>
                <textarea
                  value={editBack}
                  onChange={(e) => setEditBack(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="button" onClick={handleCloseEdit}>Cancel</button>
                <button type="submit" className="button" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckManager;