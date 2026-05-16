import { useState } from 'react';
import { Search, Plus, X, PenLine, Globe, FileText } from 'lucide-react';
import { useRecipes } from '../hooks/useRecipes';
import RecipeCard from '../components/recipes/RecipeCard';
import RecipeForm from '../components/recipes/RecipeForm';
import UrlImportForm from '../components/recipes/UrlImportForm';
import PdfImportForm from '../components/recipes/PdfImportForm';
import type { RecipeCreate } from '../db/models';

type ImportTab = 'manual' | 'url' | 'pdf';

export default function Recipes() {
  const { recipes, loading, addRecipe, deleteRecipe } = useRecipes();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ImportTab>('manual');
  const [importedData, setImportedData] = useState<Partial<RecipeCreate> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const filteredRecipes = search
    ? recipes.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
          r.mealTypes.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : recipes;

  const handleAddRecipe = async (recipe: RecipeCreate) => {
    await addRecipe(recipe);
    setShowModal(false);
    setImportedData(null);
    setActiveTab('manual');
  };

  const handleImported = (recipe: Partial<RecipeCreate>) => {
    // Switch to manual form pre-filled with imported data so user can review/edit
    setImportedData(recipe);
    setActiveTab('manual');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setImportedData(null);
    setActiveTab('manual');
  };

  const handleDelete = async (id: number) => {
    if (deleteConfirm === id) {
      await deleteRecipe(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const tabs: { id: ImportTab; label: string; icon: typeof PenLine }[] = [
    { id: 'manual', label: 'Manual', icon: PenLine },
    { id: 'url', label: 'From URL', icon: Globe },
    { id: 'pdf', label: 'From PDF', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recipes</h1>
          <p className="text-gray-500 text-sm mt-1">
            {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} in your database
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          Add Recipe
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipes by name, tag, or meal type..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Add Recipe Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Add New Recipe</h2>
              <button
                onClick={handleCloseModal}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id);
                    if (id !== 'manual') setImportedData(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    activeTab === id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'manual' && (
              <div>
                {importedData && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-emerald-700">
                      Recipe imported — review the details below and edit anything before saving.
                    </p>
                  </div>
                )}
                <RecipeForm
                  initialData={importedData || undefined}
                  onSubmit={handleAddRecipe}
                  onCancel={handleCloseModal}
                />
              </div>
            )}

            {activeTab === 'url' && (
              <UrlImportForm onImported={handleImported} />
            )}

            {activeTab === 'pdf' && (
              <PdfImportForm onImported={handleImported} />
            )}
          </div>
        </div>
      )}

      {/* Recipe Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading recipes...</div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-16">
          <BookOpenIcon />
          <p className="text-gray-500 mt-3">
            {search ? 'No recipes match your search.' : 'No recipes yet.'}
          </p>
          {!search && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Add Your First Recipe
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation toast */}
      {deleteConfirm !== null && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
          Click delete again to confirm
        </div>
      )}
    </div>
  );
}

function BookOpenIcon() {
  return (
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-400"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    </div>
  );
}
