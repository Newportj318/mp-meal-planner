// ==========================================
// Data Models — Weekly Meal Planner
// ==========================================

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type GroceryCategory =
  | 'meat-seafood'
  | 'poultry'
  | 'dairy-eggs'
  | 'vegetables'
  | 'fruits'
  | 'grains-bread'
  | 'pantry'
  | 'spices-herbs'
  | 'oils-sauces'
  | 'frozen'
  | 'other';

export const GROCERY_CATEGORY_LABELS: Record<GroceryCategory, string> = {
  'meat-seafood': 'Meat & Seafood',
  poultry: 'Poultry',
  'dairy-eggs': 'Dairy & Eggs',
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  'grains-bread': 'Grains & Bread',
  pantry: 'Pantry',
  'spices-herbs': 'Spices & Herbs',
  'oils-sauces': 'Oils & Sauces',
  frozen: 'Frozen',
  other: 'Other',
};

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export const DAY_LABELS_FULL: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

// ==========================================
// Ingredient
// ==========================================

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category: GroceryCategory;
  notes?: string;
}

// ==========================================
// Metabolic Precision Profile
// ==========================================

export interface MetabolicProfile {
  hasFirstClassProtein: boolean;
  proteinSource?: string;
  hasCarbSource: boolean;
  carbType?: 'high-energy' | 'low-energy' | 'both';
  hasOmega3: boolean;
  omega3Source?: string;
}

// ==========================================
// Recipe Source
// ==========================================

export interface RecipeSource {
  type: 'manual' | 'url';
  url?: string;
  importedAt?: string;
}

// ==========================================
// Recipe
// ==========================================

export interface Recipe {
  id: number;
  name: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  ingredients: Ingredient[];
  instructions: string[];
  tags: string[];
  mealTypes: MealType[];
  source: RecipeSource;
  imageUrl?: string;
  metabolicProfile: MetabolicProfile;
  createdAt: string;
  updatedAt: string;
}

export type RecipeCreate = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>;
export type RecipeUpdate = Partial<RecipeCreate>;

// ==========================================
// Meal Plan
// ==========================================

export interface PlannedMeal {
  day: DayOfWeek;
  mealType: MealType;
  recipeId: number | null;
  notes?: string;
}

export interface MealPlan {
  id: number;
  weekStartDate: string; // ISO date of the Monday
  meals: PlannedMeal[];
  createdAt: string;
  updatedAt: string;
}

export type MealPlanCreate = Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>;

// ==========================================
// Aggregated Grocery Item (for export)
// ==========================================

export interface AggregatedGroceryItem {
  name: string;
  totalQuantity: number;
  unit: string;
  category: GroceryCategory;
  fromRecipes: string[];
}

export interface GroupedGroceryList {
  category: GroceryCategory;
  label: string;
  items: AggregatedGroceryItem[];
}
