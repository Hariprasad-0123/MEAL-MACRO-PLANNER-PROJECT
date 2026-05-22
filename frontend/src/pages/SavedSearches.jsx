import { useState, useEffect } from 'react';
import { Trash2, Search, Barcode, Calendar, Clock, RefreshCw, AlertCircle, Database } from 'lucide-react';

export default function SavedSearches({ API_BASE, showToast, setActiveTab, setRecipeFilter }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, recipe, barcode

  // Fetch search history from Mongoose database
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/search-history`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (e) {
      console.error('Error fetching search history:', e);
      showToast('Could not load search history.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Delete individual entry
  const handleDeleteEntry = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/search-history/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Search entry deleted.');
        fetchHistory();
      } else {
        showToast('Failed to delete entry.', 'warning');
      }
    } catch {
      showToast('Offline delete failed.', 'warning');
    }
  };

  // Clear all history
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your entire search database? This action cannot be undone.')) {
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/search-history`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('All search history database cleared!');
        setHistory([]);
      } else {
        showToast('Failed to clear database.', 'warning');
      }
    } catch {
      showToast('Offline clear failed.', 'warning');
    }
  };

  // Re-run search query
  const handleReRun = (item) => {
    if (item.type === 'recipe') {
      // Set the active tab to Recipe Library and trigger a reset/filter
      setRecipeFilter(['all']);
      setActiveTab('recipes');
      showToast(`Redirected to recipes. Try searching for: "${item.query}"`);
    } else {
      setActiveTab('dashboard');
      showToast(`Check Barcode: Enter "${item.query}" in the scanner.`);
    }
  };

  // Filter local state list
  const filteredHistory = history.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="animate-fade-in">
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database className="neon-text-cyan" size={32} /> Saved Search Database
          </h2>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)' }}>
            Review persistent search queries and scanned barcodes saved in your MongoDB cluster with accurate date and timestamp tracking.
          </p>
        </div>

        {history.length > 0 && (
          <button onClick={handleClearAll} className="btn-danger" style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 16px', fontSize: '0.85rem' }}>
            <Trash2 size={16} /> Clear Database
          </button>
        )}
      </div>

      {/* Filter Options and stats */}
      <div className="flat-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setFilterType('all')} 
            className={filterType === 'all' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            All Queries ({history.length})
          </button>
          <button 
            onClick={() => setFilterType('recipe')} 
            className={filterType === 'recipe' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Recipes ({history.filter(h => h.type === 'recipe').length})
          </button>
          <button 
            onClick={() => setFilterType('barcode')} 
            className={filterType === 'barcode' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Barcodes ({history.filter(h => h.type === 'barcode').length})
          </button>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          DB Status: <strong style={{ color: 'var(--accent-cyan)' }}>Connected</strong>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flat-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="loader" style={{ margin: '0 auto 16px', border: '3px solid var(--border-glass)', borderTop: '3px solid var(--accent-cyan)', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ margin: 0 }}>Syncing search metrics with database...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        /* Empty State */
        <div className="flat-panel" style={{ padding: '64px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-muted)' }} />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px 0' }}>No Saved Data Found</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: '1.5' }}>
              We couldn't find any search queries in this category. Perform some recipe keyword searches in the Recipe Library or lookup products via the Barcode Scanner to auto-save them.
            </p>
          </div>
        </div>
      ) : (
        /* Main Database Logs Grid */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredHistory.map((item) => {
            const isRecipe = item.type === 'recipe';
            const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            const formattedTime = new Date(item.timestamp).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return (
              <div 
                key={item._id} 
                className="flat-panel" 
                style={{ 
                  padding: '20px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderLeft: isRecipe ? '4px solid var(--accent-pink)' : '4px solid var(--accent-cyan)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Left Side Info */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {/* Icon Badge */}
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '12px', 
                    background: isRecipe ? 'rgba(236, 72, 153, 0.1)' : 'rgba(0, 242, 254, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isRecipe ? 'var(--accent-pink)' : 'var(--accent-cyan)'
                  }}>
                    {isRecipe ? <Search size={22} /> : <Barcode size={22} />}
                  </div>

                  {/* Core query & metadata */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
                        "{item.query}"
                      </span>
                      
                      {/* Type Badge */}
                      <span style={{ 
                        fontSize: '0.65rem', 
                        textTransform: 'uppercase', 
                        fontWeight: 'bold',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: isRecipe ? 'rgba(236, 72, 153, 0.15)' : 'rgba(0, 242, 254, 0.15)',
                        color: isRecipe ? 'var(--accent-pink)' : 'var(--accent-cyan)'
                      }}>
                        {isRecipe ? 'Recipe Search' : 'Barcode Scanner'}
                      </span>
                      
                      {/* Result Badge */}
                      <span style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 'bold', 
                        color: 'var(--text-muted)',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-glass)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {item.resultsCount} {item.resultsCount === 1 ? 'match' : 'matches'}
                      </span>
                    </div>

                    {/* Date and Time logs */}
                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} style={{ color: 'var(--accent-cyan)' }} /> {formattedDate}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} style={{ color: 'var(--accent-pink)' }} /> {formattedTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side Action Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleReRun(item)}
                    className="btn-secondary" 
                    style={{ padding: '8px 12px', fontSize: '0.75rem', display: 'flex', gap: '6px', alignItems: 'center' }}
                    title="View page search details"
                  >
                    <RefreshCw size={12} /> Re-run Search
                  </button>
                  <button 
                    onClick={() => handleDeleteEntry(item._id)}
                    className="btn-secondary" 
                    style={{ padding: '8px', color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    title="Delete log from database"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Database sync styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}
