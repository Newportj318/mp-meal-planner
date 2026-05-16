import { Router } from 'express';
import * as cheerio from 'cheerio';
import multer from 'multer';
import { createRequire } from 'module';

// pdf-parse has ESM compatibility issues — use createRequire for reliable loading
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/import/url — scrape recipe from URL
router.post('/url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MealPlanner/1.0)',
        Accept: 'text/html',
      },
    });

    if (!response.ok) {
      return res.status(400).json({ message: `Failed to fetch URL: ${response.status}` });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try JSON-LD first (most recipe sites use this)
    let recipe = parseJsonLd($);

    // Fallback to meta tags and common selectors
    if (!recipe.name) {
      recipe = parseFallback($, url);
    }

    res.json({ recipe });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/import/pdf — extract recipe from uploaded PDF
router.post('/pdf', upload.single('pdf'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;

    if (!text.trim()) {
      return res.status(400).json({ message: 'Could not extract text from PDF. It may be image-based.' });
    }

    const recipe = parseRecipeFromText(text);
    res.json({ recipe, rawText: text });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Parse unstructured recipe text into a structured recipe object.
 * Uses heuristics to identify sections (ingredients, instructions, etc.)
 */
function parseRecipeFromText(text: string): Partial<ParsedRecipe> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // The first non-empty line is likely the title
  const name = lines[0] || 'Imported Recipe';

  // Look for ingredient-like lines (start with number/bullet, contain measurement words)
  const ingredientPattern = /^[\d½¼¾⅓⅔•\-–*]\s*|^\d+[\s./]/;
  const measurementWords = /\b(cup|tbsp|tsp|g|kg|ml|oz|lb|bunch|can|clove|slice|fillet|breast|piece|pinch|handful)\b/i;

  // Look for section headers
  const ingredientHeader = /ingredient/i;
  const instructionHeader = /instruction|method|direction|step|preparation/i;
  const servingsPattern = /serves?\s*:?\s*(\d+)|(\d+)\s*serv/i;

  let inIngredients = false;
  let inInstructions = false;
  const ingredientLines: string[] = [];
  const instructionLines: string[] = [];
  let description = '';
  let servings = 4;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Check for servings
    const servingsMatch = line.match(servingsPattern);
    if (servingsMatch) {
      servings = parseInt(servingsMatch[1] || servingsMatch[2]) || 4;
    }

    // Check for section headers
    if (ingredientHeader.test(line) && line.length < 40) {
      inIngredients = true;
      inInstructions = false;
      continue;
    }
    if (instructionHeader.test(line) && line.length < 40) {
      inIngredients = false;
      inInstructions = true;
      continue;
    }

    // Assign lines to sections
    if (inInstructions) {
      // Strip step numbers
      const cleaned = line.replace(/^(step\s*)?\d+[.):\s]*/i, '').trim();
      if (cleaned.length > 10) {
        instructionLines.push(cleaned);
      }
    } else if (inIngredients || ingredientPattern.test(line) || measurementWords.test(line)) {
      inIngredients = true;
      const cleaned = line.replace(/^[•\-–*]\s*/, '').trim();
      if (cleaned.length > 2) {
        ingredientLines.push(cleaned);
      }
    } else if (i <= 3 && !inIngredients && !inInstructions) {
      // Early lines before any section are likely description
      description += (description ? ' ' : '') + line;
    }
  }

  return {
    name,
    description,
    servings,
    prepTime: 0,
    cookTime: 0,
    ingredients: parseIngredientStrings(ingredientLines),
    instructions: instructionLines.length > 0 ? instructionLines : undefined,
  };
}

interface ParsedRecipe {
  name: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  ingredients: { name: string; quantity: number; unit: string; category: string }[];
  instructions: string[];
  imageUrl?: string;
  source: { type: string; url: string; importedAt: string };
}

function parseJsonLd($: cheerio.CheerioAPI): Partial<ParsedRecipe> {
  const scripts = $('script[type="application/ld+json"]');
  let recipeData: any = null;

  scripts.each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '');
      // Handle @graph structure
      const items = data['@graph'] || (Array.isArray(data) ? data : [data]);
      for (const item of items) {
        if (item['@type'] === 'Recipe' || (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))) {
          recipeData = item;
          break;
        }
      }
    } catch {
      // Skip invalid JSON
    }
  });

  if (!recipeData) return {};

  return {
    name: recipeData.name || '',
    description: recipeData.description || '',
    servings: parseServings(recipeData.recipeYield),
    prepTime: parseDuration(recipeData.prepTime),
    cookTime: parseDuration(recipeData.cookTime),
    ingredients: parseIngredientStrings(recipeData.recipeIngredient || []),
    instructions: parseInstructions(recipeData.recipeInstructions || []),
    imageUrl: parseImage(recipeData.image),
  };
}

function parseFallback($: cheerio.CheerioAPI, _url: string): Partial<ParsedRecipe> {
  return {
    name:
      $('meta[property="og:title"]').attr('content') ||
      $('h1').first().text().trim() ||
      '',
    description:
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '',
    imageUrl: $('meta[property="og:image"]').attr('content') || undefined,
  };
}

// Parse ISO 8601 duration (PT30M, PT1H30M, etc.) to minutes
function parseDuration(duration: string | undefined): number {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return (parseInt(match[1] || '0') * 60) + parseInt(match[2] || '0');
}

function parseServings(yield_: any): number {
  if (!yield_) return 4;
  if (typeof yield_ === 'number') return yield_;
  const str = Array.isArray(yield_) ? yield_[0] : yield_;
  const match = String(str).match(/(\d+)/);
  return match ? parseInt(match[1]) : 4;
}

function parseImage(image: any): string | undefined {
  if (!image) return undefined;
  if (typeof image === 'string') return image;
  if (image.url) return image.url;
  if (Array.isArray(image)) return image[0]?.url || image[0];
  return undefined;
}

function parseInstructions(instructions: any[]): string[] {
  return instructions.map((inst: any) => {
    if (typeof inst === 'string') return inst;
    if (inst.text) return inst.text;
    return '';
  }).filter(Boolean);
}

// Basic ingredient string parser
function parseIngredientStrings(
  strings: string[]
): { name: string; quantity: number; unit: string; category: string }[] {
  return strings.map((str) => {
    // Try to extract quantity, unit, and name
    const match = str.match(
      /^([\d./½¼¾⅓⅔]+)?\s*(g|kg|ml|L|cup|cups|tbsp|tsp|each|bunch|can|cans|slice|slices|fillet|fillets|breast|breasts|oz|lb|lbs)?\s*(.+)$/i
    );

    if (match) {
      const rawQty = match[1] || '1';
      const qty = parseFraction(rawQty);
      const unit = normalizeUnit(match[2] || 'each');
      const name = match[3].trim();

      return {
        name,
        quantity: qty,
        unit,
        category: guessCategory(name),
      };
    }

    return {
      name: str.trim(),
      quantity: 1,
      unit: 'each',
      category: 'other',
    };
  });
}

function parseFraction(str: string): number {
  // Handle unicode fractions
  const fractionMap: Record<string, number> = {
    '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 0.33, '⅔': 0.67,
  };
  if (fractionMap[str]) return fractionMap[str];

  // Handle "1/2" style fractions
  if (str.includes('/')) {
    const parts = str.split('/');
    return parseFloat(parts[0]) / parseFloat(parts[1]);
  }

  return parseFloat(str) || 1;
}

function normalizeUnit(unit: string): string {
  const map: Record<string, string> = {
    cups: 'cup',
    cans: 'can',
    slices: 'slice',
    fillets: 'fillet',
    breasts: 'breast',
    lbs: 'lb',
  };
  return map[unit.toLowerCase()] || unit.toLowerCase();
}

function guessCategory(name: string): string {
  const lower = name.toLowerCase();

  const categories: [string, string[]][] = [
    ['meat-seafood', ['beef', 'steak', 'mince', 'lamb', 'pork', 'bacon', 'salmon', 'tuna', 'fish', 'prawn', 'shrimp', 'cod', 'barramundi']],
    ['poultry', ['chicken', 'turkey', 'duck', 'thigh', 'drumstick']],
    ['dairy-eggs', ['milk', 'cheese', 'yogurt', 'yoghurt', 'cream', 'butter', 'egg', 'eggs']],
    ['vegetables', ['onion', 'garlic', 'tomato', 'potato', 'carrot', 'broccoli', 'spinach', 'capsicum', 'pepper', 'zucchini', 'mushroom', 'celery', 'lettuce', 'cucumber', 'corn', 'peas', 'bean', 'kale', 'sweet potato']],
    ['fruits', ['apple', 'banana', 'lemon', 'lime', 'orange', 'berry', 'berries', 'avocado', 'mango']],
    ['grains-bread', ['rice', 'pasta', 'bread', 'noodle', 'flour', 'oat', 'quinoa', 'couscous', 'tortilla', 'wrap']],
    ['spices-herbs', ['salt', 'pepper', 'cumin', 'paprika', 'oregano', 'basil', 'thyme', 'rosemary', 'cinnamon', 'chili', 'ginger', 'turmeric', 'coriander', 'parsley', 'mint']],
    ['oils-sauces', ['oil', 'olive', 'soy sauce', 'vinegar', 'sauce', 'mayo', 'mustard', 'honey', 'sesame']],
    ['pantry', ['stock', 'broth', 'coconut', 'can', 'tin', 'chickpea', 'lentil', 'nut', 'almond', 'walnut', 'seed', 'sugar']],
  ];

  for (const [category, keywords] of categories) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }

  return 'other';
}

export default router;
