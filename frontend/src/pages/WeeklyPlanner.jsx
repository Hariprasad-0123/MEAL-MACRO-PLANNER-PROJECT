import React, { useState } from 'react';
import { RefreshCw, Copy, Printer, ShoppingCart, Filter, CheckCircle2, Circle, AlertCircle, Search, Sparkles, Calendar, Settings } from 'lucide-react';

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
  // Sub-Navigation Tab State: 'calendar' | 'generate' | 'grocery'
  const [plannerSubTab, setPlannerSubTab] = useState('calendar');

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

  // Run auto-generation
  const onGenerateClick = () => {
    handleAutoGeneratePlan({
      dietPreference: selectedDiet,
      allergies: selectedAllergies
    });
    // Auto-switch back to the Calendar view so they can see the generated results!
    setPlannerSubTab('calendar');
  };

  // Filter grocery items
  const filteredGroceries = groceryList.filter(item => {
    const isChecked = pantry.includes(item.id);
    if (groceryStatus === 'pending' && isChecked) return false;
    if (groceryStatus === 'completed' && !isChecked) return false;
    
    if (grocerySearch && !item.name.toLowerCase().includes(grocerySearch.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Calculations for Badges
  const totalMealsScheduled = Object.values(weeklyPlan).reduce((sum, meals) => sum + (meals?.length || 0), 0);
  const totalGroceries = groceryList.length;
  const pendingGroceries = groceryList.filter(item => !pantry.includes(item.id)).length;
  const completedGroceries = groceryList.filter(item => pantry.includes(item.id)).length;

  // Touch Swipe Gesture Navigation specifically for Weekly Meal Planner Sub-Tabs
  React.useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    };

    const handleSwipe = () => {
      // Do not swipe if user is typing in inputs or searching groceries
      const activeElement = document.activeElement;
      if (
        activeElement && 
        (activeElement.tagName === 'INPUT' || 
         activeElement.tagName === 'TEXTAREA' || 
         activeElement.tagName === 'SELECT' || 
         activeElement.isContentEditable)
      ) {
        return;
      }

      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      
      // Swipe threshold: 75px. Must be wider than vertical scrolling.
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 75) {
        const subTabs = ['calendar', 'generate', 'grocery'];
        const currentIndex = subTabs.indexOf(plannerSubTab);
        
        if (currentIndex !== -1) {
          if (diffX < 0) {
            // Swiped Left -> Move Next
            if (currentIndex < subTabs.length - 1) {
              setPlannerSubTab(subTabs[currentIndex + 1]);
            }
          } else {
            // Swiped Right -> Move Previous
            if (currentIndex > 0) {
              setPlannerSubTab(subTabs[currentIndex - 1]);
            }
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [plannerSubTab]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* Header section */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Weekly Meal Planner</h2>
        <p>Organize, schedule, and automate your nutrition goals throughout the week.</p>
      </div>

      {/* Premium Segmented Sub-Navigation Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '4px',
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: '2px',
        marginBottom: '24px'
      }}>
        {/* Weekly Calendar Tab */}
        <button
          onClick={() => setPlannerSubTab('calendar')}
          style={{
            padding: '10px 4px',
            fontSize: '0.85rem',
            fontWeight: plannerSubTab === 'calendar' ? '600' : '500',
            border: 'none',
            borderBottom: plannerSubTab === 'calendar' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
            background: 'transparent',
            color: plannerSubTab === 'calendar' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Calendar size={15} />
          <span>Calendar</span>
          {totalMealsScheduled > 0 && (
            <span style={{
              fontSize: '0.65rem',
              background: plannerSubTab === 'calendar' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)',
              color: plannerSubTab === 'calendar' ? '#0f172a' : 'var(--text-muted)',
              padding: '1px 5px',
              borderRadius: '8px',
              fontWeight: 700
            }}>{totalMealsScheduled}</span>
          )}
        </button>

        {/* Generator Options Tab */}
        <button
          onClick={() => setPlannerSubTab('generate')}
          style={{
            padding: '10px 4px',
            fontSize: '0.85rem',
            fontWeight: plannerSubTab === 'generate' ? '600' : '500',
            border: 'none',
            borderBottom: plannerSubTab === 'generate' ? '3px solid var(--accent-purple)' : '3px solid transparent',
            background: 'transparent',
            color: plannerSubTab === 'generate' ? 'var(--accent-purple)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Settings size={15} />
          <span>Generator</span>
        </button>

        {/* Grocery List Tab */}
        <button
          onClick={() => setPlannerSubTab('grocery')}
          style={{
            padding: '10px 4px',
            fontSize: '0.85rem',
            fontWeight: plannerSubTab === 'grocery' ? '600' : '500',
            border: 'none',
            borderBottom: plannerSubTab === 'grocery' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
            background: 'transparent',
            color: plannerSubTab === 'grocery' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <ShoppingCart size={15} />
          <span>Groceries</span>
          {pendingGroceries > 0 && (
            <span style={{
              fontSize: '0.65rem',
              background: 'var(--accent-purple)',
              color: '#ffffff',
              padding: '1px 5px',
              borderRadius: '8px',
              fontWeight: 700
            }}>{pendingGroceries}</span>
          )}
        </button>
      </div>

      {/* --- PANEL VIEWPORTS --- */}

      {/* 1. MEAL CALENDAR VIEWPORT */}
      {plannerSubTab === 'calendar' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      No meals scheduled for {day}.
                    </p>
                    <button onClick={() => setPlannerSubTab('generate')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                      Configure Options & Auto-Generate
                    </button>
                  </div>
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
      )}

      {/* 2. AUTO-GENERATE OPTIONS VIEWPORT */}
      {plannerSubTab === 'generate' && (
        <div className="flat-panel animate-fade-in" style={{ padding: '28px', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Sparkles size={22} className="neon-text-cyan" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Auto-Generation Preferences</h3>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Set custom preferences below to build a personalized weekly meal program. Once generated, your calendar will instantly populate and recalculate grocery items.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '28px' }}>
            {/* Dietary Style Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Dietary Preference Focus
              </label>
              <select
                value={selectedDiet}
                onChange={(e) => setSelectedDiet(e.target.value)}
                className="form-input"
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-card)' }}
              >
                <option value="none">No Preference (Standard Balanced)</option>
                <option value="Vegetarian">Vegetarian Only</option>
                <option value="Vegan">Vegan Only</option>
                <option value="Keto">Keto / Low-Carb High-Fat</option>
                <option value="Gluten-Free">Gluten-Free Only</option>
              </select>
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Limits meals to dishes strictly conforming to the selected standard.
              </small>
            </div>

            {/* Excluded Allergens Exclusion Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Exclude Allergenic Ingredients
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                {['Dairy', 'Nuts', 'Eggs', 'Soy'].map(allergen => {
                  const active = selectedAllergies.includes(allergen);
                  return (
                    <button
                      key={allergen}
                      type="button"
                      onClick={() => toggleAllergen(allergen)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '0.8rem',
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
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Filters out any recipes containing marked allergens.
              </small>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
            <button onClick={onGenerateClick} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
              <RefreshCw size={18} /> Build & Schedule Weekly Plan
            </button>
          </div>
        </div>
      )}

      {/* 3. GROCERY LIST VIEWPORT */}
      {plannerSubTab === 'grocery' && (
        <div className="flat-panel animate-fade-in" style={{ padding: '24px', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 700 }}>
              <ShoppingCart size={22} className="neon-text-cyan" /> Shopping Grocery Sheet
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

          {/* Grocery Controls Filters */}
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
            {/* Status Tabs */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'all', label: 'All Items', count: totalGroceries },
                { id: 'pending', label: 'To Buy', count: pendingGroceries },
                { id: 'completed', label: 'Checked', count: completedGroceries }
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

            {/* Search Input Box */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '240px' }}>
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search shopping sheet..."
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

          {/* Grocery Items Rendering */}
          {filteredGroceries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)' }}>
              <AlertCircle size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <p style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
                {totalGroceries === 0 ? "No grocery items scheduled. Create a plan in Calendar or Generator tab!" : "No items match your query."}
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
      )}
    </div>
  );
}