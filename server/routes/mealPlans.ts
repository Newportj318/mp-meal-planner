import { Router } from 'express';
import type { Pool } from 'pg';

const router = Router();

function getPool(req: any): Pool {
  return req.app.locals.pool;
}

function toMealPlan(row: any) {
  return {
    id: row.id,
    weekStartDate: row.week_start_date.toISOString().split('T')[0],
    meals: row.meals,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET /api/meal-plans/:weekStartDate
router.get('/:weekStartDate', async (req, res) => {
  try {
    const pool = getPool(req);
    const result = await pool.query(
      'SELECT * FROM meal_plans WHERE week_start_date = $1',
      [req.params.weekStartDate]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(toMealPlan(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/meal-plans — upsert
router.post('/', async (req, res) => {
  try {
    const pool = getPool(req);
    const { weekStartDate, meals } = req.body;

    const result = await pool.query(
      `INSERT INTO meal_plans (week_start_date, meals)
       VALUES ($1, $2)
       ON CONFLICT (week_start_date)
       DO UPDATE SET meals = $2, updated_at = NOW()
       RETURNING *`,
      [weekStartDate, JSON.stringify(meals)]
    );

    res.json(toMealPlan(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/meal-plans/:weekStartDate/meals — update a single meal slot
router.put('/:weekStartDate/meals', async (req, res) => {
  try {
    const pool = getPool(req);
    const { day, mealType, recipeId } = req.body;

    // Get current plan
    const current = await pool.query(
      'SELECT * FROM meal_plans WHERE week_start_date = $1',
      [req.params.weekStartDate]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    const meals = current.rows[0].meals as any[];
    const idx = meals.findIndex(
      (m: any) => m.day === day && m.mealType === mealType
    );

    if (idx >= 0) {
      meals[idx].recipeId = recipeId;
    } else {
      meals.push({ day, mealType, recipeId });
    }

    const result = await pool.query(
      `UPDATE meal_plans SET meals = $1, updated_at = NOW() WHERE week_start_date = $2 RETURNING *`,
      [JSON.stringify(meals), req.params.weekStartDate]
    );

    res.json(toMealPlan(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/meal-plans/:weekStartDate/clear — clear all meals for a week
router.delete('/:weekStartDate/clear', async (req, res) => {
  try {
    const pool = getPool(req);
    const current = await pool.query(
      'SELECT * FROM meal_plans WHERE week_start_date = $1',
      [req.params.weekStartDate]
    );

    if (current.rows.length === 0) {
      return res.json(null);
    }

    const meals = (current.rows[0].meals as any[]).map((m: any) => ({
      ...m,
      recipeId: null,
    }));

    const result = await pool.query(
      `UPDATE meal_plans SET meals = $1, updated_at = NOW() WHERE week_start_date = $2 RETURNING *`,
      [JSON.stringify(meals), req.params.weekStartDate]
    );

    res.json(toMealPlan(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
