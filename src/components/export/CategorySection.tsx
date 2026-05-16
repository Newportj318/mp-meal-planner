import type { GroupedGroceryList } from '../../db/models';

interface CategorySectionProps {
  group: GroupedGroceryList;
}

export default function CategorySection({ group }: CategorySectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-primary-700 bg-primary-50 px-4 py-2 rounded-t-lg border border-primary-200">
        {group.label}
      </h3>
      <div className="border border-t-0 border-gray-200 rounded-b-lg divide-y divide-gray-100">
        {group.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-800 font-medium">{item.name}</span>
              <span className="text-xs text-gray-400">
                ({item.fromRecipes.join(', ')})
              </span>
            </div>
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
              {item.totalQuantity} {item.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
