// ==========================================
// API Client — talks to the Express backend
// ==========================================

import type {
  Recipe,
  RecipeCreate,
  RecipeUpdate,
  MealPlan,
  MealPlanCreate,
  PlannedMeal,
} from './models';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `API error: ${res.status}`);
  }
  return res.json();
}

// ==========================================
// Recipes
// ==========================================

export const recipesApi = {
  list: () => request<Recipe[]>('/recipes'),

  get: (id: number) => request<Recipe>(`/recipes/${id}`),

  search: (query: string) => request<Recipe[]>(`/recipes?search=${encodeURIComponent(query)}`),

  create: (recipe: RecipeCreate) =>
    request<Recipe>('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    }),

  update: (id: number, recipe: RecipeUpdate) =>
    request<Recipe>(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipe),
    }),

  delete: (id: number) =>
    request<void>(`/recipes/${id}`, { method: 'DELETE' }),
};

// ==========================================
// Meal Plans
// ==========================================

export const mealPlansApi = {
  getByWeek: (weekStartDate: string) =>
    request<MealPlan | null>(`/meal-plans/${weekStartDate}`),

  upsert: (plan: MealPlanCreate) =>
    request<MealPlan>('/meal-plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    }),

  updateMeal: (weekStartDate: string, meal: PlannedMeal) =>
    request<MealPlan>(`/meal-plans/${weekStartDate}/meals`, {
      method: 'PUT',
      body: JSON.stringify(meal),
    }),
};

// ==========================================
// Recipe Import (URL scraping)
// ==========================================

export const importApi = {
  fromUrl: (url: string) =>
    request<{ recipe: Partial<RecipeCreate> }>('/import/url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  fromPdf: async (file: File): Promise<{ recipe: Partial<RecipeCreate>; rawText: string }> => {
    const formData = new FormData();
    formData.append('pdf', file);

    const res = await fetch(`${API_BASE}/import/pdf`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type — browser sets it with boundary for multipart
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || `API error: ${res.status}`);
    }

    return res.json();
  },
};
