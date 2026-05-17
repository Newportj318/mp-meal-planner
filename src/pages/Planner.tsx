import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRecipes } from '../hooks/useRecipes';
import { useMealPlan } from '../hooks/useMealPlan';
import { getWeekStart, nextWeek, prevWeek } from '../utils/weekHelpers';
import WeekSelector from '../components/planner/WeekSelector';
import PlannerGrid from '../components/planner/PlannerGrid';
import type { DayOfWeek, MealType } from '../db/models';
import { format } from 'date-fns';

export default function Planner() {
  const [currentMonday, setCurrentMonday] = useState<Date>(getWeekStart());
  const weekStartISO = format(currentMonday, 'yyyy-MM-dd');

  const { recipes } = useRecipes();
  const { mealPlan, loading, setMeal, clearWeek } = useMealPlan(weekStartISO);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSelectMeal = (day: DayOfWeek, mealType: MealType, recipeId: number | null) => {
    setMeal(day, mealType, recipeId);
  };

  const handleClearWeek = async () => {
    await clearWeek();
    setShowClearConfirm(false);
  };

  const hasPlannedMeals = mealPlan?.meals.some((m) => m.recipeId !== null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">Weekly Planner</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
            Plan your meals for the week. Pick recipes from your database.
          </p>
        </div>
        {hasPlannedMeals && (
          <div className="relative">
            {showClearConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600 dark:text-red-400">Clear all meals?</span>
                <button
                  onClick={handleClearWeek}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, clear
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                Clear Week
              </button>
            )}
          </div>
        )}
      </div>

      <WeekSelector
        currentMonday={currentMonday}
        onPrev={() => setCurrentMonday(prevWeek(currentMonday))}
        onNext={() => setCurrentMonday(nextWeek(currentMonday))}
        onToday={() => setCurrentMonday(getWeekStart())}
      />

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading plan...</div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Add some recipes first to start planning your week.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <PlannerGrid
            monday={currentMonday}
            meals={mealPlan?.meals || []}
            recipes={recipes}
            onSelectMeal={handleSelectMeal}
          />
        </div>
      )}
    </div>
  );
}
