import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import recipesRouter from './routes/recipes';
import mealPlansRouter from './routes/mealPlans';
import importRouter from './routes/import';
import { initDb } from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Make pool available to routes
app.locals.pool = pool;

// API routes
app.use('/api/recipes', recipesRouter);
app.use('/api/meal-plans', mealPlansRouter);
app.use('/api/import', importRouter);

// In production, serve the built React app
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(clientPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  try {
    await initDb(pool);
    console.log('Database initialised');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
