import type { Pool } from 'pg';

export async function initDb(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS recipes (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      servings INTEGER DEFAULT 4,
      prep_time INTEGER DEFAULT 0,
      cook_time INTEGER DEFAULT 0,
      ingredients JSONB DEFAULT '[]',
      instructions JSONB DEFAULT '[]',
      tags JSONB DEFAULT '[]',
      meal_types JSONB DEFAULT '["dinner"]',
      source JSONB DEFAULT '{"type": "manual"}',
      image_url TEXT,
      metabolic_profile JSONB DEFAULT '{"hasFirstClassProtein": false, "hasCarbSource": false, "hasOmega3": false}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS meal_plans (
      id SERIAL PRIMARY KEY,
      week_start_date DATE NOT NULL UNIQUE,
      meals JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_meal_plans_week ON meal_plans(week_start_date);
    CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes USING gin(to_tsvector('english', name));
  `);
}
