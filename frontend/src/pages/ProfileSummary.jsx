import { useState } from 'react';
import { User, Activity, AlertTriangle, Target, RefreshCw, Edit, BarChart2, Database, ShieldAlert, Eye, EyeOff, Lock } from 'lucide-react';

export default function ProfileSummary({ profile, targets, setActiveTab, onEditProfile }) {
  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in both password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please verify.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    setPasswordError('');
    setPasswordSuccess(true);

    const currentEmail = localStorage.getItem('mmp_user_email') || '';
    const registered = JSON.parse(localStorage.getItem('mmp_registered_users') || '[]');
    const index = registered.findIndex(u => u.email.toLowerCase() === currentEmail.toLowerCase());
    if (index !== -1) {
      registered[index].password = newPassword.trim();
      localStorage.setItem('mmp_registered_users', JSON.stringify(registered));
    }

    setTimeout(() => {
      onEditProfile(); // Automatically triggers security redirect back to login
    }, 1500);
  };

  // Safe parsing helper
  const age = profile.age || 'Not set';
  const weight = profile.weight || 'Not set';
  const height = profile.height || 'Not set';
  const gender = profile.gender || 'Not set';
  
  // BMI calculation
  let bmi = null;
  let bmiCategory = '';
  let bmiColor = 'var(--text-muted)';
  
  if (Number(weight) && Number(height)) {
    const heightInMeters = Number(height) / 100;
    bmi = (Number(weight) / (heightInMeters * heightInMeters)).toFixed(1);
    
    if (bmi < 18.5) {
      bmiCategory = 'Underweight';
      bmiColor = '#38bdf8'; // Sky blue
    } else if (bmi >= 18.5 && bmi < 25) {
      bmiCategory = 'Normal Weight';
      bmiColor = '#34d399'; // Emerald green
    } else if (bmi >= 25 && bmi < 30) {
      bmiCategory = 'Overweight';
      bmiColor = '#fbbf24'; // Amber yellow
    } else {
      bmiCategory = 'Obese';
      bmiColor = '#f87171'; // Red
    }
  }

  // Format activity level strings
  const formatActivity = (level) => {
    const mappings = {
      'sedentary': 'Sedentary (No exercise)',
      'light': 'Light (Exercise 1-3 days/week)',
      'moderate': 'Moderate (Exercise 3-5 days/week)',
      'active': 'Active (Exercise 6-7 days/week)',
      'very_active': 'Very Active (Heavy training daily)'
    };
    return mappings[level] || level;
  };

  // Format Goal strings
  const formatGoal = (goal) => {
    const mappings = {
      'lose': 'Weight Loss (-500 kcal Deficit)',
      'maintain': 'Weight Maintenance',
      'build': 'Muscle Building (+300 kcal Surplus)'
    };
    return mappings[goal] || goal;
  };

  // Macro calorie ratios
  const proteinCals = targets.protein * 4;
  const carbsCals = targets.carbs * 4;
  const fatCals = targets.fat * 9;
  const computedTotal = proteinCals + carbsCals + fatCals;
  
  const proteinPct = computedTotal ? Math.round((proteinCals / computedTotal) * 100) : 0;
  const carbsPct = computedTotal ? Math.round((carbsCals / computedTotal) * 100) : 0;
  const fatPct = computedTotal ? Math.round((fatCals / computedTotal) * 100) : 0;

  // Table rows structure
  const registryData = [
    { name: 'Age', val: age !== 'Not set' ? `${age} yrs` : 'Not set', desc: 'Sets biological baseline metabolic rate calculations.', accent: 'var(--accent-indigo)' },
    { name: 'Weight', val: weight !== 'Not set' ? `${weight} kg` : 'Not set', desc: 'Calculates the essential protein baseline budget (2.0g per kg).', accent: 'var(--accent-indigo)' },
    { name: 'Height', val: height !== 'Not set' ? `${height} cm` : 'Not set', desc: 'Sets metabolic height thresholds and BMI calculations.', accent: 'var(--accent-indigo)' },
    { name: 'Gender', val: gender, desc: 'Applies sex-specific biological offset to initial BMR math.', accent: 'var(--accent-indigo)' },
    { name: 'Activity Level', val: formatActivity(profile.activityLevel), desc: 'The metabolic coefficient scalar applied to baseline maintenance calories.', accent: 'var(--accent-cyan)' },
    { name: 'Fitness Goal', val: formatGoal(profile.goal), desc: 'Sets daily offset parameter (+300 kcal surplus or -500 kcal deficit).', accent: 'var(--accent-cyan)' },
    { name: 'Diet preference', val: profile.dietPreference === 'none' ? 'Standard (No restriction)' : profile.dietPreference, desc: 'Excludes recipes from your planning generator that don\'t match this tag.', accent: 'var(--accent-pink)' },
    { name: 'Excluded Allergens', val: profile.allergies && profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None', desc: 'Safety filter to immediately exclude allergenic recipes.', accent: '#f87171' },
    { name: 'Workout Multiplier', val: `${profile.calorieCycling?.workoutCalorieMultiplier || '1.10'}x`, desc: 'Caloric scaling multiplier applied specifically to designated Workout Days.', accent: 'var(--accent-purple)' },
    { name: 'Rest Multiplier', val: `${profile.calorieCycling?.restCalorieMultiplier || '0.90'}x`, desc: 'Caloric scaling multiplier applied specifically to designated Rest Days.', accent: 'var(--accent-purple)' },
    { name: 'Custom Macros Override', val: profile.customMacros ? 'Enabled' : 'Disabled (Auto)', desc: 'Overrides standard personalized distributions with static macro targets.', accent: '#a855f7' }
  ];

  return (
    <div className="animate-fade-in" style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }} className="summary-header">
        <div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '6px' }}>My Metabolic Profile</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>An overview of your registered parameters, physical metrics, and calculated calorie strategies.</p>
        </div>
        <button 
          onClick={onEditProfile} 
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px' }}
        >
          <Edit size={16} /> Edit Profile
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '28px' }} className="profile-grid-layout">
        
        {/* Left Column: Physical Metrics & Identity Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 1: Metabolic Baseline Stats */}
          <div className="flat-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <User size={18} className="neon-text-indigo" /> Base Parameters
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Age</span>
                <strong style={{ fontSize: '1.25rem' }}>{age} {age !== 'Not set' && 'yrs'}</strong>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Gender</span>
                <strong style={{ fontSize: '1.25rem', textTransform: 'capitalize' }}>{gender}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Weight</span>
                <strong style={{ fontSize: '1.25rem' }}>{weight} {weight !== 'Not set' && 'kg'}</strong>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Height</span>
                <strong style={{ fontSize: '1.25rem' }}>{height} {height !== 'Not set' && 'cm'}</strong>
              </div>
            </div>

            {/* BMI indicator if height & weight exist */}
            {bmi && (
              <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Calculated BMI</span>
                <strong style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: 'var(--accent-indigo)', display: 'block', margin: '4px 0' }}>
                  {bmi}
                </strong>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--border-glass)', color: bmiColor }}>
                  {bmiCategory}
                </span>
              </div>
            )}
          </div>

          {/* Card 2: Lifestyle & Exclusions */}
          <div className="flat-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <Activity size={18} className="neon-text-cyan" /> Lifestyle Restrictions
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Diet preference</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'capitalize', padding: '6px 12px', background: 'rgba(15, 23, 42, 0.03)', border: '1px solid var(--border-glass)', borderRadius: '8px', display: 'inline-block' }}>
                  {profile.dietPreference === 'none' ? 'No specific diet restrictions' : profile.dietPreference}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Exclude Food Allergens</span>
                {profile.allergies && profile.allergies.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {profile.allergies.map(allergen => (
                      <span key={allergen} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', color: '#f87171', background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.2)', padding: '4px 10px', borderRadius: '20px' }}>
                        <AlertTriangle size={10} /> {allergen}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No allergen restrictions logged.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calories, Calorie Cycling & Macro Split graphs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 3: Calorie strategy Card */}
          <div className="flat-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <Target size={18} className="neon-text-purple" /> Calorie Goal Strategy
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px', alignItems: 'center' }}>
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Activity Multiplier</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{formatActivity(profile.activityLevel)}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Target Goal Option</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{formatGoal(profile.goal)}</strong>
                </div>
              </div>

              {/* Total Calories Display bubble */}
              <div style={{ background: 'linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-purple) 100%)', padding: '20px 16px', borderRadius: '16px', textAlign: 'center', color: '#ffffff', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.2)' }}>
                <span style={{ fontSize: '0.75rem', opacity: 0.85, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {targets.isWorkoutDay ? '🏋️ Workout Day' : '🛌 Rest Day'} Target
                </span>
                <strong style={{ fontSize: '1.85rem', fontFamily: 'var(--font-display)', fontWeight: 800, display: 'block', margin: '4px 0' }}>
                  {targets.calories}
                </strong>
                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>kcal / day</span>
              </div>
            </div>

            {/* Calorie Cycling details */}
            <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '6s' }} /> Active Calorie Cycling Ratios
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.02)', border: '1px solid var(--border-glass)', padding: '10px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Workout Multiplier</span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--accent-indigo)' }}>{profile.calorieCycling?.workoutCalorieMultiplier || '1.10'}x</strong>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.02)', border: '1px solid var(--border-glass)', padding: '10px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rest Multiplier</span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--accent-purple)' }}>{profile.calorieCycling?.restCalorieMultiplier || '0.90'}x</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Macro budget summary graphs */}
          <div className="flat-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <BarChart2 size={18} className="neon-text-indigo" /> Macronutrient Splits
            </h3>

            {/* Custom overrides banner indicator */}
            {profile.customMacros && (
              <div style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '16px', display: 'inline-block' }}>
                ⭐ Custom Gram Overrides Active
              </div>
            )}

            {/* Progressive Macro Ratio chart bar */}
            <div style={{ height: '24px', borderRadius: '99px', overflow: 'hidden', display: 'flex', background: 'rgba(15, 23, 42, 0.08)', marginBottom: '24px', border: '1px solid var(--border-glass)' }}>
              {proteinPct > 0 && <div style={{ width: `${proteinPct}%`, background: 'var(--accent-indigo)', height: '100%', transition: 'var(--transition-smooth)' }} title={`Protein: ${proteinPct}%`} />}
              {carbsPct > 0 && <div style={{ width: `${carbsPct}%`, background: 'var(--accent-cyan)', height: '100%', transition: 'var(--transition-smooth)' }} title={`Carbs: ${carbsPct}%`} />}
              {fatPct > 0 && <div style={{ width: `${fatPct}%`, background: 'var(--accent-pink)', height: '100%', transition: 'var(--transition-smooth)' }} title={`Fat: ${fatPct}%`} />}
            </div>

            {/* Labels and values grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-indigo)', display: 'inline-block', marginRight: '6px' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Protein</span>
                <strong style={{ fontSize: '1.25rem', display: 'block', margin: '4px 0' }}>{targets.protein}g</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{proteinPct}% ({proteinCals} kcal)</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-cyan)', display: 'inline-block', marginRight: '6px' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Carbs</span>
                <strong style={{ fontSize: '1.25rem', display: 'block', margin: '4px 0' }}>{targets.carbs}g</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{carbsPct}% ({carbsCals} kcal)</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-pink)', display: 'inline-block', marginRight: '6px' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fat</span>
                <strong style={{ fontSize: '1.25rem', display: 'block', margin: '4px 0' }}>{targets.fat}g</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{fatPct}% ({fatCals} kcal)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Metabolic Parameters Table */}
      <div className="flat-panel" style={{ marginTop: '28px', padding: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
          <Database size={20} className="neon-text-cyan" /> Configured Parameters Registry
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-glass)', color: 'var(--text-secondary)', fontWeight: 700 }}>
                <th style={{ padding: '12px 16px' }}>Parameter</th>
                <th style={{ padding: '12px 16px' }}>Logged Value</th>
                <th style={{ padding: '12px 16px' }}>System Purpose & Implication</th>
              </tr>
            </thead>
            <tbody>
              {registryData.map((row, idx) => (
                <tr 
                  key={row.name} 
                  style={{ 
                    borderBottom: '1px solid var(--border-glass)', 
                    background: idx % 2 === 0 ? 'rgba(15, 23, 42, 0.015)' : 'transparent',
                    transition: 'var(--transition-smooth)'
                  }}
                  className="table-hover-row"
                >
                  <td style={{ padding: '14px 16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: row.accent }} />
                    {row.name}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      background: 'rgba(15, 23, 42, 0.03)', 
                      border: '1px solid var(--border-glass)',
                      fontSize: '0.8rem',
                      display: 'inline-block'
                    }}>
                      {row.val}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {row.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Security & Change Password Card */}
      <div className="flat-panel" style={{ marginTop: '28px', padding: '24px', position: 'relative' }}>
        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
          <ShieldAlert size={20} className="neon-text-pink" /> Security & Account Credentials
        </h3>
        
        <form onSubmit={handlePasswordUpdate} style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {passwordError && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.8rem', fontWeight: 600 }}>
              ⚠️ {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '0.8rem', fontWeight: 600 }}>
              ✅ Password updated successfully! Re-routing to login screen...
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="password-fields-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  <Lock size={14} />
                </span>
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    fontSize: '0.8rem',
                    padding: '8px 36px 8px 36px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    width: '100%',
                    outline: 'none'
                  }}
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  <Lock size={14} />
                </span>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    fontSize: '0.8rem',
                    padding: '8px 36px 8px 36px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    width: '100%',
                    outline: 'none'
                  }}
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="btn-primary"
            style={{ padding: '10px 18px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, width: 'max-content', marginTop: '4px' }}
          >
            Update Password & Re-authenticate
          </button>
        </form>
      </div>
    </div>
  );
}
