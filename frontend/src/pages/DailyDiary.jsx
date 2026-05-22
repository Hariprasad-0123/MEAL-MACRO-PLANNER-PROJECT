import { Dumbbell, Flame, Award, Camera, RefreshCw, Utensils, Plus, Trash2, Droplet } from 'lucide-react';

export default function DailyDiary({
  currentDate,
  setCurrentDate,
  targets,
  diary,
  saveDiary,
  activeStreak,
  consumed,
  remaining,
  setShowBarcodeScanner,
  setScanResult,
  applyWeeklyPlanToToday,
  removeFoodFromDiary,
  setQuickAddSlot,
  setShowQuickAdd,
  toggleWaterGlass,
  showToast,
}) {
  // Safe percentage helper calculations to prevent division by zero or NaN/Infinity values
  const calPercent = (targets.calories && targets.calories > 0) ? Math.min(1, (consumed.calories || 0) / targets.calories) : 0;
  const proteinPercent = (targets.protein && targets.protein > 0) ? Math.min(1, (consumed.protein || 0) / targets.protein) : 0;
  const carbsPercent = (targets.carbs && targets.carbs > 0) ? Math.min(1, (consumed.carbs || 0) / targets.carbs) : 0;
  const fatPercent = (targets.fat && targets.fat > 0) ? Math.min(1, (consumed.fat || 0) / targets.fat) : 0;

  return (
    <div className="animate-fade-in">
      {/* Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Daily Food Diary</h2>
          <p>Track your meals, calorie cycling, and water intake.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input type="date" className="form-input" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} style={{ width: 'auto' }} />
          
          {/* Calorie Cycle / Workout Day toggle */}
          <div className="flat-panel" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
            <Dumbbell size={16} className={targets.isWorkoutDay ? "neon-text-cyan" : "text-muted"} />
            <span style={{ fontSize: '0.85rem' }}>{targets.isWorkoutDay ? "Workout Cycle (+20% Carbs)" : "Rest Cycle (-10%)"}</span>
            <label className="toggle-switch" style={{ width: '40px', height: '22px' }}>
              <input type="checkbox" checked={diary.isWorkoutDay} onChange={(e) => {
                const updated = { ...diary, isWorkoutDay: e.target.checked };
                saveDiary(updated);
                showToast(e.target.checked ? 'Workout calorie cycle applied (+20% calories).' : 'Rest calorie cycle applied.');
              }} />
              <span className="toggle-slider" style={{ borderRadius: '22px' }}></span>
            </label>
          </div>
        </div>
      </div>

      {/* Streak & Adherence Widget */}
      <div className="flat-panel" style={{ display: 'flex', padding: '16px 24px', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'rgba(245, 158, 11, 0.15)', borderRadius: '12px', padding: '10px' }}>
          <Flame size={28} style={{ color: 'var(--accent-orange)' }} />
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Daily Streak Tracker</h4>
          <p style={{ fontSize: '0.85rem' }}>You have hit your daily calorie target within a 5% margin for <strong>{activeStreak} consecutive days</strong>!</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Award size={20} className="neon-text-cyan" />
          <span style={{ fontWeight: 'bold' }}>Streak: {activeStreak}d</span>
        </div>
      </div>

      {/* Progress Rings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Calories Ring */}
        <div className="flat-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
          <div className="progress-ring">
            <svg width="140" height="140">
              <circle cx="70" cy="70" r="55" fill="none" stroke="var(--border-glass)" strokeWidth="10" />
              <circle cx="70" cy="70" r="55" fill="none" stroke="var(--accent-cyan)" strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 55}`}
                strokeDashoffset={`${2 * Math.PI * 55 * (1 - calPercent)}`}
                className="progress-ring-circle" />
            </svg>
            <div className="progress-label">
              <span className="progress-label-value" style={{ color: 'var(--accent-cyan)' }}>{remaining.calories}</span>
              <div className="progress-label-sub">Left</div>
            </div>
          </div>
          <h4 style={{ marginTop: '12px', fontSize: '0.95rem' }}>Calories</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: {targets.calories} kcal</p>
        </div>

        {/* Other rings (Protein, Carbs, Fat) follow the same pattern... */}
        <div className="flat-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            <div className="progress-ring"><svg width="140" height="140"><circle cx="70" cy="70" r="55" fill="none" stroke="var(--border-glass)" strokeWidth="10"></circle><circle cx="70" cy="70" r="55" fill="none" stroke="var(--accent-purple)" strokeWidth="10" strokeDasharray="345.5751918948772" strokeDashoffset={345.5751918948772 * (1 - proteinPercent)} className="progress-ring-circle"></circle></svg><div className="progress-label"><span className="progress-label-value" style={{color: 'var(--accent-purple)'}}>{remaining.protein}g</span><div className="progress-label-sub">Left</div></div></div><h4 style={{marginTop: '12px', fontSize: '0.95rem'}}>Protein</h4><p style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Target: {targets.protein}g</p>
        </div>
        <div className="flat-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            <div className="progress-ring"><svg width="140" height="140"><circle cx="70" cy="70" r="55" fill="none" stroke="var(--border-glass)" strokeWidth="10"></circle><circle cx="70" cy="70" r="55" fill="none" stroke="var(--accent-orange)" strokeWidth="10" strokeDasharray="345.5751918948772" strokeDashoffset={345.5751918948772 * (1 - carbsPercent)} className="progress-ring-circle"></circle></svg><div className="progress-label"><span className="progress-label-value" style={{color: 'var(--accent-orange)'}}>{remaining.carbs}g</span><div className="progress-label-sub">Left</div></div></div><h4 style={{marginTop: '12px', fontSize: '0.95rem'}}>Carbs</h4><p style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Target: {targets.carbs}g</p>
        </div>
        <div className="flat-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            <div className="progress-ring"><svg width="140" height="140"><circle cx="70" cy="70" r="55" fill="none" stroke="var(--border-glass)" strokeWidth="10"></circle><circle cx="70" cy="70" r="55" fill="none" stroke="var(--accent-pink)" strokeWidth="10" strokeDasharray="345.5751918948772" strokeDashoffset={345.5751918948772 * (1 - fatPercent)} className="progress-ring-circle"></circle></svg><div className="progress-label"><span className="progress-label-value" style={{color: 'var(--accent-pink)'}}>{remaining.fat}g</span><div className="progress-label-sub">Left</div></div></div><h4 style={{marginTop: '12px', fontSize: '0.95rem'}}>Fat</h4><p style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Target: {targets.fat}g</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={() => { setShowBarcodeScanner(true); setScanResult(null); }} className="btn-primary">
          <Camera size={18} /> Barcode Scanner
        </button>
        <button onClick={applyWeeklyPlanToToday} className="btn-secondary">
          <RefreshCw size={18} /> Apply Scheduled Plan
        </button>
      </div>

      {/* Diary Meal Slots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
        {['breakfast', 'lunch', 'dinner'].map(slot => {
          const items = diary.meals[slot] || [];
          const slotCalories = items.reduce((sum, i) => sum + (i.calories || 0), 0);
          
          return (
            <div key={slot} className="flat-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '12px' }}>
                <h3 style={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Utensils size={18} className="neon-text-cyan" /> {slot}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({slotCalories} kcal)</span>
                </h3>
                <button onClick={() => { setQuickAddSlot(slot); setShowQuickAdd(true); }} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  <Plus size={14} /> Quick Add
                </button>
              </div>

              {items.length === 0 ? (
                <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                  No food logged in this course.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {items.map(item => (
                    <div key={item.logId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(15,23,42,0.03)', borderRadius: '8px' }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{item.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          P: {item.protein || 0}g | C: {item.carbs || 0}g | F: {item.fat || 0}g
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{item.calories || 0} kcal</span>
                        <button onClick={() => removeFoodFromDiary(slot, item.logId)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Water Tracker Widget */}
      <div className="flat-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplet size={20} style={{ color: '#38bdf8' }} /> Water Tracker
          </h3>
          <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>{(diary.water || 0) * 250} ml / 2000 ml</span>
        </div>
        <p style={{ marginBottom: '16px', fontSize: '0.85rem' }}>Click a glass to log 250ml of water consumed. Adhering to hydration requirements helps recovery.</p>
        <div className="water-glass-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`water-glass ${i < (diary.water || 0) ? 'filled' : ''}`} onClick={() => toggleWaterGlass(i)}>
              <div className="water-glass-fill"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}