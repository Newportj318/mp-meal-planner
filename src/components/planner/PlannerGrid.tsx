import type { Recipe, DayOfWeek, MealType, PlannedMeal } from '../../db/models';
import { DAYS_OF_WEEK, MEAL_TYPE_LABELS } from '../../db/models';
import { formatDayShort } from '../../utils/weekHelpers';
import MealSlot from './MealSlot';

const PLANNER_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

interface PlannerGridProps {
  monday: Date;
  meals: PlannedMeal[];
  recipes: Recipe[];
  onSelectMeal: (day: DayOfWeek, mealType: MealType, recipeId: number | null) => void;
}

export default function PlannerGrid({
  monday,
  meals,
  recipes,
  onSelectMeal,
}: PlannerGridProps) {
  const getRecipeId = (day: DayOfWeek, mealType: MealType): number | null => {
    const meal = meals.find((m) => m.day === day && m.mealType === mealType);
    return meal?.recipeId ?? null;
  };

  return (
    <>
      {/* Desktop: horizontal grid (hidden on mobile) */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header row */}
          <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-2">
            <div />
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 py-2"
              >
                {formatDayShort(monday, day)}
              </div>
            ))}
          </div>

          {PLANNER_MEAL_TYPES.map((mealType) => (
            <div
              key={mealType}
              className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-2"
            >
              <div className="flex items-center justify-end pr-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                {MEAL_TYPE_LABELS[mealType]}
              </div>
              {DAYS_OF_WEEK.map((day) => (
                <MealSlot
                  key={`${day}-${mealType}`}
                  day={day}
                  mealType={mealType}
                  recipeId={getRecipeId(day, mealType)}
                  recipes={recipes}
                  onSelect={onSelectMeal}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: vertical day cards (hidden on desktop) */}
      <div className="sm:hidden space-y-3">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3"
          >
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {formatDayShort(monday, day)}
            </h3>
            <div className="space-y-2">
              {PLANNER_MEAL_TYPES.map((mealType) => (
                <div key={`${day}-${mealType}`} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-16 shrink-0">
                    {MEAL_TYPE_LABELS[mealType]}
                  </span>
                  <div className="flex-1">
                    <MealSlot
                      day={day}
                      mealType={mealType}
                      recipeId={getRecipeId(day, mealType)}
                      recipes={recipes}
                      onSelect={onSelectMeal}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
