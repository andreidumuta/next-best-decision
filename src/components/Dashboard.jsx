import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Shield, 
  Cloud, 
  Key, 
  DollarSign, 
  Users,
  Activity,
  ArrowRight,
  BrainCircuit,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { generateNextBestDecision } from '../utils/aiDecisions';

export default function Dashboard({ database, onSelectSuite, onUpdateDecisionState, onUpdateDecisionFeedback }) {
  const { suites, products } = database;

  // Helper to get suite metrics
  const getSuiteMetrics = (suiteId) => {
    const suiteProducts = products.filter(p => p.suiteId === suiteId);
    
    let currentMrr = 0;
    let lastWeekMrr = 0;
    let yearAgoMrr = 0;
    let totalVolume = 0;

    suiteProducts.forEach(p => {
      const price = p.price;
      currentMrr += p.weeklyVolume * price;
      lastWeekMrr += p.lastWeekVolume * price;
      
      const yearAgoVol = p.history && p.history[0] ? p.history[0].volume : p.weeklyVolume;
      yearAgoMrr += yearAgoVol * price;
      totalVolume += p.weeklyVolume;
    });

    const weekGrowth = lastWeekMrr > 0 ? ((currentMrr - lastWeekMrr) / lastWeekMrr) * 100 : 0;
    const yearGrowth = yearAgoMrr > 0 ? ((currentMrr - yearAgoMrr) / yearAgoMrr) * 100 : 0;

    // Status logic:
    // Good (Green): growth >= 5%
    // Warning (Yellow): growth between 0% and 5%
    // Critical (Red): growth < 0%
    let status = 'warning';
    if (weekGrowth >= 5) {
      status = 'good';
    } else if (weekGrowth < 0) {
      status = 'critical';
    }

    return {
      currentMrr,
      weekGrowth,
      yearGrowth,
      totalVolume,
      status
    };
  };

  // Calculate overall portfolio metrics
  let totalMrr = 0;
  let totalLastWeekMrr = 0;
  let totalYearAgoMrr = 0;
  let totalSubscribers = 0;

  products.forEach(p => {
    const price = p.price;
    totalMrr += p.weeklyVolume * price;
    totalLastWeekMrr += p.lastWeekVolume * price;
    
    const yearAgoVol = p.history && p.history[0] ? p.history[0].volume : p.weeklyVolume;
    totalYearAgoMrr += yearAgoVol * price;
    totalSubscribers += p.weeklyVolume;
  });

  const overallWeekGrowth = totalLastWeekMrr > 0 ? ((totalMrr - totalLastWeekMrr) / totalLastWeekMrr) * 100 : 0;
  const overallYearGrowth = totalYearAgoMrr > 0 ? ((totalMrr - totalYearAgoMrr) / totalYearAgoMrr) * 100 : 0;

  // Suite Icons mapper
  const getSuiteIcon = (suiteId) => {
    switch(suiteId) {
      case 'suite-endpoint':
        return <Shield className="logo-icon-svg" size={20} />;
      case 'suite-cloud':
        return <Cloud className="logo-icon-svg" size={20} />;
      case 'suite-identity':
        return <Key className="logo-icon-svg" size={20} />;
      default:
        return <Activity className="logo-icon-svg" size={20} />;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'good':
        return <CheckCircle size={16} />;
      case 'warning':
        return <AlertTriangle size={16} />;
      case 'critical':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '0.02em' }}>Welcome, Andrei</span>
            <span style={{ animation: 'wave 2.5s infinite', transformOrigin: '70% 70%', display: 'inline-block', fontSize: '0.9rem' }}>👋</span>
          </div>
          <h1 className="page-title">Portfolio Overview</h1>
          <p className="page-subtitle">Track performance and next-best actions across cybersecurity suites.</p>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="portfolio-summary">
        <div className="summary-card">
          <span className="summary-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <DollarSign size={16} color="var(--color-primary)" />
              Total Portfolio MRR
            </span>
          </span>
          <span className="summary-value">${totalMrr.toLocaleString()}</span>
          <span className="summary-trend">
            <span style={{ color: overallWeekGrowth >= 0 ? 'var(--color-success)' : 'var(--color-danger)', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
              {overallWeekGrowth >= 0 ? '+' : ''}{overallWeekGrowth.toFixed(2)}%
            </span>
            <span style={{ color: 'var(--text-muted)' }}>vs. last week</span>
          </span>
        </div>

        <div className="summary-card">
          <span className="summary-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={16} color="var(--color-primary)" />
              Active Subscriptions
            </span>
          </span>
          <span className="summary-value">{totalSubscribers.toLocaleString()}</span>
          <span className="summary-trend">
            <span style={{ color: 'var(--text-muted)' }}>Licenses deployed across portfolio</span>
          </span>
        </div>

        <div className="summary-card">
          <span className="summary-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={16} color="var(--color-primary)" />
              Annual Growth Rate
            </span>
          </span>
          <span className="summary-value" style={{ color: overallYearGrowth >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {overallYearGrowth >= 0 ? '+' : ''}{overallYearGrowth.toFixed(1)}%
          </span>
          <span className="summary-trend">
            <span style={{ color: 'var(--text-muted)' }}>Year-over-year MRR trajectory</span>
          </span>
        </div>
      </div>

      {/* Homepage Next Best Decisions Alerts */}
      {(() => {
        const activeDecisions = suites.map(suite => {
          const suiteProducts = products.filter(p => p.suiteId === suite.id);
          const decision = generateNextBestDecision(suite, suiteProducts);
          const state = database.decisionStates ? database.decisionStates[suite.id] : 'active';
          return { suite, decision, state };
        }).filter(d => d.state === 'active');

        return (
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <BrainCircuit size={20} color="var(--color-primary-dark)" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 600, margin: 0 }}>Next Best Decisions</h2>
              <span style={{ 
                backgroundColor: 'var(--color-primary-light)', 
                color: 'var(--color-primary-dark)', 
                padding: '0.2rem 0.6rem', 
                borderRadius: '20px', 
                fontSize: '0.75rem', 
                fontWeight: 700 
              }}>
                {activeDecisions.length} Action{activeDecisions.length !== 1 ? 's' : ''} Recommended
              </span>
            </div>

            {activeDecisions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeDecisions.map(({ suite, decision }) => {
                  const feedback = database.decisionFeedback ? database.decisionFeedback[suite.id] : null;
                  return (
                    <div 
                      key={suite.id}
                      className="decision-alert-item"
                      onClick={() => onSelectSuite(suite.id)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderLeft: '4px solid var(--color-primary)',
                        borderRadius: 'var(--border-radius-md)',
                        padding: '1.25rem 1.5rem',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                    >
                      {/* Left Side: Icon & text */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, marginRight: '1.5rem' }}>
                        <div style={{
                          backgroundColor: 'var(--color-primary-light)',
                          color: 'var(--color-primary-dark)',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {getSuiteIcon(suite.id)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                              {suite.name}
                            </span>
                            <span style={{ 
                              backgroundColor: '#f1f5f9', 
                              color: 'var(--text-secondary)', 
                              padding: '0.1rem 0.4rem', 
                              borderRadius: '4px', 
                              fontSize: '0.65rem', 
                              fontWeight: 600 
                            }}>
                              {decision.actionType}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
                            {decision.shortRecommendation}
                          </p>
                        </div>
                      </div>

                      {/* Right Side: Impact, Confidence, Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'right' }}>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Est. Impact</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-success)' }}>{decision.impact}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Confidence</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{decision.confidence}</div>
                          </div>
                        </div>

                        {/* Actions buttons: Checkmark & Dismiss */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem', alignItems: 'center' }}>
                          {/* Feedback Thumbs Up / Down */}
                          <div style={{ display: 'flex', gap: '0.25rem', borderRight: '1px solid var(--border-color)', paddingRight: '0.5rem', marginRight: '0.5rem' }}>
                            <button
                              onClick={() => onUpdateDecisionFeedback(suite.id, 'up')}
                              className="btn-action-feedback"
                              title="Helpful recommendation"
                              style={{
                                width: '2.1rem',
                                height: '2.1rem',
                                borderRadius: '50%',
                                backgroundColor: feedback === 'up' ? 'var(--color-success-bg)' : '#f8fafc',
                                color: feedback === 'up' ? 'var(--color-success)' : 'var(--text-muted)',
                                border: feedback === 'up' ? '1px solid var(--color-success-border)' : '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <ThumbsUp size={13} fill={feedback === 'up' ? 'var(--color-success)' : 'none'} />
                            </button>
                            <button
                              onClick={() => onUpdateDecisionFeedback(suite.id, 'down')}
                              className="btn-action-feedback"
                              title="Not helpful recommendation"
                              style={{
                                width: '2.1rem',
                                height: '2.1rem',
                                borderRadius: '50%',
                                backgroundColor: feedback === 'down' ? 'var(--color-danger-bg)' : '#f8fafc',
                                color: feedback === 'down' ? 'var(--color-danger)' : 'var(--text-muted)',
                                border: feedback === 'down' ? '1px solid var(--color-danger-border)' : '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <ThumbsDown size={13} fill={feedback === 'down' ? 'var(--color-danger)' : 'none'} />
                            </button>
                          </div>

                          <button 
                            onClick={() => onUpdateDecisionState(suite.id, 'done')}
                            className="btn-action-check"
                            title="Mark as completed"
                            style={{
                              width: '2.1rem',
                              height: '2.1rem',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-success-bg)',
                              color: 'var(--color-success)',
                              border: '1px solid var(--color-success-border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <CheckCircle size={15} />
                          </button>
                          <button 
                            onClick={() => onUpdateDecisionState(suite.id, 'dismissed')}
                            className="btn-action-dismiss"
                            title="Dismiss recommendation"
                            style={{
                              width: '2.1rem',
                              height: '2.1rem',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-danger-bg)',
                              color: 'var(--color-danger)',
                              border: '1px solid var(--color-danger-border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <XCircle size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px dashed var(--border-color)', 
                borderRadius: 'var(--border-radius-md)', 
                padding: '2rem', 
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}>
                <p style={{ margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span>🎉</span> All caught up! No active decisions recommended.
                </p>
              </div>
            )}
          </div>
        );
      })()}

      <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', fontWeight: 600 }}>Product Suites</h2>
      
      {/* Product Suites Grid */}
      <div className="suites-grid">
        {suites.map(suite => {
          const metrics = getSuiteMetrics(suite.id);
          const revenueShare = totalMrr > 0 ? (metrics.currentMrr / totalMrr) * 100 : 0;
          
          return (
            <div 
              key={suite.id} 
              className="suite-card"
              onClick={() => onSelectSuite(suite.id)}
            >
              <div>
                <div className="suite-card-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary-dark)',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getSuiteIcon(suite.id)}
                    </div>
                    <div>
                      <span className="suite-badge">Suite</span>
                    </div>
                  </div>
                  <span className={`status-badge ${metrics.status}`}>
                    {getStatusIcon(metrics.status)}
                    <span style={{ textTransform: 'capitalize' }}>{metrics.status}</span>
                  </span>
                </div>

                <h3 className="suite-title">{suite.name}</h3>
                <p className="suite-desc">{suite.description}</p>
              </div>

              <div className="suite-metrics">
                <div className="suite-metric-item">
                  <span className="suite-metric-label">Share of Revenue</span>
                  <span className="suite-metric-value">{revenueShare.toFixed(1)}%</span>
                </div>
                <div className="suite-metric-item">
                  <span className="suite-metric-label">Growth (Week)</span>
                  <span className={`suite-metric-value ${metrics.weekGrowth >= 0 ? 'growth-positive' : 'growth-negative'}`}>
                    {metrics.weekGrowth >= 0 ? '+' : ''}{metrics.weekGrowth.toFixed(1)}%
                  </span>
                </div>
                <div className="suite-metric-item">
                  <span className="suite-metric-label">Growth (Year)</span>
                  <span className={`suite-metric-value ${metrics.yearGrowth >= 0 ? 'growth-positive' : 'growth-negative'}`}>
                    {metrics.yearGrowth >= 0 ? '+' : ''}{metrics.yearGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                marginTop: '1rem',
                fontSize: '0.8rem',
                color: 'var(--color-primary)',
                fontWeight: 600,
                gap: '0.25rem'
              }}>
                Analyze details <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
