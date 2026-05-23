import React, { useState } from 'react';
import { RefreshCw, Copy, Printer, ShoppingCart, Filter, CheckCircle2, Circle, AlertCircle, Search, Sparkles } from 'lucide-react';

export default function WeeklyPlanner({
  weeklyPlan,
  handleAutoGeneratePlan,
  handleSwapMeal,
  groceryList,
  pantry,
  handlePantryCheck,
  handleExportGroceryText,
  handlePrintGrocery,
}) {
  // Plan Generation Filter States
  const [selectedDiet, setSelectedDiet] = useState('none');
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  
  // Grocery List Filter States
  const [groceryStatus, setGroceryStatus] = useState('all'); // all | pending | completed
  const [grocerySearch, setGrocerySearch] = useState('');

  const toggleAllergen = (allergen) => {
    if (selectedAllergies.includes(allergen)) {
      setSelectedAllergies(selectedAllergies.filter(a => a !== allergen));
    } else {
      setSelectedAllergies([...selectedAllergies, allergen]);
    }
  };

  // Run auto-generation with the custom active filters
  const onGenerateClick = () => {
    handleAutoGeneratePlan({
      dietPreference: selectedDiet,
      allergies: selectedAllergies
    });
  };

  // Filter grocery items in real-time
  const filteredGroceries = groceryList.filter(item => {
    const isChecked = pantry.includes(item.id);
    if (groceryStatus === 'pending' && isChecked) return false;
    if (groceryStatus === 'completed' && !isChecked) return false;
    
    if (grocerySearch && !item.name.toLowerCase().includes(grocerySearch.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Calculate status counts for UI pills
  const totalCount = groceryList.length;
  const pendingCount = groceryList.filter(item => !pantry.includes(item.id)).length;
  const completedCount = groceryList.filter(item => pantry.includes(item.id)).length;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Weekly Meal Planner</h2>
          <p>Schedule your weekly nutrition intake or auto-generate plans with customized dietary filters.</p>
        </div>
      </div>

      {/* Advanced Plan Generation Filter Panel */}
      <div className="flat-panel" style={{ padding: '24px', marginBottom: '32px', border: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Sparkles size={20} className="neon-text-cyan" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Auto-Generation Preferences</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          {/* Dietary Rule */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
              Dietary Preference
            </label>
            <select
              value={selectedDiet}
              onChange={(e) => setSelectedDiet(e.target.value)}
              className="form-input"
              style={{ width: '100%', background: 'var(--bg-card)' }}
            >
              <option value="none">No Preference (Balanced)</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Keto">Keto / Low-Carb</option>
              <option value="Gluten-Free">Gluten-Free</option>
            </select>
          </div>

          {/* Allergies Options */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
              Exclude Allergens
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Dairy', 'Nuts', 'Eggs', 'Soy'].map(allergen => {
                const active = selectedAllergies.includes(allergen);
                return (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => toggleAllergen(allergen)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      borderRadius: '20px',
                      border: '1px solid var(--border-glass)',
                      background: active ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.05)',
                      color: active ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontWeight: active ? '600' : 'normal'
                    }}
                  >
                    {allergen}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onGenerateClick} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={18} /> Auto-Generate Weekly Plan
          </button>
        </div>
      </div>

      {/* Week Calendar Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
          const dayMeals = weeklyPlan[day] || [];
          const dayCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0);
          const dayP = dayMeals.reduce((sum, m) => sum + m.protein, 0);
          const dayC = dayMeals.reduce((sum, m) => sum + m.carbs, 0);
          const dayF = dayMeals.reduce((sum, m) => sum + m.fat, 0);
          
          return (
            <div key={day} className="flat-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '12px' }}>
                <h3 style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem', fontWeight: 700 }}>{day}</h3>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>⚡ {dayCalories} kcal</span>
                  <span>🥩 P: {dayP}g</span>
                  <span>🌾 C: {dayC}g</span>
                  <span>🥑 F: {dayF}g</span>
                </div>
              </div>

              {dayMeals.length === 0 ? (
                <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                  No meals scheduled. Set preferences and click Auto-Generate above.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {dayMeals.map((meal, index) => (
                    <div key={index} style={{ padding: '12px', background: 'rgba(15,23,42,0.03)', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent-purple)', fontWeight: 'bold' }}>{meal.slot}</span>
                        <button onClick={() => handleSwapMeal(day, index)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.65rem', borderRadius: '6px' }}>
                          Swap
                        </button>
                      </div>
                      <h4 style={{ fontSize: '0.9rem', margin: '6px 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meal.name}</h4>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>{meal.calories} Cal</span>
                        <span>P: {meal.protein}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grocery list module with embedded Interactive Filters */}
      <div className="flat-panel" style={{ padding: '24px', marginTop: '40px', border: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 700 }}>
            <ShoppingCart size={22} className="neon-text-cyan" /> Weekly Grocery List
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleExportGroceryText} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Copy size={16} /> Copy List
            </button>
            <button onClick={handlePrintGrocery} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Printer size={16} /> Print / Export PDF
            </button>
          </div>
        </div>

        {/* Grocery Filters Control Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-glass)',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          {/* Status Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'all', label: 'All Items', count: totalCount },
              { id: 'pending', label: 'To Buy', count: pendingCount },
              { id: 'completed', label: 'Checked', count: completedCount }
            ].map(pill => {
              const active = groceryStatus === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setGroceryStatus(pill.id)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    color: active ? 'var(--accent-purple)' : 'var(--text-secondary)',
                    fontWeight: active ? '600' : 'normal',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {pill.label}
                  <span style={{
                    fontSize: '0.7rem',
                    background: active ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.08)',
                    color: active ? '#ffffff' : 'var(--text-muted)',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>{pill.count}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '240px' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search groceries..."
              value={grocerySearch}
              onChange={(e) => setGrocerySearch(e.target.value)}
              className="form-input"
              style={{
                width: '100%',
                paddingLeft: '32px',
                paddingRight: '12px',
                paddingTop: '6px',
                paddingBottom: '6px',
                fontSize: '0.8rem',
                borderRadius: '8px',
                background: 'var(--bg-card)'
              }}
            />
          </div>
        </div>

        {filteredGroceries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)' }}>
            <AlertCircle size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
              {groceryList.length === 0 ? "No items generated yet. Configure options and generate plans above!" : "No shopping items match your active filters."}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {['Produce', 'Meat/Fish', 'Dairy', 'Bakery', 'Nuts/Seeds', 'Pantry', 'Deli'].map(category => {
              const categoryItems = filteredGroceries.filter(i => i.category === category);
              if (categoryItems.length === 0) return null;
              
              return (
                <div key={category} className="flat-panel" style={{ padding: '16px', background: 'rgba(15,23,42,0.03)' }}>
                  <h4 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', marginBottom: '12px', color: 'var(--accent-purple)', fontSize: '0.95rem', fontWeight: 700 }}>{category}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {categoryItems.map(item => {
                      const isChecked = pantry.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handlePantryCheck(item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                            userSelect: 'none',
                            padding: '4px 0'
                          }}
                        >
                          <span style={{ display: 'inline-flex', color: isChecked ? 'var(--accent-cyan)' : 'var(--text-muted)', transition: 'color 0.2s ease' }}>
                            {isChecked ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                          </span>
                          <span style={{ textDecoration: isChecked ? 'line-through' : 'none' }}>
                            {item.name} <em style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({item.quantity})</em>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}