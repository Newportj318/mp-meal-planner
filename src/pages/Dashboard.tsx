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

  // MP scorecard: count meals that have all 3 components
  const plannedRecipeIds = mealPlan?.meals
    .filter((m) => m.recipeId !== null)
    .map((m) => m.recipeId!) || [];
  const plannedRecipes = recipes.filter((r) => plannedRecipeIds.includes(r.id));
  const mpCompliant = plannedRecipes.filter(
    (r) =>
      r.metabolicProfile.hasFirstClassProtein &&
      r.metabolicProfile.hasCarbSource &&
      r.metabolicProfile.hasOmega3
  ).length;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Meal Planner
        </h1>
        <p className="text-gray-500 mt-1">
          {formatWeekLabel(getWeekStart())}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <CalendarDays size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{plannedCount}/{totalSlots}</p>
              <p className="text-xs text-gray-500">Meals Planned</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${planPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {mpCompliant}/{plannedRecipes.length}
              </p>
              <p className="text-xs text-gray-500">MP Compliant Meals</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <BookOpen size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
              <p className="text-xs text-gray-500">Recipes in Database</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
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
            className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-md transition-shadow"
          >
            <BookOpen size={24} className="mb-2 text-gray-600" />
            <p className="font-semibold text-gray-900">Add Recipe</p>
            <p className="text-sm text-gray-500 mt-1">Build your recipe database</p>
          </button>

          <button
            onClick={() => navigate('/export')}
            className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-md transition-shadow"
          >
            <ShoppingCart size={24} className="mb-2 text-gray-600" />
            <p className="font-semibold text-gray-900">Export Grocery List</p>
            <p className="text-sm text-gray-500 mt-1">Download your shopping list</p>
          </button>
        </div>
      </div>
    </div>
  );
}
