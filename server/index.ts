import express from 'express';
import cors from 'cors';
import path from 'path';
import { Pool } from 'pg';
import recipesRouter from './routes/recipes.js';
import mealPlansRouter from './routes/mealPlans.js';
import importRouter from './routes/import.js';
import { initDb } from './db.js';

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

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// In production, serve the built React app
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(clientPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(clientPath, 'index.html'));
  });
}

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
