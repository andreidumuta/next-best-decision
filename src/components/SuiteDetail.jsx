import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  TrendingUp, 
  HelpCircle, 
  Calculator,
  MessageSquare,
  ShieldAlert,
  Send,
  X,
  Target,
  DollarSign,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Percent
} from 'lucide-react';
import { generateNextBestDecision } from '../utils/aiDecisions';

export default function SuiteDetail({ suiteId, database, onBack, onUpdateDecisionState, onUpdateDecisionFeedback, onNavigateToSimulator, onNavigateToElasticitySimulator }) {
  const { suites, products } = database;
  const suite = suites.find(s => s.id === suiteId);
  const suiteProducts = products.filter(p => p.suiteId === suiteId);

  // States
  const [activeTab, setActiveTab] = useState('comparison'); // 'comparison' or 'trend'
  const [hoveredData, setHoveredData] = useState(null); // Tooltip state
  const [showExpert, setShowExpert] = useState(false);

  // Pricing Expert States
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'assistant',
      text: `Hello! I am your Pricing & Portfolio Expert for the ${suite?.name || 'Cybersecurity'} portfolio. I have analyzed your product performance, sales volumes, and elasticity indexes. How can I help you optimize your margins and recurring revenue today?`
    }
  ]);

  if (!suite) {
    return (
      <div>
        <button className="btn btn-secondary" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <p style={{ marginTop: '2rem' }}>Product suite not found.</p>
      </div>
    );
  }

  // Calculate metrics for table
  const productsWithMetrics = suiteProducts.map(p => {
    const currentVolume = p.weeklyVolume;
    const mrr = currentVolume * p.price;
    const targetMrr = p.targetSales * p.price;
    
    // Week growth
    const weekGrowth = p.lastWeekVolume > 0 ? ((currentVolume - p.lastWeekVolume) / p.lastWeekVolume) * 100 : 0;
    
    // Year growth
    const firstVol = p.history && p.history[0] ? p.history[0].volume : currentVolume;
    const yearGrowth = firstVol > 0 ? ((currentVolume - firstVol) / firstVol) * 100 : 0;

    return {
      ...p,
      mrr,
      targetMrr,
      weekGrowth,
      yearGrowth
    };
  });

  const suiteCurrentMrr = productsWithMetrics.reduce((sum, p) => sum + p.mrr, 0);
  const suiteTargetMrr = productsWithMetrics.reduce((sum, p) => sum + p.targetMrr, 0);

  const totalWeeklyVol = productsWithMetrics.reduce((sum, p) => sum + p.weeklyVolume, 0);
  const totalLastWeekVol = productsWithMetrics.reduce((sum, p) => sum + p.lastWeekVolume, 0);
  const totalLastWeekMrr = productsWithMetrics.reduce((sum, p) => sum + (p.lastWeekVolume * p.price), 0);
  const totalWeeklyGrowth = totalLastWeekMrr > 0 ? ((suiteCurrentMrr - totalLastWeekMrr) / totalLastWeekMrr) * 100 : 0;
  
  const totalYearAgoMrr = productsWithMetrics.reduce((sum, p) => {
    const yearAgoVol = p.history && p.history[0] ? p.history[0].volume : p.weeklyVolume;
    return sum + (yearAgoVol * p.price);
  }, 0);
  const totalYearlyGrowth = totalYearAgoMrr > 0 ? ((suiteCurrentMrr - totalYearAgoMrr) / totalYearAgoMrr) * 100 : 0;

  // Get AI decision text
  const aiDecision = generateNextBestDecision(suite, suiteProducts);

  // Custom SVG Chart Calculations
  // 1. Find Max Volume for Bar Chart Scaling
  const allVols = suiteProducts.flatMap(p => [
    p.weeklyVolume, 
    p.lastWeekVolume, 
    p.targetSales,
    (p.history && p.history[0] ? p.history[0].volume : p.weeklyVolume)
  ]);
  const maxVol = Math.max(...allVols, 100) * 1.15; // 15% padding top

  // 1b. Find Max MRR for Value Comparison scaling
  const allMrrs = suiteProducts.flatMap(p => [
    p.weeklyVolume * p.price,
    p.lastWeekVolume * p.price,
    p.targetSales * p.price,
    (p.history && p.history[0] ? p.history[0].volume : p.weeklyVolume) * p.price
  ]);
  const maxSuiteProdMrr = Math.max(...allMrrs, 1000) * 1.15; // 15% padding

  // 2. Prepare 13-Month Trend Data (Aggregated Suite MRR per month)
  // We assume all products have history of same length (13) and matching months
  const monthsCount = suiteProducts[0]?.history?.length || 0;
  const trendData = [];
  
  for (let i = 0; i < monthsCount; i++) {
    const monthName = suiteProducts[0].history[i].month;
    let monthMrr = 0;
    suiteProducts.forEach(p => {
      const vol = p.history && p.history[i] ? p.history[i].volume : p.weeklyVolume;
      monthMrr += vol * p.price;
    });
    trendData.push({ month: monthName, mrr: monthMrr });
  }
  
  const maxMrr = Math.max(...trendData.map(d => d.mrr), 1000) * 1.1;



  // Expert Chat Interaction
  const handleSendChat = (textToSend) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    const newHistory = [...chatHistory, { sender: 'user', text }];
    setChatHistory(newHistory);
    setChatInput('');

    // Formulate a smart response based on text content and suite metrics
    setTimeout(() => {
      let responseText = "";
      const lower = text.toLowerCase();

      if (lower.includes('price') || lower.includes('raise') || lower.includes('increase')) {
        const good = productsWithMetrics.find(p => p.tier === 'good');
        responseText = `Based on the latest data for ${suite.name}, your entry product (${good?.name}) is currently at ${good?.pctOfTarget.toFixed(0)}% of its target capacity with a positive growth of ${good?.weekGrowth.toFixed(1)}% this week. Security software at the entry-level exhibits high switching costs (inelasticity). Raising price on "${good?.name}" by 8-10% (from $${good?.price} to $${Math.round(good?.price * 1.09)}) is highly feasible and would yield an estimated boost of $${Math.round(good?.weeklyVolume * good?.price * 0.08)}/month, assuming less than 3% contract cancellation.`;
      } else if (lower.includes('upsell') || lower.includes('migration') || lower.includes('better') || lower.includes('best')) {
        const good = productsWithMetrics.find(p => p.tier === 'good');
        const better = productsWithMetrics.find(p => p.tier === 'better');
        responseText = `To accelerate tier migration from Good ("${good?.name}") to Better ("${better?.name}"), I recommend executing a feature-gating strategy. Recently, compliance regulations (e.g. SOC2, GDPR) have increased demand. Migrate advanced reporting and compliance logs from the basic tier to the pro tier, then offer existing basic subscribers a 'seamless upgrade path' at a 15% discount for the first 3 months. This will expand average revenue per account (ARPU).`;
      } else if (lower.includes('cloud') || lower.includes('threat') || lower.includes('endpoint')) {
        responseText = `For ${suite.name}, our metrics indicate that target sales volumes are not being fully hit at the high tier. Security decision makers prefer bundle purchasing. We should bundle endpoint security with zero-trust access control for a unified threat interface, discounting the bundle by 12% compared to individual licensing. This targets C-level buyers rather than individual IT admins, which should lift total contract value (TCV).`;
      } else {
        responseText = `Looking at the current portfolio metrics for the ${suite.name}, your total suite MRR is $${suiteCurrentMrr.toLocaleString()} (against a target of $${suiteTargetMrr.toLocaleString()}). The biggest lever you have right now is to address the underperformance of "${productsWithMetrics[1]?.name || 'Better Tier'}" which has experienced growth friction. I suggest standardizing trial-to-paid conversions with an automated email reminder 3 days before the end of trials, detailing threat reports caught during the trial period.`;
      }

      setChatHistory(prev => [...prev, { sender: 'assistant', text: responseText }]);
    }, 600);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Breadcrumbs */}
      <div className="back-button">
        <button onClick={onBack}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {/* Suite Header Info */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">{suite.name}</h1>
          <p className="page-subtitle">{suite.description}</p>
        </div>
        <div>
          <span className={`status-badge ${aiDecision.weekGrowth < 0 ? 'critical' : (aiDecision.weekGrowth < 5 ? 'warning' : 'good')}`}>
            Suite Target MRR: ${suiteTargetMrr.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="detail-grid">
        {/* Products & Pricing Table */}
        <div className="detail-card grid-area-table" style={{ margin: 0 }}>
          <h3 className="detail-card-title">
              <DollarSign size={18} color="var(--color-primary)" />
              Suite Products & Pricing
            </h3>
            
            <div className="table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Tier</th>
                    <th>Product Name</th>
                    <th>Price / Mo</th>
                    <th>Weekly Vol</th>
                    <th>Current MRR</th>
                    <th>Growth (Wk)</th>
                    <th>Growth (YoY)</th>
                  </tr>
                </thead>
                <tbody>
                  {productsWithMetrics.map(p => (
                    <tr key={p.id}>
                      <td>
                        <span className={`tier-badge ${p.tier}`}>
                          {p.tier}
                        </span>
                      </td>
                      <td className="product-name">{p.name}</td>
                      <td><strong>${p.price}</strong></td>
                      <td>{p.weeklyVolume}</td>
                      <td><strong>${p.mrr.toLocaleString()}</strong></td>
                      <td style={{ 
                        color: p.weekGrowth >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                        fontWeight: 600
                      }}>
                        {p.weekGrowth >= 0 ? '+' : ''}{p.weekGrowth.toFixed(1)}%
                      </td>
                      <td style={{ 
                        color: p.yearGrowth >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                        fontWeight: 600
                      }}>
                        {p.yearGrowth >= 0 ? '+' : ''}{p.yearGrowth.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                  
                  {/* Total summary row */}
                  <tr style={{ borderTop: '2px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
                    <td>
                      <span className="tier-badge" style={{ 
                        backgroundColor: 'var(--color-primary-light)', 
                        color: 'var(--color-primary-dark)',
                        fontWeight: 700
                      }}>
                        TOTAL
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>Suite Aggregates</td>
                    <td>-</td>
                    <td style={{ fontWeight: 700 }}>{totalWeeklyVol.toLocaleString()}</td>
                    <td style={{ fontWeight: 700 }}>${suiteCurrentMrr.toLocaleString()}</td>
                    <td style={{ 
                      color: totalWeeklyGrowth >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                      fontWeight: 700
                    }}>
                      {totalWeeklyGrowth >= 0 ? '+' : ''}{totalWeeklyGrowth.toFixed(1)}%
                    </td>
                    <td style={{ 
                      color: totalYearlyGrowth >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                      fontWeight: 700
                    }}>
                      {totalYearlyGrowth >= 0 ? '+' : ''}{totalYearlyGrowth.toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="detail-card grid-area-chart" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <h3 className="detail-card-title" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                <Target size={18} color="var(--color-primary)" />
                Performance Analysis
              </h3>
              
              <div className="chart-tabs" style={{ margin: 0 }}>
                <button 
                  className={`chart-tab ${activeTab === 'comparison' ? 'active' : ''}`}
                  onClick={() => setActiveTab('comparison')}
                >
                  Volume Comparison
                </button>
                <button 
                  className={`chart-tab ${activeTab === 'value_comparison' ? 'active' : ''}`}
                  onClick={() => setActiveTab('value_comparison')}
                >
                  Value Comparison
                </button>
                <button 
                  className={`chart-tab ${activeTab === 'trend' ? 'active' : ''}`}
                  onClick={() => setActiveTab('trend')}
                >
                  13-Month MRR Trend
                </button>
              </div>
            </div>

            <div className="chart-container">
              {activeTab === 'comparison' ? (
                // SVG Bar Chart comparing Current vs Target vs Last Week vs Last Year
                <div className="chart-svg-wrapper">
                  <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
                    {/* Y-Axis Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                      const y = 30 + (1 - ratio) * 200;
                      const val = Math.round(maxVol * ratio);
                      return (
                        <g key={index}>
                          <line x1="45" y1={y} x2="570" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                          <text x="35" y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10">{val}</text>
                        </g>
                      );
                    })}

                    {/* Chart Elements grouped by Product */}
                    {suiteProducts.map((p, pIndex) => {
                      const groupX = 75 + pIndex * 170;
                      
                      // Values
                      const cur = p.weeklyVolume;
                      const target = p.targetSales;
                      const prevWeek = p.lastWeekVolume;
                      const prevYear = p.history && p.history[0] ? p.history[0].volume : cur;

                      // Heights (max height 200px)
                      const hCur = (cur / maxVol) * 200;
                      const hTarget = (target / maxVol) * 200;
                      const hPrevWk = (prevWeek / maxVol) * 200;
                      const hPrevYr = (prevYear / maxVol) * 200;

                      // Bars side-by-side: X coordinates inside group
                      const wBar = 22;
                      const xCur = groupX;
                      const xPrevWk = groupX + wBar + 4;
                      const xPrevYr = groupX + (wBar + 4) * 2;
                      const xTarget = groupX + (wBar + 4) * 3;

                      return (
                        <g key={p.id}>
                          {/* Product Label Group Header */}
                          <text x={groupX + 45} y="250" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600">
                            {p.name.length > 22 ? p.name.substring(0, 20) + '...' : p.name}
                          </text>
                          <text x={groupX + 45} y="264" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="500">
                            ({p.tier.toUpperCase()})
                          </text>

                          {/* Bar 1: Current Volume */}
                          <rect 
                            x={xCur} 
                            y={230 - hCur} 
                            width={wBar} 
                            height={hCur} 
                            fill="var(--color-primary)" 
                            rx="2"
                            onMouseEnter={(e) => setHoveredData({ name: `${p.name} (Current)`, val: cur, x: xCur + 10, y: 220 - hCur })}
                            onMouseLeave={() => setHoveredData(null)}
                          />

                          {/* Bar 2: Last Week */}
                          <rect 
                            x={xPrevWk} 
                            y={230 - hPrevWk} 
                            width={wBar} 
                            height={hPrevWk} 
                            fill="#818cf8" 
                            opacity="0.7"
                            rx="2"
                            onMouseEnter={(e) => setHoveredData({ name: `${p.name} (Last Week)`, val: prevWeek, x: xPrevWk + 10, y: 220 - hPrevWk })}
                            onMouseLeave={() => setHoveredData(null)}
                          />

                          {/* Bar 3: Last Year */}
                          <rect 
                            x={xPrevYr} 
                            y={230 - hPrevYr} 
                            width={wBar} 
                            height={hPrevYr} 
                            fill="#cbd5e1" 
                            rx="2"
                            onMouseEnter={(e) => setHoveredData({ name: `${p.name} (Last Year)`, val: prevYear, x: xPrevYr + 10, y: 220 - hPrevYr })}
                            onMouseLeave={() => setHoveredData(null)}
                          />

                          {/* Bar 4: Target */}
                          <rect 
                            x={xTarget} 
                            y={230 - hTarget} 
                            width={wBar} 
                            height={hTarget} 
                            fill="none" 
                            stroke="var(--color-primary)"
                            strokeWidth="1.5"
                            strokeDasharray="2,2"
                            rx="2"
                            onMouseEnter={(e) => setHoveredData({ name: `${p.name} (Target)`, val: target, x: xTarget + 10, y: 220 - hTarget })}
                            onMouseLeave={() => setHoveredData(null)}
                          />
                        </g>
                      );
                    })}

                    {/* Tooltip render */}
                    {hoveredData && (
                      <g>
                        <rect 
                          x={hoveredData.x - 55} 
                          y={hoveredData.y - 35} 
                          width="110" 
                          height="28" 
                          fill="var(--text-primary)" 
                          rx="4" 
                        />
                        <text x={hoveredData.x} y={hoveredData.y - 23} textAnchor="middle" fill="white" fontSize="9" fontWeight="600">
                          {hoveredData.name.length > 18 ? hoveredData.name.split(' (')[0].substring(0, 8) + '... (' + hoveredData.name.split(' (')[1] : hoveredData.name}
                        </text>
                        <text x={hoveredData.x} y={hoveredData.y - 12} textAnchor="middle" fill="var(--color-primary-light)" fontSize="10" fontWeight="bold">
                          {hoveredData.isCurrency ? hoveredData.val : `${hoveredData.val} Licenses`}
                        </text>
                      </g>
                    )}
                  </svg>

                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                      <span>Current Vol</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: '#818cf8', opacity: 0.7 }}></div>
                      <span>Last Week Vol</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: '#cbd5e1' }}></div>
                      <span>Last Year Vol</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{ border: '1px dashed var(--color-primary)', height: '10px' }}></div>
                      <span>Target Goal</span>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'value_comparison' ? (
                // SVG Bar Chart comparing Current vs Target vs Last Week vs Last Year in USD (MRR value)
                <div className="chart-svg-wrapper">
                  <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
                    {/* Y-Axis Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                      const y = 30 + (1 - ratio) * 200;
                      const val = Math.round(maxSuiteProdMrr * ratio);
                      return (
                        <g key={index}>
                          <line x1="50" y1={y} x2="570" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                          <text x="42" y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="9">${val.toLocaleString()}</text>
                        </g>
                      );
                    })}

                    {/* Chart Elements grouped by Product */}
                    {suiteProducts.map((p, pIndex) => {
                      const groupX = 75 + pIndex * 170;
                      
                      // Values
                      const cur = p.weeklyVolume * p.price;
                      const target = p.targetSales * p.price;
                      const prevWeek = p.lastWeekVolume * p.price;
                      const prevYear = (p.history && p.history[0] ? p.history[0].volume : p.weeklyVolume) * p.price;

                      // Heights (max height 200px)
                      const hCur = (cur / maxSuiteProdMrr) * 200;
                      const hTarget = (target / maxSuiteProdMrr) * 200;
                      const hPrevWk = (prevWeek / maxSuiteProdMrr) * 200;
                      const hPrevYr = (prevYear / maxSuiteProdMrr) * 200;

                      // Bars side-by-side: X coordinates inside group
                      const wBar = 22;
                      const xCur = groupX;
                      const xPrevWk = groupX + wBar + 4;
                      const xPrevYr = groupX + (wBar + 4) * 2;
                      const xTarget = groupX + (wBar + 4) * 3;

                      return (
                        <g key={p.id}>
                          {/* Product Label Group Header */}
                          <text x={groupX + 45} y="250" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600">
                            {p.name.length > 22 ? p.name.substring(0, 20) + '...' : p.name}
                          </text>
                          <text x={groupX + 45} y="264" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="500">
                            ({p.tier.toUpperCase()})
                          </text>

                          {/* Bar 1: Current MRR */}
                          <rect 
                            x={xCur} 
                            y={230 - hCur} 
                            width={wBar} 
                            height={hCur} 
                            fill="var(--color-primary)" 
                            rx="2"
                            onMouseEnter={(e) => setHoveredData({ name: `${p.name} (Current)`, val: `$${cur.toLocaleString()}`, x: xCur + 10, y: 220 - hCur, isCurrency: true })}
                            onMouseLeave={() => setHoveredData(null)}
                          />

                          {/* Bar 2: Last Week MRR */}
                          <rect 
                            x={xPrevWk} 
                            y={230 - hPrevWk} 
                            width={wBar} 
                            height={hPrevWk} 
                            fill="#818cf8" 
                            opacity="0.7"
                            rx="2"
                            onMouseEnter={(e) => setHoveredData({ name: `${p.name} (Last Week)`, val: `$${prevWeek.toLocaleString()}`, x: xPrevWk + 10, y: 220 - hPrevWk, isCurrency: true })}
                            onMouseLeave={() => setHoveredData(null)}
                          />

                          {/* Bar 3: Last Year MRR */}
                          <rect 
                            x={xPrevYr} 
                            y={230 - hPrevYr} 
                            width={wBar} 
                            height={hPrevYr} 
                            fill="#cbd5e1" 
                            rx="2"
                            onMouseEnter={(e) => setHoveredData({ name: `${p.name} (Last Year)`, val: `$${prevYear.toLocaleString()}`, x: xPrevYr + 10, y: 220 - hPrevYr, isCurrency: true })}
                            onMouseLeave={() => setHoveredData(null)}
                          />

                          {/* Bar 4: Target MRR */}
                          <rect 
                            x={xTarget} 
                            y={230 - hTarget} 
                            width={wBar} 
                            height={hTarget} 
                            fill="none" 
                            stroke="var(--color-primary)"
                            strokeWidth="1.5"
                            strokeDasharray="2,2"
                            rx="2"
                            onMouseEnter={(e) => setHoveredData({ name: `${p.name} (Target)`, val: `$${target.toLocaleString()}`, x: xTarget + 10, y: 220 - hTarget, isCurrency: true })}
                            onMouseLeave={() => setHoveredData(null)}
                          />
                        </g>
                      );
                    })}

                    {/* Tooltip render */}
                    {hoveredData && (
                      <g>
                        <rect 
                          x={hoveredData.x - 55} 
                          y={hoveredData.y - 35} 
                          width="110" 
                          height="28" 
                          fill="var(--text-primary)" 
                          rx="4" 
                        />
                        <text x={hoveredData.x} y={hoveredData.y - 23} textAnchor="middle" fill="white" fontSize="9" fontWeight="600">
                          {hoveredData.name.length > 18 ? hoveredData.name.split(' (')[0].substring(0, 8) + '... (' + hoveredData.name.split(' (')[1] : hoveredData.name}
                        </text>
                        <text x={hoveredData.x} y={hoveredData.y - 12} textAnchor="middle" fill="var(--color-primary-light)" fontSize="10" fontWeight="bold">
                          {hoveredData.isCurrency ? hoveredData.val : `${hoveredData.val} Licenses`}
                        </text>
                      </g>
                    )}
                  </svg>

                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                      <span>Current MRR</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: '#818cf8', opacity: 0.7 }}></div>
                      <span>Last Week MRR</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: '#cbd5e1' }}></div>
                      <span>Last Year MRR</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{ border: '1px dashed var(--color-primary)', height: '10px' }}></div>
                      <span>Target Goal MRR</span>
                    </div>
                  </div>
                </div>
              ) : (
                // SVG Line Chart for 13-Month Trend
                <div className="chart-svg-wrapper">
                  <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
                    <defs>
                      <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0"/>
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                      const y = 30 + (1 - ratio) * 200;
                      const val = Math.round(maxMrr * ratio);
                      return (
                        <g key={index}>
                          <line x1="50" y1={y} x2="580" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                          <text x="40" y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="9">${val.toLocaleString()}</text>
                        </g>
                      );
                    })}

                    {/* Draw Area / Gradient path first */}
                    {(() => {
                      const points = trendData.map((d, index) => {
                        const x = 60 + index * (500 / 12);
                        const y = 230 - (d.mrr / maxMrr) * 200;
                        return { x, y };
                      });
                      
                      if (points.length === 0) return null;
                      
                      const pathD = points.reduce((str, p, i) => `${str} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                      const areaD = `${pathD} L ${points[points.length-1].x} 230 L ${points[0].x} 230 Z`;
                      
                      return (
                        <g>
                          <path d={areaD} fill="url(#line-grad)" />
                          <path d={pathD} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
                          
                          {/* Data points */}
                          {points.map((p, idx) => (
                            <circle 
                              key={idx}
                              cx={p.x} 
                              cy={p.y} 
                              r="4" 
                              fill="white" 
                              stroke="var(--color-primary)" 
                              strokeWidth="2"
                              onMouseEnter={() => setHoveredData({ name: trendData[idx].month, val: trendData[idx].mrr, x: p.x, y: p.y })}
                              onMouseLeave={() => setHoveredData(null)}
                            />
                          ))}
                        </g>
                      );
                    })()}

                    {/* X-Axis labels */}
                    {trendData.map((d, index) => {
                      if (index % 2 !== 0 && index !== 12) return null; // Show every 2nd label
                      const x = 60 + index * (500 / 12);
                      return (
                        <text key={index} x={x} y="250" textAnchor="middle" fill="#94a3b8" fontSize="9">
                          {d.month.split(' ')[0]} '{d.month.split(' ')[1].substring(2)}
                        </text>
                      );
                    })}

                    {/* Tooltip render */}
                    {hoveredData && (
                      <g>
                        <rect 
                           x={hoveredData.x - 50} 
                           y={hoveredData.y - 40} 
                           width="100" 
                           height="30" 
                           fill="var(--text-primary)" 
                           rx="4" 
                        />
                        <text x={hoveredData.x} y={hoveredData.y - 27} textAnchor="middle" fill="white" fontSize="9" fontWeight="600">
                          {hoveredData.name}
                        </text>
                        <text x={hoveredData.x} y={hoveredData.y - 15} textAnchor="middle" fill="var(--color-success)" fontSize="10" fontWeight="bold">
                          ${hoveredData.val.toLocaleString()} MRR
                        </text>
                      </g>
                    )}
                  </svg>
                  
                  <div className="chart-legend" style={{ marginTop: '0.50rem' }}>
                    <div className="legend-item">
                      <div style={{ width: '15px', height: '3px', backgroundColor: 'var(--color-primary)' }}></div>
                      <span>Aggregated Suite Monthly Recurring Revenue (MRR) Trend</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Decision Card */}
          {(() => {
            const decisionState = database.decisionStates ? database.decisionStates[suiteId] : 'active';
            
            if (decisionState === 'done') {
              return (
                <div className="ai-decision-card grid-area-decision" style={{ 
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  borderColor: 'var(--color-success-border)',
                  borderLeft: '5px solid var(--color-success)',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  margin: 0
                }}>
                  <div className="ai-header">
                    <span className="ai-title" style={{ color: 'var(--color-success)' }}>
                      <CheckCircle size={18} />
                      Decision Completed
                    </span>
                    <span className="ai-badge" style={{ background: 'var(--color-success)' }}>Logged</span>
                  </div>
                  <p className="ai-recommendation-text" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    This pricing and portfolio decision has been **marked as done** and completed by the Category Manager.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'white' }}
                      onClick={() => onUpdateDecisionState(suiteId, 'active')}
                    >
                      Re-open Recommendation
                    </button>
                  </div>
                </div>
              );
            }
            
            if (decisionState === 'dismissed') {
              return (
                <div className="ai-decision-card grid-area-decision" style={{ 
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderColor: 'var(--border-color)',
                  borderLeft: '5px solid var(--text-muted)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  margin: 0
                }}>
                  <div className="ai-header">
                    <span className="ai-title" style={{ color: 'var(--text-secondary)' }}>
                      <XCircle size={18} />
                      Decision Dismissed
                    </span>
                    <span className="ai-badge" style={{ background: 'var(--text-muted)' }}>Archived</span>
                  </div>
                  <p className="ai-recommendation-text" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    This recommendation has been dismissed and is currently hidden from your main portfolio overview.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'white' }}
                      onClick={() => onUpdateDecisionState(suiteId, 'active')}
                    >
                      Re-open Recommendation
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div className="ai-decision-card grid-area-decision" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                margin: 0
              }}>
                <div className="ai-header">
                  <span className="ai-title">
                    <Sparkles size={18} fill="var(--color-primary)" />
                    Next Best Decision
                  </span>
                </div>
                
                <p className="ai-recommendation-text" dangerouslySetInnerHTML={{ __html: aiDecision.recommendation }}></p>
                
                <div className="ai-metrics" style={{ marginBottom: '1.5rem' }}>
                  <div className="ai-metric-item">
                    <span className="ai-metric-label">Estimated Revenue Impact</span>
                    <span className="ai-metric-value impact-green">{aiDecision.impact}</span>
                  </div>
                  <div className="ai-metric-item">
                    <span className="ai-metric-label">Confidence Level</span>
                    <span className="ai-metric-value">{aiDecision.confidence}</span>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  borderTop: '1px dashed rgba(99, 102, 241, 0.2)', 
                  paddingTop: '1.25rem',
                  justifyContent: 'flex-end',
                  alignItems: 'center'
                }}>
                  {(() => {
                    const feedback = database.decisionFeedback ? database.decisionFeedback[suiteId] : null;
                    return (
                      <div style={{ display: 'flex', gap: '0.25rem', marginRight: 'auto' }}>
                        <button
                          onClick={() => onUpdateDecisionFeedback(suiteId, 'up')}
                          className="btn btn-secondary"
                          title="Helpful recommendation"
                          style={{
                            padding: '0.4rem 0.6rem',
                            fontSize: '0.75rem',
                            backgroundColor: feedback === 'up' ? 'var(--color-success-bg)' : 'white',
                            color: feedback === 'up' ? 'var(--color-success)' : 'var(--text-muted)',
                            borderColor: feedback === 'up' ? 'var(--color-success-border)' : 'var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <ThumbsUp size={12} fill={feedback === 'up' ? 'var(--color-success)' : 'none'} />
                          <span>Helpful</span>
                        </button>
                        <button
                          onClick={() => onUpdateDecisionFeedback(suiteId, 'down')}
                          className="btn btn-secondary"
                          title="Not helpful recommendation"
                          style={{
                            padding: '0.4rem 0.6rem',
                            fontSize: '0.75rem',
                            backgroundColor: feedback === 'down' ? 'var(--color-danger-bg)' : 'white',
                            color: feedback === 'down' ? 'var(--color-danger)' : 'var(--text-muted)',
                            borderColor: feedback === 'down' ? 'var(--color-danger-border)' : 'var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <ThumbsDown size={12} fill={feedback === 'down' ? 'var(--color-danger)' : 'none'} />
                          <span>Not Helpful</span>
                        </button>
                      </div>
                    );
                  })()}

                  <button 
                    className="btn btn-secondary"
                    style={{ 
                      padding: '0.4rem 0.8rem', 
                      fontSize: '0.8rem',
                      color: 'var(--color-danger)',
                      borderColor: 'var(--color-danger-border)',
                      backgroundColor: 'var(--color-danger-bg)'
                    }}
                    onClick={() => onUpdateDecisionState(suiteId, 'dismissed')}
                  >
                    <X size={14} /> Dismiss
                  </button>
                  <button 
                    className="btn btn-primary"
                    style={{ 
                      padding: '0.4rem 0.8rem', 
                      fontSize: '0.8rem',
                      backgroundColor: 'var(--color-success)',
                      borderColor: 'var(--color-success)',
                      color: 'white'
                    }}
                    onClick={() => onUpdateDecisionState(suiteId, 'done')}
                  >
                    <CheckCircle size={14} /> Mark as Done
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Action Areas Grid */}
          <div className="action-areas grid-area-actions">
            {/* Revenue Simulator Card */}
            <div className="action-card simulator" onClick={onNavigateToSimulator}>
              <div className="action-icon-wrapper">
                <Calculator size={22} />
              </div>
              <div className="action-content">
                <h4 className="action-title">Revenue Simulator</h4>
                <p className="action-desc">Model how price changes affect demand elasticities and MRR outcomes.</p>
              </div>
            </div>

            {/* Pricing Expert Card */}
            <div className="action-card pricing-expert" onClick={onNavigateToElasticitySimulator}>
              <div className="action-icon-wrapper">
                <Percent size={22} />
              </div>
              <div className="action-content">
                <h4 className="action-title">Pricing Expert</h4>
                <p className="action-desc">Model pricing optimizations, elastic demand curves, and churn sensitivities.</p>
              </div>
            </div>
          </div>
      </div>



      {/* Pricing Expert Modal */}
      {showExpert && (
        <div className="modal-overlay" onClick={() => setShowExpert(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowExpert(false)}>
              <X size={20} />
            </button>
            <h3 className="modal-title">
              <MessageSquare size={22} color="var(--color-primary)" />
              Interactive Pricing Expert
            </h3>
            
            <div className="expert-chat-history">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className={`chat-bubble ${chat.sender}`}>
                  {chat.text}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Frequently Asked Questions:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: '20px' }}
                  onClick={() => handleSendChat("Should I raise prices on the Good tier?")}
                >
                  "Should I raise prices on the Good tier?"
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: '20px' }}
                  onClick={() => handleSendChat("How do we accelerate migration to Better tier?")}
                >
                  "How to accelerate migration to Better?"
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: '20px' }}
                  onClick={() => handleSendChat("What bundling strategy works best?")}
                >
                  "What bundling works best?"
                </button>
              </div>
            </div>

            <div className="chat-input-wrapper">
              <input 
                type="text" 
                className="form-control" 
                style={{ flex: 1 }}
                placeholder="Ask advice on cybersecurity package pricing..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              />
              <button className="btn btn-primary" onClick={() => handleSendChat()}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
