import React from 'react';
import { useNavigate } from 'react-router-dom';

const DeckCard = ({ deck, onDelete, onEdit }) => {
  const navigate = useNavigate();

  // Handler for clicking the card (not the Edit/Delete buttons)
  const handleCardClick = (e) => {
    // Prevent navigation if clicking Edit or Delete
    if (e.target.closest('.menu-option')) return;
    navigate(`/deck/${deck._id}/subdecks`);
  };

  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={handleCardClick}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '0.5em' }}>
        <h3 style={{ flex: 1, margin: 0 }}>{deck.name}</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onDelete(deck._id)}
            className="menu-option delete"
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
      <div style={{ marginBottom: '1em', color: '#555', whiteSpace: 'pre-wrap' }}>{deck.description || 'No description provided'}</div>
    </div>
  );
};

export default DeckCard; 