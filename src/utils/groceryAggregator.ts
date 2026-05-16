import type {
  Recipe,
  AggregatedGroceryItem,
  GroupedGroceryList,
  GroceryCategory,
} from '../db/models';
import { GROCERY_CATEGORY_LABELS } from '../db/models';

// ==========================================
// Unit conversion maps
// ==========================================

const UNIT_CONVERSIONS: Record<string, { base: string; factor: number }> = {
  kg: { base: 'g', factor: 1000 },
  g: { base: 'g', factor: 1 },
  l: { base: 'ml', factor: 1000 },
  litre: { base: 'ml', factor: 1000 },
  liter: { base: 'ml', factor: 1000 },
  ml: { base: 'ml', factor: 1 },
  tbsp: { base: 'tsp', factor: 3 },
  tsp: { base: 'tsp', factor: 1 },
};

// Display thresholds: convert back to larger unit for readability
const DISPLAY_CONVERSIONS: Record<string, { unit: string; threshold: number; divisor: number }> = {
  g: { unit: 'kg', threshold: 1000, divisor: 1000 },
  ml: { unit: 'L', threshold: 1000, divisor: 1000 },
  tsp: { unit: 'tbsp', threshold: 3, divisor: 3 },
};

// Category display order (roughly follows supermarket aisle flow)
const CATEGORY_ORDER: GroceryCategory[] = [
  'fruits',
  'vegetables',
  'meat-seafood',
  'poultry',
  'dairy-eggs',
  'grains-bread',
  'frozen',
  'pantry',
  'spices-herbs',
  'oils-sauces',
  'other',
];

// ==========================================
// Normalisation helpers
// ==========================================

function normalizeIngredientName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

function normalizeUnit(unit: string): string {
  return unit.toLowerCase().trim();
}

// ==========================================
// Core aggregation
// ==========================================

export function aggregateGroceryList(recipes: Recipe[]): GroupedGroceryList[] {
  // Step 1: Collect all ingredients with recipe attribution
  const itemMap = new Map<
    string,
    {
      name: string;
      quantities: { amount: number; unit: string }[];
      category: GroceryCategory;
      fromRecipes: Set<string>;
    }
  >();

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const key = `${normalizeIngredientName(ing.name)}|${ing.category}`;

      if (!itemMap.has(key)) {
        itemMap.set(key, {
          name: ing.name,
          quantities: [],
          category: ing.category,
          fromRecipes: new Set(),
        });
      }

      const entry = itemMap.get(key)!;
      entry.quantities.push({ amount: ing.quantity, unit: ing.unit });
      entry.fromRecipes.add(recipe.name);
    }
  }

  // Step 2: Aggregate quantities per item
  const aggregatedItems: AggregatedGroceryItem[] = [];

  for (const entry of itemMap.values()) {
    // Group quantities by base unit
    const unitGroups = new Map<string, number>();

    for (const { amount, unit } of entry.quantities) {
      const normalUnit = normalizeUnit(unit);
      const conversion = UNIT_CONVERSIONS[normalUnit];

      if (conversion) {
        const baseAmount = amount * conversion.factor;
        unitGroups.set(
          conversion.base,
          (unitGroups.get(conversion.base) || 0) + baseAmount
        );
      } else {
        // No conversion available — keep the unit as-is
        unitGroups.set(normalUnit, (unitGroups.get(normalUnit) || 0) + amount);
      }
    }

    // Convert back to readable units
    for (const [baseUnit, totalAmount] of unitGroups) {
      const display = DISPLAY_CONVERSIONS[baseUnit];
      let finalAmount = totalAmount;
      let finalUnit = baseUnit;

      if (display && totalAmount >= display.threshold) {
        finalAmount = totalAmount / display.divisor;
        finalUnit = display.unit;
      }

      // Round to 1 decimal place
      finalAmount = Math.round(finalAmount * 10) / 10;

      aggregatedItems.push({
        name: entry.name,
        totalQuantity: finalAmount,
        unit: finalUnit,
        category: entry.category,
        fromRecipes: Array.from(entry.fromRecipes),
      });
    }
  }

  // Step 3: Group by category
  const categoryMap = new Map<GroceryCategory, AggregatedGroceryItem[]>();

  for (const item of aggregatedItems) {
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, []);
    }
    categoryMap.get(item.category)!.push(item);
  }

  // Step 4: Sort by category order, then alphabetically within each category
  const grouped: GroupedGroceryList[] = [];

  for (const category of CATEGORY_ORDER) {
    const items = categoryMap.get(category);
    if (items && items.length > 0) {
      items.sort((a, b) => a.name.localeCompare(b.name));
      grouped.push({
        category,
        label: GROCERY_CATEGORY_LABELS[category],
        items,
      });
    }
  }

  return grouped;
}
