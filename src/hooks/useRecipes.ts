import { useState, useEffect, useCallback } from 'react';
import type { Recipe, RecipeCreate, RecipeUpdate } from '../db/models';
import { recipesApi } from '../db/api';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = search
        ? await recipesApi.search(search)
        : await recipesApi.list();
      setRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const addRecipe = async (recipe: RecipeCreate): Promise<Recipe> => {
    const created = await recipesApi.create(recipe);
    setRecipes((prev) => [...prev, created]);
    return created;
  };

  const updateRecipe = async (id: number, updates: RecipeUpdate): Promise<Recipe> => {
    const updated = await recipesApi.update(id, updates);
    setRecipes((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  const deleteRecipe = async (id: number): Promise<void> => {
    await recipesApi.delete(id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
  };
}
