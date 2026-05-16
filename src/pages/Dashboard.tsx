import { useNavigate } from 'react-router-dom';
import { BookOpen, CalendarDays, ShoppingCart, TrendingUp } from 'lucide-react';
import { useRecipes } from '../hooks/useRecipes';
import { useMealPlan } from '../hooks/useMealPlan';
import { getWeekStartISO, formatWeekLabel, getWeekStart } from '../utils/weekHelpers';

export default function Dashboard() {
  const navigate = useNavigate();
  const { recipes } = useRecipes();
  const weekStart = getWeekStartISO();
  const { mealPlan } = useMealPlan(weekStart);

  const plannedCount = mealPlan?.meals.filter((m) => m.recipeId !== null).length || 0;
  const totalSlots = 21; // 7 days x 3 meals
  const planPercentage = Math.round((plannedCount / totalSlots) * 100);

  // MP scorecard: count per meal slot (not per unique recipe)
  const plannedMeals = mealPlan?.meals.filter((m) => m.recipeId !== null) || [];
  const mpCompliant = plannedMeals.filter((m) => {
    const recipe = recipes.find((r) => r.id === m.recipeId);
    return recipe &&
      recipe.metabolicProfile.hasFirstClassProtein &&
      recipe.metabolicProfile.hasCarbSource &&
      recipe.metabolicProfile.hasOmega3;
  }).length;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Meal Planner
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {formatWeekLabel(getWeekStart())}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center">
              <CalendarDays size={20} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{plannedCount}/{totalSlots}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Meals Planned</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${planPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mpCompliant}/{plannedCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">MP Compliant Meals</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
              <BookOpen size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{recipes.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Recipes in Database</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/planner')}
            className="bg-primary-600 text-white rounded-xl p-5 text-left hover:bg-primary-700 transition-colors"
          >
            <CalendarDays size={24} className="mb-2" />
            <p className="font-semibold">Plan This Week</p>
            <p className="text-sm text-primary-200 mt-1">Set your meals for the week</p>
          </button>

          <button
            onClick={() => navigate('/recipes')}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-left hover:shadow-md transition-shadow"
          >
            <BookOpen size={24} className="mb-2 text-gray-600 dark:text-gray-400" />
            <p className="font-semibold text-gray-900 dark:text-white">Add Recipe</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Build your recipe database</p>
          </button>

          <button
            onClick={() => navigate('/export')}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-left hover:shadow-md transition-shadow"
          >
            <ShoppingCart size={24} className="mb-2 text-gray-600 dark:text-gray-400" />
            <p className="font-semibold text-gray-900 dark:text-white">Export Grocery List</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Download your shopping list</p>
          </button>
        </div>
      </div>
    </div>
  );
}
