import { IndianRupee, Lock, Award } from 'lucide-react';

export default function AICoach({
  profile,
  premiumCard,
  setPremiumCard,
  isPaying,
  handlePremiumPaymentSubmit,
  chatMessages,
  chatInput,
  setChatInput,
  handleCoachMessageSubmit,
}) {
  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '8px' }}>AI Nutrition Coach</h2>
      <p style={{ marginBottom: '32px' }}>Unlock expert coach feedback, daily review analysis, and premium features.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '30px', alignItems: 'start' }} className="coach-hub-grid">
        
        {/* Left Side: Coach Chat (Locked for non-premium) */}
        <div className="flat-panel" style={{ padding: '24px', position: 'relative', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3>Coaching Dialogue</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>Chat directly with our AI model trained on macro guidelines.</p>

          <div className="chat-messages" style={{ flex: 1 }}>
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          {profile.isPremium ? (
            <form onSubmit={handleCoachMessageSubmit} style={{ display: 'flex', gap: '10px' }}>
              <input type="text" placeholder="Ask about protein sources, weight adjustments..." className="form-input" value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
              <button type="submit" className="btn-primary">Send</button>
            </form>
          ) : (
            <div className="coach-lock-overlay">
              <Lock size={48} className="neon-text-cyan" style={{ marginBottom: '16px' }} />
              <h4 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Coaching Hub Locked</h4>
              <p style={{ maxWidth: '300px', fontSize: '0.85rem', marginBottom: '20px', color: 'var(--text-secondary)' }}>Unlock Premium Tier access below to query our AI Nutrition Specialist.</p>
            </div>
          )}
        </div>

        {/* Right Side: Payment Checkout */}
        <aside className="flat-panel" style={{ padding: '24px' }}>
          {profile.isPremium ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Award size={48} className="neon-text-cyan" style={{ marginBottom: '16px', display: 'inline-block' }} />
              <h3 style={{ color: 'var(--accent-cyan)' }}>Premium Activated</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>You have full access to custom coaching, workout plan adjustments, and all ads are removed.</p>
            </div>
          ) : (
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <IndianRupee size={20} className="neon-text-cyan" /> Premium Checkout
              </h3>
              <p style={{ fontSize: '0.85rem', marginBottom: '20px' }}>Simulate a mock transaction to access specialized coaching tools (₹49.00 only).</p>

              <form onSubmit={handlePremiumPaymentSubmit}>
                <div className="form-group">
                  <label className="form-label">Cardholder Name</label>
                  <input type="text" className="form-input" placeholder="John Doe" required value={premiumCard.name} onChange={(e) => setPremiumCard({...premiumCard, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input type="text" className="form-input" placeholder="4242 4242 4242 4242" required maxLength="19" value={premiumCard.cardNumber} onChange={(e) => setPremiumCard({...premiumCard, cardNumber: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input type="text" className="form-input" placeholder="MM/YY" required maxLength="5" value={premiumCard.expiry} onChange={(e) => setPremiumCard({...premiumCard, expiry: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input type="password" className="form-input" placeholder="***" required maxLength="3" value={premiumCard.cvv} onChange={(e) => setPremiumCard({...premiumCard, cvv: e.target.value})} />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={isPaying}>
                  {isPaying ? 'Authorizing Payment...' : 'Authorize Transaction'}
                </button>
              </form>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}