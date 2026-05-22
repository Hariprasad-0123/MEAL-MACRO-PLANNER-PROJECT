import { RefreshCw, Copy, Printer, ShoppingCart } from 'lucide-react';

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
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Weekly Meal Planner</h2>
          <p>Plan ahead or generate a balanced macro meal plan automatically.</p>
        </div>
        <button onClick={handleAutoGeneratePlan} className="btn-primary">
          <RefreshCw size={18} /> Auto-Generate Weekly Plan
        </button>
      </div>

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
                <h3 style={{ color: 'var(--accent-cyan)' }}>{day}</h3>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>⚡ {dayCalories} kcal</span>
                  <span>🥩 P: {dayP}g</span>
                  <span>🌾 C: {dayC}g</span>
                  <span>🥑 F: {dayF}g</span>
                </div>
              </div>

              {dayMeals.length === 0 ? (
                <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                  No meals scheduled. Click Auto-Generate above.
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

      {/* Grocery list module embedded in the planner */}
      <div className="flat-panel" style={{ padding: '24px', marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={22} className="neon-text-cyan" /> Automatically Generated Weekly Grocery List
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
        <p style={{ marginBottom: '20px', fontSize: '0.85rem' }}>
          Below are all the ingredients required for your planned meals, aggregated and sorted. Tick items off to check them against your pantry.
        </p>

        {groceryList.length === 0 ? (
          <p style={{ fontStyle: 'italic', textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
            No items generated. Schedule weekly plans first.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {['Produce', 'Meat/Fish', 'Dairy', 'Bakery', 'Nuts/Seeds', 'Pantry', 'Deli'].map(category => {
              const items = groceryList.filter(i => i.category === category);
              if (items.length === 0) return null;
              
              return (
                <div key={category} className="flat-panel" style={{ padding: '16px', background: 'rgba(15,23,42,0.03)' }}>
                  <h4 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', marginBottom: '12px', color: 'var(--accent-purple)' }}>{category}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {items.map(item => {
                      const isChecked = pantry.includes(item.id);
                      return (
                        <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isChecked ? 'line-through' : 'none' }}>
                          <input type="checkbox" className="form-checkbox" checked={isChecked} onChange={() => handlePantryCheck(item.id)} />
                          <span>{item.name} <em style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({item.quantity})</em></span>
                        </label>
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