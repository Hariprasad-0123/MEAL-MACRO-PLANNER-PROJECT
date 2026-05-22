const express = require('express');
const router = express.Router();

// Barcode Lookup Proxy endpoint
router.get('/:barcode', async (req, res) => {
  const barcode = req.params.barcode;
  const mockBarcodes = {
    '123456': {
      name: 'High-Protein Almond Energy Bar',
      calories: 220,
      protein: 20,
      carbs: 15,
      fat: 9,
      serving: '1 bar (50g)',
      ingredients: 'Almonds, Whey Protein, Honey, Dates, Cocoa'
    },
    '654321': {
      name: 'Gluten-Free Oats & Berry Granola',
      calories: 180,
      protein: 5,
      carbs: 32,
      fat: 4,
      serving: '1/2 cup (45g)',
      ingredients: 'Gluten-free oats, Maple syrup, Cranberries, Blueberries'
    },
    '987654': {
      name: 'Greek Style Plain Yogurt Pot',
      calories: 120,
      protein: 15,
      carbs: 6,
      fat: 4,
      serving: '1 tub (150g)',
      ingredients: 'Skimmed milk, Active cultures'
    }
  };
  
  if (mockBarcodes[barcode]) {
    return res.json({ found: true, source: 'mock', product: mockBarcodes[barcode] });
  }
  
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();
    
    if (data.status === 1 && data.product) {
      const product = data.product;
      const nutriments = product.nutriments || {};
      const result = {
        name: product.product_name || 'Unknown Product',
        calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
        protein: Math.round(nutriments['proteins_100g'] || nutriments['proteins'] || 0),
        carbs: Math.round(nutriments['carbohydrates_100g'] || nutriments['carbohydrates'] || 0),
        fat: Math.round(nutriments['fat_100g'] || nutriments['fat'] || 0),
        serving: product.serving_size || '100g',
        ingredients: product.ingredients_text || 'Ingredients not specified'
      };
      return res.json({ found: true, source: 'openfoodfacts', product: result });
    }
    return res.status(404).json({ found: false, message: 'Product not found' });
  } catch (error) {
    return res.json({
      found: true,
      source: 'fallback-generator',
      product: {
        name: `Scanned Product (${barcode})`,
        calories: 150,
        protein: 10,
        carbs: 15,
        fat: 5,
        serving: '1 package',
        ingredients: 'Sample ingredients'
      }
    });
  }
});

module.exports = router;
