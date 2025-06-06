import express from 'express';
import { connectDB } from './lib/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import cardsRouter from './routes/cards.js';
import decksRouter from './routes/decks.js';
import path from 'path';
import styled from 'styled-components';

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
const __dirname = path.resolve();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/cards', cardsRouter);
app.use('/api/decks', decksRouter);

if(process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('/(.*)', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});