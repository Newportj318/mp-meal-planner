import { useState } from 'react';
import { Globe, Loader2, AlertCircle } from 'lucide-react';
import { importApi } from '../../db/api';
import type { RecipeCreate } from '../../db/models';

interface UrlImportFormProps {
  onImported: (recipe: Partial<RecipeCreate>) => void;
}

export default function UrlImportForm({ onImported }: UrlImportFormProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { recipe } = await importApi.fromUrl(url.trim());

      if (!recipe.name) {
        setError('Could not extract a recipe from that URL. Try a different recipe page.');
        return;
      }

      // Attach source info
      recipe.source = { type: 'url', url: url.trim(), importedAt: new Date().toISOString() };
      onImported(recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Globe size={20} className="text-primary-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-primary-800">Import from Website</p>
            <p className="text-xs text-primary-600 mt-1">
              Paste a recipe URL from sites like Taste.com.au, BBC Good Food, AllRecipes, etc.
              We'll extract the recipe data automatically.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Recipe URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.taste.com.au/recipes/..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleImport()}
          />
          <button
            onClick={handleImport}
            disabled={loading || !url.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Importing...
              </>
            ) : (
              'Import'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
