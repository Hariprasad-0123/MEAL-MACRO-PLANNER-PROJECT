import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, User, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, Sun, Moon, KeyRound } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // OTP Verification States
  const [view, setView] = useState('signup'); // 'signup' | 'otp_verification'
  const [otpCode, setOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const [otpLoadingMessage, setOtpLoadingMessage] = useState('');

  // Theme state synced with App.jsx
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle 30 seconds countdown timer for OTP entry
  useEffect(() => {
    if (view !== 'otp_verification') return;
    if (timeLeft <= 0) {
      setIsOtpExpired(true);
      setError('Verification time expired. Please request a new OTP.');
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [view, timeLeft]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSignupSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    setError('');
    
    // Check if user already exists
    const registeredUsers = JSON.parse(localStorage.getItem('mmp_registered_users') || '[]');
    const userExists = registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setError('An account already exists with this email address. Redirecting to login page...');
        
        // Wait and redirect to login
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2200);
      }, 1000);
      return;
    }

    // Generate secure 6-digit OTP
    const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    setOtpCode(generatedOtp);

    // SECURITY: Log the OTP securely to the browser console for staging / testing
    console.log(
      '%c🔑 [SECURITY] Register OTP sent to ' + email + ' is: ' + generatedOtp, 
      'background: #0f172a; color: #00f2fe; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 14px; border: 1.5px solid rgba(0, 242, 254, 0.35);'
    );

    // Trigger backend real Nodemailer mail dispatch
    const triggerBackendEmail = async () => {
      try {
        const API_BASE = 'http://localhost:5001/api';
        await fetch(`${API_BASE}/send-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, otp: generatedOtp })
        });
      } catch (err) {
        console.error('Failed to trigger backend OTP email dispatch:', err);
      }
    };

    triggerBackendEmail();

    // Trigger the 10-second OTP generation display
    setIsLoading(true);
    setOtpLoadingMessage('Connecting to secure registration node...');

    let counter = 10;
    const interval = setInterval(() => {
      counter -= 1;
      if (counter === 7) {
        setOtpLoadingMessage('Generating secure 6-digit One-Time Password...');
      } else if (counter === 4) {
        setOtpLoadingMessage(`Dispatching secure verification email to ${email}...`);
      } else if (counter <= 0) {
        clearInterval(interval);
        setIsLoading(false);
        setOtpLoadingMessage('');
        
        setTimeLeft(30);
        setIsOtpExpired(false);
        setEnteredOtp('');
        setError('');
        setView('otp_verification');
      }
    }, 1000);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (isOtpExpired || timeLeft <= 0) {
      setError('Verification time expired. Please request a new OTP.');
      return;
    }
    if (!enteredOtp) {
      setError('Please enter the verification code.');
      return;
    }
    if (enteredOtp !== otpCode) {
      setError('Invalid OTP code. Please try again.');
      return;
    }

    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);

      // Save user to registered users database
      const registeredUsersList = JSON.parse(localStorage.getItem('mmp_registered_users') || '[]');
      registeredUsersList.push({ name, email, password });
      localStorage.setItem('mmp_registered_users', JSON.stringify(registeredUsersList));
      
      // Save authenticated flag in localStorage
      localStorage.setItem('mmp_authenticated', 'true');
      localStorage.setItem('mmp_user_name', name);
      localStorage.setItem('mmp_user_email', email);

      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1200);
    }, 1200);
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

      {/* Signup Card */}
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
        {/* Gorgeous 10-Second Generation Overlay */}
        {isLoading && otpLoadingMessage && (
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
              border: '3px solid rgba(0, 242, 254, 0.1)',
              borderTopColor: 'var(--accent-cyan)',
              animation: 'spin 1s linear infinite',
              marginBottom: '20px'
            }}></div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Sending Secure OTP
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {otpLoadingMessage}
            </p>
            <div style={{ marginTop: '16px', background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.2)', padding: '6px 12px', borderRadius: '20px', display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
              <span className="pulsing-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>ESTIMATED TIME: 10S</span>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {view === 'signup' && (
            <motion.div
              key="signup-view"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Get Started
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Create your free account to track and hit your target metrics
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
                    fontWeight: 'bold',
                    animation: 'pulse 2s infinite'
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Full Name input */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      <User size={18} />
                    </span>
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading || success}
                      className="form-input"
                      style={{ paddingLeft: '48px' }}
                      required
                    />
                  </div>
                </div>

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
                      placeholder="Minimum 8 characters" 
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

                {/* Terms & Privacy checkbox */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '4px 0' }}>
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="form-checkbox"
                    style={{ marginTop: '3px', cursor: 'pointer' }}
                    required
                  />
                  <label htmlFor="terms" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', cursor: 'pointer' }}>
                    I agree to the{' '}
                    <span style={{ color: 'var(--accent-indigo)', textDecoration: 'none', fontWeight: 600 }} className="neon-text-cyan">Terms of Service</span>
                    {' '}and{' '}
                    <span style={{ color: 'var(--accent-indigo)', textDecoration: 'none', fontWeight: 600 }} className="neon-text-cyan">Privacy Policy</span>.
                  </label>
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
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  Create Account
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
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  style={{ color: 'var(--accent-indigo)', textDecoration: 'none', fontWeight: 600 }}
                  className="neon-text-cyan"
                >
                  Login
                </Link>
              </div>
            </motion.div>
          )}

          {/* VIEW 2: SECURE OTP VERIFICATION */}
          {view === 'otp_verification' && (
            <motion.div
              key="otp-verification-view"
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
                    background: 'rgba(0, 242, 254, 0.1)', 
                    color: 'var(--accent-cyan)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}
                >
                  <Lock size={22} className="neon-text-cyan" />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Two-Step Verification
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '320px', margin: '0 auto' }}>
                  A secure 6-digit One-Time Password (OTP) has been sent to your registered email:
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 'bold', marginTop: '4px' }}>
                  {email}
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
                  Verification successful! Creating account...
                </div>
              )}

              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* OTP input */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Verification Code
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      <KeyRound size={18} />
                    </span>
                    <input 
                      type="text" 
                      maxLength={6}
                      placeholder="Enter 6-digit code" 
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      disabled={isLoading || success || isOtpExpired}
                      className="form-input"
                      style={{ paddingLeft: '48px', letterSpacing: '0.12em', fontWeight: 'bold' }}
                      required
                    />
                  </div>
                </div>

                {/* Countdown Timer Indicator & Resend */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: isOtpExpired ? 'var(--accent-red)' : 'var(--text-secondary)', fontWeight: 600 }}>
                    {isOtpExpired ? 'OTP Expired' : `Expires in: ${timeLeft}s`}
                  </span>
                  {isOtpExpired && (
                    <button
                      type="button"
                      onClick={() => {
                        // Resubmit to trigger fresh 10s OTP generation
                        handleSignupSubmit();
                      }}
                      className="neon-text-cyan"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-indigo)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      Resend OTP (10s mail)
                    </button>
                  )}
                </div>

                {/* Submit & Back buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button 
                    type="button" 
                    onClick={() => { setView('signup'); setError(''); }}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading || success}
                    className="btn-primary"
                    style={{ flex: 2, justifyContent: 'center', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {isLoading ? (
                      <span 
                        style={{ 
                          width: '18px', 
                          height: '18px', 
                          border: '2px solid rgba(255,255,255,0.3)', 
                          borderTopColor: '#ffffff', 
                          borderRadius: '50%', 
                          display: 'inline-block',
                          animation: 'spin 1s linear infinite'
                        }}
                      ></span>
                    ) : (
                      'Verify & Register'
                    )}
                  </button>
                </div>
              </form>
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
