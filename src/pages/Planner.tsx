import { useState } from 'react';
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
  const { mealPlan, loading, setMeal } = useMealPlan(weekStartISO);

  const handleSelectMeal = (day: DayOfWeek, mealType: MealType, recipeId: number | null) => {
    setMeal(day, mealType, recipeId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Weekly Planner</h1>
        <p className="text-sm text-gray-500">
          Plan your meals for the week. Pick recipes from your database.
        </p>
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
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
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
