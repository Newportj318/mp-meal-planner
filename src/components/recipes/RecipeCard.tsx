import { Clock, Users, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Recipe } from '../../db/models';
import { MEAL_TYPE_LABELS } from '../../db/models';
import MetabolicBadge from './MetabolicBadge';

interface RecipeCardProps {
  recipe: Recipe;
  onDelete?: (id: number) => void;
  onTagClick?: (tag: string) => void;
}

export default function RecipeCard({ recipe, onDelete, onTagClick }: RecipeCardProps) {
  const navigate = useNavigate();
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => navigate(`/recipes/${recipe.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight pr-2">
          {recipe.name}
        </h3>
        <MetabolicBadge profile={recipe.metabolicProfile} compact />
      </div>

      {/* Description */}
      {recipe.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
          {recipe.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 mb-3">
        {totalTime > 0 && (
          <span className="flex items-center gap-1">
            <Clock size={13} />
            {totalTime} min
          </span>
        )}
        <span className="flex items-center gap-1">
          <Users size={13} />
          {recipe.servings} serves
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {recipe.mealTypes.map((type) => (
          <button
            key={type}
            onClick={(e) => {
              e.stopPropagation();
              onTagClick?.(type.toLowerCase());
            }}
            className="inline-block px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded text-xs hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
          >
            {MEAL_TYPE_LABELS[type]}
          </button>
        ))}
        {recipe.tags.slice(0, 3).map((tag) => (
          <button
            key={tag}
            onClick={(e) => {
              e.stopPropagation();
              onTagClick?.(tag.toLowerCase());
            }}
            className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(recipe.id);
          }}
          className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={13} />
          Delete
        </button>
      )}
    </div>
  );
}
