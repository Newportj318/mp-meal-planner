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
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header row — day names */}
        <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-2">
          <div /> {/* Empty corner cell */}
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-700 py-2"
            >
              {formatDayShort(monday, day)}
            </div>
          ))}
        </div>

        {/* Meal rows */}
        {PLANNER_MEAL_TYPES.map((mealType) => (
          <div
            key={mealType}
            className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-2"
          >
            {/* Row label */}
            <div className="flex items-center justify-end pr-3 text-sm font-medium text-gray-500">
              {MEAL_TYPE_LABELS[mealType]}
            </div>

            {/* Day slots */}
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
  );
}
