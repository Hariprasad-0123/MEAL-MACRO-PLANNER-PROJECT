const mockRecipes = [
  { id: "recipe_101", name: "Greek Yogurt Berry Parfait", category: "breakfast", calories: 320, protein: 22, carbs: 38, fat: 8, diet: "none", allergens: ["dairy"], ingredients: [{ name: "Greek Yogurt", quantity: "1 cup" }, { name: "Mixed Berries", quantity: "1/2 cup" }, { name: "Granola", quantity: "1/4 cup" }], instructions: ["Layer yogurt, berries, and granola in a glass.", "Serve immediately."], approved: true, custom: false },
  { id: "recipe_102", name: "Chicken Avocado Salad", category: "lunch", calories: 420, protein: 35, carbs: 16, fat: 24, diet: "none", allergens: [], ingredients: [{ name: "Cooked Chicken Breast", quantity: "150g" }, { name: "Avocado", quantity: "1/2" }, { name: "Mixed Greens", quantity: "2 cups" }], instructions: ["Toss chicken, avocado, and greens together.", "Dress with olive oil and lemon juice."], approved: true, custom: false },
  { id: "recipe_103", name: "Salmon with Quinoa and Veggies", category: "dinner", calories: 540, protein: 40, carbs: 45, fat: 18, diet: "none", allergens: ["fish"], ingredients: [{ name: "Salmon Fillet", quantity: "150g" }, { name: "Cooked Quinoa", quantity: "1 cup" }, { name: "Steamed Broccoli", quantity: "1 cup" }], instructions: ["Bake or pan-sear salmon until cooked through.", "Serve with quinoa and broccoli."], approved: true, custom: false }
];

export default mockRecipes;
