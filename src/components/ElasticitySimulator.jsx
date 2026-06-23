import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Calculator, 
  HelpCircle, 
  RefreshCw, 
  DollarSign, 
  Target, 
  TrendingUp, 
  Info,
  Users,
  Percent,
  Trash2,
  Plus
} from 'lucide-react';

export default function ElasticitySimulator({ suiteId, database, onBack, onSuiteChange }) {
  const { suites, products } = database;
  const suite = suites.find(s => s.id === suiteId);
  const suiteProducts = products.filter(p => p.suiteId === suiteId);

  const getAvgSuitePrice = () => {
    if (!suiteProducts || suiteProducts.length === 0) return 40;
    return Math.round(suiteProducts.reduce((sum, p) => sum + p.price, 0) / suiteProducts.length);
  };

  const getAvgSuiteVolume = () => {
    if (!suiteProducts || suiteProducts.length === 0) return 100;
    return Math.round(suiteProducts.reduce((sum, p) => sum + p.weeklyVolume, 0) / suiteProducts.length);
  };

  const getInitialSimState = (prodId) => {
    if (prodId === 'all') {
      const avgPrice = getAvgSuitePrice();
      const avgVolume = getAvgSuiteVolume();
      return {
        price: avgPrice,
        elasticity: -1.2,
        churnSensitivity: 0.4,
        mode: 'formula',
        customPoints: [
          { price: Math.round(0.5 * avgPrice), volume: Math.round(1.5 * avgVolume) },
          { price: Math.round(0.75 * avgPrice), volume: Math.round(1.25 * avgVolume) },
          { price: avgPrice, volume: avgVolume },
          { price: Math.round(1.25 * avgPrice), volume: Math.round(0.85 * avgVolume) },
          { price: Math.round(1.5 * avgPrice), volume: Math.round(0.9 * avgVolume) },
          { price: Math.round(1.75 * avgPrice), volume: Math.round(0.5 * avgVolume) },
          { price: Math.round(2.0 * avgPrice), volume: Math.round(0.3 * avgVolume) }
        ]
      };
    }
    
    const prod = suiteProducts.find(p => p.id === prodId);
    if (!prod) {
      return { 
        price: 40, 
        elasticity: -1.2, 
        churnSensitivity: 0.4,
        mode: 'formula',
        customPoints: [
          { price: 20, volume: 150 },
          { price: 30, volume: 125 },
          { price: 40, volume: 100 },
          { price: 50, volume: 85 },
          { price: 60, volume: 90 },
          { price: 70, volume: 50 },
          { price: 80, volume: 30 }
        ]
      };
    }

    // Assign defaults based on product tiers
    let elasticity = -1.2;
    if (prod.tier === 'good') {
      elasticity = -1.8; // entry level tier is highly price sensitive
    } else if (prod.tier === 'better') {
      elasticity = -1.2; // mid tier is moderately sensitive
    } else if (prod.tier === 'best') {
      elasticity = -0.7; // high premium tier is inelastic
    }

    return {
      price: prod.price,
      elasticity,
      churnSensitivity: 0.4,
      mode: 'formula',
      customPoints: [
        { price: Math.round(0.5 * prod.price), volume: Math.round(1.5 * prod.weeklyVolume) },
        { price: Math.round(0.75 * prod.price), volume: Math.round(1.25 * prod.weeklyVolume) },
        { price: prod.price, volume: prod.weeklyVolume },
        { price: Math.round(1.25 * prod.price), volume: Math.round(0.85 * prod.weeklyVolume) },
        { price: Math.round(1.5 * prod.price), volume: Math.round(0.9 * prod.weeklyVolume) },
        { price: Math.round(1.75 * prod.price), volume: Math.round(0.5 * prod.weeklyVolume) },
        { price: Math.round(2.0 * prod.price), volume: Math.round(0.3 * prod.weeklyVolume) }
      ]
    };
  };

  // States
  const defaultProdId = suiteProducts && suiteProducts.length > 0 ? suiteProducts[0].id : '';
  const [selectedSimProduct, setSelectedSimProduct] = useState(defaultProdId);
  const [simValuesMap, setSimValuesMap] = useState({
    [defaultProdId]: getInitialSimState(defaultProdId)
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null); // 'price' | 'elasticity' | 'custom-point' | null
  const [draggedPointIdx, setDraggedPointIdx] = useState(null);
  const svgRef = useRef(null);

  // States for adding custom price points
  const [newPointPrice, setNewPointPrice] = useState('');
  const [newPointVolume, setNewPointVolume] = useState('');

  // Get active values
  const currentSimValues = simValuesMap[selectedSimProduct] || getInitialSimState(selectedSimProduct);
  const simPrice = currentSimValues.price;
  const simElasticity = currentSimValues.elasticity;
  const simChurnSensitivity = currentSimValues.churnSensitivity;
  const currentMode = currentSimValues.mode || 'formula';

  // Baseline values based on selection
  let baselinePrice = 40;
  let baselineVolume = 100;
  let baselineChurn = 5.0;

  if (selectedSimProduct === 'all') {
    baselinePrice = getAvgSuitePrice();
    baselineVolume = getAvgSuiteVolume();
    baselineChurn = 5.4; // Average baseline churn
  } else {
    const prod = suiteProducts.find(p => p.id === selectedSimProduct);
    if (prod) {
      baselinePrice = prod.price;
      baselineVolume = prod.weeklyVolume;
      // Derived baseline churn or standard default
      baselineChurn = prod.tier === 'good' ? 6.2 : (prod.tier === 'better' ? 5.0 : 3.8);
    }
  }

  // Safe numerical parses
  const simPriceNum = Number(simPrice) || 0;
  const simElasticityNum = Number(simElasticity) || -1.2;
  const simChurnSensitivityNum = Number(simChurnSensitivity) || 0;

  // Formula Calculations
  const minPrice = 0.5 * baselinePrice;
  const maxPrice = 2.0 * baselinePrice;
  const peakVolume = baselineVolume * Math.pow(0.5, simElasticityNum);

  // Dynamic max custom volume for scaling
  const maxCustomVol = currentMode === 'custom' && currentSimValues.customPoints && currentSimValues.customPoints.length > 0
    ? Math.max(...currentSimValues.customPoints.map(pt => pt.volume))
    : 0;
  const maxChartVol = Math.max(
    2.0 * baselineVolume, 
    currentMode === 'custom' ? maxCustomVol * 1.15 : peakVolume * 1.05
  );

  // Helper function for linear interpolation of custom curve points
  const getInterpolatedVolume = (pVal) => {
    const points = currentSimValues.customPoints || [];
    if (points.length === 0) return baselineVolume;
    
    // Sort points by price to ensure correct segment search
    const sorted = [...points].sort((a, b) => a.price - b.price);
    
    if (pVal <= sorted[0].price) {
      return sorted[0].volume;
    }
    
    if (pVal >= sorted[sorted.length - 1].price) {
      return sorted[sorted.length - 1].volume;
    }
    
    // Interpolate within segments
    for (let i = 0; i < sorted.length - 1; i++) {
      const pA = sorted[i].price;
      const vA = sorted[i].volume;
      const pB = sorted[i + 1].price;
      const vB = sorted[i + 1].volume;
      
      if (pVal >= pA && pVal <= pB) {
        if (pB === pA) return vA;
        return vA + ((pVal - pA) / (pB - pA)) * (vB - vA);
      }
    }
    
    return baselineVolume;
  };

  // 1. Demand License Volume: Formula-based or Piecewise Linear custom interpolation
  const priceRatio = baselinePrice > 0 ? (simPriceNum / baselinePrice) : 1;
  const simulatedVolume = currentMode === 'custom'
    ? getInterpolatedVolume(simPriceNum)
    : baselineVolume * Math.pow(priceRatio, simElasticityNum);
  const volumeDelta = simulatedVolume - baselineVolume;

  // 2. Churn Sensitivity
  const priceChangeFraction = baselinePrice > 0 ? Math.max(0, (simPriceNum - baselinePrice) / baselinePrice) : 0;
  const simulatedChurn = Math.max(0.5, Math.min(50.0, baselineChurn * (1 + simChurnSensitivityNum * Math.pow(priceChangeFraction, 2))));
  const churnDelta = simulatedChurn - baselineChurn;

  // 3. Revenues
  const baselineMrr = baselineVolume * baselinePrice;
  const simulatedMrr = simulatedVolume * simPriceNum;
  const mrrAdded = simulatedMrr - baselineMrr;

  // 4. Lifetime Values
  const baselineLtv = baselineChurn > 0 ? baselinePrice / (baselineChurn / 100) : 0;
  const simulatedLtv = simulatedChurn > 0 ? simPriceNum / (simulatedChurn / 100) : 0;
  const simulatedLifetimeRevenue = simulatedVolume * simulatedLtv;
  const baselineLifetimeRevenue = baselineVolume * baselineLtv;
  const lifetimeRevenueAdded = simulatedLifetimeRevenue - baselineLifetimeRevenue;

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

  const handleOptimize = () => {
    console.log('handleOptimize triggered (Maximize Lifetime Revenue)');
    
    const minPriceVal = Math.round(0.5 * baselinePrice);
    const maxPriceVal = Math.round(2.0 * baselinePrice);
    
    let bestPrice = baselinePrice;
    let maxLtvRevenue = -Infinity;
    
    for (let p = minPriceVal; p <= maxPriceVal; p++) {
      const vol = currentMode === 'custom'
        ? getInterpolatedVolume(p)
        : baselineVolume * Math.pow(p / baselinePrice, simElasticityNum);
      const priceChangeFraction = baselinePrice > 0 ? Math.max(0, (p - baselinePrice) / baselinePrice) : 0;
      const churn = Math.max(0.5, Math.min(50.0, baselineChurn * (1 + simChurnSensitivityNum * Math.pow(priceChangeFraction, 2))));
      const ltvVal = churn > 0 ? p / (churn / 100) : 0;
      const lifetimeRevenue = vol * ltvVal;
      
      if (lifetimeRevenue > maxLtvRevenue) {
        maxLtvRevenue = lifetimeRevenue;
        bestPrice = p;
      }
    }
    
    console.log('Calculated bestPrice:', bestPrice);
    setSimValue('price', bestPrice);
  };

  const handleAddPoint = () => {
    const priceVal = parseInt(newPointPrice);
    const volumeVal = parseInt(newPointVolume);
    
    if (isNaN(priceVal) || isNaN(volumeVal)) {
      alert('Please enter valid integer values for Price and Volume.');
      return;
    }
    
    if (priceVal < minPrice || priceVal > maxPrice) {
      alert(`Price must be between $${minPrice} and $${maxPrice} (bounds of the chart).`);
      return;
    }
    
    const currentPoints = currentSimValues.customPoints || [];
    if (currentPoints.some(pt => pt.price === priceVal)) {
      alert('A price test point already exists for this price. Delete it first to re-add.');
      return;
    }
    
    const updatedPoints = [...currentPoints, { price: priceVal, volume: volumeVal }].sort((a, b) => a.price - b.price);
    setSimValue('customPoints', updatedPoints);
    setNewPointPrice('');
    setNewPointVolume('');
  };

  const handleDeletePoint = (priceToDelete) => {
    const currentPoints = currentSimValues.customPoints || [];
    const updatedPoints = currentPoints.filter(pt => pt.price !== priceToDelete);
    setSimValue('customPoints', updatedPoints);
  };

  // Dragging interaction for the SVG chart
  const handleStartDrag = (e, mode, pointIdx = null) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragMode(mode);
    if (mode === 'custom-point') {
      setDraggedPointIdx(pointIdx);
    }
    handleDragMove(e, mode, pointIdx);
  };

  const handleDragMove = (e, mode, pointIdx = null) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Relative mouse positions in SVG viewBox units (600x250)
    const mouseX = ((e.clientX - rect.left) / width) * 600;
    const mouseY = ((e.clientY - rect.top) / height) * 250;

    // Calculate Price from mouseX
    let draggedPrice = minPrice + ((mouseX - 70) / 460) * (maxPrice - minPrice);
    draggedPrice = Math.max(minPrice, Math.min(maxPrice, draggedPrice));

    if (mode === 'price') {
      // Dragging the price point ONLY changes the price. The elasticity (and thus the curve itself) remains completely static.
      setSimValue('price', Number(draggedPrice.toFixed(2)));
    } else if (mode === 'elasticity') {
      if (currentMode === 'custom') return;
      // Dragging the curve up/down changes the elasticity directly.
      // Top of chart (y=30) maps to inelastic (-0.1), bottom (y=220) maps to elastic (-3.0).
      let pct = (220 - mouseY) / 190;
      pct = Math.max(0, Math.min(1, pct));
      
      let calculatedElasticity = -3.0 + pct * 2.9; // Scale from -3.0 to -0.1
      
      setSimValuesMap(prev => {
        const current = prev[selectedSimProduct] || getInitialSimState(selectedSimProduct);
        return {
          ...prev,
          [selectedSimProduct]: {
            ...current,
            elasticity: Number(calculatedElasticity.toFixed(2))
          }
        };
      });
    } else if (mode === 'custom-point') {
      const idx = pointIdx !== null ? pointIdx : draggedPointIdx;
      if (idx === null || idx === undefined) return;

      setSimValuesMap(prev => {
        const current = prev[selectedSimProduct] || getInitialSimState(selectedSimProduct);
        const currentPoints = [...(current.customPoints || [])];
        
        if (idx >= 0 && idx < currentPoints.length) {
          // Boundary prices to keep order stable and prevent points from crossing
          const prevPrice = idx > 0 ? currentPoints[idx - 1].price : minPrice;
          const nextPrice = idx < currentPoints.length - 1 ? currentPoints[idx + 1].price : maxPrice;
          
          let constrainedPrice = Math.round(draggedPrice);
          const lowerBound = idx > 0 ? prevPrice + 1 : minPrice;
          const upperBound = idx < currentPoints.length - 1 ? nextPrice - 1 : maxPrice;
          constrainedPrice = Math.max(lowerBound, Math.min(upperBound, constrainedPrice));

          // Calculate and constrain volume based on vertical mouse position
          let draggedVol = ((220 - mouseY) / 190) * maxChartVol;
          draggedVol = Math.max(0, Math.min(maxChartVol, draggedVol));
          const constrainedVol = Math.round(draggedVol);

          currentPoints[idx] = {
            price: constrainedPrice,
            volume: constrainedVol
          };
        }

        return {
          ...prev,
          [selectedSimProduct]: {
            ...current,
            customPoints: currentPoints
          }
        };
      });
    }
  };

  const handleSvgMouseMove = (e) => {
    if (!isDragging || !dragMode) return;
    handleDragMove(e, dragMode);
  };

  const handleSvgMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
    setDraggedPointIdx(null);
  };

  // Generate SVG path for the constant elasticity curve
  const getCurvePathD = () => {
    let points = [];
    
    if (currentMode === 'custom') {
      const sortedPoints = [...(currentSimValues.customPoints || [])].sort((a, b) => a.price - b.price);
      sortedPoints.forEach(pt => {
        const x = 70 + ((pt.price - minPrice) / (maxPrice - minPrice)) * 460;
        const y = 220 - (pt.volume / maxChartVol) * 190;
        points.push(`${x},${y}`);
      });
    } else {
      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const p = minPrice + (i / steps) * (maxPrice - minPrice);
        const q = baselineVolume * Math.pow(p / baselinePrice, simElasticityNum);
        const x = 70 + ((p - minPrice) / (maxPrice - minPrice)) * 460;
        const y = 220 - (q / maxChartVol) * 190;
        if (y >= 10 && y <= 240) {
          points.push(`${x},${y}`);
        }
      }
    }
    
    return points.length > 0 ? `M ${points.join(' L ')}` : '';
  };

  // Map simulated state to chart dot
  const dotX = 70 + ((simPriceNum - minPrice) / (maxPrice - minPrice)) * 460;
  const dotY = 220 - (simulatedVolume / maxChartVol) * 190;

  if (!suite) {
    return (
      <div style={{ padding: '2rem' }}>
        <button className="btn btn-secondary" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <p style={{ marginTop: '2rem' }}>Product suite not found.</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }} onMouseUp={handleSvgMouseUp} onMouseLeave={handleSvgMouseUp}>
      {/* Breadcrumbs */}
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
            <h1 className="page-title" style={{ margin: 0 }}>Pricing & Elasticity Simulator</h1>
          </div>
          <p className="page-subtitle" style={{ marginTop: '0.25rem' }}>
            Model pricing optimization and customer churn sensitivity using price elasticity curves for <strong>{suite?.name || 'Cybersecurity'}</strong>.
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
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Select Product Tier to Model:</label>
                <select 
                  className="form-control" 
                  style={{ padding: '0.5rem', fontSize: '0.9rem', width: '100%', marginTop: '0.25rem' }}
                  value={selectedSimProduct}
                  onChange={(e) => handleSimProductChange(e.target.value)}
                >
                  {suiteProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (${p.price}/mo - {p.tier.toUpperCase()} tier)</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Curve Mode Switcher */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.75rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Price chart type:</label>
              <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                <button
                  onClick={() => setSimValue('mode', 'formula')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    backgroundColor: currentMode === 'formula' ? 'var(--color-primary)' : 'white',
                    color: currentMode === 'formula' ? 'white' : 'var(--text-secondary)',
                    textAlign: 'center',
                    border: 'none',
                    borderRadius: 0,
                  }}
                >
                  Elasticity coefficient
                </button>
                <button
                  onClick={() => setSimValue('mode', 'custom')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    backgroundColor: currentMode === 'custom' ? 'var(--color-primary)' : 'white',
                    color: currentMode === 'custom' ? 'white' : 'var(--text-secondary)',
                    textAlign: 'center',
                    border: 'none',
                    borderRadius: 0,
                  }}
                >
                  Custom elasticity
                </button>
              </div>
            </div>

            {/* Slider Section: Price Adjustment */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)', borderBottom: '1px dashed var(--border-color)', pb: '0.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <span>1. Subscription Pricing</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Price Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="tooltip-container" data-tooltip="Proposed monthly subscription price to model elasticity and churn impact." style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Subscription Price</span>
                      <HelpCircle size={12} style={{ color: 'var(--text-muted)' }} />
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>$</span>
                      <input 
                        type="number"
                        min={Math.round(0.5 * baselinePrice)} 
                        max={Math.round(2.0 * baselinePrice)} 
                        step="1"
                        value={simPrice === 0 ? '' : simPrice}
                        onChange={(e) => setSimValue('price', e.target.value === '' ? '' : parseInt(e.target.value))}
                        onBlur={(e) => {
                          let val = parseInt(e.target.value) || Math.round(0.5 * baselinePrice);
                          val = Math.max(Math.round(0.5 * baselinePrice), Math.min(Math.round(2.0 * baselinePrice), val));
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
                    min={Math.round(0.5 * baselinePrice)} 
                    max={Math.round(2.0 * baselinePrice)} 
                    step="1"
                    value={simPriceNum} 
                    onChange={(e) => setSimValue('price', parseInt(e.target.value))}
                    className="range-input" 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    <span>Min: ${Math.round(0.5 * baselinePrice)}/mo</span>
                    <span>Baseline: ${baselinePrice}/mo</span>
                    <span>Max: ${Math.round(2.0 * baselinePrice)}/mo</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.25rem' }}>
                    <button 
                      onClick={handleOptimize}
                      className="btn btn-primary"
                      style={{
                        padding: '0.45rem 1rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-success)',
                        borderColor: 'var(--color-success)',
                        color: 'white',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      <Calculator size={14} />
                      Find Optimal Price
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {currentMode === 'formula' ? (
              /* Slider Section: Elasticity Curves */
              <div style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)', borderBottom: '1px dashed var(--border-color)', pb: '0.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <span>2. Price Elasticity of Demand</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Elasticity Coefficient */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span className="tooltip-container" data-tooltip="Price elasticity of demand (ε). A negative scaling factor representing how demand volume changes in response to price changes." style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Elasticity Coefficient (ε)</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textAlign: 'left' }}>Negative value (higher is more sensitive)</span>
                        </div>
                        <HelpCircle size={12} style={{ color: 'var(--text-muted)' }} />
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input 
                          type="number"
                          min="-3.0" 
                          max="-0.1" 
                          step="0.05"
                          value={simElasticity === 0 ? '' : simElasticity}
                          onChange={(e) => setSimValue('elasticity', e.target.value === '' ? '' : parseFloat(e.target.value))}
                          onBlur={(e) => {
                            let val = parseFloat(e.target.value) || -1.2;
                            val = Math.max(-3.0, Math.min(-0.1, val));
                            setSimValue('elasticity', Number(val.toFixed(2)));
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
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="-3.0" 
                      max="-0.1" 
                      step="0.05"
                      value={simElasticityNum} 
                      onChange={(e) => setSimValue('elasticity', parseFloat(e.target.value))}
                      className="range-input" 
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      <span>Highly Elastic (-3.0)</span>
                      <span>Inelastic (-0.1)</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Custom Price Test Points Editor */
              <div style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)', borderBottom: '1px dashed var(--border-color)', pb: '0.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <span>2. Custom Price Test Points</span>
                </h4>
                
                {/* Form to add a new point */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'flex-end', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Price ($):</label>
                    <input 
                      type="number"
                      placeholder={`$${Math.round(minPrice)} - $${Math.round(maxPrice)}`}
                      className="form-control"
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', width: '100%', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                      value={newPointPrice}
                      onChange={(e) => setNewPointPrice(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Volume (Licenses):</label>
                    <input 
                      type="number"
                      placeholder="e.g. 120"
                      className="form-control"
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', width: '100%', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                      value={newPointVolume}
                      onChange={(e) => setNewPointVolume(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleAddPoint}
                    className="btn btn-secondary"
                    style={{ 
                      padding: '0.4rem 0.75rem', 
                      fontSize: '0.85rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem', 
                      backgroundColor: 'var(--color-primary-light)', 
                      borderColor: 'var(--color-primary-border)',
                      color: 'var(--color-primary)',
                      fontWeight: '700',
                      borderRadius: '6px'
                    }}
                  >
                    <Plus size={14} />
                    Add
                  </button>
                </div>

                {/* Points Table List */}
                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '0.5rem' }}>Price ($)</th>
                        <th style={{ padding: '0.5rem' }}>Volume</th>
                        <th style={{ padding: '0.5rem' }}>MRR</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(currentSimValues.customPoints || []).length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No test points defined yet.</td>
                        </tr>
                      ) : (
                        [...(currentSimValues.customPoints || [])]
                          .sort((a, b) => a.price - b.price)
                          .map((pt) => (
                            <tr key={pt.price} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '0.5rem', fontWeight: 700 }}>${pt.price}</td>
                              <td style={{ padding: '0.5rem' }}>{pt.volume}</td>
                              <td style={{ padding: '0.5rem' }}>${(pt.price * pt.volume).toLocaleString()}</td>
                              <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                <button 
                                  onClick={() => handleDeletePoint(pt.price)}
                                  style={{ color: 'var(--color-danger)', border: 'none', background: 'none', padding: '0.15rem 0.35rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                  title="Delete point"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
                { (currentSimValues.customPoints || []).length < 2 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--color-danger)', fontWeight: 600 }}>
                    ⚠️ Plotting requires at least 2 points.
                  </div>
                )}
              </div>
            )}

            {/* Slider Section: Churn Sensitivity */}
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)', borderBottom: '1px dashed var(--border-color)', pb: '0.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <span>3. Churn Price Sensitivity</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Churn Sensitivity Coefficient */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="tooltip-container" data-tooltip="Customer churn price sensitivity coefficient (γ). Scaling factor for churn rate penalty when price is raised above baseline." style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Churn Sensitivity (γ)</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textAlign: 'left' }}>Scaling factor for price-driven churn</span>
                      </div>
                      <HelpCircle size={12} style={{ color: 'var(--text-muted)' }} />
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input 
                        type="number"
                        min="0.0" 
                        max="3.0" 
                        step="0.1"
                        value={simChurnSensitivity}
                        onChange={(e) => setSimValue('churnSensitivity', e.target.value === '' ? '' : parseFloat(e.target.value))}
                        onBlur={(e) => {
                          let val = parseFloat(e.target.value) || 0.0;
                          val = Math.max(0.0, Math.min(3.0, val));
                          setSimValue('churnSensitivity', Number(val.toFixed(1)));
                        }}
                        style={{
                          width: '55px',
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
                    min="0.0" 
                    max="3.0" 
                    step="0.1"
                    value={simChurnSensitivityNum} 
                    onChange={(e) => setSimValue('churnSensitivity', parseFloat(e.target.value))}
                    className="range-input" 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    <span>Insensitive (0.0)</span>
                    <span>High Churn Penalty (3.0)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Outputs & Interactive Elasticity Curve */}
        <div className="simulator-card-panel">
          
          {/* Prominent KPI Row (MRR Added, Volumes, Churn) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '0.25rem' }}>
            
            {/* KPI 1: Lifetime Revenue Added */}
            <div className="detail-card" style={{ margin: 0, padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <span className="tooltip-container" data-tooltip="Projected lifetime revenue added factoring in both volume changes (elasticity) and churn rate adjustments." style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
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

            {/* KPI 2: Volumes */}
            <div className="detail-card" style={{ margin: 0, padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <span className="tooltip-container" data-tooltip="Projected number of customer licenses active under the target price." style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                <span>Active Volume</span>
                <HelpCircle size={10} style={{ color: 'var(--text-muted)' }} />
              </span>
              <div style={{ 
                fontSize: '1.75rem', 
                fontWeight: 800, 
                color: volumeDelta > 0 ? 'var(--color-success)' : (volumeDelta < 0 ? 'var(--color-danger)' : 'var(--text-secondary)') 
              }}>
                {volumeDelta > 0 ? '+' : ''}{Math.round(volumeDelta).toLocaleString()}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Total: {Math.round(simulatedVolume).toLocaleString()} licenses
              </span>
            </div>

            {/* KPI 3: Churn */}
            <div className="detail-card" style={{ margin: 0, padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <span className="tooltip-container" data-tooltip="Projected monthly customer churn rate resulting from price adjustments." style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                <span>Projected Churn</span>
                <HelpCircle size={10} style={{ color: 'var(--text-muted)' }} />
              </span>
              <div style={{ 
                fontSize: '1.75rem', 
                fontWeight: 800, 
                color: churnDelta > 0 ? 'var(--color-danger)' : (churnDelta < 0 ? 'var(--color-success)' : 'var(--text-secondary)') 
              }}>
                {simulatedChurn.toFixed(1)}%
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Delta: {churnDelta >= 0 ? '+' : ''}{churnDelta.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Interactive Elasticity Demand Curve Chart */}
          <div className="detail-card" style={{ marginBottom: '0.25rem', padding: '1.25rem 1.5rem' }}>
            <h3 className="detail-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              <TrendingUp size={16} color="var(--color-primary)" />
              Interactive Demand Curve (Price vs. Quantity)
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>
              Drag the green handle **left/right** to adjust target price, or **up/down** to change elasticity directly on the curve.
            </span>
                       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0.25rem 0' }}>
              <svg 
                ref={svgRef}
                viewBox="0 0 600 250" 
                style={{ width: '100%', height: 'auto', maxWidth: '580px', backgroundColor: '#fcfdfe', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: isDragging ? (dragMode === 'price' ? 'ew-resize' : (dragMode === 'custom-point' ? 'move' : 'ns-resize')) : 'default', userSelect: 'none' }}
                onMouseMove={handleSvgMouseMove}
              >
                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
                  const y = 30 + (1 - ratio) * 190;
                  const label = Math.round(maxChartVol * ratio);
                  return (
                    <g key={idx}>
                      <line x1="70" y1={y} x2="530" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                      <text x="60" y={y + 3} textAnchor="end" fill="var(--text-muted)" fontSize="9">{label}</text>
                    </g>
                  );
                })}

                {/* X-axis labels (Price) */}
                {[0.5, 0.8, 1.0, 1.25, 1.5, 1.8, 2.0].map((multiplier, idx) => {
                  const priceVal = Math.round(baselinePrice * multiplier);
                  const x = 70 + ((priceVal - minPrice) / (maxPrice - minPrice)) * 460;
                  return (
                    <g key={idx}>
                      <line x1={x} y1="30" x2={x} y2="220" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                      <text x={x} y="235" textAnchor="middle" fill="var(--text-muted)" fontSize="9">${priceVal}</text>
                    </g>
                  );
                })}

                {/* X & Y axis label text */}
                <text x="300" y="248" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontWeight="700">TARGET SUBSCRIPTION PRICE ($)</text>
                <text x="12" y="125" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontWeight="700" transform="rotate(-90,12,125)">ACTIVE LICENSES (QUANTITY)</text>

                {/* Baseline Guide lines */}
                {(() => {
                  const baselineX = 70 + ((baselinePrice - minPrice) / (maxPrice - minPrice)) * 460;
                  const baselineY = 220 - (baselineVolume / maxChartVol) * 190;
                  return (
                    <g>
                      <line x1={baselineX} y1="30" x2={baselineX} y2="220" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="2,2" />
                      <line x1="70" y1={baselineY} x2="530" y2={baselineY} stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="2,2" />
                      {/* Baseline Point */}
                      <circle cx={baselineX} cy={baselineY} r="4.5" fill="var(--text-muted)" />
                      <text x={baselineX + 8} y={baselineY - 8} fill="var(--text-secondary)" fontSize="8.5" fontWeight="600">Default Baseline</text>
                    </g>
                  );
                })()}

                {/* Invisible Thicker Curve Path (Hitbox for curve drag/elasticity adjustments) */}
                <path 
                  d={getCurvePathD()} 
                  fill="none" 
                  stroke="transparent" 
                  strokeWidth="15" 
                  style={{ cursor: currentMode === 'custom' ? 'default' : 'ns-resize', pointerEvents: currentMode === 'custom' ? 'none' : 'auto' }}
                  onMouseDown={(e) => handleStartDrag(e, 'elasticity')}
                />

                {/* Visible Elasticity Curve Path */}
                <path 
                  d={getCurvePathD()} 
                  fill="none" 
                  stroke="var(--color-primary)" 
                  strokeWidth="2.5" 
                  style={{ pointerEvents: 'none', transition: isDragging ? 'none' : 'd 0.2s ease-out' }}
                />

                {/* Visual Custom Price Test Points */}
                {currentMode === 'custom' && (currentSimValues.customPoints || []).map((pt, idx) => {
                  const cx = 70 + ((pt.price - minPrice) / (maxPrice - minPrice)) * 460;
                  const cy = 220 - (pt.volume / maxChartVol) * 190;
                  const isThisPointDragged = isDragging && dragMode === 'custom-point' && draggedPointIdx === idx;
                  return (
                    <g 
                      key={idx} 
                      style={{ cursor: isThisPointDragged ? 'grabbing' : 'grab' }}
                      onMouseDown={(e) => handleStartDrag(e, 'custom-point', idx)}
                    >
                      {/* Transparent outer hitbox for easy grabbing */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r="12"
                        fill="transparent"
                      />
                      {/* Interactive Point circle */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r="4"
                        fill={isThisPointDragged ? 'var(--color-success)' : 'var(--color-primary)'}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <text 
                        x={cx} 
                        y={cy - 8} 
                        textAnchor="middle" 
                        fill="var(--text-secondary)" 
                        fontSize="8" 
                        fontWeight="700"
                        style={{ pointerEvents: 'none' }}
                      >
                        ${pt.price}
                      </text>
                    </g>
                  );
                })}

                {/* Draggable Active Handle Dot */}
                {dotX >= 70 && dotX <= 530 && dotY >= 10 && dotY <= 230 && (
                  <g 
                    style={{ cursor: 'ew-resize' }}
                    onMouseDown={(e) => handleStartDrag(e, 'price')}
                  >
                    {/* Pulsing ring around the handle */}
                    <circle 
                      cx={dotX} 
                      cy={dotY} 
                      r="12" 
                      fill="var(--color-success)" 
                      opacity="0.2" 
                      style={{ transition: isDragging ? 'none' : 'cx 0.2s, cy 0.2s' }}
                    />
                    <circle 
                      cx={dotX} 
                      cy={dotY} 
                      r="6" 
                      fill="var(--color-success)" 
                      stroke="#ffffff" 
                      strokeWidth="2"
                      style={{ transition: isDragging ? 'none' : 'cx 0.2s, cy 0.2s' }}
                    />
                    {/* Tooltip above active handle */}
                    <rect x={dotX - 50} y={dotY - 36} width="100" height="20" fill="var(--text-primary)" rx="4" opacity="0.9" style={{ pointerEvents: 'none' }} />
                    <text x={dotX} y={dotY - 23} textAnchor="middle" fill="white" fontSize="9" fontWeight="700" style={{ pointerEvents: 'none' }}>
                      ${Math.round(simPriceNum)}: {Math.round(simulatedVolume)} licenses
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Unit Economics Ledger Table */}
          <div className="detail-card" style={{ marginBottom: 0, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={16} color="var(--color-primary)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Elasticity Economics Ledger</span>
            </div>
            
            <div className="table-container">
              <table className="products-table" style={{ margin: 0, width: '100%' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '0.65rem 1.25rem' }}>Model Variable</th>
                    <th style={{ padding: '0.65rem 1.25rem', textAlign: 'right' }}>Baseline (Default)</th>
                    <th style={{ padding: '0.65rem 1.25rem', textAlign: 'right' }}>Simulated</th>
                    <th style={{ padding: '0.65rem 1.25rem', textAlign: 'right' }}>Net Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.65rem 1.25rem', fontWeight: 600 }}>Subscription Price</td>
                    <td style={{ padding: '0.65rem 1.25rem', textAlign: 'right' }}>${baselinePrice}/mo</td>
                    <td style={{ padding: '0.65rem 1.25rem', textAlign: 'right', fontWeight: 700 }}>${Math.round(simPriceNum)}/mo</td>
                    <td style={{ 
                      padding: '0.65rem 1.25rem', 
                      textAlign: 'right', 
                      fontWeight: 700,
                      color: simPriceNum > baselinePrice ? 'var(--color-success)' : (simPriceNum < baselinePrice ? 'var(--color-danger)' : 'var(--text-secondary)')
                    }}>
                      {simPriceNum >= baselinePrice ? '+' : ''}${Math.round(simPriceNum - baselinePrice)}/mo
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.65rem 1.25rem', fontWeight: 600 }}>Customer Volume</td>
                    <td style={{ padding: '0.65rem 1.25rem', textAlign: 'right' }}>{baselineVolume} users</td>
                    <td style={{ padding: '0.65rem 1.25rem', textAlign: 'right', fontWeight: 700 }}>{Math.round(simulatedVolume)} users</td>
                    <td style={{ 
                      padding: '0.65rem 1.25rem', 
                      textAlign: 'right', 
                      fontWeight: 700,
                      color: volumeDelta >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                    }}>
                      {volumeDelta >= 0 ? '+' : ''}{Math.round(volumeDelta)} users
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.65rem 1.25rem', fontWeight: 600 }}>Monthly Revenue (MRR)</td>
                    <td style={{ padding: '0.65rem 1.25rem', textAlign: 'right' }}>${Math.round(baselineMrr).toLocaleString()}</td>
                    <td style={{ padding: '0.65rem 1.25rem', textAlign: 'right', fontWeight: 700 }}>${Math.round(simulatedMrr).toLocaleString()}</td>
                    <td style={{ 
                      padding: '0.65rem 1.25rem', 
                      textAlign: 'right', 
                      fontWeight: 700,
                      color: mrrAdded >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                    }}>
                      {mrrAdded >= 0 ? '+' : ''}${Math.round(mrrAdded).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.65rem 1.25rem', fontWeight: 600 }}>Customer Churn Rate</td>
                    <td style={{ padding: '0.65rem 1.25rem', textAlign: 'right' }}>{baselineChurn.toFixed(1)}%</td>
                    <td style={{ padding: '0.65rem 1.25rem', textAlign: 'right', fontWeight: 700 }}>{simulatedChurn.toFixed(1)}%</td>
                    <td style={{ 
                      padding: '0.65rem 1.25rem', 
                      textAlign: 'right', 
                      fontWeight: 700,
                      color: churnDelta > 0 ? 'var(--color-danger)' : (churnDelta < 0 ? 'var(--color-success)' : 'var(--text-secondary)')
                    }}>
                      {churnDelta >= 0 ? '+' : ''}{churnDelta.toFixed(1)}%
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: 'none' }}>
                    <td style={{ padding: '0.65rem 1.25rem', fontWeight: 700, borderBottom: 'none' }}>Lifetime cohort value</td>
                    <td style={{ padding: '0.65rem 1.25rem', textAlign: 'right', borderBottom: 'none' }}>${Math.round(baselineLifetimeRevenue).toLocaleString()}</td>
                    <td style={{ padding: '0.65rem 1.25rem', textAlign: 'right', fontWeight: 700, borderBottom: 'none' }}>${Math.round(simulatedLifetimeRevenue).toLocaleString()}</td>
                    <td style={{ 
                      padding: '0.65rem 1.25rem', 
                      textAlign: 'right', 
                      fontWeight: 700,
                      borderBottom: 'none',
                      color: lifetimeRevenueAdded >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                    }}>
                      {lifetimeRevenueAdded >= 0 ? '+' : ''}${Math.round(lifetimeRevenueAdded).toLocaleString()}
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
