import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import DeckList from './components/DeckList';
import DeckManager from './components/DeckManager';
import AddCard from './components/AddCard';
import AddSubDeck from './components/AddSubDeck';
import SubDeckList from './components/SubDeckList';

const App = () => {
  return (
    <div className="app-root">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <Link to="/" className="brand-link">
              <span className="brand-title">FlashCards</span>
            </Link>
          </div>
          <div className="navbar-links">
            <Link to="/" className="nav-link">My Decks</Link>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DeckList />} />
          <Route path="/deck/:deckId" element={<DeckManager />} />
          <Route path="/deck/:deckId/add-card" element={<AddCard />} />
          <Route path="/deck/:deckId/add-subdeck" element={<AddSubDeck />} />
          <Route path="/deck/:deckId/subdecks" element={<SubDeckList />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">
            © {new Date().getFullYear()} FlashCards. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;