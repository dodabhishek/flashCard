import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deckApi, cardApi } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

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
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchDeckAndCards = async () => {
      setIsLoading(true);
      try {
        const [deckData, cardsData] = await Promise.all([
          deckApi.getDeck(deckId),
          cardApi.getDeckCards(deckId),
        ]);
        setDeck(deckData);
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
    // Reset timer when card changes
    setTimer(TIMER_DURATION);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isFlipped && !showAnswerModal && cards.length > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleShowAnswer(cards[currentCardIndex].back || cards[currentCardIndex].answer, true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line
  }, [currentCardIndex, cards, isFlipped, showAnswerModal]);

  // Stop timer if user flips or answers
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Randomly select a card index different from the current one
  const getRandomCardIndex = () => {
    if (cards.length <= 1) return 0;
    let idx;
    do {
      idx = Math.floor(Math.random() * cards.length);
    } while (idx === currentCardIndex);
    return idx;
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCardIndex(getRandomCardIndex());
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

  // Edit modal logic
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

  // Show answer modal or flip card after timer
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

  // When user manually flips the card, stop the timer
  const handleFlip = () => {
    setIsFlipped((prev) => {
      if (!prev) stopTimer();
      return !prev;
    });
  };

  if (isLoading) return <LoadingSpinner text="Loading your deck..." />;
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

  // Main blurred content
  const mainContent = (
    <div className={`deck-manager${showAnswerModal || showEditModal ? ' blurred-bg' : ''}`}>
      <div className="deck-header">
        <h1>{deck.name}</h1>
        <p className="deck-desc">{deck.description || 'No description provided'}</p>
        <div className="deck-actions">
          <button className="button deck-nav-btn" onClick={() => navigate(`/deck/${deckId}/add-card`)}>➕ Add Card</button>
          <button className="button deck-nav-btn" onClick={() => navigate('/')}>⬅️ Back to Decks</button>
        </div>
      </div>
      {cards.length === 0 ? (
        <div className="flashcard-empty">
          <p>No cards in this deck yet. Add your first card to get started!</p>
          <button className="button" onClick={() => navigate(`/deck/${deckId}/add-card`)}>Add Your First Card</button>
        </div>
      ) : (
        <>
          <div className="flashcard-section">
            <div className="flashcard-nav">
              <button className="button deck-nav-btn" onClick={handlePrevious} disabled={cards.length <= 1}>⏮️ Previous</button>
              <span className="flashcard-count">Card {currentCardIndex + 1} of {cards.length}</span>
              <button className="button deck-nav-btn" onClick={handleNext} disabled={cards.length <= 1}>Next 🎲</button>
            </div>
            <div className="flashcard" onClick={handleFlip}>
              <div className="flashcard-inner">
                <div className={`flashcard-front${isFlipped ? ' flashcard-flipped' : ''}`}>{isFlipped ? (cards[currentCardIndex].back || cards[currentCardIndex].answer) : (cards[currentCardIndex].front || cards[currentCardIndex].question)}</div>
              </div>
              <div className="flashcard-timer">{!isFlipped && !showAnswerModal && <span>⏳ {timer}s</span>}</div>
            </div>
            <div className="flashcard-actions">
              <button className="button button-danger" onClick={() => handleDeleteCard(cards[currentCardIndex]._id)}>
                🗑️ Delete Card
              </button>
              <button className="button" onClick={() => handleShowAnswer(cards[currentCardIndex].back || cards[currentCardIndex].answer)}>
                Answer
              </button>
              <button className="button" onClick={handleShowEdit}>
                ✏️ Edit
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Modal overlay (always outside the blurred content)
  const modal = showAnswerModal && (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Answer</h2>
        <div className="modal-answer">{modalAnswer}</div>
        <button className="button" onClick={handleCloseModal} style={{marginTop: '1em'}}>Close</button>
      </div>
    </div>
  );

  // Edit modal
  const editModal = showEditModal && (
    <div className="modal-overlay" onClick={handleCloseEdit}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Edit Card</h2>
        <form onSubmit={handleEditSubmit}>
          <div style={{marginBottom: '1em'}}>
            <label htmlFor="editFront">Question</label>
            <textarea
              id="editFront"
              value={editFront}
              onChange={e => setEditFront(e.target.value)}
              rows={3}
              style={{width: '100%', borderRadius: '6px', padding: '0.5em'}}
              required
            />
          </div>
          <div style={{marginBottom: '1em'}}>
            <label htmlFor="editBack">Answer</label>
            <textarea
              id="editBack"
              value={editBack}
              onChange={e => setEditBack(e.target.value)}
              rows={3}
              style={{width: '100%', borderRadius: '6px', padding: '0.5em'}}
              required
            />
          </div>
          <button className="button" type="submit" disabled={editLoading} style={{marginRight: '1em'}}>
            {editLoading ? 'Saving...' : 'Save'}
          </button>
          <button className="button button-danger" type="button" onClick={handleCloseEdit} disabled={editLoading}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {mainContent}
      {modal}
      {editModal}
    </>
  );
};

export default DeckManager;