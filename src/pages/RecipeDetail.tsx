import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Edit2, Trash2 } from 'lucide-react';
import type { Recipe, RecipeCreate } from '../db/models';
import { GROCERY_CATEGORY_LABELS, MEAL_TYPE_LABELS } from '../db/models';
import { recipesApi } from '../db/api';
import MetabolicBadge from '../components/recipes/MetabolicBadge';
import RecipeForm from '../components/recipes/RecipeForm';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    recipesApi
      .get(Number(id))
      .then(setRecipe)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (data: RecipeCreate) => {
    if (!recipe) return;
    const updated = await recipesApi.update(recipe.id, data);
    setRecipe(updated);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!recipe) return;
    if (!confirm('Delete this recipe? This cannot be undone.')) return;
    await recipesApi.delete(recipe.id);
    navigate('/recipes');
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  if (error || !recipe) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Recipe not found'}</p>
        <button
          onClick={() => navigate('/recipes')}
          className="mt-4 text-primary-600 text-sm font-medium"
        >
          Back to Recipes
        </button>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setEditing(false)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} />
          Cancel Edit
        </button>
        <h1 className="text-xl font-bold text-gray-900 mb-6">Edit Recipe</h1>
        <RecipeForm
          initialData={recipe}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          submitLabel="Update Recipe"
        />
      </div>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/recipes')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to Recipes
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit2 size={15} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{recipe.name}</h1>
        {recipe.description && (
          <p className="text-gray-500 mb-4">{recipe.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
          {totalTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock size={15} />
              {totalTime} min
              {recipe.prepTime > 0 && recipe.cookTime > 0 && (
                <span className="text-xs text-gray-400">
                  ({recipe.prepTime} prep + {recipe.cookTime} cook)
                </span>
              )}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users size={15} />
            {recipe.servings} servings
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.mealTypes.map((type) => (
            <span key={type} className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
              {MEAL_TYPE_LABELS[type]}
            </span>
          ))}
          {recipe.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>

        {/* MP Badge */}
        <MetabolicBadge profile={recipe.metabolicProfile} />
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-800">
                {ing.quantity} {ing.unit} {ing.name}
                {ing.notes && (
                  <span className="text-gray-400 ml-1">({ing.notes})</span>
                )}
              </span>
              <span className="text-xs text-gray-400">
                {GROCERY_CATEGORY_LABELS[ing.category]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      {recipe.instructions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h2>
          <ol className="space-y-3">
            {recipe.instructions.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-semibold">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
