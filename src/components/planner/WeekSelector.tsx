import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatWeekLabel } from '../../utils/weekHelpers';

interface WeekSelectorProps {
  currentMonday: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function WeekSelector({
  currentMonday,
  onPrev,
  onNext,
  onToday,
}: WeekSelectorProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1 sm:gap-3 flex-1 min-w-0">
        <button
          onClick={onPrev}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors shrink-0"
          aria-label="Previous week"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white text-center flex-1 truncate">
          {formatWeekLabel(currentMonday)}
        </h2>
        <button
          onClick={onNext}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors shrink-0"
          aria-label="Next week"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <button
        onClick={onToday}
        className="ml-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors shrink-0"
      >
        This Week
      </button>
    </div>
  );
}
