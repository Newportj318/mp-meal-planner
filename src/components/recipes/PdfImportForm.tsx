import { useState, useRef } from 'react';
import { FileText, Upload, Loader2, AlertCircle } from 'lucide-react';
import { importApi } from '../../db/api';
import type { RecipeCreate } from '../../db/models';

interface PdfImportFormProps {
  onImported: (recipe: Partial<RecipeCreate>) => void;
}

export default function PdfImportForm({ onImported }: PdfImportFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }

    setLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      const { recipe } = await importApi.fromPdf(file);

      if (!recipe.name) {
        setError('Could not extract a recipe from that PDF. You may need to enter it manually.');
        return;
      }

      recipe.source = { type: 'manual' }; // PDF source treated as manual
      onImported(recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-4">
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText size={20} className="text-primary-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-primary-800">Import from PDF</p>
            <p className="text-xs text-primary-600 mt-1">
              Drop a recipe PDF and we'll extract the ingredients, instructions, and details.
              Works best with text-based PDFs (not scanned images).
            </p>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleInputChange}
          className="hidden"
        />

        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={32} className="text-primary-500 animate-spin" />
            <p className="text-sm text-gray-600">Parsing {fileName}...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={32} className="text-gray-400" />
            <p className="text-sm font-medium text-gray-700">
              Drop a PDF here, or click to browse
            </p>
            <p className="text-xs text-gray-400">Max 10MB</p>
          </div>
        )}
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
