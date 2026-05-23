import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Dumbbell, 
  ArrowRight, 
  Sun, 
  Moon, 
  Utensils, 
  Calendar, 
  BookOpen, 
  BarChart2, 
  User, 
  Database, 
  Bot, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  
  // Theme state synced with localStorage and body [data-theme] attribute
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [showAlert, setShowAlert] = useState(true);
  const [redirectingFeature, setRedirectingFeature] = useState(null);

  // Authentication check
  const isAuthenticated = localStorage.getItem('mmp_authenticated') === 'true';
  const userName = localStorage.getItem('mmp_user_name') || '';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleFeatureClick = (tabKey, title) => {
    localStorage.setItem('mmp_active_tab', tabKey);
    setRedirectingFeature(title);
    
    setTimeout(() => {
      if (isAuthenticated) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/login';
      }
    }, 750); // Premium 750ms deep-link launch timing delay
  };

  const features = [
    {
      key: 'dashboard',
      title: 'Daily Food Diary',
      description: 'Track daily meals and water intake. Monitor target calories, proteins, carbs, and fats with interactive remaining gauges.',
      badge: 'Real-time Targets',
      icon: Utensils,
      gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
      border: 'rgba(6, 182, 212, 0.35)',
      iconBg: 'rgba(6, 182, 212, 0.12)',
      iconColor: 'var(--accent-cyan)'
    },
    {
      key: 'mealplan',
      title: 'Weekly Planner',
      description: 'Generate structured 7-day meal plans customized to your fitness goal. Manage groceries and pantry checkoff lists.',
      badge: 'Custom Planning',
      icon: Calendar,
      gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
      border: 'rgba(99, 102, 241, 0.35)',
      iconBg: 'rgba(99, 102, 241, 0.12)',
      iconColor: 'var(--accent-indigo)'
    },
    {
      key: 'recipes',
      title: 'Recipe Library',
      description: 'Browse approved premium meals, customize serving scales, build recipes, and submit them directly to our community directory.',
      badge: 'Database Approved',
      icon: BookOpen,
      gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
      border: 'rgba(168, 85, 247, 0.35)',
      iconBg: 'rgba(168, 85, 247, 0.12)',
      iconColor: 'var(--accent-purple)'
    },
    {
      key: 'analytics',
      title: 'Fitness Analytics',
      description: 'Log and monitor your body weight logs over time. Track daily streak consistency and view charts of historical nutrition logs.',
      badge: 'Streak Counter',
      icon: BarChart2,
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
      border: 'rgba(16, 185, 129, 0.35)',
      iconBg: 'rgba(16, 185, 129, 0.12)',
      iconColor: '#10b981'
    },
    {
      key: 'profile',
      title: 'Onboarding & Goals',
      description: 'Calculate your Basal Metabolic Rate (BMR). Enable calorie cycling to automatically scale targets for workout and rest days.',
      badge: 'Calorie Cycling',
      icon: User,
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)',
      border: 'rgba(245, 158, 11, 0.35)',
      iconBg: 'rgba(245, 158, 11, 0.12)',
      iconColor: '#f59e0b'
    },
    {
      key: 'savedSearches',
      title: 'Search & Scans',
      description: 'Perform extensive nutrition searches in our historical directory and scan product barcodes utilizing OpenFoodFacts API.',
      badge: 'Barcode Scanner',
      icon: Database,
      gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(225, 29, 72, 0.15) 100%)',
      border: 'rgba(244, 63, 94, 0.35)',
      iconBg: 'rgba(244, 63, 94, 0.12)',
      iconColor: '#f43f5e'
    },
    {
      key: 'coach',
      title: 'AI Coach Premium',
      description: 'Ask questions, get instant recipe adjustments, receive hydration reminders, and unlock personalized elite nutrition coaching.',
      badge: 'Interactive AI',
      icon: Bot,
      gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(219, 39, 119, 0.15) 100%)',
      border: 'rgba(236, 72, 153, 0.35)',
      iconBg: 'rgba(236, 72, 153, 0.12)',
      iconColor: 'var(--accent-pink)'
    }
  ];

  return (
    <div 
      className="min-h-screen flex flex-col justify-start items-center px-6 py-12 relative overflow-x-hidden transition-all duration-300"
      style={{ 
        background: 'transparent',
        minHeight: '100vh',
        fontFamily: 'var(--font-body)',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      
      {/* Dynamic Header Toolbar (Theme Toggle + Welcome/Dashboard trigger) */}
      <div style={{ 
        position: 'absolute', 
        top: '24px', 
        right: '24px', 
        zIndex: 100, 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px' 
      }}>
        {isAuthenticated && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'var(--bg-card)', 
              padding: '6px 14px', 
              borderRadius: '12px', 
              border: '1px solid var(--border-glass)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-primary)'
            }}
            className="flat-panel"
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} className="pulsing-dot"></span>
            {userName ? `Hi, ${userName}!` : 'Authenticated'}
          </motion.div>
        )}
        
        <button 
          onClick={toggleTheme}
          className="flat-panel"
          style={{ 
            width: '44px', 
            height: '44px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            padding: 0,
            borderRadius: '12px',
            border: '1px solid var(--border-glass)',
            background: 'var(--bg-card)'
          }}
          title="Toggle Theme Mode"
        >
          {theme === 'dark' ? (
            <Sun className="animate-pulse" size={18} style={{ color: '#fbbf24' }} />
          ) : (
            <Moon className="text-indigo-600" size={18} style={{ color: 'var(--accent-indigo)' }} />
          )}
        </button>
      </div>

      {/* Welcome Alert Notification */}
      {showAlert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: '960px',
            width: '100%',
            padding: '14px 18px',
            marginBottom: '32px',
            borderRadius: '16px',
            border: '1px solid rgba(0, 242, 254, 0.35)',
            background: 'var(--bg-card)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            position: 'relative',
            zIndex: 10,
            marginTop: '20px'
          }}
          className="flat-panel"
        >
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid rgba(0, 242, 254, 0.4)'
          }}>
            <Sparkles size={14} className="neon-text-cyan animate-pulse" />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
              Welcome to the New MacroPlan Dashboard Hub!
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Click any dashboard component below to launch it directly. If you aren't signed up, we'll guide you through our secure 2-step verification.
            </p>
          </div>
          <button 
            onClick={() => setShowAlert(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </motion.div>
      )}

      {/* Main Glassmorphic Welcome Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="flat-panel"
        style={{ 
          maxWidth: '960px', 
          width: '100%', 
          padding: '48px 32px', 
          textAlign: 'center', 
          position: 'relative', 
          zIndex: 10, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: '24px',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border-glass)',
          marginBottom: '48px'
        }}
      >
        
        {/* Branding Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div 
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#ffffff',
                border: '2px solid var(--border-glass)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), inset 0 4px 8px rgba(255,255,255,0.6), inset 0 -4px 8px rgba(0,0,0,0.15)',
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
            <span style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
              MACRO<span className="neon-text-cyan">PLAN</span>
            </span>
          </div>
          <div style={{ height: '3px', width: '60px', background: 'linear-gradient(90deg, var(--accent-indigo) 0%, var(--accent-purple) 100%)', borderRadius: '99px' }}></div>
        </div>

        {/* Tagline */}
        <h1 
          style={{ 
            fontSize: '2.5rem', 
            fontFamily: 'var(--font-display)', 
            fontWeight: 800, 
            color: 'var(--text-primary)', 
            marginBottom: '16px', 
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            maxWidth: '600px'
          }}
        >
          Hit Your Macro Goals <span className="neon-text-cyan">Smarter</span>
        </h1>

        {/* Short Summary Description */}
        <p 
          style={{ 
            fontSize: '0.95rem', 
            color: 'var(--text-secondary)', 
            marginBottom: '32px', 
            lineHeight: 1.6, 
            maxWidth: '520px' 
          }}
        >
          Track calories, protein, carbs, and fats with AI-powered meal planning built for consistency, ease, and real fitness results.
        </p>

        {/* Dynamic CTA Button Triggers */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {isAuthenticated ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
              style={{ 
                padding: '16px 36px', 
                fontSize: '1rem', 
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Go to My Dashboard
              <ArrowRight size={18} />
            </button>
          ) : (
            <>
              <button 
                onClick={() => navigate('/signup')}
                className="btn-primary"
                style={{ 
                  padding: '16px 36px', 
                  fontSize: '1rem', 
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Get Started Free
                <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="btn-secondary"
                style={{ 
                  padding: '16px 36px', 
                  fontSize: '1rem', 
                  borderRadius: '14px'
                }}
              >
                Sign In
              </button>
            </>
          )}
        </div>

      </motion.div>

      {/* DASHBOARD OPTIONS SHOWCASE GRID */}
      <div style={{ maxWidth: '960px', width: '100%', marginBottom: '40px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Interactive Dashboard Features
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.5 }}>
            Unlock these standard and premium capabilities to plan, log, and achieve your daily nutritional targets.
          </p>
        </div>

        {/* Showcase Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '24px', 
          width: '100%' 
        }}>
          {features.map((feat) => {
            const IconComponent = feat.icon;
            return (
              <motion.div
                key={feat.key}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => handleFeatureClick(feat.key, feat.title)}
                className="flat-panel"
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '20px',
                  padding: '24px',
                  border: `1px solid var(--border-glass)`,
                  boxShadow: 'var(--shadow-card)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = feat.border;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-glass)';
                }}
              >
                {/* Feature Hover Glow Accent Background */}
                <div style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '120px',
                  height: '120px',
                  background: feat.gradient,
                  borderRadius: '50%',
                  filter: 'blur(30px)',
                  opacity: 0.6,
                  zIndex: 0
                }}></div>

                {/* Badge Tag */}
                <div style={{
                  background: feat.iconBg,
                  color: feat.iconColor,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  zIndex: 1
                }}>
                  {feat.badge}
                </div>

                {/* Feature Icon */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: feat.iconBg,
                  color: feat.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  zIndex: 1
                }}>
                  <IconComponent size={22} />
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                  zIndex: 1
                }}>
                  {feat.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                  marginBottom: '20px',
                  flex: 1,
                  zIndex: 1
                }}>
                  {feat.description}
                </p>

                {/* Action CTA link */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: feat.iconColor,
                  marginTop: 'auto',
                  zIndex: 1
                }}>
                  <span>{isAuthenticated ? 'Launch Option' : 'Unlock Feature'}</span>
                  <ArrowRight size={14} />
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>

      {/* Brand Footer */}
      <div style={{ 
        marginTop: '40px', 
        fontSize: '0.78rem', 
        color: 'var(--text-muted)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px' 
      }}>
        <Dumbbell size={14} />
        <span>© {new Date().getFullYear()} MacroPlan. All rights reserved. Premium targets secured.</span>
      </div>

      {/* Premium Full-Screen Deep-Link Redirection Splash Overlay */}
      {redirectingFeature && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(2, 6, 23, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          color: '#ffffff'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(0, 242, 254, 0.15)',
            borderTop: '4px solid var(--accent-cyan)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '24px'
          }} />
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '0.02em',
            marginBottom: '8px',
            color: '#ffffff'
          }}>
            Launching {redirectingFeature}
          </h3>
          <p style={{
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 500
          }}>
            Deep-linking to your secure premium dashboard...
          </p>
        </div>
      )}

    </div>
  );
}
