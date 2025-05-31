const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  return data;
};

// Deck API calls
const deckApi = {
  // Get all decks
  getAllDecks: async () => {
    const response = await fetch(`${API_BASE_URL}/decks`);
    return handleResponse(response);
  },

  // Get a specific deck with its cards
  getDeck: async (deckId) => {
    const response = await fetch(`${API_BASE_URL}/decks/${deckId}`);
    return handleResponse(response);
  },

  // Create a new deck
  createDeck: async (deckData) => {
    const response = await fetch(`${API_BASE_URL}/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deckData),
    });
    return handleResponse(response);
  },

  // Delete a deck
  deleteDeck: async (deckId) => {
    const response = await fetch(`${API_BASE_URL}/decks/${deckId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // Update a deck
  updateDeck: async (deckId, deckData) => {
    const response = await fetch(`${API_BASE_URL}/decks/${deckId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deckData),
    });
    return handleResponse(response);
  },
};

// Card API calls
const cardApi = {
  // Get all cards for a specific deck
  getDeckCards: async (deckId) => {
    const response = await fetch(`${API_BASE_URL}/cards/deck/${deckId}`);
    return handleResponse(response);
  },

  // Create a new card
  createCard: async (cardData) => {
    console.log('Creating card with data:', cardData);
    const response = await fetch(`${API_BASE_URL}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: cardData.question,
        answer: cardData.answer,
        deck: cardData.deck,
        category: cardData.category || 'general'
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error response:', errorData);
      throw new Error(errorData.message || 'Failed to create card');
    }
    
    return response.json();
  },

  // Delete a card
  deleteCard: async (cardId) => {
    const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // Update a card
  updateCard: async (cardId, cardData) => {
    const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cardData),
    });
    return handleResponse(response);
  },
};

export { deckApi, cardApi }; 