import { useState } from 'react';
import { Plus, Minus, Loader2 } from 'lucide-react';
import type {
  RecipeCreate,
  Ingredient,
  MealType,
  GroceryCategory,
  MetabolicProfile,
} from '../../db/models';
import {
  MEAL_TYPE_LABELS,
  MEAL_TYPES,
  GROCERY_CATEGORY_LABELS,
} from '../../db/models';

// ==========================================
// Constants
// ==========================================

const UNITS = ['g', 'kg', 'ml', 'L', 'cup', 'tbsp', 'tsp', 'each', 'bunch', 'can', 'slice', 'fillet', 'breast'];

const CATEGORY_OPTIONS: { value: GroceryCategory; label: string }[] = Object.entries(
  GROCERY_CATEGORY_LABELS
).map(([value, label]) => ({ value: value as GroceryCategory, label }));

const EMPTY_INGREDIENT: Ingredient = {
  name: '',
  quantity: 0,
  unit: 'g',
  category: 'other',
};

// ==========================================
// Props
// ==========================================

interface RecipeFormProps {
  initialData?: Partial<RecipeCreate>;
  onSubmit: (recipe: RecipeCreate) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export default function RecipeForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Recipe',
}: RecipeFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [servings, setServings] = useState(initialData?.servings || 4);
  const [prepTime, setPrepTime] = useState(initialData?.prepTime || 0);
  const [cookTime, setCookTime] = useState(initialData?.cookTime || 0);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialData?.ingredients?.length ? initialData.ingredients : [{ ...EMPTY_INGREDIENT }]
  );
  const [instructions, setInstructions] = useState<string[]>(
    initialData?.instructions?.length ? initialData.instructions : ['']
  );
  const [mealTypes, setMealTypes] = useState<MealType[]>(
    initialData?.mealTypes || ['dinner']
  );
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [metabolicProfile, setMetabolicProfile] = useState<MetabolicProfile>(
    initialData?.metabolicProfile || {
      hasFirstClassProtein: false,
      hasCarbSource: false,
      hasOmega3: false,
    }
  );
  const [saving, setSaving] = useState(false);

  // ==========================================
  // Ingredient handlers
  // ==========================================

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { ...EMPTY_INGREDIENT }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // ==========================================
  // Instruction handlers
  // ==========================================

  const updateInstruction = (index: number, value: string) => {
    setInstructions((prev) => prev.map((inst, i) => (i === index ? value : inst)));
  };

  const addInstruction = () => {
    setInstructions((prev) => [...prev, '']);
  };

  const removeInstruction = (index: number) => {
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  // ==========================================
  // Meal type toggle
  // ==========================================

  const toggleMealType = (type: MealType) => {
    setMealTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // ==========================================
  // Submit
  // ==========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        servings,
        prepTime,
        cookTime,
        ingredients: ingredients.filter((i) => i.name.trim()),
        instructions: instructions.filter((i) => i.trim()),
        mealTypes,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        source: initialData?.source || { type: 'manual' },
        metabolicProfile,
      });
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name + Description */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipe Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="e.g. Grilled Salmon with Roasted Vegetables"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            placeholder="Brief description of the meal..."
          />
        </div>
      </div>

      {/* Servings + Times */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
          <input
            type="number"
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            min={1}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prep (min)</label>
          <input
            type="number"
            value={prepTime}
            onChange={(e) => setPrepTime(Number(e.target.value))}
            min={0}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cook (min)</label>
          <input
            type="number"
            value={cookTime}
            onChange={(e) => setCookTime(Number(e.target.value))}
            min={0}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>

      {/* Meal Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
        <div className="flex gap-2">
          {MEAL_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleMealType(type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mealTypes.includes(type)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {MEAL_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
        <div className="space-y-2">
          {ingredients.map((ing, index) => (
            <div key={index} className="flex gap-2 items-start">
              <input
                type="number"
                value={ing.quantity || ''}
                onChange={(e) => updateIngredient(index, 'quantity', Number(e.target.value))}
                placeholder="Qty"
                className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                min={0}
                step="any"
              />
              <select
                value={ing.unit}
                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <input
                type="text"
                value={ing.name}
                onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                placeholder="Ingredient name"
                className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
              <select
                value={ing.category}
                onChange={(e) => updateIngredient(index, 'category', e.target.value)}
                className="w-36 px-2 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                disabled={ingredients.length === 1}
              >
                <Minus size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredient}
          className="mt-2 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          <Plus size={16} />
          Add Ingredient
        </button>
      </div>

      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
        <div className="space-y-2">
          {instructions.map((step, index) => (
            <div key={index} className="flex gap-2 items-start">
              <span className="flex items-center justify-center w-7 h-9 text-xs font-medium text-gray-400">
                {index + 1}.
              </span>
              <textarea
                value={step}
                onChange={(e) => updateInstruction(index, e.target.value)}
                placeholder={`Step ${index + 1}...`}
                rows={2}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                disabled={instructions.length === 1}
              >
                <Minus size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addInstruction}
          className="mt-2 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          <Plus size={16} />
          Add Step
        </button>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags <span className="text-gray-400 font-normal">(comma separated)</span>
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. quick, chicken, weeknight"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
      </div>

      {/* Metabolic Precision Profile */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Metabolic Precision Profile
        </label>
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 space-y-3">
          {/* Protein */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={metabolicProfile.hasFirstClassProtein}
              onChange={(e) =>
                setMetabolicProfile((prev) => ({
                  ...prev,
                  hasFirstClassProtein: e.target.checked,
                }))
              }
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">First Class Protein</span>
            <input
              type="text"
              value={metabolicProfile.proteinSource || ''}
              onChange={(e) =>
                setMetabolicProfile((prev) => ({ ...prev, proteinSource: e.target.value }))
              }
              placeholder="e.g. chicken breast"
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Carbs */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={metabolicProfile.hasCarbSource}
              onChange={(e) =>
                setMetabolicProfile((prev) => ({
                  ...prev,
                  hasCarbSource: e.target.checked,
                }))
              }
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Carb Source</span>
            <select
              value={metabolicProfile.carbType || ''}
              onChange={(e) =>
                setMetabolicProfile((prev) => ({
                  ...prev,
                  carbType: (e.target.value || undefined) as MetabolicProfile['carbType'],
                }))
              }
              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">Select type</option>
              <option value="low-energy">Low Energy (veg/fruit)</option>
              <option value="high-energy">High Energy (grains)</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Omega-3 */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={metabolicProfile.hasOmega3}
              onChange={(e) =>
                setMetabolicProfile((prev) => ({
                  ...prev,
                  hasOmega3: e.target.checked,
                }))
              }
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Omega-3 Source</span>
            <input
              type="text"
              value={metabolicProfile.omega3Source || ''}
              onChange={(e) =>
                setMetabolicProfile((prev) => ({ ...prev, omega3Source: e.target.value }))
              }
              placeholder="e.g. salmon, flax oil"
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
