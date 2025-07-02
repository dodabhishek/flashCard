import express from 'express';
import { connectDB } from './lib/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { performanceMonitor, dbPerformanceMonitor } from './middleware/performance.js';
import cardsRouter from './routes/cards.js';
import decksRouter from './routes/decks.js';
import path from 'path';

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
const __dirname = path.resolve();

// Performance monitoring
app.use(performanceMonitor);
app.use(dbPerformanceMonitor);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Compression middleware
app.use(compression());

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cache static files
app.use(express.static(path.join(__dirname, '../frontend/dist'), {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));

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