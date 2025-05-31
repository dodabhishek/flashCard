import express from 'express';
import { connectDB } from './lib/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import cardsRouter from './routes/cards.js';
import decksRouter from './routes/decks.js';

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/cards', cardsRouter);
app.use('/api/decks', decksRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});