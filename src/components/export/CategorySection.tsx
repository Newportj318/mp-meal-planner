import type { GroupedGroceryList } from '../../db/models';

interface CategorySectionProps {
  group: GroupedGroceryList;
}

export default function CategorySection({ group }: CategorySectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-4 py-2 rounded-t-lg border border-primary-200 dark:border-primary-700">
        {group.label}
      </h3>
      <div className="border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-lg divide-y divide-gray-100 dark:divide-gray-700">
        {group.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{item.name}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                ({item.fromRecipes.join(', ')})
              </span>
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {item.totalQuantity} {item.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
