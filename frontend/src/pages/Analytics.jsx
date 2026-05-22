export default function Analytics({
  weightLogs,
  currentDate,
  saveWeightLog,
  deleteWeightLog,
  resetWeightLogs,
  consumed,
  targets,
}) {
  // Safe calculations to avoid division by zero or NaN/Infinity values
  const proteinPercent = (targets.protein && targets.protein > 0) ? Math.min(100, ((consumed.protein || 0) / targets.protein) * 100) : 0;
  const carbsPercent = (targets.carbs && targets.carbs > 0) ? Math.min(100, ((consumed.carbs || 0) / targets.carbs) * 100) : 0;
  const fatPercent = (targets.fat && targets.fat > 0) ? Math.min(100, ((consumed.fat || 0) / targets.fat) * 100) : 0;

  // Format date helper to show "MM-DD"
  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    // If it contains a full timestamp (ISO string), take the YYYY-MM-DD part first, then slice MM-DD
    const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    return datePart.substring(5, 10); // yields "MM-DD"
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '8px' }}>Adherence & Weight Analytics</h2>
      <p style={{ marginBottom: '32px' }}>Track weight progress, compliance scores, and rolling macro targets.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '32px' }}>
        
        {/* Weight Logger & Chart */}
        <div className="flat-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0 }}>Weight Progress Chart</h3>
              
              {/* Back Step (Undo Last) & Reset All Sub-Toolbar */}
              {weightLogs.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px', alignItems: 'center' }}>
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete the last logged weight entry?')) {
                        const lastLog = weightLogs[weightLogs.length - 1];
                        deleteWeightLog(lastLog.date);
                      }
                    }}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      padding: 0, 
                      fontSize: '0.72rem', 
                      fontWeight: 700, 
                      color: 'var(--accent-pink)', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px' 
                    }}
                    title="Delete the most recently logged weight log"
                  >
                    ↺ Undo Last
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.15)' }}>|</span>
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reset all weight progress history? This action cannot be undone.')) {
                        resetWeightLogs();
                      }
                    }}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      padding: 0, 
                      fontSize: '0.72rem', 
                      fontWeight: 700, 
                      color: '#ef4444', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px' 
                    }}
                    title="Clear entire weight history data"
                  >
                    🗑️ Reset All
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="date" id="weight-logger-date" defaultValue={currentDate} className="form-input" style={{ width: '125px', padding: '6px 10px', fontSize: '0.85rem' }} />
              <input type="number" id="weight-logger-input" placeholder="70.0" className="form-input" style={{ width: '70px', padding: '6px 10px', fontSize: '0.85rem' }} />
              <button onClick={() => {
                const dateInput = document.getElementById('weight-logger-date');
                const input = document.getElementById('weight-logger-input');
                if (dateInput && dateInput.value && input && input.value) {
                  saveWeightLog(dateInput.value, input.value);
                  input.value = '';
                }
              }} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Log</button>
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '200px', background: 'rgba(15,23,42,0.03)', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {weightLogs.length === 0 && (
              <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', textAlign: 'center' }}>Log your first weight to start tracking.</p>
            )}
            
            {weightLogs.length === 1 && (
              <>
                <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', textAlign: 'center', paddingBottom: '10px' }}>Add one more weight to see progress.</p>
                <svg width="100%" height="150px" viewBox="0 0 500 150" preserveAspectRatio="xMidYMid meet">
                  <circle cx="250" cy="75" r="5" fill="var(--bg-primary)" stroke="var(--accent-cyan)" strokeWidth="2" />
                  <text x="250" y="65" fill="var(--text-primary)" fontSize="10" textAnchor="middle">{weightLogs[0].weight}kg</text>
                  <text x="250" y="145" fill="var(--text-muted)" fontSize="8" textAnchor="middle">{formatDateLabel(weightLogs[0].date)}</text>
                </svg>
              </>
            )}

            {weightLogs.length > 1 && (
              <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="50" x2="500" y2="50" stroke="var(--border-glass)" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="var(--border-glass)" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="var(--border-glass)" />
                
                {/* Line calculation */}
                {(() => {
                  const weights = weightLogs.map(w => w.weight);
                  const minWeight = Math.min(...weights) - 1;
                  const maxWeight = Math.max(...weights) + 1;
                  const weightRange = maxWeight - minWeight;
                  
                  const points = weightLogs.map((log, idx) => {
                    const x = 40 + (idx / (weightLogs.length - 1)) * 420;
                    const y = 165 - ((log.weight - minWeight) / weightRange) * 140;
                    return `${x},${y}`;
                  });

                  return (
                    <>
                      <path d={`M ${points.join(' L ')}`} fill="none" stroke="var(--accent-cyan)" strokeWidth="3" />
                      {weightLogs.map((log, idx) => {
                        const x = 40 + (idx / (weightLogs.length - 1)) * 420;
                        const y = 165 - ((log.weight - minWeight) / weightRange) * 140;
                        return (
                          <g key={idx}>
                            <circle cx={x} cy={y} r="5" fill="var(--bg-primary)" stroke="var(--accent-cyan)" strokeWidth="2" />
                            <text x={x} y={y - 12} fill="var(--text-primary)" fontSize="10" fontWeight="600" textAnchor="middle">{log.weight}kg</text>
                            <text x={x} y="195" fill="var(--text-muted)" fontSize="8" textAnchor="middle">{formatDateLabel(log.date)}</text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            )}
          </div>
        </div>

        {/* Weekly Macro adherence averages */}
        <div className="flat-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Weekly Macro Averages</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Calorie target average bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span>Protein (Avg vs Target)</span>
                <span style={{ fontWeight: 'bold' }}>{consumed.protein}g / {targets.protein}g</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(15,23,42,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${proteinPercent}%`, background: 'var(--accent-purple)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span>Carbohydrates (Avg vs Target)</span>
                <span style={{ fontWeight: 'bold' }}>{consumed.carbs}g / {targets.carbs}g</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(15,23,42,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${carbsPercent}%`, background: 'var(--accent-orange)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span>Fat (Avg vs Target)</span>
                <span style={{ fontWeight: 'bold' }}>{consumed.fat}g / {targets.fat}g</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(15,23,42,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${fatPercent}%`, background: 'var(--accent-pink)' }}></div>
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(0, 242, 254, 0.05)', borderRadius: '12px', border: '1px dashed var(--accent-cyan)', marginTop: '8px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                💡 <strong>Weekly Review:</strong> You are meeting your fiber intake guidelines. Try swapping snacks for high protein items to hit protein goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}