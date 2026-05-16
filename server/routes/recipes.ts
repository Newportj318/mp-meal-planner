import { Router } from 'express';
import type { Pool } from 'pg';

const router = Router();

function getPool(req: any): Pool {
  return req.app.locals.pool;
}

// Converts snake_case DB row to camelCase API response
function toRecipe(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    servings: row.servings,
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    ingredients: row.ingredients,
    instructions: row.instructions,
    tags: row.tags,
    mealTypes: row.meal_types,
    source: row.source,
    imageUrl: row.image_url,
    metabolicProfile: row.metabolic_profile,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET /api/recipes — list all or search
router.get('/', async (req, res) => {
  try {
    const pool = getPool(req);
    const search = req.query.search as string | undefined;

    let result;
    if (search) {
      result = await pool.query(
        `SELECT * FROM recipes WHERE name ILIKE $1 OR $1 = ANY(SELECT jsonb_array_elements_text(tags)) ORDER BY name`,
        [`%${search}%`]
      );
    } else {
      result = await pool.query('SELECT * FROM recipes ORDER BY name');
    }

    res.json(result.rows.map(toRecipe));
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/recipes/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = getPool(req);
    const result = await pool.query('SELECT * FROM recipes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(toRecipe(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/recipes — create
router.post('/', async (req, res) => {
  try {
    const pool = getPool(req);
    const {
      name, description, servings, prepTime, cookTime,
      ingredients, instructions, tags, mealTypes,
      source, imageUrl, metabolicProfile,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO recipes (name, description, servings, prep_time, cook_time, ingredients, instructions, tags, meal_types, source, image_url, metabolic_profile)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        name, description || '', servings || 4, prepTime || 0, cookTime || 0,
        JSON.stringify(ingredients || []),
        JSON.stringify(instructions || []),
        JSON.stringify(tags || []),
        JSON.stringify(mealTypes || ['dinner']),
        JSON.stringify(source || { type: 'manual' }),
        imageUrl || null,
        JSON.stringify(metabolicProfile || { hasFirstClassProtein: false, hasCarbSource: false, hasOmega3: false }),
      ]
    );

    res.status(201).json(toRecipe(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/recipes/:id — update
router.put('/:id', async (req, res) => {
  try {
    const pool = getPool(req);
    const fields: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    const fieldMap: Record<string, string> = {
      name: 'name',
      description: 'description',
      servings: 'servings',
      prepTime: 'prep_time',
      cookTime: 'cook_time',
      imageUrl: 'image_url',
    };

    const jsonFieldMap: Record<string, string> = {
      ingredients: 'ingredients',
      instructions: 'instructions',
      tags: 'tags',
      mealTypes: 'meal_types',
      source: 'source',
      metabolicProfile: 'metabolic_profile',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (req.body[key] !== undefined) {
        fields.push(`${col} = $${paramIdx++}`);
        values.push(req.body[key]);
      }
    }

    for (const [key, col] of Object.entries(jsonFieldMap)) {
      if (req.body[key] !== undefined) {
        fields.push(`${col} = $${paramIdx++}`);
        values.push(JSON.stringify(req.body[key]));
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE recipes SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json(toRecipe(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/recipes/:id
router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool(req);
    const result = await pool.query('DELETE FROM recipes WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json({ deleted: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
