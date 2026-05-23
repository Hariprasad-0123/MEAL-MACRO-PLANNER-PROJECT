// /Users/harisavala/Desktop/meal-macro-planner/frontend/src/utils/plannerUtils.js

export const generateMealPlanForDay = (targetCals, recipes, profile) => {
    // Filter recipes matching user restrictions
    const filtered = recipes.filter(r => {
      // Admin approved only
      if (!r.approved) return false;
      // Dietary filter
      if (profile.dietPreference !== 'none' && r.diet !== profile.dietPreference) return false;
      // Allergen filter
      if (profile.allergies.some(allergen => r.allergens?.includes(allergen))) return false;
      return true;
    });

    const bMeals = filtered.filter(r => r.category === 'breakfast');
    const lMeals = filtered.filter(r => r.category === 'lunch');
    const dMeals = filtered.filter(r => r.category === 'dinner');
    const sMeals = filtered.filter(r => r.category === 'snack');

    if (!bMeals.length || !lMeals.length || !dMeals.length) {
      // Fallback to random if filter is too restrictive
      return [];
    }

    let bestCombination = null;
    let minDifference = Infinity;

    // Run a quick randomized search to find the closest macro match
    for (let i = 0; i < 200; i++) {
      const b = bMeals[Math.floor(Math.random() * bMeals.length)];
      const l = lMeals[Math.floor(Math.random() * lMeals.length)];
      const d = dMeals[Math.floor(Math.random() * dMeals.length)];
      const s = sMeals[Math.floor(Math.random() * sMeals.length)] || null;

      const totalCals = b.calories + l.calories + d.calories + (s ? s.calories : 0);
      
      const diff = Math.abs(totalCals - targetCals);
      
      if (diff < minDifference) {
        minDifference = diff;
        bestCombination = [
          { ...b, slot: 'breakfast' },
          { ...l, slot: 'lunch' },
          { ...d, slot: 'dinner' },
          ...(s ? [{ ...s, slot: 'snack' }] : [])
        ];
      }

      // If within 50 calories, break early
      if (diff < 50) break;
    }

    return bestCombination || [];
};

export const generateGroceryList = (weeklyPlan) => {
    const list = {};
    
    // Categorize ingredient mapping
    const categoryMapping = {
      // Pantry items
      'Oats': 'Pantry', 'Oatmeal': 'Pantry', 'Protein': 'Pantry', 'Powder': 'Pantry',
      'Oil': 'Pantry', 'Honey': 'Pantry', 'Syrup': 'Pantry', 'Granola': 'Pantry',
      'Chia': 'Pantry', 'Hemp': 'Pantry', 'Quinoa': 'Pantry', 'Beans': 'Pantry',
      'Flour': 'Pantry', 'Rice': 'Pantry', 'Cinnamon': 'Pantry', 'Paprika': 'Pantry',
      'Salt': 'Pantry', 'Pepper': 'Pantry', 'Sugar': 'Pantry', 'Cocoa': 'Pantry',
      'Capers': 'Pantry', 'Soy': 'Pantry',
      
      // Bakery items
      'Bread': 'Bakery', 'Tortilla': 'Bakery', 'Croissant': 'Bakery', 'Bun': 'Bakery', 'Bagel': 'Bakery',
      
      // Dairy
      'Milk': 'Dairy', 'Egg': 'Dairy', 'Eggs': 'Dairy', 'Cheese': 'Dairy', 'Butter': 'Dairy',
      'Yogurt': 'Dairy', 'Cream': 'Dairy', 'Ricotta': 'Dairy',
      
      // Meat & Seafood
      'Bacon': 'Meat/Fish', 'Chicken': 'Meat/Fish', 'Turkey': 'Meat/Fish', 'Ham': 'Meat/Fish',
      'Pork': 'Meat/Fish', 'Beef': 'Meat/Fish', 'Steak': 'Meat/Fish', 'Sausage': 'Meat/Fish',
      'Prosciutto': 'Meat/Fish', 'Salmon': 'Meat/Fish', 'Tuna': 'Meat/Fish', 'Cod': 'Meat/Fish',
      
      // Produce
      'Avocado': 'Produce', 'Banana': 'Produce', 'Berries': 'Produce', 'Blueberries': 'Produce',
      'Peaches': 'Produce', 'Apple': 'Produce', 'Melon': 'Produce', 'Mango': 'Produce',
      'Salad': 'Produce', 'Greens': 'Produce', 'Spinach': 'Produce', 'Kale': 'Produce',
      'Broccoli': 'Produce', 'Lettuce': 'Produce', 'Tomato': 'Produce', 'Tomatoes': 'Produce',
      'Cucumber': 'Produce', 'Asparagus': 'Produce', 'Onion': 'Produce', 'Garlic': 'Produce',
      'Carrot': 'Produce', 'Carrots': 'Produce', 'Potato': 'Produce', 'Potatoes': 'Produce',
      'Squash': 'Produce', 'Scallions': 'Produce', 'Tofu': 'Produce', 'Corn': 'Produce',
      
      // Nuts & Seeds
      'Almond': 'Nuts/Seeds', 'Peanut': 'Nuts/Seeds', 'Nuts': 'Nuts/Seeds', 'Pistachios': 'Nuts/Seeds',
      
      // Deli
      'Hummus': 'Deli', 'Salsa': 'Deli', 'Dressing': 'Deli', 'Sauce': 'Deli', 'Mayonnaise': 'Deli', 'Mustard': 'Deli'
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    days.forEach(day => {
      const meals = weeklyPlan?.[day];
      if (Array.isArray(meals)) {
        meals.forEach(meal => {
        if (meal.ingredients) {
          meal.ingredients.forEach(ing => {
            const name = ing.name;
            const quantity = ing.quantity;
            
            // Map category
            let cat = 'Pantry';
            Object.keys(categoryMapping).forEach(key => {
              if (name.toLowerCase().includes(key.toLowerCase())) {
                cat = categoryMapping[key];
              }
            });

            const key = `${name} (${cat})`;
            if (list[key]) {
              list[key].quantityList.push(quantity);
            } else {
              list[key] = {
                name,
                category: cat,
                quantityList: [quantity]
              };
            }
          });
        }
      });
      }
    });

    // Format list into array
    return Object.values(list).map(item => {
      // Just list quantities combined
      return {
        id: item.name.toLowerCase().replace(/\s/g, '-'),
        name: item.name,
        category: item.category,
        quantity: item.quantityList.join(' + ')
      };
    });
};