import { useState, useEffect, useCallback } from 'react';
import type { MealPlan, PlannedMeal, DayOfWeek, MealType } from '../db/models';
import { DAYS_OF_WEEK, MEAL_TYPES } from '../db/models';
import { mealPlansApi } from '../db/api';

function createEmptyMeals(): PlannedMeal[] {
  const meals: PlannedMeal[] = [];
  for (const day of DAYS_OF_WEEK) {
    for (const mealType of MEAL_TYPES.filter((t) => t !== 'snack')) {
      meals.push({ day, mealType, recipeId: null });
    }
  }
  return meals;
}

export function useMealPlan(weekStartDate: string) {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const plan = await mealPlansApi.getByWeek(weekStartDate);
      setMealPlan(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meal plan');
    } finally {
      setLoading(false);
    }
  }, [weekStartDate]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const setMeal = async (day: DayOfWeek, mealType: MealType, recipeId: number | null) => {
    try {
      const meal: PlannedMeal = { day, mealType, recipeId };

      // If no plan exists yet, create one
      if (!mealPlan) {
        const meals = createEmptyMeals();
        const idx = meals.findIndex((m) => m.day === day && m.mealType === mealType);
        if (idx >= 0) meals[idx].recipeId = recipeId;

        const created = await mealPlansApi.upsert({ weekStartDate, meals });
        setMealPlan(created);
      } else {
        const updated = await mealPlansApi.updateMeal(weekStartDate, meal);
        setMealPlan(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update meal');
    }
  };

  const getMeal = (day: DayOfWeek, mealType: MealType): PlannedMeal | undefined => {
    return mealPlan?.meals.find((m) => m.day === day && m.mealType === mealType);
  };

  const clearWeek = async () => {
    try {
      const result = await mealPlansApi.clearWeek(weekStartDate);
      setMealPlan(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear week');
    }
  };

  const getPlannedRecipeIds = (): number[] => {
    if (!mealPlan) return [];
    return mealPlan.meals
      .filter((m) => m.recipeId !== null)
      .map((m) => m.recipeId!);
  };

  return {
    mealPlan,
    loading,
    error,
    setMeal,
    getMeal,
    clearWeek,
    getPlannedRecipeIds,
    refresh: fetchPlan,
  };
}
