import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calculator, 
  HelpCircle, 
  RefreshCw, 
  DollarSign, 
  Target, 
  TrendingUp,
  Info
} from 'lucide-react';

export default function RevenueSimulator({ suiteId, database, onBack, onSuiteChange }) {
  const { suites, products } = database;
  const suite = suites.find(s => s.id === suiteId);
  const suiteProducts = products.filter(p => p.suiteId === suiteId);

  const getAvgSuitePrice = () => {
    if (!suiteProducts || suiteProducts.length === 0) return 40;
    return Math.round(suiteProducts.reduce((sum, p) => sum + p.price, 0) / suiteProducts.length);
  };

  const getInitialSimState = (prodId) => {
    if (prodId === 'all') {
      return {
        traffic: 49000,
        cpc: 0.45,
        signupConv: 3.4,
        freeToPaidConv: 5.0,
        price: getAvgSuitePrice(),
        churn: 5.4
      };
    }
    
    const prod = suiteProducts.find(p => p.id === prodId);
    if (!prod) {
      return { traffic: 40000, cpc: 0.5, signupConv: 3.0, freeToPaidConv: 4.5, price: 40, churn: 6.0 };
    }

    let traffic = 50000;
    let cpc = 0.40;
    let signupConv = 4.0;
    let freeToPaidConv = 6.0;
    let churn = 5.0;

    if (prod.tier === 'good') {
      traffic = 68000;
      cpc = 0.30;
      signupConv = 4.2;
      freeToPaidConv = 5.5;
      churn = 6.2;
    } else if (prod.tier === 'better') {
      traffic = 42000;
      cpc = 0.50;
      signupConv = 3.3;
      freeToPaidConv = 4.8;
      churn = 5.0;
    } else if (prod.tier === 'best') {
      traffic = 24000;
      cpc = 0.80;
      signupConv = 2.4;
      freeToPaidConv = 3.6;
      churn = 3.8;
    }

    return {
      traffic,
      cpc,
      signupConv,
      freeToPaidConv,
      price: prod.price,
      churn
    };
  };

  // States
  const [selectedSimProduct, setSelectedSimProduct] = useState('all');
  const [simValuesMap, setSimValuesMap] = useState({
    all: getInitialSimState('all')
  });

  // Get active values based on selection
  const currentSimValues = simValuesMap[selectedSimProduct] || getInitialSimState(selectedSimProduct);

  const simTraffic = currentSimValues.traffic;
  const simCpc = currentSimValues.cpc;
  const simSignupConv = currentSimValues.signupConv;
  const simFreeToPaidConv = currentSimValues.freeToPaidConv;
  const simPrice = currentSimValues.price;
  const simChurn = currentSimValues.churn;

  const setSimValue = (key, val) => {
    setSimValuesMap(prev => {
      const current = prev[selectedSimProduct] || getInitialSimState(selectedSimProduct);
      return {
        ...prev,
        [selectedSimProduct]: {
          ...current,
          [key]: val
        }
      };
    });
  };

  const handleSimProductChange = (prodId) => {
    setSelectedSimProduct(prodId);
    if (!simValuesMap[prodId]) {
      setSimValuesMap(prev => ({
        ...prev,
        [prodId]: getInitialSimState(prodId)
      }));
    }
  };

  const resetToDefaults = () => {
    setSimValuesMap(prev => ({
      ...prev,
      [selectedSimProduct]: getInitialSimState(selectedSimProduct)
    }));
  };

  const getLtvCaqStatus = (ratio) => {
    if (ratio < 1.0) return 'Loss-making';
    if (ratio < 2.0) return 'Poor';
    if (ratio < 3.0) return 'Fair';
    if (ratio < 4.0) return 'Good';
    return 'Excellent';
  };

  const getLtvCaqColor = (ratio) => {
    if (ratio < 1.0) return 'var(--color-danger)';
    if (ratio < 2.0) return 'var(--color-warning)';
    if (ratio < 3.0) return '#eab308'; // Darker yellow/gold
    if (ratio < 4.0) return 'var(--color-primary-dark)';
    return 'var(--color-success)';
  };

  const simTrafficNum = Number(simTraffic) || 0;
  const simCpcNum = Number(simCpc) || 0;
  const simSignupConvNum = Number(simSignupConv) || 0;
  const simFreeToPaidConvNum = Number(simFreeToPaidConv) || 0;
  const simPriceNum = Number(simPrice) || 0;
  const simChurnNum = Number(simChurn) || 0;

  // Math variables for Simulator
  const newPaidUsers = simTrafficNum * (simSignupConvNum / 100) * (simFreeToPaidConvNum / 100);
  const caq = newPaidUsers > 0 ? (simTrafficNum * simCpcNum) / newPaidUsers : 0;
  const ltv = simChurnNum > 0 ? simPriceNum / (simChurnNum / 100) : 0;
  
  // Baseline calculations
  const baselineState = getInitialSimState(selectedSimProduct);
  const baselinePaidUsers = baselineState.traffic * (baselineState.signupConv / 100) * (baselineState.freeToPaidConv / 100);
  const baselineMrr = baselinePaidUsers * baselineState.price;
  const baselineBudget = baselineState.traffic * baselineState.cpc;
  const baselineLtv = baselineState.churn > 0 ? baselineState.price / (baselineState.churn / 100) : 0;
  
  const simMrr = newPaidUsers * simPriceNum;
  const mrrAdded = simMrr - baselineMrr;
  const lifetimeRevenueAdded = (newPaidUsers * ltv) - (baselinePaidUsers * baselineLtv);
  
  const currentBudget = simTrafficNum * simCpcNum;
  const budgetAdded = currentBudget - baselineBudget;
  
  const ltvCaqRatio = caq > 0 ? ltv / caq : 0;

  const signupsCount = Math.round(simTrafficNum * (simSignupConvNum / 100));
  const paidCount = Math.round(newPaidUsers);

  // Dynamic funnel dimension calculations (centered at X=330 for left-hand labeling space)
  const trafficWidth = 140 + (simTrafficNum / 100000) * 200; // max width 340px, fits within [160, 500]
  const signupWidth = trafficWidth * (0.05 + (simSignupConvNum / 20) * 0.85);
  const paidWidth = signupWidth * (0.05 + (simFreeToPaidConvNum / 50) * 0.85);
  const bottomWidth = paidWidth * Math.max(0.1, 1 - (simChurnNum / 30) * 0.85);

  if (!suite) {
    return (
      <div style={{ padding: '2rem' }}>
        <button className="btn btn-secondary" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <p style={{ marginTop: '2rem' }}>Product suite not found.</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Breadcrumbs / Back button */}
      <div className="back-button" style={{ marginBottom: '1rem' }}>
        <button onClick={onBack}>
          <ArrowLeft size={16} /> Back to {suite.name} Details
        </button>
      </div>

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              backgroundColor: 'var(--color-primary-light)', 
              color: 'var(--color-primary)', 
              padding: '0.5rem', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Calculator size={24} />
            </div>
            <h1 className="page-title" style={{ margin: 0 }}>Revenue Simulator</h1>
          </div>
          <p className="page-subtitle" style={{ marginTop: '0.25rem' }}>
            Model pricing campaigns, customer acquisition costs, and retention impact for the <strong>{suite?.name || 'Cybersecurity'}</strong>.
          </p>
        </div>
      </div>

      {/* Two-Column Simulator Layout */}
      <div className="simulator-layout-grid">
        
        {/* Left Side: Controls Panel */}
        <div className="simulator-card-panel">
          <div className="detail-card" style={{ height: '100%', marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
              <h3 className="detail-card-title" style={{ borderBottom: 'none', margin: 0, paddingBottom: 0 }}>
                <Target size={18} color="var(--color-primary)" />
                Simulator Configuration
              </h3>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                onClick={resetToDefaults}
              >
                <RefreshCw size={12} />
                Reset Defaults
              </button>
            </div>

            {/* Suite & Product Selectors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              {onSuiteChange && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Select Product Suite:</label>
                  <select
                    className="form-control"
                    style={{ padding: '0.5rem', fontSize: '0.9rem', width: '100%', marginTop: '0.25rem' }}
                    value={suiteId}
                    onChange={(e) => onSuiteChange(e.target.value)}
                  >
                    {suites.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Select Base Product Model:</label>
                <select 
                  className="form-control" 
                  style={{ padding: '0.5rem', fontSize: '0.9rem', width: '100%', marginTop: '0.25rem' }}
                  value={selectedSimProduct}
                  onChange={(e) => handleSimProductChange(e.target.value)}
                >
                  <option value="all">All Products (Average - ${getAvgSuitePrice()}/mo)</option>
                  {suiteProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (${p.price}/mo - {p.tier.toUpperCase()} tier)</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Slider Section: User Acquisition */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)', borderBottom: '1px dashed var(--border-color)', pb: '0.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <span>1. Traffic & Acquisition</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Traffic */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="tooltip-container" data-tooltip="Number of unique visitors who land on our marketing site each month." style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Monthly Marketing Traffic</span>
                      <HelpCircle size={12} style={{ color: 'var(--text-muted)' }} />
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input 
                        type="number"
                        min="1000" 
                        max="100000" 
                        step="1000"
                        value={simTraffic === 0 ? '' : simTraffic}
                        onChange={(e) => setSimValue('traffic', e.target.value === '' ? '' : parseInt(e.target.value))}
                        onBlur={(e) => {
                          let val = parseInt(e.target.value) || 1000;
                          val = Math.max(1000, Math.min(100000, val));
                          setSimValue('traffic', val);
                        }}
                        style={{
                          width: '85px',
                          padding: '0.15rem 0.35rem',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          textAlign: 'right',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                          boxShadow: 'var(--shadow-inset)'
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Visitors</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="1000" 
                    max="100000" 
                    step="1000"
                    value={simTrafficNum} 
                    onChange={(e) => setSimValue('traffic', parseInt(e.target.value))}
                    className="range-input" 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    <span>1,000</span>
                    <span>100,000 Visitors</span>
                  </div>
                </div>

                {/* CPC */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="tooltip-container" data-tooltip="Average price paid for each user click generated by advertising campaigns." style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cost Per Click (CPC)</span>
                      <HelpCircle size={12} style={{ color: 'var(--text-muted)' }} />
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>$</span>
                      <input 
                        type="number"
                        min="0.05" 
                        max="5.00" 
                        step="0.01"
                        value={simCpc === 0 ? '' : simCpc}
                        onChange={(e) => setSimValue('cpc', e.target.value === '' ? '' : parseFloat(e.target.value))}
                        onBlur={(e) => {
                          let val = parseFloat(e.target.value) || 0.05;
                          val = Math.max(0.05, Math.min(5.00, val));
                          setSimValue('cpc', Number(val.toFixed(2)));
                        }}
                        style={{
                          width: '60px',
                          padding: '0.15rem 0.35rem',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          textAlign: 'right',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                          boxShadow: 'var(--shadow-inset)'
                        }}
                      />
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="0.05" 
                    max="5.00" 
                    step="0.05"
                    value={simCpcNum} 
                    onChange={(e) => setSimValue('cpc', parseFloat(e.target.value))}
                    className="range-input" 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    <span>$0.05</span>
                    <span>$5.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Section: Conversion Funnel */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)', borderBottom: '1px dashed var(--border-color)', pb: '0.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <span>2. Funnel Conversions</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Signup Conversion */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="tooltip-container" data-tooltip="Percentage of website visitors who register for a free account." style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Signup Conversion Rate</span>
                      <HelpCircle size={12} style={{ color: 'var(--text-muted)' }} />
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input 
                        type="number"
                        min="0.1" 
                        max="20.0" 
                        step="0.1"
                        value={simSignupConv === 0 ? '' : simSignupConv}
                        onChange={(e) => setSimValue('signupConv', e.target.value === '' ? '' : parseFloat(e.target.value))}
                        onBlur={(e) => {
                          let val = parseFloat(e.target.value) || 0.1;
                          val = Math.max(0.1, Math.min(20.0, val));
                          setSimValue('signupConv', Number(val.toFixed(1)));
                        }}
                        style={{
                          width: '65px',
                          padding: '0.15rem 0.35rem',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          textAlign: 'right',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                          boxShadow: 'var(--shadow-inset)'
                        }}
                      />
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-primary)' }}>%</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="20.0" 
                    step="0.1"
                    value={simSignupConvNum} 
                    onChange={(e) => setSimValue('signupConv', parseFloat(e.target.value))}
                    className="range-input" 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    <span>0.1%</span>
                    <span>20.0%</span>
                  </div>
                </div>

                {/* Free to Paid */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="tooltip-container" data-tooltip="Percentage of registered free users who upgrade to a paid subscription tier." style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Free-to-Paid Upgrade Rate</span>
                      <HelpCircle size={12} style={{ color: 'var(--text-muted)' }} />
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input 
                        type="number"
                        min="0.5" 
                        max="50.0" 
                        step="0.1"
                        value={simFreeToPaidConv === 0 ? '' : simFreeToPaidConv}
                        onChange={(e) => setSimValue('freeToPaidConv', e.target.value === '' ? '' : parseFloat(e.target.value))}
                        onBlur={(e) => {
                          let val = parseFloat(e.target.value) || 0.5;
                          val = Math.max(0.5, Math.min(50.0, val));
                          setSimValue('freeToPaidConv', Number(val.toFixed(1)));
                        }}
                        style={{
                          width: '65px',
                          padding: '0.15rem 0.35rem',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          textAlign: 'right',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                          boxShadow: 'var(--shadow-inset)'
                        }}
                      />
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-primary)' }}>%</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="50.0" 
                    step="0.5"
                    value={simFreeToPaidConvNum} 
                    onChange={(e) => setSimValue('freeToPaidConv', parseFloat(e.target.value))}
                    className="range-input" 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    <span>0.5%</span>
                    <span>50.0%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Section: Pricing & Churn */}
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)', borderBottom: '1px dashed var(--border-color)', pb: '0.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <span>3. Product Economics & Churn</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Price */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="tooltip-container" data-tooltip="Monthly subscription fee charged per active paid user license." style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Subscription Price / Month</span>
                      <HelpCircle size={12} style={{ color: 'var(--text-muted)' }} />
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>$</span>
                      <input 
                        type="number"
                        min="5" 
                        max="500" 
                        step="1"
                        value={simPrice === 0 ? '' : simPrice}
                        onChange={(e) => setSimValue('price', e.target.value === '' ? '' : parseInt(e.target.value))}
                        onBlur={(e) => {
                          let val = parseInt(e.target.value) || 5;
                          val = Math.max(5, Math.min(500, val));
                          setSimValue('price', val);
                        }}
                        style={{
                          width: '60px',
                          padding: '0.15rem 0.35rem',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          textAlign: 'right',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                          boxShadow: 'var(--shadow-inset)'
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '0.2rem' }}>/mo</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="500" 
                    step="5"
                    value={simPriceNum} 
                    onChange={(e) => setSimValue('price', parseInt(e.target.value))}
                    className="range-input" 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    <span>$5</span>
                    <span>$500/mo</span>
                  </div>
                </div>

                {/* Churn Rate */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="tooltip-container" data-tooltip="Percentage of active paid customers who cancel their subscription each month." style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Monthly Customer Churn Rate</span>
                      <HelpCircle size={12} style={{ color: 'var(--text-muted)' }} />
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input 
                        type="number"
                        min="0.5" 
                        max="30.0" 
                        step="0.1"
                        value={simChurn === 0 ? '' : simChurn}
                        onChange={(e) => setSimValue('churn', e.target.value === '' ? '' : parseFloat(e.target.value))}
                        onBlur={(e) => {
                          let val = parseFloat(e.target.value) || 0.5;
                          val = Math.max(0.5, Math.min(30.0, val));
                          setSimValue('churn', Number(val.toFixed(1)));
                        }}
                        style={{
                          width: '60px',
                          padding: '0.15rem 0.35rem',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          textAlign: 'right',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                          boxShadow: 'var(--shadow-inset)'
                        }}
                      />
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-primary)' }}>%</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="30.0" 
                    step="0.1"
                    value={simChurnNum} 
                    onChange={(e) => setSimValue('churn', parseFloat(e.target.value))}
                    className="range-input" 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    <span>0.5%</span>
                    <span>30.0%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Outputs & Funnel System */}
        <div className="simulator-card-panel">
          
          {/* Prominent KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* KPI 1 */}
            <div className="detail-card" style={{ margin: 0, padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <span className="tooltip-container" data-tooltip="Customer Lifetime Value divided by Customer Acquisition Cost. A ratio of 3.0x or higher indicates a healthy business model." style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                <span>LTV : CAQ Ratio</span>
                <HelpCircle size={10} style={{ color: 'var(--text-muted)' }} />
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: getLtvCaqColor(ltvCaqRatio) }}>
                {ltvCaqRatio.toFixed(2)}x
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getLtvCaqColor(ltvCaqRatio), marginTop: '0.25rem', backgroundColor: `${getLtvCaqColor(ltvCaqRatio)}15`, padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                {getLtvCaqStatus(ltvCaqRatio)}
              </span>
            </div>

            {/* KPI 2 */}
            <div className="detail-card" style={{ margin: 0, padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <span className="tooltip-container" data-tooltip="Projected increase in lifetime subscription revenue compared to the baseline configuration." style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                <span>Lifetime Revenue Added</span>
                <HelpCircle size={10} style={{ color: 'var(--text-muted)' }} />
              </span>
              <div style={{ 
                fontSize: '1.75rem', 
                fontWeight: 800, 
                color: lifetimeRevenueAdded > 0 ? 'var(--color-success)' : (lifetimeRevenueAdded < 0 ? 'var(--color-danger)' : 'var(--text-secondary)') 
              }}>
                {lifetimeRevenueAdded > 0 ? '+' : ''}${Math.round(lifetimeRevenueAdded).toLocaleString()}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                MRR Added: {mrrAdded > 0 ? '+' : ''}${Math.round(mrrAdded).toLocaleString()}/mo
              </span>
            </div>

            {/* KPI 3 */}
            <div className="detail-card" style={{ margin: 0, padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <span className="tooltip-container" data-tooltip="The difference in monthly marketing spend (Traffic * CPC) between simulated traffic and the baseline setup." style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                <span>Marketing Budget Added</span>
                <HelpCircle size={10} style={{ color: 'var(--text-muted)' }} />
              </span>
              <div style={{ 
                fontSize: '1.75rem', 
                fontWeight: 800, 
                color: budgetAdded > 0 ? 'var(--color-danger)' : (budgetAdded < 0 ? 'var(--color-success)' : 'var(--text-secondary)') 
              }}>
                {budgetAdded > 0 ? '+' : ''}${Math.round(budgetAdded).toLocaleString()}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Total: ${Math.round(currentBudget).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="detail-card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
            <h3 className="detail-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <TrendingUp size={16} color="var(--color-primary)" />
              Conversion Funnel Visualization
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.25rem 0' }}>
              <svg viewBox="0 0 520 270" style={{ width: '100%', height: 'auto', maxWidth: '560px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.08))', transition: 'all 0.3s ease-out' }}>
                <defs>
                  <linearGradient id="funnel-top-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#818cf8"/>
                    <stop offset="100%" stopColor="#6366f1"/>
                  </linearGradient>
                  <linearGradient id="funnel-mid-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#a78bfa"/>
                    <stop offset="100%" stopColor="#8b5cf6"/>
                  </linearGradient>
                  <linearGradient id="funnel-bot-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#34d399"/>
                    <stop offset="100%" stopColor="#10b981"/>
                  </linearGradient>
                </defs>

                {/* Left Side Labels (High-contrast, fully visible) */}
                <text x="130" y="49" textAnchor="end" fill="var(--text-secondary)" fontSize="10" fontWeight="800" style={{ letterSpacing: '0.05em' }}>
                  PAID TRAFFIC
                </text>
                <text x="130" y="134" textAnchor="end" fill="var(--text-secondary)" fontSize="10" fontWeight="800" style={{ letterSpacing: '0.05em' }}>
                  INTERESTED
                </text>
                <text x="130" y="219" textAnchor="end" fill="var(--text-secondary)" fontSize="10" fontWeight="800" style={{ letterSpacing: '0.05em' }}>
                  CONVERTED
                </text>

                {/* Dotted Connecting Guide Lines (Dynamic length matching polygon left edge) */}
                <line x1="140" y1="45" x2={330 - trafficWidth / 2 - 8} y2="45" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                <line x1="140" y1="130" x2={330 - signupWidth / 2 - 8} y2="130" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                <line x1="140" y1="215" x2={330 - paidWidth / 2 - 8} y2="215" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />

                {/* Layer 1: Traffic (Centered at X=330, Taller) */}
                <polygon 
                  points={`${330 - trafficWidth / 2},10 ${330 + trafficWidth / 2},10 ${330 + signupWidth / 2},80 ${330 - signupWidth / 2},80`} 
                  fill="url(#funnel-top-grad)" 
                  opacity="0.95"
                  style={{ transition: 'points 0.3s ease-out' }}
                />

                {/* Transition 1 */}
                <line x1="330" y1="80" x2="330" y2="95" stroke="var(--text-secondary)" strokeWidth="1.5" strokeDasharray="2,2" />
                <rect x="285" y="77" width="90" height="16" fill="white" rx="3" stroke="var(--border-color)" strokeWidth="1" />
                <text x="330" y="88" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="700">
                  {simSignupConv}% Signup
                </text>

                {/* Layer 2: Interested (Centered at X=330, Taller) */}
                <polygon 
                  points={`${330 - signupWidth / 2},95 ${330 + signupWidth / 2},95 ${330 + paidWidth / 2},165 ${330 - paidWidth / 2},165`} 
                  fill="url(#funnel-mid-grad)" 
                  opacity="0.95"
                  style={{ transition: 'points 0.3s ease-out' }}
                />

                {/* Transition 2 */}
                <line x1="330" y1="165" x2="330" y2="180" stroke="var(--text-secondary)" strokeWidth="1.5" strokeDasharray="2,2" />
                <rect x="260" y="162" width="140" height="16" fill="white" rx="3" stroke="var(--border-color)" strokeWidth="1" />
                <text x="330" y="173" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="700">
                  {simFreeToPaidConv}% Free-to-Paid
                </text>

                {/* Layer 3: Converted (Centered at X=330, Taller) */}
                <polygon 
                  points={`${330 - paidWidth / 2},180 ${330 + paidWidth / 2},180 ${330 + bottomWidth / 2},250 ${330 - bottomWidth / 2},250`} 
                  fill="url(#funnel-bot-grad)" 
                  opacity="0.95"
                  style={{ transition: 'points 0.3s ease-out' }}
                />
              </svg>
            </div>
          </div>

          {/* Detailed Calculations Table */}
          <div className="detail-card" style={{ marginBottom: 0, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={16} color="var(--color-primary)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Unit Economics Ledger</span>
            </div>
            
            <div className="table-container">
              <table className="products-table" style={{ margin: 0, width: '100%' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '0.75rem 1.25rem' }}>Model Variable</th>
                    <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Formula / Definition</th>
                    <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Projected Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.75rem 1.25rem' }}>Monthly Ad Spend</td>
                    <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Traffic × CPC</td>
                    <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right', fontWeight: 700 }}>
                      ${Math.round(simTraffic * simCpc).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 1.25rem' }}>New Paid Subscriptions</td>
                    <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Traffic × Signup% × FreeToPaid%</td>
                    <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right', fontWeight: 700 }}>
                      {paidCount.toLocaleString()} users
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 1.25rem' }}>Customer Acquisition Cost (CAQ)</td>
                    <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total Spend / New Paid Subs</td>
                    <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right', fontWeight: 700 }}>
                      ${Math.round(caq).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 1.25rem' }}>Customer Lifetime Value (LTV)</td>
                    <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Monthly Price / Churn Rate</td>
                    <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right', fontWeight: 700 }}>
                      ${Math.round(ltv).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 1.25rem' }}>Projected MRR Upgrade Value</td>
                    <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Incremental MRR vs. Baseline</td>
                    <td style={{ 
                      padding: '0.75rem 1.25rem', 
                      textAlign: 'right', 
                      fontWeight: 700, 
                      color: mrrAdded > 0 ? 'var(--color-success)' : (mrrAdded < 0 ? 'var(--color-danger)' : 'var(--text-secondary)') 
                    }}>
                      {mrrAdded > 0 ? '+' : ''}${Math.round(mrrAdded).toLocaleString()}/mo
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 1.25rem' }}>Projected Lifetime Revenue Added</td>
                    <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Incremental Lifetime Value vs. Baseline</td>
                    <td style={{ 
                      padding: '0.75rem 1.25rem', 
                      textAlign: 'right', 
                      fontWeight: 700, 
                      color: lifetimeRevenueAdded > 0 ? 'var(--color-success)' : (lifetimeRevenueAdded < 0 ? 'var(--color-danger)' : 'var(--text-secondary)') 
                    }}>
                      {lifetimeRevenueAdded > 0 ? '+' : ''}${Math.round(lifetimeRevenueAdded).toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: 'none' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, borderBottom: 'none' }}>LTV to CAQ Ratio</td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem', borderBottom: 'none' }}>LTV / CAQ</td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: 700, borderBottom: 'none', color: getLtvCaqColor(ltvCaqRatio) }}>
                      {ltvCaqRatio.toFixed(2)}x
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
