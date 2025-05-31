import React from 'react';
import { Link } from 'react-router-dom';

const DeckCard = ({ deck, onDelete }) => {
  console.log('DeckCard rendering with deck:', deck);

  return (
    <div className="card">
      <h3>{deck.name}</h3>
      <p style={{ marginBottom: '1em', color: '#555' }}>{deck.description || 'No description provided'}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          to={`/deck/${deck._id}`}
          className="button"
        >
          View Cards
        </Link>
        <button
          onClick={() => onDelete(deck._id)}
          className="button button-danger"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeckCard; 