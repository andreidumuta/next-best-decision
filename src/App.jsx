import React, { useState, useEffect } from 'react';
import { getDatabase, updateDecisionState, updateDecisionFeedback, addGeneralFeedback, saveStrategyHubContent } from './db/storage';
import Dashboard from './components/Dashboard';
import SuiteDetail from './components/SuiteDetail';
import AdminPanel from './components/AdminPanel';
import RevenueSimulator from './components/RevenueSimulator';
import ElasticitySimulator from './components/ElasticitySimulator';
import StrategyHub from './components/StrategyHub';
import { 
  ShieldCheck, 
  Settings, 
  LayoutDashboard,
  BrainCircuit,
  Lock,
  AlertTriangle,
  Bell,
  Percent,
  Calculator,
  LogOut,
  User
} from 'lucide-react';

export default function App() {
  const [database, setDatabase] = useState(getDatabase());
  const [currentView, setCurrentView] = useState('DASHBOARD'); // 'DASHBOARD' | 'SUITE_DETAIL' | 'ADMIN' | 'REVENUE_SIMULATOR'
  const [selectedSuiteId, setSelectedSuiteId] = useState(null);
  
  // Login State simulation
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Pre-logged in for prototype ease
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Element-level Feedback states
  const [isSelectingElement, setIsSelectingElement] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbacksList, setFeedbacksList] = useState(() => {
    const db = getDatabase();
    return db.feedbacks || [];
  });

  useEffect(() => {
    if (!isSelectingElement) return;

    const handleMouseOver = (e) => {
      // Avoid highlighting our own selection banner/modal/floating buttons
      if (e.target.closest('#nbd-feedback-banner') || e.target.closest('#nbd-feedback-modal') || e.target.closest('#nbd-feedback-trigger-btn')) return;
      e.target.style.outline = '2px dashed var(--color-primary)';
      e.target.style.outlineOffset = '2px';
      e.target.style.cursor = 'crosshair';
    };

    const handleMouseOut = (e) => {
      e.target.style.outline = '';
      e.target.style.outlineOffset = '';
      e.target.style.cursor = '';
    };

    const handleGlobalClick = (e) => {
      // If clicking inside the feedback elements, do not intercept
      if (e.target.closest('#nbd-feedback-banner') || e.target.closest('#nbd-feedback-modal') || e.target.closest('#nbd-feedback-trigger-btn')) return;

      e.preventDefault();
      e.stopPropagation();

      // Clean up styles
      e.target.style.outline = '';
      e.target.style.outlineOffset = '';
      e.target.style.cursor = '';

      const tag = e.target.tagName.toLowerCase();
      const text = e.target.innerText || e.target.value || '';
      const snippet = text.substring(0, 60).trim() + (text.length > 60 ? '...' : '');
      const classes = e.target.className ? `.${String(e.target.className).split(' ').join('.')}` : '';
      const elementId = e.target.id ? `#${e.target.id}` : '';

      setSelectedElement({
        tag,
        snippet: snippet || '[Empty element]',
        selector: `${tag}${elementId}${classes.substring(0, 50)}`
      });

      setIsSelectingElement(false);
      setShowFeedbackModal(true);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSelectingElement(false);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleGlobalClick, true); // capture phase
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('click', handleGlobalClick, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelectingElement]);

  const handleUpdateDatabase = (newDb) => {
    setDatabase({ ...newDb });
  };

  const handleUpdateDecisionState = (suiteId, status) => {
    const newDb = updateDecisionState(suiteId, status);
    setDatabase({ ...newDb });
  };

  const handleUpdateDecisionFeedback = (suiteId, feedback) => {
    const newDb = updateDecisionFeedback(suiteId, feedback);
    setDatabase({ ...newDb });
  };

  const handleSaveHubContent = (content) => {
    const newDb = saveStrategyHubContent(content);
    setDatabase({ ...newDb });
  };

  const navigateToSuite = (suiteId) => {
    setSelectedSuiteId(suiteId);
    setCurrentView('SUITE_DETAIL');
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <form className="login-card" onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
          <div className="login-header">
            <div className="login-logo">NBD</div>
            <h1 className="login-title">DecisionEngine</h1>
            <p className="login-subtitle">Next Best Decision Platform</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                required 
                placeholder="andrei@nextbestdecision.com" 
                defaultValue="andrei@nextbestdecision.com"
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                className="form-control" 
                required 
                placeholder="••••••••" 
                defaultValue="password123"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontWeight: 600 }}>
            Sign In to Enterprise Division
          </button>
          
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Authorized personnel only. Sessions are audited.
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Premium Navigation Header */}
      <header className="navbar">
        <div className="logo-container" onClick={() => { setCurrentView('DASHBOARD'); setSelectedSuiteId(null); }} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">NBD</div>
          <span className="logo-text">Next Best Decision</span>
        </div>

        <div className="nav-actions">
          <div className="session-badge">
            <span className="session-dot"></span>
            Secured Session
          </div>
          <button 
            className="material-symbols-outlined text-secondary hover:bg-surface-container-low p-2 rounded-full" 
            style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Lock system"
            onClick={() => { setIsLoggedIn(false); setCurrentView('DASHBOARD'); setSelectedSuiteId(null); }}
          >
            <Lock size={18} />
          </button>
          <button 
            className="material-symbols-outlined text-secondary hover:bg-surface-container-low p-2 rounded-full" 
            style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Notifications"
          >
            <Bell size={18} />
          </button>
          <div className="profile-avatar">
            <img 
              alt="A professional headshot of a female executive in a minimalist business suit, lit by soft studio lighting with a neutral gray background." 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnLaTVAglz6Ne8ugvffIqDBsyuGQfUde-IYflfoQH2S2DhsMdruLPFYLkju41dbtbpzXeW0GDp2kEXfH0NjzJ-6W5j2kGb_zIQnwtQeLQVAqNvILlOC-iy54cI73WSpsc9JbqEhQabVYmQPrnjzTnt1lo3AxLRuyqxjYwi0d3cSH8kj4QTs5CUr5BIeJRwhClAKV1m285I_Cl6NaaBAt2oLufQq17QlNciqznPwFDU8ECu9quafACLvG5Ba5r1KKjEW9_HB2nh1o8" 
            />
          </div>
        </div>
      </header>

      <div className="app-layout">
        {/* Left Navigation Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-profile">
            <div className="profile-initials">CE</div>
            <div className="profile-info">
              <span className="profile-role">Category Manager</span>
              <span className="profile-dept">Enterprise Division</span>
            </div>
          </div>

          <nav className="sidebar-menu">
            <div 
              className={`sidebar-link ${currentView === 'DASHBOARD' || currentView === 'SUITE_DETAIL' ? 'active' : ''}`}
              onClick={() => { setCurrentView('DASHBOARD'); setSelectedSuiteId(null); }}
            >
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </div>

            <div 
              className={`sidebar-link ${currentView === 'ELASTICITY_SIMULATOR' ? 'active' : ''}`}
              onClick={() => {
                setCurrentView('ELASTICITY_SIMULATOR');
                if (!selectedSuiteId && database.suites.length > 0) {
                  setSelectedSuiteId(database.suites[0].id);
                }
              }}
            >
              <Percent size={18} />
              <span>Pricing Simulator</span>
            </div>

            <div 
              className={`sidebar-link ${currentView === 'REVENUE_SIMULATOR' ? 'active' : ''}`}
              onClick={() => {
                setCurrentView('REVENUE_SIMULATOR');
                if (!selectedSuiteId && database.suites.length > 0) {
                  setSelectedSuiteId(database.suites[0].id);
                }
              }}
            >
              <Calculator size={18} />
              <span>Revenue Simulator</span>
            </div>

            <div 
              className={`sidebar-link ${currentView === 'STRATEGY_HUB' ? 'active' : ''}`}
              onClick={() => { setCurrentView('STRATEGY_HUB'); setSelectedSuiteId(null); }}
            >
              <BrainCircuit size={18} />
              <span>Strategy Hub</span>
            </div>

            <div 
              className={`sidebar-link ${currentView === 'ADMIN' ? 'active' : ''}`}
              onClick={() => { setCurrentView('ADMIN'); setSelectedSuiteId(null); }}
            >
              <Settings size={18} />
              <span>Admin Catalog</span>
            </div>
          </nav>

          <div className="sidebar-footer">
            <div 
              className="sidebar-link"
              onClick={() => {
                setIsLoggedIn(false);
                setCurrentView('DASHBOARD');
                setSelectedSuiteId(null);
              }}
              style={{ color: 'var(--color-danger)' }}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </div>
          </div>
        </aside>

        {/* Right Main Container */}
        <div className="main-container">
          <main className="main-content">
            {currentView === 'DASHBOARD' && (
              <Dashboard 
                database={database} 
                onSelectSuite={navigateToSuite} 
                onUpdateDecisionState={handleUpdateDecisionState}
                onUpdateDecisionFeedback={handleUpdateDecisionFeedback}
              />
            )}
            
            {currentView === 'SUITE_DETAIL' && (
              <SuiteDetail 
                suiteId={selectedSuiteId} 
                database={database} 
                onBack={() => { setCurrentView('DASHBOARD'); setSelectedSuiteId(null); }} 
                onUpdateDecisionState={handleUpdateDecisionState}
                onUpdateDecisionFeedback={handleUpdateDecisionFeedback}
                onNavigateToSimulator={() => setCurrentView('REVENUE_SIMULATOR')}
                onNavigateToElasticitySimulator={() => setCurrentView('ELASTICITY_SIMULATOR')}
              />
            )}

            {currentView === 'REVENUE_SIMULATOR' && (
              <RevenueSimulator 
                key={selectedSuiteId || 'revenue-default'}
                suiteId={selectedSuiteId || database.suites[0].id} 
                database={database} 
                onBack={() => {
                  if (selectedSuiteId) {
                    setCurrentView('SUITE_DETAIL');
                  } else {
                    setCurrentView('DASHBOARD');
                  }
                }}
                onSuiteChange={(id) => setSelectedSuiteId(id)}
              />
            )}

            {currentView === 'ELASTICITY_SIMULATOR' && (
              <ElasticitySimulator 
                key={selectedSuiteId || 'elasticity-default'}
                suiteId={selectedSuiteId || database.suites[0].id} 
                database={database} 
                onBack={() => {
                  if (selectedSuiteId) {
                    setCurrentView('SUITE_DETAIL');
                  } else {
                    setCurrentView('DASHBOARD');
                  }
                }}
                onSuiteChange={(id) => setSelectedSuiteId(id)}
              />
            )}

            {currentView === 'ADMIN' && (
              <AdminPanel 
                database={database} 
                onUpdateDb={handleUpdateDatabase} 
              />
            )}

            {currentView === 'STRATEGY_HUB' && (
              <StrategyHub 
                database={database}
                onSaveHubContent={handleSaveHubContent}
                onBack={() => setCurrentView('DASHBOARD')}
              />
            )}
          </main>

          {/* Footer Branding */}
          <footer style={{
            textAlign: 'center',
            padding: '2rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginTop: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <BrainCircuit size={16} />
              <strong>Next Best Decision Platform</strong>
            </div>
            <div>Built for Cybersecurity Category Management and Dynamic Pricing Simulation.</div>
            <div style={{ marginTop: '0.5rem' }}>© 2026 Next Best Decision Inc. All rights reserved.</div>
          </footer>
        </div>
      </div>

      {/* Element Selector Banner */}
      {isSelectingElement && (
        <div 
          id="nbd-feedback-banner"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: 'var(--color-primary-dark)',
            color: 'white',
            textAlign: 'center',
            padding: '0.85rem 1rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <span>🎯 Hover and click the element you want to provide feedback on.</span>
          <button 
            onClick={() => setIsSelectingElement(false)}
            style={{
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: '4px',
              fontWeight: 700
            }}
          >
            Cancel (Esc)
          </button>
        </div>
      )}

      {/* Feedback Submission Modal */}
      {showFeedbackModal && selectedElement && (
        <div 
          id="nbd-feedback-modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              width: '100%',
              maxWidth: '480px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ padding: '0.4rem', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', borderRadius: '6px' }}>
                <BrainCircuit size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Something needs improvement? Tell us!</h3>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                <strong>Selected Element</strong>
                <span style={{ fontFamily: 'monospace', color: 'var(--color-primary-dark)', fontWeight: 600 }}>&lt;{selectedElement.tag}&gt;</span>
              </div>
              <div style={{ color: 'var(--text-primary)', fontStyle: 'italic', wordBreak: 'break-word', borderLeft: '3px solid var(--border-color)', paddingLeft: '0.5rem' }}>
                "{selectedElement.snippet}"
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                Selector: {selectedElement.selector}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Your Feedback / Recommendation:</label>
              <textarea 
                rows="4"
                className="form-control"
                placeholder="What is wrong with this element? What would you improve? (e.g. layout alignment, copy clarity, calculation inaccuracy...)"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackText('');
                  setSelectedElement(null);
                }}
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  if (!feedbackText.trim()) return;
                  addGeneralFeedback({
                    element: selectedElement,
                    feedback: feedbackText,
                    view: currentView,
                    suiteId: selectedSuiteId
                  });
                  // Update local list
                  const db = getDatabase();
                  setFeedbacksList(db.feedbacks || []);
                  
                  // Show success toast
                  alert('Thank you for your feedback! It has been logged to the Admin Database.');
                  setShowFeedbackModal(false);
                  setFeedbackText('');
                  setSelectedElement(null);
                }}
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)', color: 'white' }}
                disabled={!feedbackText.trim()}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Give Feedback Button (Sticky in bottom-right) */}
      {!isSelectingElement && !showFeedbackModal && (
        <div id="nbd-feedback-trigger-btn" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
          <button
            onClick={() => setIsSelectingElement(true)}
            className="btn btn-primary"
            style={{
              padding: '0.65rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.825rem',
              backgroundColor: 'var(--color-primary)',
              borderColor: 'var(--color-primary)',
              color: 'white',
              boxShadow: '0 4px 14px rgba(6, 78, 59, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '30px',
              animation: 'pulseGlow 2.5s infinite',
              transition: 'all 0.2s ease'
            }}
          >
            <AlertTriangle size={15} />
            <span>Something needs improvement? Tell us!</span>
          </button>
        </div>
      )}
    </div>
  );
}
