import { X, Plus } from 'lucide-react';
import type { Recipe, DayOfWeek, MealType } from '../../db/models';

interface MealSlotProps {
  day: DayOfWeek;
  mealType: MealType;
  recipeId: number | null;
  recipes: Recipe[];
  onSelect: (day: DayOfWeek, mealType: MealType, recipeId: number | null) => void;
}

export default function MealSlot({
  day,
  mealType,
  recipeId,
  recipes,
  onSelect,
}: MealSlotProps) {
  const selectedRecipe = recipeId
    ? recipes.find((r) => r.id === recipeId)
    : null;

  if (selectedRecipe) {
    return (
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-2 min-h-[60px] flex items-center justify-between gap-1 group">
        <span className="text-xs font-medium text-primary-800 leading-tight line-clamp-2">
          {selectedRecipe.name}
        </span>
        <button
          onClick={() => onSelect(day, mealType, null)}
          className="p-1 rounded text-primary-400 hover:text-red-500 hover:bg-white transition-colors opacity-0 group-hover:opacity-100 shrink-0"
          aria-label="Clear meal"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[60px]">
      <select
        value=""
        onChange={(e) => {
          const id = Number(e.target.value);
          if (id) onSelect(day, mealType, id);
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      >
        <option value="">Select a recipe...</option>
        {recipes.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-2 min-h-[60px] flex items-center justify-center text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors cursor-pointer">
        <Plus size={16} />
      </div>
    </div>
  );
}
