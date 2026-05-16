import { useState, useEffect } from 'react';
import { Download, ShoppingCart } from 'lucide-react';
import { useRecipes } from '../hooks/useRecipes';
import { useMealPlan } from '../hooks/useMealPlan';
import {
  getWeekStart,
  nextWeek,
  prevWeek,
  formatWeekLabel,
} from '../utils/weekHelpers';
import { aggregateGroceryList } from '../utils/groceryAggregator';
import { generateGroceryPdf } from '../utils/pdfGenerator';
import WeekSelector from '../components/planner/WeekSelector';
import CategorySection from '../components/export/CategorySection';
import type { GroupedGroceryList, Recipe } from '../db/models';
import { format } from 'date-fns';

export default function Export() {
  const [currentMonday, setCurrentMonday] = useState<Date>(getWeekStart());
  const weekStartISO = format(currentMonday, 'yyyy-MM-dd');

  const { recipes } = useRecipes();
  const { mealPlan, loading } = useMealPlan(weekStartISO);
  const [groceryList, setGroceryList] = useState<GroupedGroceryList[]>([]);

  // Build grocery list when plan or recipes change
  useEffect(() => {
    if (!mealPlan || recipes.length === 0) {
      setGroceryList([]);
      return;
    }

    const plannedRecipeIds = mealPlan.meals
      .filter((m) => m.recipeId !== null)
      .map((m) => m.recipeId!);

    // Collect recipes (may appear multiple times if used for multiple meals)
    const plannedRecipes: Recipe[] = [];
    for (const id of plannedRecipeIds) {
      const recipe = recipes.find((r) => r.id === id);
      if (recipe) plannedRecipes.push(recipe);
    }

    const grouped = aggregateGroceryList(plannedRecipes);
    setGroceryList(grouped);
  }, [mealPlan, recipes]);

  const handleExportPdf = () => {
    const weekLabel = formatWeekLabel(currentMonday);
    generateGroceryPdf(groceryList, weekLabel);
  };

  const totalItems = groceryList.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grocery List</h1>
          <p className="text-sm text-gray-500 mt-1">
            Auto-generated from your meal plan. Ingredients grouped and aggregated.
          </p>
        </div>
        {groceryList.length > 0 && (
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Download size={18} />
            Export PDF
          </button>
        )}
      </div>

      <WeekSelector
        currentMonday={currentMonday}
        onPrev={() => setCurrentMonday(prevWeek(currentMonday))}
        onNext={() => setCurrentMonday(nextWeek(currentMonday))}
        onToday={() => setCurrentMonday(getWeekStart())}
      />

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : groceryList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-500">
            No meals planned for this week yet. Head to the Planner to get started.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {totalItems} item{totalItems !== 1 ? 's' : ''} across {groceryList.length} categor{groceryList.length !== 1 ? 'ies' : 'y'}
          </p>
          {groceryList.map((group) => (
            <CategorySection key={group.category} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
