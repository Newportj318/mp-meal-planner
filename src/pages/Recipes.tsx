import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, X, PenLine, Globe, FileText, ChevronDown, Tag } from 'lucide-react';
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ImportTab>('manual');
  const [importedData, setImportedData] = useState<Partial<RecipeCreate> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Collect all unique tags + meal types for the filter dropdown
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const r of recipes) {
      for (const t of r.tags) tagSet.add(t.toLowerCase());
      for (const mt of r.mealTypes) tagSet.add(mt.toLowerCase());
    }
    return Array.from(tagSet).sort();
  }, [recipes]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredRecipes = recipes.filter((r) => {
    // Text search filter
    if (search) {
      const q = search.toLowerCase();
      const matchesSearch =
        r.name.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)) ||
        r.mealTypes.some((t) => t.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    // Tag filter — recipe must match ALL selected tags
    if (selectedTags.length > 0) {
      const recipeTags = [
        ...r.tags.map((t) => t.toLowerCase()),
        ...r.mealTypes.map((t) => t.toLowerCase()),
      ];
      const matchesTags = selectedTags.every((tag) => recipeTags.includes(tag));
      if (!matchesTags) return false;
    }

    return true;
  });

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recipes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
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

      {/* Search + Tag Filter */}
      <div className="flex gap-3 items-start">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes by name..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
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

        {/* Tag Filter Dropdown */}
        <div className="relative" ref={tagDropdownRef}>
          <button
            onClick={() => setShowTagDropdown(!showTagDropdown)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              selectedTags.length > 0
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Tag size={16} />
            Filter{selectedTags.length > 0 ? ` (${selectedTags.length})` : ''}
            <ChevronDown size={14} className={`transition-transform ${showTagDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showTagDropdown && allTags.length > 0 && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-2 max-h-64 overflow-y-auto">
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="w-full px-3 py-1.5 text-left text-xs text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Clear all filters
                </button>
              )}
              {allTags.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => toggleTag(tag)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{tag}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active tag filters */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-xs font-medium"
            >
              <span className="capitalize">{tag}</span>
              <button
                onClick={() => toggleTag(tag)}
                className="hover:text-primary-900 dark:hover:text-primary-200"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add Recipe Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Recipe</h2>
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
