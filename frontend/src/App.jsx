import { useState, useEffect } from 'react';
import { 
  Dumbbell, Calendar, Utensils, BookOpen, BarChart2, User, 
  Camera, ShieldAlert, Bot, Sparkles, Menu, X, 
  Sun, Moon, Database, LogOut
} from 'lucide-react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ProfileOnboarding from './pages/ProfileOnboarding.jsx';
import DailyDiary from './pages/DailyDiary.jsx';
import WeeklyPlanner from './pages/WeeklyPlanner.jsx';
import RecipeLibrary from './pages/RecipeLibrary.jsx';
import Analytics from './pages/Analytics.jsx';
import AICoach from './pages/AICoach.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import SavedSearches from './pages/SavedSearches.jsx';
import ProfileSummary from './pages/ProfileSummary.jsx';
import { generateMealPlanForDay, generateGroceryList } from './utils/plannerUtils.js';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api';

// Helper to calculate suggested calorie cycling multipliers based on physical profile (BMI & Age)
const getAutoCyclingMultipliers = (age, weight, height) => {
  const bmi = weight / ((height / 100) ** 2);
  // More conservative swings prevent calories from getting dangerously high or low
  const isHighRisk = bmi > 28 || age > 50;
  return {
    workout: isHighRisk ? 1.05 : 1.10,
    rest: isHighRisk ? 0.95 : 0.90
  };
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddSlot, setQuickAddSlot] = useState('breakfast');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [recipeFilter, setRecipeFilter] = useState(['all']);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Physical profile defaults for initialization
  const defaultAge = '';
  const defaultWeight = '';
  const defaultHeight = '';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // App Core Data States
  const [profile, setProfile] = useState(() => {
    const local = localStorage.getItem('mmp_profile');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Error parsing profile from local storage:', e);
      }
    }
    return {
      age: defaultAge,
      weight: defaultWeight,
      height: defaultHeight,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'maintain',
      dietPreference: 'none',
      allergies: [],
      customMacros: null,
      isPremium: false,
      calorieCycling: {
        workoutDays: ['Monday', 'Wednesday', 'Friday'],
        workoutCalorieMultiplier: '',
        restCalorieMultiplier: ''
      }
    };
  });

  const [recipes, setRecipes] = useState(() => {
    const local = localStorage.getItem('mmp_recipes');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Error parsing recipes from local storage:', e);
      }
    }
    return [];
  });

  const [diary, setDiary] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    const local = localStorage.getItem(`mmp_diary_${today}`);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Error parsing diary from local storage:', e);
      }
    }
    return {
      meals: { breakfast: [], lunch: [], dinner: [] },
      water: 0,
      isWorkoutDay: false
    };
  });

  const [weightLogs, setWeightLogs] = useState(() => {
    const local = localStorage.getItem('mmp_weight');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Error parsing weight logs from local storage:', e);
      }
    }
    return [];
  });

  const [weeklyPlan, setWeeklyPlan] = useState(() => {
    const local = localStorage.getItem('mmp_weeklyplan');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Error parsing weekly plan from local storage:', e);
      }
    }
    return {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
    };
  });

  const [pantry, setPantry] = useState(() => {
    const local = localStorage.getItem('mmp_pantry');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Error parsing pantry from local storage:', e);
      }
    }
    return [];
  });

  // Form states
  const [quickAddForm, setQuickAddForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  const [customRecipeForm, setCustomRecipeForm] = useState({
    name: '', category: 'lunch', calories: '', protein: '', carbs: '', fat: '', diet: 'none',
    allergens: [], ingredientsText: '', instructionsText: ''
  });
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [premiumCard, setPremiumCard] = useState({ cardNumber: '', name: '', expiry: '', cvv: '' });
  const [isPaying, setIsPaying] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  
  // Chatbot states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'coach', text: "Hello! I am your AI Macro Coach. Upgrade to Premium to get personalized advice on your meal logs!" }
  ]);

  // Toast / Status Message State
  const [toast, setToast] = useState(null);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper: Format day of week for a date
  const getDayOfWeekName = (dateStr) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(dateStr);
    return days[d.getDay()];
  };

  // --- API OPERATIONS WITH LOCAL STORAGE FALLBACKS ---

  async function fetchProfile() {
    try {
      const res = await fetch(`${API_BASE}/profile`);
      if (res.ok) {
        const data = await res.json();
        const normalized = {
          ...data,
          age: data.age === null || data.age === 0 ? '' : data.age,
          weight: data.weight === null || data.weight === 0 ? '' : data.weight,
          height: data.height === null || data.height === 0 ? '' : data.height,
          calorieCycling: data.calorieCycling ? {
            ...data.calorieCycling,
            workoutCalorieMultiplier: data.calorieCycling.workoutCalorieMultiplier === null ? '' : data.calorieCycling.workoutCalorieMultiplier,
            restCalorieMultiplier: data.calorieCycling.restCalorieMultiplier === null ? '' : data.calorieCycling.restCalorieMultiplier,
          } : {
            workoutDays: ['Monday', 'Wednesday', 'Friday'],
            workoutCalorieMultiplier: '',
            restCalorieMultiplier: ''
          }
        };
        setProfile(normalized);
        localStorage.setItem('mmp_profile', JSON.stringify(normalized));
      }
    } catch {
      console.warn('Backend offline, using local storage/fallback for Profile');
      const local = localStorage.getItem('mmp_profile');
      if (local) setProfile(JSON.parse(local));
    }
  };

  const saveProfile = async (updatedProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('mmp_profile', JSON.stringify(updatedProfile));
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
      if (res.ok) {
        showToast('Profile updated successfully!', 'success');
      }
    } catch {
      showToast('Profile saved locally!', 'success');
    }
  };

  const handleEditProfileRedirect = () => {
    setActiveTab('profile');
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  async function fetchRecipes() {
    try {
      const res = await fetch(`${API_BASE}/recipes`);
      if (!res.ok) throw new Error('Backend response not OK');
      const data = await res.json();
      setRecipes(data);
      // Keep local storage in sync with the backend
      localStorage.setItem('mmp_recipes', JSON.stringify(data));
    } catch {
      console.warn('Backend offline, using mock recipes as fallback.');
      // Fallback to mock data if backend fails
      try {
        const mod = await import('./mockRecipes.js');
        setRecipes(mod.default);
        localStorage.setItem('mmp_recipes', JSON.stringify(mod.default));
      } catch (mockError) {
        console.error("Could not load mock recipes.", mockError);
        setRecipes([]);
      }
    }
  };

  async function fetchDiary(date) {
    try {
      const res = await fetch(`${API_BASE}/logs/${date}`);
      if (res.ok) {
        const data = await res.json();
        setDiary(data);
        localStorage.setItem(`mmp_diary_${date}`, JSON.stringify(data));
      }
    } catch {
      console.warn(`Backend offline, using local storage/fallback for diary on ${date}`);
      const local = localStorage.getItem(`mmp_diary_${date}`);
      if (local) {
        setDiary(JSON.parse(local));
      } else {
        setDiary({
          meals: { breakfast: [], lunch: [], dinner: [] },
          water: 0,
          isWorkoutDay: false
        });
      }
    }
  };

  const saveDiary = async (updatedDiary) => {
    setDiary(updatedDiary);
    localStorage.setItem(`mmp_diary_${currentDate}`, JSON.stringify(updatedDiary));
    try {
      await fetch(`${API_BASE}/logs/${currentDate}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDiary)
      });
    } catch {
      console.log('Diary saved locally');
    }
  };

  async function fetchWeightLogs() {
    try {
      const res = await fetch(`${API_BASE}/weight`);
      if (res.ok) {
        const data = await res.json();
        const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        setWeightLogs(sortedData);
        localStorage.setItem('mmp_weight', JSON.stringify(sortedData));
      }
    } catch {
      const local = localStorage.getItem('mmp_weight');
      if (local) {
        const data = JSON.parse(local);
        const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        setWeightLogs(sortedData);
      }
    }
  };

  const saveWeightLog = async (date, weight) => {
    // Combine picker date with current local time to create a unique timestamp
    const selectedDate = new Date(date);
    const now = new Date();
    selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    const uniqueDateStr = selectedDate.toISOString();

    const newLog = { date: uniqueDateStr, weight: Number(weight) };
    const updated = [...weightLogs, newLog].sort((a,b) => new Date(a.date) - new Date(b.date));
    setWeightLogs(updated);
    localStorage.setItem('mmp_weight', JSON.stringify(updated));
    try {
      await fetch(`${API_BASE}/weight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      });
      showToast('Weight logged successfully!');
    } catch {
      showToast('Weight logged locally');
    }
  };

  const deleteWeightLog = async (date) => {
    const updated = weightLogs.filter(w => w.date !== date);
    setWeightLogs(updated);
    localStorage.setItem('mmp_weight', JSON.stringify(updated));
    try {
      await fetch(`${API_BASE}/weight/${date}`, {
        method: 'DELETE'
      });
      showToast('Weight entry removed successfully!');
    } catch {
      showToast('Weight entry deleted locally');
    }
  };

  const resetWeightLogs = async () => {
    setWeightLogs([]);
    localStorage.removeItem('mmp_weight');
    try {
      await fetch(`${API_BASE}/weight`, {
        method: 'DELETE'
      });
      showToast('Weight progress reset successfully!');
    } catch {
      showToast('Weight history reset locally');
    }
  };

  async function fetchWeeklyPlan() {
    try {
      const res = await fetch(`${API_BASE}/weekly-plan`);
      if (res.ok) {
        const data = await res.json();
        setWeeklyPlan(data);
        localStorage.setItem('mmp_weeklyplan', JSON.stringify(data));
      }
    } catch {
      const local = localStorage.getItem('mmp_weeklyplan');
      if (local) setWeeklyPlan(JSON.parse(local));
    }
  };

  const saveWeeklyPlan = async (plan) => {
    setWeeklyPlan(plan);
    localStorage.setItem('mmp_weeklyplan', JSON.stringify(plan));
    try {
      await fetch(`${API_BASE}/weekly-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      });
    } catch {
      console.log('Weekly plan saved locally');
    }
  };

  async function fetchPantry() {
    try {
      const res = await fetch(`${API_BASE}/pantry`);
      if (res.ok) {
        const data = await res.json();
        setPantry(data);
        localStorage.setItem('mmp_pantry', JSON.stringify(data));
      }
    } catch {
      const local = localStorage.getItem('mmp_pantry');
      if (local) setPantry(JSON.parse(local));
    }
  };

  const savePantry = async (updatedPantry) => {
    setPantry(updatedPantry);
    localStorage.setItem('mmp_pantry', JSON.stringify(updatedPantry));
    try {
      await fetch(`${API_BASE}/pantry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPantry)
      });
    } catch {
      console.log('Pantry saved locally');
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  // Fetch all core data on mount and on date change
  useEffect(() => {
    fetchProfile();
    fetchRecipes();
    fetchWeightLogs();
    fetchWeeklyPlan();
    fetchPantry();
  }, []);

  useEffect(() => {
    fetchDiary(currentDate);
  }, [currentDate]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Touch Swipe Gesture Navigation for Mobile Dashboard Views
  useEffect(() => {
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
      handleSwipeGesture();
    };

    const handleSwipeGesture = () => {
      // Avoid swipe navigation if user is not authenticated or not on dashboard page
      const isAuthenticated = localStorage.getItem('mmp_authenticated') === 'true';
      if (!isAuthenticated) return;

      // Do not swipe if user is typing in inputs or textareas
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
      
      // Horizontal swipe threshold: 75px. Must be wider than vertical scrolling movement.
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 75) {
        const tabs = ['dashboard', 'mealplan', 'recipes', 'analytics', 'profile'];
        const currentIndex = tabs.indexOf(activeTab);
        
        if (currentIndex !== -1) {
          if (diffX < 0) {
            // Swiped Left -> Move Next (Dashboard -> Mealplan -> Recipes -> Analytics -> Profile)
            if (currentIndex < tabs.length - 1) {
              const nextTab = tabs[currentIndex + 1];
              setActiveTab(nextTab);
            }
          } else {
            // Swiped Right -> Move Prev (Profile -> Analytics -> Recipes -> Mealplan -> Dashboard)
            if (currentIndex > 0) {
              const prevTab = tabs[currentIndex - 1];
              setActiveTab(prevTab);
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
  }, [activeTab]);

  // Submit new recipe (User / Admin)
  const handleCreateRecipe = async (e) => {
    e.preventDefault();
    if (!customRecipeForm.name) return;

    const recipeData = {
      name: customRecipeForm.name,
      category: customRecipeForm.category,
      calories: Number(customRecipeForm.calories) || 0,
      protein: Number(customRecipeForm.protein) || 0,
      carbs: Number(customRecipeForm.carbs) || 0,
      fat: Number(customRecipeForm.fat) || 0,
      diet: customRecipeForm.diet,
      allergens: customRecipeForm.allergens,
      ingredients: customRecipeForm.ingredientsText.split('\n').filter(i => i.trim()).map(i => {
        const parts = i.split('-');
        return { name: parts[0]?.trim() || i, quantity: parts[1]?.trim() || '1 serving' };
      }),
      instructions: customRecipeForm.instructionsText.split('\n').filter(i => i.trim()),
      approved: isAdminMode // Auto-approved if created in admin mode, else false
    };

    try {
      const res = await fetch(`${API_BASE}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData)
      });
      if (res.ok) {
        const saved = await res.json();
        setRecipes([...recipes, saved]);
        showToast(isAdminMode ? 'Recipe created and approved!' : 'Recipe submitted for Admin Approval.');
      } else {
        throw new Error('Failed to save to backend');
      }
    } catch {
      // Offline fallback
      const offlineRecipe = { ...recipeData, id: 'recipe_offline_' + Date.now(), custom: true };
      const updated = [...recipes, offlineRecipe];
      setRecipes(updated);
      localStorage.setItem('mmp_recipes', JSON.stringify(updated));
      showToast('Recipe created locally (Offline mode)');
    }

    // Reset Form
    setCustomRecipeForm({
      name: '', category: 'lunch', calories: '', protein: '', carbs: '', fat: '', diet: 'none',
      allergens: [], ingredientsText: '', instructionsText: ''
    });
  };

  // Toggle favorite status
  const toggleFavorite = (recipeId) => {
    const updatedRecipes = recipes.map(r => {
      if (r.id === recipeId) {
        const fav = !r.favorite;
        // update backend
        fetch(`${API_BASE}/recipes/${recipeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ favorite: fav })
        }).catch(() => {});
        return { ...r, favorite: fav };
      }
      return r;
    });
    setRecipes(updatedRecipes);
    localStorage.setItem('mmp_recipes', JSON.stringify(updatedRecipes));
  };

  // --- MACRO CALCULATIONS ENGINE (MIFFLIN-ST JEOR) ---
  
  const calculateTargets = () => {
    // Mifflin-St Jeor Formula
    let bmr;
    const { age = defaultAge, weight = defaultWeight, height = defaultHeight, gender = 'male', activityLevel = 'moderate', goal = 'maintain', customMacros = null, calorieCycling = null } = profile || {};
    
    const ageVal = Number(age) || defaultAge;
    const weightVal = Number(weight) || defaultWeight;
    const heightVal = Number(height) || defaultHeight;

    if (gender === 'male') {
      bmr = 10 * weightVal + 6.25 * heightVal - 5 * ageVal + 5;
    } else {
      bmr = 10 * weightVal + 6.25 * heightVal - 5 * ageVal - 161;
    }
    
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    
    let maintenanceCalories = bmr * (activityMultipliers[activityLevel] || 1.2);

    // Calorie Cycling Adjustment
    const dayOfWeek = getDayOfWeekName(currentDate);
    const isWorkoutDay = (diary && diary.isWorkoutDay) || (calorieCycling?.workoutDays?.includes(dayOfWeek));

    const autoMults = getAutoCyclingMultipliers(ageVal, weightVal, heightVal);
    
    // Honor custom user-defined multipliers if specified
    const userWorkoutMult = Number(calorieCycling?.workoutCalorieMultiplier);
    const userRestMult = Number(calorieCycling?.restCalorieMultiplier);
    
    const wMult = (!isNaN(userWorkoutMult) && userWorkoutMult > 0) ? userWorkoutMult : autoMults.workout;
    const rMult = (!isNaN(userRestMult) && userRestMult > 0) ? userRestMult : autoMults.rest;
    
    const multiplier = isWorkoutDay ? wMult : rMult;

    // Apply cycling to maintenance base first to avoid compounding with goal offsets
    let targetCalories = maintenanceCalories * multiplier;

    if (goal === 'lose') {
      targetCalories -= 500;
    } else if (goal === 'build') {
      targetCalories += 300;
    }
    
    targetCalories = Math.round(targetCalories);

    // Calculate Macros
    let pGrams, cGrams, fGrams;
    
    if (customMacros && customMacros.protein !== null && customMacros.carbs !== null && customMacros.fat !== null) {
      if (customMacros.mode === 'percentage') {
        const { protein, carbs, fat } = customMacros;
        pGrams = Math.round((targetCalories * (protein / 100)) / 4);
        cGrams = Math.round((targetCalories * (carbs / 100)) / 4);
        fGrams = Math.round((targetCalories * (fat / 100)) / 9);
      } else {
        // Grams mode override
        pGrams = customMacros.protein;
        cGrams = customMacros.carbs;
        fGrams = customMacros.fat;
        targetCalories = pGrams * 4 + cGrams * 4 + fGrams * 9;
      }
    } else {
      // Personalized default: Protein based on weight (2g/kg), 25% Fat, remaining Carbs
      // This is much more accurate for individual body compositions
      pGrams = Math.round(weightVal * 2.0); 
      fGrams = Math.round((targetCalories * 0.25) / 9);
      const proteinAndFatCals = (pGrams * 4) + (fGrams * 9);
      cGrams = Math.round(Math.max(0, targetCalories - proteinAndFatCals) / 4);
    }
    
    return {
      calories: targetCalories,
      protein: pGrams,
      carbs: cGrams,
      fat: fGrams,
      isWorkoutDay: !!isWorkoutDay
    };
  };

  const targets = calculateTargets();

  // --- DIARY LOGS CALCULATIONS ---

  const getDiaryConsumed = () => {
    let calories = 0, protein = 0, carbs = 0, fat = 0;
    
    if (diary && diary.meals) {
      Object.keys(diary.meals).forEach(slot => {
        const items = diary.meals[slot];
        if (Array.isArray(items)) {
          items.forEach(item => {
            calories += item.calories || 0;
            protein += item.protein || 0;
            carbs += item.carbs || 0;
            fat += item.fat || 0;
          });
        }
      });
    }
    
    return { calories, protein, carbs, fat };
  };

  const consumed = getDiaryConsumed();
  const remaining = {
    calories: Math.max(0, targets.calories - consumed.calories),
    protein: Math.max(0, targets.protein - consumed.protein),
    carbs: Math.max(0, targets.carbs - consumed.carbs),
    fat: Math.max(0, targets.fat - consumed.fat)
  };

  const getWeeklyAverageConsumed = () => {
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let daysWithLogs = 0;
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date();
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const log = localStorage.getItem(`mmp_diary_${dateStr}`);

      if (log) {
        try {
          const parsed = JSON.parse(log);
          const mealItems = Object.values(parsed.meals || {}).flat();

          if (mealItems.length > 0) {
            daysWithLogs++;
            mealItems.forEach(item => {
              totalProtein += item.protein || 0;
              totalCarbs += item.carbs || 0;
              totalFat += item.fat || 0;
            });
          }
        } catch (e) {
          console.error(`Could not parse diary log for ${dateStr}`, e);
        }
      }
    }

    if (daysWithLogs === 0) return { protein: 0, carbs: 0, fat: 0 };

    return {
      protein: Math.round(totalProtein / daysWithLogs),
      carbs: Math.round(totalCarbs / daysWithLogs),
      fat: Math.round(totalFat / daysWithLogs),
    };
  };
  const weeklyAverageConsumed = getWeeklyAverageConsumed();

  // Add Item to Diary Log
  const addFoodToDiary = (slot, foodItem) => {
    const updatedMeals = { ...diary.meals };
    updatedMeals[slot] = [...updatedMeals[slot], { ...foodItem, logId: 'log_' + Date.now() }];
    const updatedDiary = { ...diary, meals: updatedMeals };
    saveDiary(updatedDiary);
    showToast(`Added ${foodItem.name} to ${slot}!`);
  };

  // Remove Item from Diary Log
  const removeFoodFromDiary = (slot, logId) => {
    const updatedMeals = { ...diary.meals };
    updatedMeals[slot] = updatedMeals[slot].filter(item => item.logId !== logId);
    const updatedDiary = { ...diary, meals: updatedMeals };
    saveDiary(updatedDiary);
    showToast('Item removed.');
  };

  // Quick Add Form Submit
  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickAddForm.name || !quickAddForm.calories) return;
    
    const foodItem = {
      name: quickAddForm.name,
      calories: Number(quickAddForm.calories) || 0,
      protein: Number(quickAddForm.protein) || 0,
      carbs: Number(quickAddForm.carbs) || 0,
      fat: Number(quickAddForm.fat) || 0
    };
    
    addFoodToDiary(quickAddSlot, foodItem);
    setShowQuickAdd(false);
    setQuickAddForm({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  };

  // Water log tracking
  const toggleWaterGlass = (index) => {
    let currentGlasses = diary.water || 0;
    // Toggle: if clicked glass is equal to current glasses, decrease by 1, else set to clicked index + 1
    let nextWater = currentGlasses === index + 1 ? currentGlasses - 1 : index + 1;
    const updatedDiary = { ...diary, water: nextWater };
    saveDiary(updatedDiary);
  };

  // --- STREAK TRACKING LOGIC ---
  
  const calculateStreak = () => {
    // Check adherence over last 14 days
    // adherence is met if consumed calories are within 5% of target
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const checkDate = new Date();
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      // Load diary from localStorage
      const log = localStorage.getItem(`mmp_diary_${dateStr}`);
      if (log) {
        try {
          const parsed = JSON.parse(log);
          let dayCal = 0;
          if (parsed && parsed.meals) {
            Object.keys(parsed.meals).forEach(s => {
              const items = parsed.meals[s];
              if (Array.isArray(items)) {
                items.forEach(item => {
                  dayCal += item.calories || 0;
                });
              }
            });
          }
        
          // Calculate target for that day (mocking historical target roughly)
          if (dayCal > 0) {
            const diff = Math.abs(dayCal - targets.calories);
            const percentDiff = (diff / targets.calories) * 100;
            if (percentDiff <= 5) {
              streak++;
            } else {
              break; // Streak broken
            }
          } else {
            // If no logs, but it's today and not filled yet, don't break streak, else break
            if (i > 0) break;
          }
        } catch (e) {
          if (i > 0) break;
        }
      } else {
        if (i > 0) break;
      }
    }
    return streak;
  };

  const activeStreak = calculateStreak();

  const handleAutoGeneratePlan = () => {
    const newWeeklyPlan = { ...weeklyPlan };
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    days.forEach(day => {
      // Note: This uses the target calories for the *currently selected* date for all days.
      // A more advanced implementation would calculate targets for each specific day of the week.
      newWeeklyPlan[day] = generateMealPlanForDay(targets.calories, recipes, profile);
    });

    saveWeeklyPlan(newWeeklyPlan);
    showToast('Weekly Meal Plan Auto-Generated!');
  };

  // Swap specific meal
  const handleSwapMeal = (day, index) => {
    const mealToSwap = weeklyPlan[day][index];
    if (!mealToSwap) return;

    const alternatives = recipes.filter(r => 
      r.id !== mealToSwap.id && 
      r.category === mealToSwap.category && 
      r.approved && 
      (profile.dietPreference === 'none' || r.diet === profile.dietPreference) &&
      !profile.allergies.some(a => r.allergens?.includes(a))
    );

    if (alternatives.length === 0) {
      showToast('No alternative meal found with matching preferences.', 'warning');
      return;
    }

    // Find closest calorie match
    let closest = alternatives[0];
    let diff = Math.abs(closest.calories - mealToSwap.calories);
    
    alternatives.forEach(alt => {
      const altDiff = Math.abs(alt.calories - mealToSwap.calories);
      if (altDiff < diff) {
        diff = altDiff;
        closest = alt;
      }
    });

    const updatedPlan = { ...weeklyPlan };
    updatedPlan[day][index] = { ...closest, slot: mealToSwap.slot };
    saveWeeklyPlan(updatedPlan);
    showToast(`Swapped for ${closest.name}!`);
  };

  // Apply Today's Meal Plan to Daily Diary
  const applyWeeklyPlanToToday = () => {
    const day = getDayOfWeekName(currentDate);
    const dayMeals = weeklyPlan[day];
    
    if (!dayMeals || dayMeals.length === 0) {
      showToast('No meals planned for today in weekly planner.', 'warning');
      return;
    }

    const updatedMeals = { breakfast: [], lunch: [], dinner: [] };
    
    dayMeals.forEach(meal => {
      const slot = meal.category;
      // Ensure the slot exists in our new structure
      if (updatedMeals[slot]) {
        updatedMeals[slot].push({
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          logId: 'log_' + Math.random()
        });
      }
    });

    const updatedDiary = { ...diary, meals: updatedMeals, water: 8 };
    saveDiary(updatedDiary);
    showToast(`Applied ${day}'s Meal Plan & filled Water Tracker to Diary!`);
  };

  // --- BARCODE SCANNER HANDLER ---

  const handleBarcodeSubmit = async (barcode) => {
    if (!barcode) return;
    setIsScanning(true);
    setScanResult(null);
    
    try {
      const res = await fetch(`${API_BASE}/barcode/${barcode}`);
      const data = await res.json();
      
      // Save barcode search in history
      try {
        await fetch(`${API_BASE}/search-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: barcode,
            type: 'barcode',
            resultsCount: data.found ? 1 : 0
          })
        });
      } catch (e) {
        console.error('Failed to log barcode scan to history:', e);
      }

      if (data.found && data.product) {
        setScanResult(data.product);
        showToast('Product successfully scanned!');
      } else {
        showToast('Barcode not found. Check number or try custom Quick Add.', 'warning');
      }
    } catch {
      // offline generator
      const mockResult = {
        name: `Mock Product (${barcode})`,
        calories: 220,
        protein: 15,
        carbs: 20,
        fat: 8,
        serving: '1 unit (60g)',
        ingredients: 'Offline simulated database match'
      };

      // Save offline simulated search history
      try {
        await fetch(`${API_BASE}/search-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: barcode,
            type: 'barcode',
            resultsCount: 1
          })
        });
      } catch (e) {
        console.error('Failed to log offline barcode scan to history:', e);
      }

      setScanResult(mockResult);
      showToast('Simulated barcode scan result.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddScannedToDiary = () => {
    if (!scanResult) return;
    const foodItem = {
      name: scanResult.name,
      calories: scanResult.calories,
      protein: scanResult.protein,
      carbs: scanResult.carbs,
      fat: scanResult.fat
    };
    addFoodToDiary(quickAddSlot, foodItem);
    setShowBarcodeScanner(false);
    setScanResult(null);
    setBarcodeInput('');
  };

  const groceryList = generateGroceryList(weeklyPlan);

  const handlePantryCheck = (itemId) => {
    let updated;
    if (pantry.includes(itemId)) {
      updated = pantry.filter(id => id !== itemId);
    } else {
      updated = [...pantry, itemId];
    }
    savePantry(updated);
  };

  const handleExportGroceryText = () => {
    let text = `🛒 MY MEAL MACRO PLANNER SHOPPING LIST\n`;
    text += `==========================================\n\n`;
    
    const categories = [...new Set(groceryList.map(item => item.category))];
    
    categories.forEach(cat => {
      text += `📂 ${cat.toUpperCase()}\n`;
      groceryList.filter(item => item.category === cat).forEach(item => {
        const inPantry = pantry.includes(item.id) ? ' [x] IN PANTRY' : ' [ ] NEED';
        text += `- ${item.name} (${item.quantity})${inPantry}\n`;
      });
      text += `\n`;
    });
    
    navigator.clipboard.writeText(text);
    showToast('Grocery list copied to clipboard!');
  };

  const handlePrintGrocery = () => {
    window.print();
  };

  // --- PREMIUM UPGRADE & COACH CHAT SIMULATION ---

  const handlePremiumPaymentSubmit = (e) => {
    e.preventDefault();
    if (!premiumCard.cardNumber || !premiumCard.expiry || !premiumCard.cvv) {
      showToast('Please fill all card fields.', 'warning');
      return;
    }
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      const updatedProfile = { ...profile, isPremium: true };
      saveProfile(updatedProfile);
      showToast('Premium Access Granted! Ad banner removed, AI Coach unlocked.');
      setChatMessages([
        { sender: 'coach', text: "Welcome to Premium! I have analyzed your physical profile: " + profile.weight + "kg, " + profile.height + "cm. What nutrition advice do you need today?" }
      ]);
    }, 2000);
  };

  const handleCoachMessageSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      let reply = "I am processing your query. As a reminder, keep hitting your daily macro target of " + targets.protein + "g protein!";
      
      const lower = userMsg.toLowerCase();
      if (lower.includes('protein') || lower.includes('muscle')) {
        reply = `To build muscle, focus on eating high-protein meals like our Grilled Chicken Salad (${targets.protein}g target today). Ensure you log it in your Daily Diary.`;
      } else if (lower.includes('weight') || lower.includes('fat')) {
        reply = `For fat loss, maintaining a calorie deficit is key. Your target today is ${targets.calories} kcal. Try the cod and asparagus lunch or tofu veggie dinner.`;
      } else if (lower.includes('water') || lower.includes('dehydrate')) {
        reply = "Hydration supports your metabolic rate. Keep filling all 8 cups in the Water Tracker!";
      } else if (lower.includes('cycle') || lower.includes('workout')) {
        const autoMults = getAutoCyclingMultipliers(profile.age, profile.weight, profile.height);
        reply = `Since you cycle calories, workout days give you ${autoMults.workout}x energy targets. Rest days are adjusted downward for maximum metabolic efficiency.`;
      } else if (lower.includes('hi') || lower.includes('hello')) {
        reply = "Hello! How can I assist you with your macro targets and dietary planning today?";
      }

      setChatMessages(prev => [...prev, { sender: 'coach', text: reply }]);
    }, 1000);
  };

  // --- ADMIN PANEL FUNCTIONS ---
  const handleApproveRecipe = async (id) => {
    const updatedRecipes = recipes.map(r => r.id === id ? { ...r, approved: true } : r);
    setRecipes(updatedRecipes);
    localStorage.setItem('mmp_recipes', JSON.stringify(updatedRecipes));
    
    try {
      await fetch(`${API_BASE}/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true })
      });
      showToast('Recipe approved!');
    } catch {
      showToast('Approved locally.');
    }
  };

  const handleDeleteRecipe = async (id) => {
    const updatedRecipes = recipes.filter(r => r.id !== id);
    setRecipes(updatedRecipes);
    localStorage.setItem('mmp_recipes', JSON.stringify(updatedRecipes));
    
    try {
      await fetch(`${API_BASE}/recipes/${id}`, {
        method: 'DELETE'
      });
      showToast('Recipe deleted from database.');
    } catch {
      showToast('Deleted locally.');
    }
  };

  const isAuthenticated = localStorage.getItem('mmp_authenticated') === 'true';

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={
        isAuthenticated ? (
          <Navigate to="/dashboard" replace />
        ) : (
          <LoginPage />
        )
      } />
      <Route path="/signup" element={
        isAuthenticated ? (
          <Navigate to="/dashboard" replace />
        ) : (
          <SignupPage />
        )
      } />
      <Route path="/dashboard" element={
        !isAuthenticated ? (
          <Navigate to="/signup" replace />
        ) : (
          <div className="dashboard-grid" style={{ position: 'relative' }}>
      {/* Toast Alert */}
      {toast && (
        <div style={{
          position: 'fixed', top: '80px', right: '20px', zIndex: 2000,
          background: toast.type === 'success' ? '#10b981' : '#f59e0b',
          color: '#ffffff', padding: '12px 24px', borderRadius: '12px',
          fontFamily: 'var(--font-display)', fontWeight: 600,
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toast.message}
        </div>
      )}

      {/* User Avatar Circle & Dropdown */}
      {(() => {
        const name = localStorage.getItem('mmp_user_name') || '';
        const email = localStorage.getItem('mmp_user_email') || '';
        let displayName = name;
        if (!displayName && email) {
          const prefix = email.split('@')[0];
          displayName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }
        if (!displayName) {
          displayName = 'Guest User';
        }
        const firstLetter = displayName.charAt(0).toUpperCase();

        return (
          <div 
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 1500,
              fontFamily: 'var(--font-display)'
            }}
          >
            {/* Circle Avatar Button */}
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-purple) 100%)',
                color: '#ffffff',
                border: '2px solid var(--border-glass)',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.25), var(--shadow-neon)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                transition: 'var(--transition-smooth)',
                outline: 'none'
              }}
              className="user-avatar-btn"
              title="Account Options"
            >
              {firstLetter}
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                {/* Backdrop overlay to close when clicked outside */}
                <div 
                  onClick={() => setIsUserMenuOpen(false)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1400,
                    background: 'transparent'
                  }}
                />
                
                {/* Dropdown panel */}
                <div 
                  className="flat-panel animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: '54px',
                    right: '0',
                    width: '280px',
                    zIndex: 1450,
                    padding: '20px',
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    boxShadow: '0 15px 35px rgba(15, 23, 42, 0.15), var(--shadow-card)',
                    border: '1px solid var(--border-glass)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}
                >
                  {/* Header section with User Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-purple) 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem'
                    }}>
                      {firstLetter}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {displayName}
                      </h4>
                      {!isEditingEmail ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {email || 'No email registered'}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setNewEmailInput(email);
                              setIsEditingEmail(true);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--accent-indigo)',
                              padding: 0,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Change Email Address"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                          <input 
                            type="email" 
                            value={newEmailInput} 
                            onChange={(e) => setNewEmailInput(e.target.value)} 
                            style={{
                              fontSize: '0.75rem',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-glass)',
                              background: 'var(--bg-input)',
                              color: 'var(--text-primary)',
                              width: '100%',
                              outline: 'none'
                            }}
                            placeholder="New email address"
                            required
                          />
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                if (!newEmailInput || !newEmailInput.includes('@')) {
                                  showToast('Please enter a valid email address.', 'warning');
                                  return;
                                }
                                const currentEmail = localStorage.getItem('mmp_user_email') || '';
                                const registered = JSON.parse(localStorage.getItem('mmp_registered_users') || '[]');
                                const index = registered.findIndex(u => u.email.toLowerCase() === currentEmail.toLowerCase());
                                if (index !== -1) {
                                  registered[index].email = newEmailInput.trim();
                                  localStorage.setItem('mmp_registered_users', JSON.stringify(registered));
                                }
                                localStorage.setItem('mmp_user_email', newEmailInput.trim());
                                localStorage.removeItem('mmp_authenticated');
                                setIsUserMenuOpen(false);
                                setIsEditingEmail(false);
                                showToast('Email updated successfully! Redirecting to login...', 'success');
                                setTimeout(() => {
                                  navigate('/login');
                                }, 1000);
                              }}
                              style={{
                                fontSize: '0.7rem',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                border: 'none',
                                background: 'var(--accent-indigo)',
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontWeight: 700
                              }}
                            >
                              Save & Logout
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setIsEditingEmail(false);
                              }}
                              style={{
                                fontSize: '0.7rem',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                border: '1px solid var(--border-glass)',
                                background: 'transparent',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Tier details */}
                  <div 
                    style={{ 
                      background: profile.isPremium ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' : 'rgba(15, 23, 42, 0.03)',
                      border: profile.isPremium ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid var(--border-glass)',
                      borderRadius: '10px', 
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {profile.isPremium ? (
                        <>
                          <Sparkles size={14} style={{ color: 'var(--accent-pink)' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-pink)' }}>PREMIUM MEMBER</span>
                        </>
                      ) : (
                        <>
                          <Utensils size={14} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Free Account Tier</span>
                        </>
                      )}
                    </div>
                    {!profile.isPremium && (
                      <button 
                        onClick={() => {
                          setActiveTab('coach');
                          setIsUserMenuOpen(false);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-indigo)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          padding: 0
                        }}
                        className="neon-text-cyan"
                      >
                        Upgrade
                      </button>
                    )}
                  </div>

                  {/* Navigation Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      onClick={() => {
                        setActiveTab('profile-summary');
                        setIsUserMenuOpen(false);
                      }}
                      className="sidebar-item"
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.8rem',
                        borderRadius: '8px',
                        width: '100%',
                        background: activeTab === 'profile-summary' ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <Sparkles size={14} style={{ color: 'var(--accent-indigo)' }} /> My Profile Summary
                    </button>
                    <button
                      onClick={handleEditProfileRedirect}
                      className="sidebar-item"
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.8rem',
                        borderRadius: '8px',
                        width: '100%',
                        background: activeTab === 'profile' ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <User size={14} /> Goals & Calculator
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="sidebar-item"
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.8rem',
                        borderRadius: '8px',
                        width: '100%',
                        background: activeTab === 'dashboard' ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <Utensils size={14} /> My Food Diary
                    </button>
                  </div>

                  {/* Logout Button */}
                  <button 
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      localStorage.removeItem('mmp_authenticated');
                      navigate('/');
                    }}
                    className="btn-danger"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      justifyContent: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>

                </div>
              </>
            )}
          </div>
        );
      })()}

      {/* Sidebar Navigation (Desktop) */}
      <aside className="dashboard-sidebar">
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <div 
              style={{
                width: '108px',
                height: '108px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#ffffff',
                border: '3px solid var(--border-glass)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), inset 0 4px 8px rgba(255,255,255,0.6), inset 0 -4px 8px rgba(0,0,0,0.15), 0 0 15px rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'perspective(400px) rotateX(6deg) rotateY(-2deg)',
                transition: 'var(--transition-smooth)'
              }}
              className="logo-3d-sphere"
            >
              <img 
                src="/macro_meals_3d_logo.png" 
                alt="Logo" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scale(1.05)'
                }}
              />
            </div>
            <h1 
              style={{ 
                fontSize: '1.35rem', 
                fontFamily: 'var(--font-display)', 
                fontWeight: 800, 
                color: 'var(--text-primary)', 
                textTransform: 'uppercase', 
                letterSpacing: '0.08em', 
                marginTop: '14px', 
                textAlign: 'center',
                textShadow: '0 4px 12px rgba(0, 0, 0, 0.35)' 
              }}
            >
              MACROMIND
            </h1>
          </div>
          
          <nav className="sidebar-nav">
            <a onClick={() => setActiveTab('dashboard')} className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
              <Utensils size={20} /> Daily Diary
            </a>
            <a onClick={() => setActiveTab('mealplan')} className={`sidebar-item ${activeTab === 'mealplan' ? 'active' : ''}`}>
              <Calendar size={20} /> Weekly Planner
            </a>
            <a onClick={() => setActiveTab('recipes')} className={`sidebar-item ${activeTab === 'recipes' ? 'active' : ''}`}>
              <BookOpen size={20} /> Recipe Library
            </a>
            <a onClick={() => setActiveTab('analytics')} className={`sidebar-item ${activeTab === 'analytics' ? 'active' : ''}`}>
              <BarChart2 size={20} /> Analytics
            </a>
            <a onClick={handleEditProfileRedirect} className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}>
              <User size={20} /> Onboarding & Goals
            </a>
            <a onClick={() => setActiveTab('savedSearches')} className={`sidebar-item ${activeTab === 'savedSearches' ? 'active' : ''}`}>
              <Database size={20} /> Search Database
            </a>
            {isAdminMode && (
              <a onClick={() => setActiveTab('admin')} className={`sidebar-item ${activeTab === 'admin' ? 'active' : ''}`}>
                <ShieldAlert size={20} className="neon-text-purple" /> Admin Panel
              </a>
            )}
            <a onClick={() => setActiveTab('coach')} className={`sidebar-item ${activeTab === 'coach' ? 'active' : ''}`}>
              <Bot size={20} className={profile.isPremium ? "neon-text-cyan" : "text-muted"} /> AI Coach
            </a>
          </nav>
        </div>

        {/* Premium Upgrade card at bottom of sidebar */}
        {!profile.isPremium && (
          <div className="flat-panel" style={{ padding: '16px', marginTop: '24px', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <Sparkles size={16} style={{ color: 'var(--accent-pink)' }} />
              <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-pink)' }}>UNLEASH PREMIUM</h4>
            </div>
            <p style={{ fontSize: '0.75rem', marginBottom: '12px' }}>Get custom coach feedback, ad removal & more.</p>
            <button onClick={() => setActiveTab('coach')} className="btn-primary" style={{ padding: '8px 12px', fontSize: '0.75rem', width: '100%', justifyContent: 'center' }}>
              Upgrade Now
            </button>
          </div>
        )}

        {/* Theme & Admin Switchers */}
        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />} Theme Mode
            </span>
            <label className="toggle-switch">
              <input type="checkbox" checked={theme === 'dark'} onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')} />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Admin Privileges</span>
            <label className="toggle-switch">
              <input type="checkbox" checked={isAdminMode} onChange={(e) => {
                setIsAdminMode(e.target.checked);
                if(e.target.checked) showToast('Admin Mode Enabled.');
              }} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '12px', marginTop: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogOut size={14} className="text-red-500" /> Log Out
            </span>
            <button 
              onClick={() => {
                localStorage.removeItem('mmp_authenticated');
                navigate('/');
              }} 
              className="btn-danger" 
              style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', gap: '4px' }}
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="dashboard-content">
        
        {/* Mobile Header / Navigation */}
        <header style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }} className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#ffffff',
                border: '1.5px solid var(--border-glass)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img 
                src="/macro_meals_3d_logo.png" 
                alt="Logo" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scale(1.05)'
                }}
              />
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {isMobileMenuOpen && (
          <div style={{
            position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0,
            background: 'var(--bg-primary)', zIndex: 99, padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <a onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} style={{ fontSize: '1.25rem', padding: '12px 0', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-primary)', display: 'block' }}>Daily Diary</a>
            <a onClick={() => { setActiveTab('mealplan'); setIsMobileMenuOpen(false); }} style={{ fontSize: '1.25rem', padding: '12px 0', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-primary)', display: 'block' }}>Weekly Planner</a>
            <a onClick={() => { setActiveTab('recipes'); setIsMobileMenuOpen(false); }} style={{ fontSize: '1.25rem', padding: '12px 0', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-primary)', display: 'block' }}>Recipe Library</a>
            <a onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }} style={{ fontSize: '1.25rem', padding: '12px 0', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-primary)', display: 'block' }}>Analytics</a>
            <a onClick={handleEditProfileRedirect} style={{ fontSize: '1.25rem', padding: '12px 0', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-primary)', display: 'block' }}>Onboarding & Goals</a>
            {isAdminMode && (
              <a onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }} style={{ fontSize: '1.25rem', padding: '12px 0', borderBottom: '1px solid var(--border-glass)', color: 'var(--accent-purple)', display: 'block' }}>Admin Panel</a>
            )}
            <a onClick={() => { setActiveTab('coach'); setIsMobileMenuOpen(false); }} style={{ fontSize: '1.25rem', padding: '12px 0', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-primary)', display: 'block' }}>AI Coach</a>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px' }}>
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />} Theme Mode
              </span>
              <label className="toggle-switch">
                <input type="checkbox" checked={theme === 'dark'} onChange={(e) => {
                  setTheme(e.target.checked ? 'dark' : 'light');
                  setIsMobileMenuOpen(false);
                }} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Admin Privileges</span>
              <label className="toggle-switch">
                <input type="checkbox" checked={isAdminMode} onChange={(e) => {
                  setIsAdminMode(e.target.checked);
                  setIsMobileMenuOpen(false);
                }} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        )}

        {/* Mock Advertisement Banner (hides when user is premium) */}
        {!profile.isPremium && (
          <div className="mock-ad-banner">
            <div>
              <h5 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 600 }}>🌟 Ads Helping Support Our Free Plan!</h5>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Upgrade to Premium to remove advertisements and unlock the expert AI Coach.</p>
            </div>
            <button onClick={() => setActiveTab('coach')} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.7rem' }}>
              GO AD-FREE
            </button>
          </div>
        )}

        {/* --- VIEW: DAILY DIARY --- */}
        {activeTab === 'dashboard' && (
          <DailyDiary
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            targets={targets}
            diary={diary}
            saveDiary={saveDiary}
            activeStreak={activeStreak}
            consumed={consumed}
            remaining={remaining}
            setShowBarcodeScanner={setShowBarcodeScanner}
            setScanResult={setScanResult}
            applyWeeklyPlanToToday={applyWeeklyPlanToToday}
            removeFoodFromDiary={removeFoodFromDiary}
            setQuickAddSlot={setQuickAddSlot}
            setShowQuickAdd={setShowQuickAdd}
            toggleWaterGlass={toggleWaterGlass}
            showToast={showToast}
          />
        )}

        {/* --- VIEW: WEEKLY PLANNER --- */}
        {activeTab === 'mealplan' && (
          <WeeklyPlanner
            weeklyPlan={weeklyPlan}
            handleAutoGeneratePlan={handleAutoGeneratePlan}
            handleSwapMeal={handleSwapMeal}
            groceryList={groceryList}
            pantry={pantry}
            handlePantryCheck={handlePantryCheck}
            handleExportGroceryText={handleExportGroceryText}
            handlePrintGrocery={handlePrintGrocery}
          />
        )}

        {/* --- VIEW: RECIPE LIBRARY & CUSTOM BUILDER --- */}
        {activeTab === 'recipes' && (
          <RecipeLibrary
            recipes={recipes}
            toggleFavorite={toggleFavorite}
            addFoodToDiary={addFoodToDiary}
            customRecipeForm={customRecipeForm}
            setCustomRecipeForm={setCustomRecipeForm}
            handleCreateRecipe={handleCreateRecipe}
            isAdminMode={isAdminMode}
            recipeFilter={recipeFilter}
            // Adjust spacing for the RecipeLibrary content if needed within this component or its CSS
            setRecipeFilter={setRecipeFilter}
          />
        )}

        {/* --- VIEW: ANALYTICS & WEIGHT LOGS --- */}
        {activeTab === 'analytics' && (
          <Analytics
            weightLogs={weightLogs}
            currentDate={currentDate}
            saveWeightLog={saveWeightLog}
            deleteWeightLog={deleteWeightLog}
            resetWeightLogs={resetWeightLogs}
            consumed={weeklyAverageConsumed}
            targets={targets}
          />
        )}

        {/* --- VIEW: PROFILE ONBOARDING & GOALS --- */}
        {activeTab === 'profile' && (
          <ProfileOnboarding profile={profile} saveProfile={saveProfile} showToast={showToast} />
        )}

        {/* --- VIEW: PROFILE SUMMARY OVERVIEW --- */}
        {activeTab === 'profile-summary' && (
          <ProfileSummary profile={profile} targets={targets} setActiveTab={setActiveTab} onEditProfile={handleEditProfileRedirect} />
        )}

        {/* --- VIEW: ADMIN PANEL --- */}
        {activeTab === 'admin' && isAdminMode && (
           <AdminPanel
            recipes={recipes}
            handleApproveRecipe={handleApproveRecipe}
            handleDeleteRecipe={handleDeleteRecipe}
          />
        )}

        {/* --- VIEW: AI COACH PREMIUM CENTRE --- */}
        {activeTab === 'coach' && (
          <AICoach
            profile={profile}
            premiumCard={premiumCard}
            setPremiumCard={setPremiumCard}
            isPaying={isPaying}
            handlePremiumPaymentSubmit={handlePremiumPaymentSubmit}
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            handleCoachMessageSubmit={handleCoachMessageSubmit}/>
        )}

        {/* --- VIEW: SEARCH DATABASE AND SCANS --- */}
        {activeTab === 'savedSearches' && (
          <SavedSearches
            API_BASE={API_BASE}
            showToast={showToast}
            setActiveTab={setActiveTab}
            setRecipeFilter={setRecipeFilter}
          />
        )}
      </main>

      {/* Mobile Navigation Bar */}
      <nav className="mobile-nav-bar">
        <a onClick={() => setActiveTab('dashboard')} className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
          <Utensils size={20} /> Diary
        </a>
        <a onClick={() => setActiveTab('mealplan')} className={`mobile-nav-item ${activeTab === 'mealplan' ? 'active' : ''}`}>
          <Calendar size={20} /> Plan
        </a>
        <a onClick={() => setActiveTab('recipes')} className={`mobile-nav-item ${activeTab === 'recipes' ? 'active' : ''}`}>
          <BookOpen size={20} /> Recipes
        </a>
        <a onClick={() => setActiveTab('analytics')} className={`mobile-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}>
          <BarChart2 size={20} /> Charts
        </a>
        <a onClick={handleEditProfileRedirect} className={`mobile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}>
          <User size={20} /> Goal
        </a>
      </nav>

      {/* --- MODAL: QUICK ADD FOOD --- */}
      {showQuickAdd && (
        <div className="modal-overlay">
          <div className="modal-content flat-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ textTransform: 'capitalize' }}>Quick Add Food to {quickAddSlot}</h3>
              <button onClick={() => setShowQuickAdd(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleQuickAdd}>
              <div className="form-group">
                <label className="form-label">Food Item Name</label>
                <input type="text" className="form-input" placeholder="e.g. Scrambled Eggs with Avocado" required value={quickAddForm.name} onChange={(e) => setQuickAddForm({...quickAddForm, name: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Calories (kcal)</label>
                  <input type="number" className="form-input" placeholder="e.g. 250" required value={quickAddForm.calories} onChange={(e) => setQuickAddForm({...quickAddForm, calories: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Protein (g)</label>
                  <input type="number" className="form-input" placeholder="e.g. 15" value={quickAddForm.protein} onChange={(e) => setQuickAddForm({...quickAddForm, protein: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Carbohydrates (g)</label>
                  <input type="number" className="form-input" placeholder="e.g. 2" value={quickAddForm.carbs} onChange={(e) => setQuickAddForm({...quickAddForm, carbs: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fat (g)</label>
                  <input type="number" className="form-input" placeholder="e.g. 18" value={quickAddForm.fat} onChange={(e) => setQuickAddForm({...quickAddForm, fat: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Add to Diary
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: BARCODE SCANNER SIMULATION --- */}
      {showBarcodeScanner && (
        <div className="modal-overlay">
          <div className="modal-content flat-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Simulated Barcode Scanner</h3>
              <button onClick={() => setShowBarcodeScanner(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'black', height: '180px', borderRadius: '12px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-glass)', overflow: 'hidden', marginBottom: '16px' }}>
              {/* Green barcode scanner line animation */}
              <div style={{
                position: 'absolute', left: 0, right: 0, height: '2px', background: 'var(--accent-cyan)',
                animation: 'scanMotion 2s infinite linear',
                boxShadow: '0 0 8px var(--accent-cyan)'
              }}></div>
              
              <style>{`
                @keyframes scanMotion {
                  0% { top: 10%; }
                  50% { top: 90%; }
                  100% { top: 10%; }
                }
              `}</style>
              
              <Camera size={40} className="text-muted" style={{ marginBottom: '8px', zIndex: 2 }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', zIndex: 2 }}>[ CAMERA SCAN ACTIVE ]</p>
            </div>

            <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
              Type a custom barcode to check our mock DB or search live via <strong>OpenFoodFacts</strong>. Test barcodes: <code>123456</code>, <code>654321</code>, or <code>987654</code>.
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input type="text" className="form-input" placeholder="Scan or enter barcode numbers..." value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} />
              <button onClick={() => handleBarcodeSubmit(barcodeInput)} className="btn-primary" disabled={isScanning}>
                {isScanning ? 'Scanning...' : 'Search'}
              </button>
            </div>

            {scanResult && (
              <div className="flat-panel" style={{ padding: '16px', background: 'rgba(15,23,42,0.03)' }} className="animate-fade-in">
                <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '8px' }}>{scanResult.name}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '0.8rem', marginBottom: '12px' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Cal</div>
                    <strong>{scanResult.calories}</strong>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>P</div>
                    <strong>{scanResult.protein}g</strong>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>C</div>
                    <strong>{scanResult.carbs}g</strong>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>F</div>
                    <strong>{scanResult.fat}g</strong>
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', marginBottom: '12px' }}>
                  <strong>Ingredients:</strong> {scanResult.ingredients?.substring(0, 100)}...
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select className="form-select" style={{ width: '130px', padding: '6px' }} value={quickAddSlot} onChange={(e) => setQuickAddSlot(e.target.value)}>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                  <button onClick={handleAddScannedToDiary} className="btn-primary" style={{ flex: 1, padding: '6px' }}>
                    Log this Product
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
          </div>
        )
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
