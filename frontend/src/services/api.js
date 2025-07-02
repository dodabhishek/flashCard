const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache helper functions
const getCacheKey = (url, method = 'GET') => `${method}:${url}`;
const isCacheValid = (timestamp) => Date.now() - timestamp < CACHE_DURATION;
const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};
const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

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
  // Get all root decks
  getAllDecks: async () => {
    const cacheKey = getCacheKey(`${API_BASE_URL}/decks`);
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const response = await fetch(`${API_BASE_URL}/decks`);
    const data = await handleResponse(response);
    setCache(cacheKey, data);
    return data;
  },

  // Get a specific deck with its cards and sub-decks
  getDeck: async (deckId) => {
    const cacheKey = getCacheKey(`${API_BASE_URL}/decks/${deckId}`);
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const response = await fetch(`${API_BASE_URL}/decks/${deckId}`);
    const data = await handleResponse(response);
    setCache(cacheKey, data);
    return data;
  },

  // Create a new deck (can be a sub-deck if parentId is provided)
  createDeck: async (deckData) => {
    const response = await fetch(`${API_BASE_URL}/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deckData),
    });
    const data = await handleResponse(response);
    
    // Invalidate related caches
    cache.delete(getCacheKey(`${API_BASE_URL}/decks`));
    if (deckData.parentId) {
      cache.delete(getCacheKey(`${API_BASE_URL}/decks/${deckData.parentId}`));
    }
    
    return data;
  },

  // Delete a deck and its sub-decks
  deleteDeck: async (deckId) => {
    const response = await fetch(`${API_BASE_URL}/decks/${deckId}`, {
      method: 'DELETE',
    });
    const data = await handleResponse(response);
    
    // Invalidate related caches
    cache.delete(getCacheKey(`${API_BASE_URL}/decks`));
    cache.delete(getCacheKey(`${API_BASE_URL}/decks/${deckId}`));
    
    return data;
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
    const data = await handleResponse(response);
    
    // Invalidate related caches
    cache.delete(getCacheKey(`${API_BASE_URL}/decks`));
    cache.delete(getCacheKey(`${API_BASE_URL}/decks/${deckId}`));
    
    return data;
  },

  // Clear cache for decks
  clearCache: () => {
    for (const [key] of cache) {
      if (key.includes('/decks')) {
        cache.delete(key);
      }
    }
  }
};

// Card API calls
const cardApi = {
  // Get all cards for a specific deck
  getDeckCards: async (deckId) => {
    const cacheKey = getCacheKey(`${API_BASE_URL}/cards/deck/${deckId}`);
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const response = await fetch(`${API_BASE_URL}/cards/deck/${deckId}`);
    const data = await handleResponse(response);
    setCache(cacheKey, data);
    return data;
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
    
    const data = await response.json();
    
    // Invalidate related caches
    cache.delete(getCacheKey(`${API_BASE_URL}/cards/deck/${cardData.deck}`));
    
    return data;
  },

  // Delete a card
  deleteCard: async (cardId, deckId) => {
    const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
      method: 'DELETE',
    });
    const data = await handleResponse(response);
    
    // Invalidate related caches
    if (deckId) {
      cache.delete(getCacheKey(`${API_BASE_URL}/cards/deck/${deckId}`));
    }
    
    return data;
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
    const data = await handleResponse(response);
    
    // Invalidate related caches
    if (cardData.deck) {
      cache.delete(getCacheKey(`${API_BASE_URL}/cards/deck/${cardData.deck}`));
    }
    
    return data;
  },

  // Clear cache for cards
  clearCache: () => {
    for (const [key] of cache) {
      if (key.includes('/cards')) {
        cache.delete(key);
      }
    }
  }
};

export { deckApi, cardApi }; 