
export default function AdminPanel({
  recipes,
  handleApproveRecipe,
  handleDeleteRecipe,
}) {
  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '8px' }}>Recipe Database Admin Dashboard</h2>
      <p style={{ marginBottom: '32px' }}>Review user-submitted recipes, edit macros, or remove entries from circulation.</p>

      <div className="flat-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Global Recipe Management</h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Course</th>
                <th style={{ padding: '12px' }}>Calories</th>
                <th style={{ padding: '12px' }}>Macros (P/C/F)</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map(recipe => (
                <tr key={recipe.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{recipe.name}</td>
                  <td style={{ padding: '12px', textTransform: 'capitalize' }}>{recipe.category}</td>
                  <td style={{ padding: '12px' }}>{recipe.calories} kcal</td>
                  <td style={{ padding: '12px' }}>{recipe.protein}g / {recipe.carbs}g / {recipe.fat}g</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      background: recipe.approved ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: recipe.approved ? 'var(--accent-green)' : 'var(--accent-orange)',
                      padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem'
                    }}>
                      {recipe.approved ? 'Approved' : 'Pending Review'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                    {!recipe.approved && (
                      <button onClick={() => handleApproveRecipe(recipe.id)} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                        Approve
                      </button>
                    )}
                    <button onClick={() => handleDeleteRecipe(recipe.id)} className="btn-danger" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}