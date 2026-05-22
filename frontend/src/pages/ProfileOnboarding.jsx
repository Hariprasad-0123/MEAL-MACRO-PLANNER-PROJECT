import { useState, useEffect } from 'react';

export default function ProfileOnboarding({ profile, saveProfile, showToast }) {
  const [localProfile, setLocalProfile] = useState(profile);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Auto-calculated multipliers based on physical profile (BMI & Age)
  const getAutoCyclingMultipliers = (age, weight, height) => {
    if (!age || !weight || !height) return { workout: 1.10, rest: 0.90 };
    const bmi = weight / ((height / 100) ** 2);
    const isHighRisk = bmi > 28 || age > 50;
    return {
      workout: isHighRisk ? 1.05 : 1.10,
      rest: isHighRisk ? 0.95 : 0.90
    };
  };

  // Automatically update suggested multipliers from user physical metrics
  useEffect(() => {
    const ageVal = Number(localProfile.age);
    const weightVal = Number(localProfile.weight);
    const heightVal = Number(localProfile.height);

    if (ageVal && weightVal && heightVal) {
      const suggested = getAutoCyclingMultipliers(ageVal, weightVal, heightVal);
      // Auto-prefill multipliers ONLY if they are not already set
      if (!localProfile.calorieCycling?.workoutCalorieMultiplier || !localProfile.calorieCycling?.restCalorieMultiplier) {
        setLocalProfile(prev => ({
          ...prev,
          calorieCycling: {
            ...prev.calorieCycling,
            workoutCalorieMultiplier: prev.calorieCycling?.workoutCalorieMultiplier || suggested.workout.toFixed(2),
            restCalorieMultiplier: prev.calorieCycling?.restCalorieMultiplier || suggested.rest.toFixed(2)
          }
        }));
      }
    }
  }, [localProfile.age, localProfile.weight, localProfile.height]);

  const handleUpdate = () => {
    const { age, weight, height, calorieCycling } = localProfile;
    if (
      !age ||
      !weight ||
      !height ||
      !calorieCycling?.workoutCalorieMultiplier ||
      !calorieCycling?.restCalorieMultiplier
    ) {
      showToast('Please fill all metabolic profile fields.', 'warning');
      return;
    }

    const profileToSave = {
      ...localProfile,
      age: Number(localProfile.age) || 0,
      weight: Number(localProfile.weight) || 0,
      height: Number(localProfile.height) || 0,
      calorieCycling: {
        ...localProfile.calorieCycling,
        workoutCalorieMultiplier: Number(localProfile.calorieCycling?.workoutCalorieMultiplier) || 0,
        restCalorieMultiplier: Number(localProfile.calorieCycling?.restCalorieMultiplier) || 0,
      },
      customMacros: localProfile.customMacros ? {
        ...localProfile.customMacros,
        protein: Number(localProfile.customMacros.protein) || 0,
        carbs: Number(localProfile.customMacros.carbs) || 0,
        fat: Number(localProfile.customMacros.fat) || 0,
      } : null
    };
    saveProfile(profileToSave);
  };

  const handleReset = () => {
    setLocalProfile(prev => ({
      ...prev,
      age: '',
      weight: '',
      height: '',
      gender: 'male',
      activityLevel: 'sedentary',
      goal: 'maintain',
      dietPreference: 'none',
      allergies: [],
      customMacros: null,
      calorieCycling: {
        ...prev.calorieCycling,
        workoutCalorieMultiplier: '',
        restCalorieMultiplier: ''
      }
    }));
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '8px' }}>Onboarding & Macro Calculator</h2>
      <p style={{ marginBottom: '32px' }}>Configure your metabolic parameters, diet restrictions, and target calorie allocations.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className="profile-grid-layout">
        
        {/* Form 1: Onboarding Parameters */}
        <div className="flat-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>Metabolic Profile Settings</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input type="number" className="form-input" value={localProfile.age} onChange={(e) => setLocalProfile({...localProfile, age: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={localProfile.gender} onChange={(e) => setLocalProfile({...localProfile, gender: e.target.value})}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input type="number" className="form-input" value={localProfile.weight} onChange={(e) => setLocalProfile({...localProfile, weight: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input type="number" className="form-input" value={localProfile.height} onChange={(e) => setLocalProfile({...localProfile, height: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Activity Level</label>
            <select className="form-select" value={localProfile.activityLevel} onChange={(e) => setLocalProfile({...localProfile, activityLevel: e.target.value})}>
              <option value="sedentary">Sedentary (No exercise)</option>
              <option value="light">Light (Exercise 1-3 days/week)</option>
              <option value="moderate">Moderate (Exercise 3-5 days/week)</option>
              <option value="active">Active (Exercise 6-7 days/week)</option>
              <option value="very_active">Very Active (Heavy training daily)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Goal Target</label>
            <select className="form-select" value={localProfile.goal} onChange={(e) => setLocalProfile({...localProfile, goal: e.target.value})}>
              <option value="lose">Lose Weight (-500 kcal deficit)</option>
              <option value="maintain">Maintain Weight</option>
              <option value="build">Build Muscle (+300 kcal surplus)</option>
            </select>
          </div>

          {/* Calorie Cycling configuration */}
          <h4 style={{ margin: '20px 0 12px 0', borderTop: '1px solid var(--border-glass)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Calorie Cycling Configuration
            <button 
              type="button" 
              onClick={() => {
                const ageVal = Number(localProfile.age);
                const weightVal = Number(localProfile.weight);
                const heightVal = Number(localProfile.height);
                if (!ageVal || !weightVal || !heightVal) {
                  showToast('Please enter your age, weight, and height to calculate recommendations.', 'warning');
                  return;
                }
                const suggested = getAutoCyclingMultipliers(ageVal, weightVal, heightVal);
                setLocalProfile(prev => ({
                  ...prev,
                  calorieCycling: {
                    ...prev.calorieCycling,
                    workoutCalorieMultiplier: suggested.workout.toFixed(2),
                    restCalorieMultiplier: suggested.rest.toFixed(2)
                  }
                }));
                showToast('Calorie cycling multipliers calculated from physical profile data!', 'success');
              }}
              className="btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }}
            >
              Auto-Fill Recommended
            </button>
          </h4>
          <div className="form-group">
            <label className="form-label">Calorie multipliers (Workout vs Rest days)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input type="number" step="0.05" className="form-input" placeholder="Workout Multiplier" value={localProfile.calorieCycling?.workoutCalorieMultiplier} onChange={(e) => {
                const updated = { ...localProfile };
                updated.calorieCycling.workoutCalorieMultiplier = e.target.value;
                setLocalProfile(updated);
              }} />
              <input type="number" step="0.05" className="form-input" placeholder="Rest Multiplier" value={localProfile.calorieCycling?.restCalorieMultiplier} onChange={(e) => {
                const updated = { ...localProfile };
                updated.calorieCycling.restCalorieMultiplier = e.target.value;
                setLocalProfile(updated);
              }} />
            </div>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={handleReset} className="btn-secondary">Reset</button>
            <button onClick={handleUpdate} className="btn-primary">Update Profile</button>
          </div>
        </div>

        {/* Form 2: Dietary Preferences & Custom Overrides */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Dietary Filter */}
          <div className="flat-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Diet & Allergen Settings</h3>
            
            <div className="form-group">
              <label className="form-label">Primary Dietary Preference</label>
              <select className="form-select" value={localProfile.dietPreference} onChange={(e) => setLocalProfile({...localProfile, dietPreference: e.target.value})}>
                <option value="none">No specific diet restrictions</option>
                <option value="vegan">Vegan (Plant-based only)</option>
                <option value="keto">Keto (High fat, ultra-low carb)</option>
                <option value="paleo">Paleo (Whole food hunter-gatherer)</option>
                <option value="gluten-free">Gluten-Free</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Exclude Food Allergens</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {['gluten', 'dairy', 'nuts', 'soy'].map(allergen => {
                  const hasAllergy = localProfile.allergies.includes(allergen);
                  return (
                    <label key={allergen} style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'capitalize', fontSize: '0.85rem' }}>
                      <input type="checkbox" className="form-checkbox" checked={hasAllergy} onChange={() => {
                        const nextAllergies = hasAllergy 
                          ? localProfile.allergies.filter(a => a !== allergen) 
                          : [...localProfile.allergies, allergen];
                        setLocalProfile({...localProfile, allergies: nextAllergies});
                      }} />
                      {allergen}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Macro Target overrides */}
          <div className="flat-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>Custom Macro Overrides</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '20px' }}>Override standard calculations with specific gram allocations.</p>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem' }}>Enable Custom Overrides</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={localProfile.customMacros !== null} onChange={(e) => {
                    const val = e.target.checked 
                      ? { mode: 'grams', protein: 150, carbs: 200, fat: 60 } 
                      : null;
                    setLocalProfile({...localProfile, customMacros: val});
                  }} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            {localProfile.customMacros && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Protein (g)</label>
                    <input type="number" className="form-input" value={localProfile.customMacros.protein} onChange={(e) => {
                      const updated = { ...localProfile };
                      updated.customMacros.protein = e.target.value;
                      setLocalProfile(updated);
                    }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Carbs (g)</label>
                    <input type="number" className="form-input" value={localProfile.customMacros.carbs} onChange={(e) => {
                      const updated = { ...localProfile };
                      updated.customMacros.carbs = e.target.value;
                      setLocalProfile(updated);
                    }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fat (g)</label>
                    <input type="number" className="form-input" value={localProfile.customMacros.fat} onChange={(e) => {
                      const updated = { ...localProfile };
                      updated.customMacros.fat = e.target.value;
                      setLocalProfile(updated);
                    }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}