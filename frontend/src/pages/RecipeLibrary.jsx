import { useState } from 'react';
import { Plus, Star, Save } from 'lucide-react';

const dietIcons = {
  vegan: '🥗',
  keto: '🥑',
  paleo: '🍖',
  'gluten-free': '🍚',
  none: '🍲',
};

export default function RecipeLibrary({
  recipes,
  toggleFavorite,
  addFoodToDiary,
  customRecipeForm,
  setCustomRecipeForm,
  handleCreateRecipe,
  recipeFilter,
  setRecipeFilter,
}) {
  const [searchVal, setSearchVal] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const mealTypes = ['breakfast', 'lunch', 'dinner'];
  const dietTypes = ['vegan', 'keto', 'paleo', 'gluten-free', 'none'];
  const filters = ['all', ...mealTypes, ...dietTypes];
  const allFilterActive = recipeFilter.length === 0 || recipeFilter.includes('all');

  const handleFilterClick = (filter) => {
    if (filter === 'all') {
      setRecipeFilter(['all']);
      return;
    }

    let newFilters = [...recipeFilter];
    if (newFilters.includes('all')) {
      newFilters = [];
    }

    const index = newFilters.indexOf(filter);
    if (index > -1) {
      newFilters.splice(index, 1);
    } else {
      newFilters.push(filter);
    }

    if (newFilters.length === 0) {
      setRecipeFilter(['all']);
    } else {
      setRecipeFilter(newFilters);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    if (allFilterActive && !activeSearch) return true;

    const selectedMealTypes = recipeFilter.filter(f => mealTypes.includes(f));
    const selectedDietTypes = recipeFilter.filter(f => dietTypes.includes(f));

    const mealMatch = selectedMealTypes.length === 0 || selectedMealTypes.includes(recipe.category);
    const dietMatch = selectedDietTypes.length === 0 || selectedDietTypes.includes(recipe.diet);
    
    const searchMatch = !activeSearch ? true : (
      recipe.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
      recipe.ingredients?.some(i => i.name.toLowerCase().includes(activeSearch.toLowerCase()))
    );

    return (allFilterActive || (mealMatch && dietMatch)) && searchMatch;
  });

  const handleSearch = async () => {
    setActiveSearch(searchVal);
    if (!searchVal.trim()) return;

    // Calculate how many matches are found
    const matchesCount = recipes.filter(recipe => {
      const selectedMealTypes = recipeFilter.filter(f => mealTypes.includes(f));
      const selectedDietTypes = recipeFilter.filter(f => dietTypes.includes(f));
      const mealMatch = selectedMealTypes.length === 0 || selectedMealTypes.includes(recipe.category);
      const dietMatch = selectedDietTypes.length === 0 || selectedDietTypes.includes(recipe.diet);
      const matchesFilters = allFilterActive || (mealMatch && dietMatch);
      const matchesSearch = recipe.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        recipe.ingredients?.some(i => i.name.toLowerCase().includes(searchVal.toLowerCase()));
      return matchesFilters && matchesSearch;
    }).length;

    // Save to backend search history
    try {
      await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5001/api'}/search-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchVal.trim(),
          type: 'recipe',
          resultsCount: matchesCount
        })
      });
    } catch (e) {
      console.error('Could not save search history:', e);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '8px' }}>Recipe Library</h2>
      <p style={{ marginBottom: '16px' }}>Search nutrition plans, build custom recipes, and bookmark your favorites.</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Showing <strong>{filteredRecipes.length}</strong> of <strong>{recipes.length}</strong> recipes
          {allFilterActive ? ' (all filters cleared)' : ` matching ${recipeFilter.join(', ')}`}
        </div>
        {!allFilterActive && (
          <button onClick={() => setRecipeFilter(['all'])} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
            Reset filters
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }} className="recipes-view-grid">
        
        {/* Left Side: Recipe Browser */}
        <div>
          <div className="flat-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Search recipes (e.g. oatmeal, chicken, salad)..." 
              className="form-input" 
              style={{ flex: 1 }} 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
            <button onClick={handleSearch} className="btn-primary">Search</button>
          </div>

          <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
                className={recipeFilter.includes(filter) ? 'btn-primary' : 'btn-secondary'}
                style={{ textTransform: 'capitalize', padding: '6px 14px', fontSize: '0.8rem' }}
              >
                {filter === 'none' ? 'No Diet' : filter}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {(() => {
              // 1. Render all directly filtered recipes
              const matchedCards = filteredRecipes.map(recipe => (
                <div key={recipe.id} className="flat-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid var(--border-glass)' }}>
                  <div style={{ padding: '20px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-cyan)', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{recipe.category}</span>
                      <button onClick={() => toggleFavorite(recipe.id)} style={{ background: 'none', border: 'none', color: recipe.favorite ? '#fbbf24' : 'var(--text-muted)', cursor: 'pointer' }}>
                        <Star size={18} fill={recipe.favorite ? '#fbbf24' : 'none'} />
                      </button>
                    </div>
                    
                    <h3 style={{ fontSize: '1.2rem', margin: '12px 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {recipe.diet && dietIcons[recipe.diet] && (
                        <span style={{ fontSize: '2rem', lineHeight: 1 }}>{dietIcons[recipe.diet]}</span>
                      )}
                      <span style={{ flex: 1 }}>
                        {recipe.name} 
                        {!recipe.approved && <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--accent-orange)', marginTop: '2px' }}>Pending</span>}
                      </span>
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)', padding: '10px 0', margin: '12px 0' }}>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cals</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{recipe.calories}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prot</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{recipe.protein}g</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Carb</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{recipe.carbs}g</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fat</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{recipe.fat}g</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong>Ingredients:</strong>
                      <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                        {recipe.ingredients?.slice(0, 3).map((ing, idx) => (
                          <li key={idx}>{ing.name} ({ing.quantity})</li>
                        ))}
                        {(recipe.ingredients?.length || 0) > 3 && <li>...and {(recipe.ingredients?.length || 0) - 3} more</li>}
                      </ul>
                    </div>
                  </div>

                  <div style={{ padding: '16px', background: 'rgba(15,23,42,0.02)', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '8px' }}>
                    <button onClick={() => addFoodToDiary(recipe.category, recipe)} className="btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', justifyContent: 'center' }}>
                      Log to Diary
                    </button>
                  </div>
                </div>
              ));

              // 2. Pad list dynamically to always fill at least 6 grid cells using other library recipes
              let paddedCards = [];
              if (filteredRecipes.length < 6) {
                const remainingCount = 6 - filteredRecipes.length;
                const otherRecipes = recipes
                  .filter(r => !filteredRecipes.some(fr => fr.id === r.id))
                  .slice(0, remainingCount);

                paddedCards = otherRecipes.map(recipe => (
                  <div key={recipe.id} className="flat-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px dashed var(--border-glass)', background: 'rgba(15,23,42,0.01)', opacity: 0.85 }}>
                    <div style={{ padding: '20px', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-cyan)', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{recipe.category}</span>
                          <span style={{ fontSize: '0.65rem', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>Explore</span>
                        </div>
                        <button onClick={() => toggleFavorite(recipe.id)} style={{ background: 'none', border: 'none', color: recipe.favorite ? '#fbbf24' : 'var(--text-muted)', cursor: 'pointer' }}>
                          <Star size={18} fill={recipe.favorite ? '#fbbf24' : 'none'} />
                        </button>
                      </div>
                      
                      <h3 style={{ fontSize: '1.2rem', margin: '12px 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {recipe.diet && dietIcons[recipe.diet] && (
                          <span style={{ fontSize: '2rem', lineHeight: 1 }}>{dietIcons[recipe.diet]}</span>
                        )}
                        <span style={{ flex: 1 }}>
                          {recipe.name} 
                          {!recipe.approved && <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--accent-orange)', marginTop: '2px' }}>Pending</span>}
                        </span>
                      </h3>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)', padding: '10px 0', margin: '12px 0' }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cals</div>
                          <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{recipe.calories}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prot</div>
                          <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{recipe.protein}g</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Carb</div>
                          <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{recipe.carbs}g</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fat</div>
                          <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{recipe.fat}g</div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <strong>Ingredients:</strong>
                        <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                          {recipe.ingredients?.slice(0, 3).map((ing, idx) => (
                            <li key={idx}>{ing.name} ({ing.quantity})</li>
                          ))}
                          {(recipe.ingredients?.length || 0) > 3 && <li>...and {(recipe.ingredients?.length || 0) - 3} more</li>}
                        </ul>
                      </div>
                    </div>

                    <div style={{ padding: '16px', background: 'rgba(15,23,42,0.02)', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '8px' }}>
                      <button onClick={() => addFoodToDiary(recipe.category, recipe)} className="btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', justifyContent: 'center' }}>
                        Log to Diary
                      </button>
                    </div>
                  </div>
                ));
              }

              return [...matchedCards, ...paddedCards];
            })()}
          </div>
        </div>

        {/* Right Side: Custom Recipe Builder & Existing Recipes Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <aside className="flat-panel" style={{ padding: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Plus size={20} className="neon-text-cyan" /> Recipe Builder
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '20px' }}>Input custom recipes to save to database. Admin mode bypasses reviews.</p>
            
            <form onSubmit={handleCreateRecipe}>
              <div className="form-group">
                <label className="form-label">Recipe Name</label>
                <input type="text" className="form-input" placeholder="e.g. Keto Turkey Omelette" required value={customRecipeForm.name} onChange={(e) => setCustomRecipeForm({...customRecipeForm, name: e.target.value})} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Course Type</label>
                  <select className="form-select" value={customRecipeForm.category} onChange={(e) => setCustomRecipeForm({...customRecipeForm, category: e.target.value})}>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Diet Filter</label>
                  <select className="form-select" value={customRecipeForm.diet} onChange={(e) => setCustomRecipeForm({...customRecipeForm, diet: e.target.value})}>
                    <option value="none">None</option>
                    <option value="vegan">Vegan</option>
                    <option value="keto">Keto</option>
                    <option value="paleo">Paleo</option>
                    <option value="gluten-free">Gluten-Free</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Calories</label>
                  <input type="number" className="form-input" placeholder="kcal" value={customRecipeForm.calories} onChange={(e) => setCustomRecipeForm({...customRecipeForm, calories: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Protein (g)</label>
                  <input type="number" className="form-input" placeholder="grams" value={customRecipeForm.protein} onChange={(e) => setCustomRecipeForm({...customRecipeForm, protein: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Carbs (g)</label>
                  <input type="number" className="form-input" placeholder="grams" value={customRecipeForm.carbs} onChange={(e) => setCustomRecipeForm({...customRecipeForm, carbs: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fat (g)</label>
                  <input type="number" className="form-input" placeholder="grams" value={customRecipeForm.fat} onChange={(e) => setCustomRecipeForm({...customRecipeForm, fat: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Ingredients (Name - Quantity, one per line)</label>
                <textarea className="form-textarea" rows="3" placeholder="e.g. Eggs - 3 large&#10;Turkey Bacon - 2 slices" value={customRecipeForm.ingredientsText} onChange={(e) => setCustomRecipeForm({...customRecipeForm, ingredientsText: e.target.value})}></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Instructions (one step per line)</label>
                <textarea className="form-textarea" rows="3" placeholder="Beat eggs.&#10;Fry bacon in pan." value={customRecipeForm.instructionsText} onChange={(e) => setCustomRecipeForm({...customRecipeForm, instructionsText: e.target.value})}></textarea>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Save size={18} /> Save & Build Recipe
              </button>
            </form>
          </aside>

          {/* New downside container: Saved & Popular Recipes */}
          <aside className="flat-panel" style={{ padding: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Star size={18} style={{ color: '#fbbf24' }} fill="#fbbf24" /> Saved & Popular Recipes
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '20px' }}>Quickly access your bookmarked meals or explore popular suggestions.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(() => {
                let favorites = recipes.filter(r => r.favorite);
                let displayList = [...favorites];
                
                // Fill up to 25 items dynamically with recommendations to cover all right-side space beautifully!
                if (displayList.length < 25) {
                  const remainingCount = 25 - displayList.length;
                  const recommendations = recipes.filter(r => !r.favorite).slice(0, remainingCount);
                  displayList = [...displayList, ...recommendations];
                }

                if (displayList.length === 0) {
                  return (
                    <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                      No recipes available in the library.
                    </p>
                  );
                }

                return (
                  <>
                    {displayList.map(recipe => (
                      <div 
                        key={recipe.id} 
                        style={{ 
                          padding: '14px', 
                          background: recipe.favorite ? 'rgba(251, 191, 36, 0.04)' : 'rgba(15,23,42,0.01)', 
                          border: recipe.favorite ? '1px solid rgba(251, 191, 36, 0.25)' : '1px solid var(--border-glass)', 
                          borderRadius: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-cyan)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                              {recipe.category}
                            </span>
                            {recipe.favorite && (
                              <span style={{ fontSize: '0.62rem', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                Favorited
                              </span>
                            )}
                          </div>
                          <button onClick={() => toggleFavorite(recipe.id)} style={{ background: 'none', border: 'none', color: recipe.favorite ? '#fbbf24' : 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                            <Star size={14} fill={recipe.favorite ? '#fbbf24' : 'none'} />
                          </button>
                        </div>

                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>
                          {recipe.name}
                        </h4>

                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: 'var(--text-secondary)', borderTop: '1px dashed var(--border-glass)', borderBottom: '1px dashed var(--border-glass)', padding: '6px 0', flexWrap: 'wrap' }}>
                          <span><strong>{recipe.calories}</strong> kcal</span>
                          <span>|</span>
                          <span><strong>{recipe.protein}g</strong> P</span>
                          <span>|</span>
                          <span><strong>{recipe.carbs}g</strong> C</span>
                          <span>|</span>
                          <span><strong>{recipe.fat}g</strong> F</span>
                        </div>

                        <button 
                          onClick={() => addFoodToDiary(recipe.category, recipe)} 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', justifyContent: 'center', width: '100%' }}
                        >
                          Quick Log to Diary
                        </button>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}