import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, Sun, Moon, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // View states: 'login' | 'forgot' | 'reset_success'
  const [view, setView] = useState('login');

  // Theme state synced with App.jsx
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLoginSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    // Retrieve registered database to match user
    const registeredUsers = JSON.parse(localStorage.getItem('mmp_registered_users') || '[]');
    const matchedUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!matchedUser) {
      setTimeout(() => {
        setIsLoading(false);
        setError('This email address is not registered. Please sign up first.');
      }, 1000);
      return;
    }

    // Verify Password
    if (matchedUser.password !== password) {
      setTimeout(() => {
        setIsLoading(false);
        setError('Incorrect password. Please try again.');
      }, 1000);
      return;
    }

    // Correct email and password! Log in immediately with a brief premium delay
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);

      // Complete authentication
      localStorage.setItem('mmp_authenticated', 'true');
      localStorage.setItem('mmp_user_email', matchedUser.email);
      localStorage.setItem('mmp_user_name', matchedUser.name);

      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1200);
    }, 1500);
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email address.');
      return;
    }

    setError('');
    setIsLoading(true);

    // Simulate sending email reset link
    setTimeout(() => {
      setIsLoading(false);
      setView('reset_success');
    }, 1500);
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center px-6 relative overflow-hidden transition-all duration-300"
      style={{ 
        background: 'transparent',
        minHeight: '100vh',
        fontFamily: 'var(--font-body)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      
      {/* Floating Theme Toggle (Top Right) */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 100 }}>
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

      {/* Floating Brand Logo Container */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div 
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '14px', 
              background: 'linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-purple) 100%)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(99, 102, 241, 0.15)'
            }}
          >
            <Dumbbell className="text-white" size={20} />
          </div>
          <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
            MACRO<span className="neon-text-cyan">PLAN</span>
          </span>
        </Link>
      </motion.div>

      {/* Login / Reset Card Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="flat-panel"
        style={{ 
          maxWidth: '440px', 
          width: '100%', 
          padding: '40px 32px', 
          position: 'relative', 
          zIndex: 10, 
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: '24px',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border-glass)',
          overflow: 'hidden'
        }}
      >
        {/* Gorgeous Session Security Loading Overlay */}
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--bg-card)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 50,
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: '3px solid rgba(99, 102, 241, 0.1)',
              borderTopColor: 'var(--accent-indigo)',
              animation: 'spin 1s linear infinite',
              marginBottom: '20px'
            }}></div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Securing Session
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Verifying your credentials and establishing a secure session...
            </p>
          </div>
        )}
        <AnimatePresence mode="wait">
          
          {/* VIEW 1: STANDARD SIGN IN */}
          {view === 'login' && (
            <motion.div
              key="login-view"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Welcome Back
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Sign in with your email and password
                </p>
              </div>

              {error && (
                <div 
                  style={{ 
                    marginBottom: '20px', 
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.2)', 
                    color: 'var(--accent-red)', 
                    fontSize: '0.8rem', 
                    fontWeight: 'bold'
                  }}
                >
                  {error}
                </div>
              )}

              {success && (
                <div 
                  style={{ 
                    marginBottom: '20px', 
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    border: '1px solid rgba(16, 185, 129, 0.2)', 
                    color: 'var(--accent-green)', 
                    fontSize: '0.8rem', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <CheckCircle2 size={16} className="text-green-500" />
                  Sign in successful! Redirecting...
                </div>
              )}

              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Email input */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      <Mail size={18} />
                    </span>
                    <input 
                      type="email" 
                      placeholder="you@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading || success}
                      className="form-input"
                      style={{ paddingLeft: '48px' }}
                      required
                    />
                  </div>
                </div>

                {/* Password input */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      <Lock size={18} />
                    </span>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading || success}
                      className="form-input"
                      style={{ paddingLeft: '48px', paddingRight: '44px' }}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ 
                        position: 'absolute', 
                        right: '16px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password link */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-4px', marginBottom: '4px' }}>
                  <button 
                    type="button" 
                    onClick={() => { setError(''); setView('forgot'); }}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--accent-indigo)', 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      cursor: 'pointer', 
                      padding: 0 
                    }}
                    className="neon-text-cyan"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit button */}
                <button 
                  type="submit"
                  disabled={isLoading || success}
                  className="btn-primary"
                  style={{ 
                    width: '100%', 
                    justifyContent: 'center', 
                    padding: '14px 20px', 
                    fontSize: '1rem', 
                    borderRadius: '12px',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  Sign In
                </button>
              </form>

              <div 
                style={{ 
                  textAlign: 'center', 
                  marginTop: '24px', 
                  paddingTop: '20px', 
                  borderTop: '1px solid var(--border-glass)', 
                  fontSize: '0.8rem', 
                  fontWeight: 600, 
                  color: 'var(--text-secondary)' 
                }}
              >
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  style={{ color: 'var(--accent-indigo)', textDecoration: 'none', fontWeight: 600 }}
                  className="neon-text-cyan"
                >
                  Create an account
                </Link>
              </div>
            </motion.div>
          )}

          {/* VIEW 2: PASSWORD RECOVERY REQUEST */}
          {view === 'forgot' && (
            <motion.div
              key="forgot-view"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div 
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    background: 'rgba(99, 102, 241, 0.1)', 
                    color: 'var(--accent-indigo)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}
                >
                  <KeyRound size={22} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Reset Password
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '300px', margin: '0 auto' }}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div 
                  style={{ 
                    marginBottom: '20px', 
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.2)', 
                    color: 'var(--accent-red)', 
                    fontSize: '0.8rem', 
                    fontWeight: 'bold'
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Email input */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      <Mail size={18} />
                    </span>
                    <input 
                      type="email" 
                      placeholder="you@example.com" 
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      disabled={isLoading}
                      className="form-input"
                      style={{ paddingLeft: '48px' }}
                      required
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                  style={{ 
                    width: '100%', 
                    justifyContent: 'center', 
                    padding: '14px 20px', 
                    fontSize: '1rem', 
                    borderRadius: '12px',
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isLoading ? (
                    <span 
                      style={{ 
                        width: '20px', 
                        height: '20px', 
                        border: '2px solid rgba(255,255,255,0.3)', 
                        borderTopColor: '#ffffff', 
                        borderRadius: '50%', 
                        display: 'inline-block',
                        animation: 'spin 1s linear infinite'
                      }}
                    ></span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <div 
                style={{ 
                  textAlign: 'center', 
                  marginTop: '24px', 
                  paddingTop: '20px', 
                  borderTop: '1px solid var(--border-glass)', 
                  fontSize: '0.8rem', 
                  fontWeight: 600, 
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setError('');
                  setView('login');
                }}
              >
                <span className="neon-text-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-indigo)' }}>
                  Back to Sign In
                </span>
              </div>
            </motion.div>
          )}

          {/* VIEW 3: DISPATCH SUCCESS SCREEN */}
          {view === 'reset_success' && (
            <motion.div
              key="success-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: 'center', padding: '10px 0' }}
            >
              <div 
                style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '50%', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  color: 'var(--accent-green)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 20px auto',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}
              >
                <CheckCircle2 size={26} className="text-green-500 animate-bounce" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '8px' }}>
                Reset Link Sent
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '320px', margin: '0 auto 28px auto', lineHeight: '1.6' }}>
                We have dispatched a password recovery token to **{resetEmail}**. Please inspect your inbox and click the reset link.
              </p>

              <button 
                onClick={() => {
                  setError('');
                  setView('login');
                }}
                className="btn-primary"
                style={{ 
                  width: '100%', 
                  justifyContent: 'center', 
                  padding: '12px 20px', 
                  fontSize: '0.95rem', 
                  borderRadius: '12px'
                }}
              >
                Return to Sign In
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      {/* Return home link */}
      <Link 
        to="/" 
        style={{ 
          marginTop: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          fontSize: '0.8rem', 
          fontWeight: 700, 
          color: 'var(--text-muted)', 
          textDecoration: 'none',
          transition: 'var(--transition-smooth)'
        }}
        className="neon-text-cyan"
      >
        <ArrowLeft size={14} />
        Return to Homepage
      </Link>

    </div>
  );
}
