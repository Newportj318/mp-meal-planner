import { Clock, Users, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Recipe } from '../../db/models';
import { MEAL_TYPE_LABELS } from '../../db/models';
import MetabolicBadge from './MetabolicBadge';

interface RecipeCardProps {
  recipe: Recipe;
  onDelete?: (id: number) => void;
}

export default function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  const navigate = useNavigate();
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => navigate(`/recipes/${recipe.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-base leading-tight pr-2">
          {recipe.name}
        </h3>
        <MetabolicBadge profile={recipe.metabolicProfile} compact />
      </div>

      {/* Description */}
      {recipe.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {recipe.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
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
          <span
            key={type}
            className="inline-block px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs"
          >
            {MEAL_TYPE_LABELS[type]}
          </span>
        ))}
        {recipe.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
          >
            {tag}
          </span>
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
