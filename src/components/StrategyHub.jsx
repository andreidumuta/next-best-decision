import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Users, 
  Calculator, 
  Award, 
  Bookmark, 
  GitCommit, 
  UserCheck, 
  Zap, 
  CheckCircle, 
  TrendingUp, 
  Percent, 
  ThumbsUp, 
  ThumbsDown 
} from 'lucide-react';

const DEFAULT_CONTENT = {
  header: {
    title: "PM Strategy & Specification Hub",
    subtitle: "Explore the product strategy, target customer personas, and mathematical models behind Next Best Decision."
  },
  prd: {
    title: "Product Requirement Document (PRD) Outline",
    problemHeader: "1. Problem Statement",
    problemText: "Subscription managers and SaaS marketers currently lack a cohesive method to run predictive simulations on pricing shifts and marketing spend adjustments. Today, decisions are made reactively based on historical performance reports, which ignore the compound effects of pricing elasticity, conversions, and price-driven churn sensitivity.",
    valueHeader: "2. Product Value Proposition",
    valueText: "Next Best Decision provides a decision intelligence workspace that pairs portfolio KPI visibility with interactive, multi-variable simulations. It translates complex economic models (like Constant Demand Elasticity) into drag-and-drop visuals, allowing category managers to simulate outcomes and find optimization points with one click.",
    featuresHeader: "3. Core Product Features",
    
    feature1Title: "Decisions Engine",
    feature1Desc: "Rule-based recommendation engine identifying growth initiatives (price hikes, conversion drives) based on portfolio target deltas.",
    
    feature2Title: "Funnel Simulator",
    feature2Desc: "Dynamic visualizer that physically morphs the marketing funnel shape based on traffic, conversions, CPC, and churn sliders.",
    
    feature3Title: "Elasticity Simulator",
    feature3Desc: "Two-dimensional interactive graph allowing managers to slide pricing along curves or manipulate curve shapes to model customer sensitivity.",
    
    feature4Title: "Revenue Optimizers",
    feature4Desc: "Complex numerical sweep algorithm identifying maximum Lifetime Value (LTV) cohort pricing boundaries.",
    
    okrHeader: "Success Metrics (OKRs)",
    okrGoal1Title: "Goal 1: Expand Portfolio MRR",
    okrGoal1Desc: "Target average of +5% YoY recurring revenue increase across cybersecurity suites.",
    
    okrGoal2Title: "Goal 2: Increase LTV : CAC Ratio",
    okrGoal2Desc: "Ensure simulated CAC stays within a 3x LTV envelope to preserve unit economics health.",
    
    okrGoal3Title: "Goal 3: Reduce Churn Spill",
    okrGoal3Desc: "Flag and mitigate subscription churn surges caused by pricing changes exceeding 20%.",
    
    roadmapHeader: "Release Milestones",
    
    milestone1Title: "v1.0: Portfolio KPIs & Admin Panel",
    milestone1Desc: "Baseline metrics, target tables, and CRUD operations.",
    
    milestone2Title: "v1.1: Funnel & Revenue Simulator",
    milestone2Desc: "Interactive morphing SVG and CPC cohort analytics.",
    
    milestone3Title: "v1.2: Elasticity Simulator",
    milestone3Desc: "Constant elasticity graph, drag-to-adjust, LTV optimization.",
    
    milestone4Title: "v2.0: Multi-User Collaboration",
    milestone4Desc: "Scenario comparison sharing and dashboard export."
  },
  personas: {
    sarahName: "Sarah Miller",
    sarahTitle: "Portfolio Category Manager",
    sarahRoleHeader: "Role Description",
    sarahRoleDesc: "Manages the subscription catalog across Endpoint Security and Identity suites. Sarah is responsible for growing portfolio MRR and finding the optimal pricing model.",
    sarahUseHeader: "How she uses NBD",
    sarahUseDesc: "Sarah drags pricing points on the Elasticity curves to model product tier demand and checks next-best-actions to optimize portfolio revenue health.",
    sarahGoalsLabel: "Goals:",
    sarahGoalsDesc: "Identify product pricing sweet spots without triggering customer churn.",
    sarahPainLabel: "Pain Points:",
    sarahPainDesc: "Legacy spreadsheets fail to model churn sensitivities for price increases above 10%.",
    
    marcusName: "Marcus Vance",
    marcusTitle: "VP of Revenue Operations",
    marcusRoleHeader: "Role Description",
    marcusRoleDesc: "Drives marketing acquisition pipelines, sales funnels, and advertising budgets. Marcus manages client acquisition efficiency (LTV : CAC ratios).",
    marcusUseHeader: "How he uses NBD",
    marcusUseDesc: "Marcus models ad campaign conversion rates and CPC using the morphing Funnel Simulator to project marketing budget requirements.",
    marcusGoalsLabel: "Goals:",
    marcusGoalsDesc: "Maximize cohort lifetime value return while maintaining a CAC payback under 12 months.",
    marcusPainLabel: "Pain Points:",
    marcusPainDesc: "Disconnect between paid search spends (CPC) and downstream customer cohort retention."
  },
  metrics: {
    coreHeader: "Core Equations",
    coreIntro: "The simulator employs standard SaaS subscription accounting combined with mathematical consumer models. Here are the logic guidelines powering the app:",
    
    eq1Title: "Customer Lifetime Value (LTV)",
    eq1Formula: "LTV = Price / Churn Rate",
    eq1Desc: "Defines the net revenue yield of a customer before they unsubscribe.",
    
    eq2Title: "Customer Acquisition Cost (CAC)",
    eq2Formula: "CAC = (Traffic * CPC) / New Paid Users",
    eq2Desc: "Calculates average search budget spend to convert a single customer license.",
    
    eq3Title: "LTV : CAC Ratio",
    eq3Formula: "Ratio = LTV / CAC",
    eq3Desc: "A unit economics health score. Values > 3x indicate sustainable acquisition.",
    
    advancedHeader: "Elasticity & Churn Modeling Specifications",
    
    spec1Title: "1. Constant Elasticity of Demand",
    spec1Formula: "Q = Q0 * (P / P0)^ε",
    spec1Desc: "Where Q0 and P0 represent default baseline volumes and prices, P is the simulated price, and ε (elasticity coefficient) represents demand sensitivity (e.g. -1.2). As price changes, volume scales exponentially relative to the coefficient.",
    
    spec2Title: "2. Price-Sensitive Churn Degradation",
    spec2Formula: "Churn = Churn0 * (1 + γ * max(0, (P - P0) / P0)^2)",
    spec2Desc: "We model churn asymmetry: pricing discounts do not reduce churn below baseline, but pricing hikes trigger a quadratic churn increase scaled by the Churn Sensitivity coefficient γ. This forces the LTV optimizer to find a real pricing ceiling, penalizing aggressive price hikes with exponential subscriber drop-off."
  },
  experimentation: {
    frameworkHeader: "A/B Testing Framework",
    frameworkIntro: "To prove product value, a Product Manager needs to design robust experimentation strategies. In this workspace, A/B testing is defined through two main streams:",
    
    hypoTitle: "A/B Testing Hypothesis",
    hypoDesc: "\"By introducing dynamic simulators (elasticity graphs and funnels) to category managers, we increase pricing optimization completion rates by 35% compared to legacy static reports.\"",
    
    splitsTitle: "Traffic Splits",
    splitsDesc: "Control (50%): Receives standard pricing recommendation templates.\nTreatment (50%): Receives the full-page predictive simulator dashboard.",
    
    feedbackHeader: "Closing the Loop: Recommendation Feedback",
    feedbackIntro: "A recommendation engine is only as good as its training signals. To build this reinforcement loop, we added Thumbs Up (Helpful) / Thumbs Down (Not Helpful) buttons next to every decision.",
    
    upTitle: "Thumbs Up",
    upDesc: "Signals that the heuristic is accurate and aligned with category goals. This reinforces the recommendation type weights, making similar alerts display earlier.",
    
    downTitle: "Thumbs Down",
    downDesc: "Triggers heuristics refinement. Negative signals flag that target parameters are mismatched (e.g. churn sensitivity is set too low for that specific customer base).",
    
    footerText: "Interactive Demo Live: Cast votes directly on active decisions in the Dashboard or Suite Details to toggle state persistence in LocalStorage."
  }
};

export default function StrategyHub({ database, onSaveHubContent, onBack }) {
  const [activeTab, setActiveTab] = useState('prd'); // 'prd' | 'personas' | 'metrics' | 'experimentation'
  const [hubContent, setHubContent] = useState(() => {
    return database?.strategyHubContent || DEFAULT_CONTENT;
  });

  useEffect(() => {
    setHubContent(database?.strategyHubContent || DEFAULT_CONTENT);
  }, [database]);

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const setNestedValue = (obj, path, value) => {
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((acc, part) => acc[part], obj);
    if (target) {
      target[last] = value;
    }
  };

  const renderEditable = (path, tagName = 'p', style = {}, className = '') => {
    const Tag = tagName;
    const value = getNestedValue(hubContent, path) || '';

    const handleBlur = (e) => {
      const newText = e.currentTarget.textContent;
      const updated = JSON.parse(JSON.stringify(hubContent));
      setNestedValue(updated, path, newText);
      setHubContent(updated);
      if (onSaveHubContent) {
        onSaveHubContent(updated);
      }
    };

    return (
      <Tag
        contentEditable
        suppressContentEditableWarning
        className={`editable-text ${className}`}
        style={{ outline: 'none', ...style }}
        onBlur={handleBlur}
      >
        {value}
      </Tag>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Back button */}
      <div className="back-button" style={{ marginBottom: '1rem' }}>
        <button onClick={onBack}>
          <ArrowLeft size={16} /> Back to Dashboard
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
              <Award size={24} />
            </div>
            {renderEditable('header.title', 'h1', { margin: 0 }, 'page-title')}
          </div>
          {renderEditable('header.subtitle', 'p', { marginTop: '0.25rem' }, 'page-subtitle')}
        </div>
      </div>

      {/* Strategy Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        borderBottom: '1px solid var(--border-color)', 
        paddingBottom: '1px', 
        marginBottom: '2rem' 
      }}>
        <button 
          onClick={() => setActiveTab('prd')}
          className={`btn ${activeTab === 'prd' ? 'btn-primary' : 'btn-ghost'}`}
          style={{
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottom: activeTab === 'prd' ? '3px solid var(--color-primary-dark)' : 'none',
            fontWeight: 700,
            padding: '0.75rem 1.5rem',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FileText size={16} />
          Product Specification (PRD)
        </button>
        <button 
          onClick={() => setActiveTab('personas')}
          className={`btn ${activeTab === 'personas' ? 'btn-primary' : 'btn-ghost'}`}
          style={{
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottom: activeTab === 'personas' ? '3px solid var(--color-primary-dark)' : 'none',
            fontWeight: 700,
            padding: '0.75rem 1.5rem',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Users size={16} />
          Target User Personas
        </button>
        <button 
          onClick={() => setActiveTab('metrics')}
          className={`btn ${activeTab === 'metrics' ? 'btn-primary' : 'btn-ghost'}`}
          style={{
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottom: activeTab === 'metrics' ? '3px solid var(--color-primary-dark)' : 'none',
            fontWeight: 700,
            padding: '0.75rem 1.5rem',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Calculator size={16} />
          Metrics & Analytical Models
        </button>
        <button 
          onClick={() => setActiveTab('experimentation')}
          className={`btn ${activeTab === 'experimentation' ? 'btn-primary' : 'btn-ghost'}`}
          style={{
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottom: activeTab === 'experimentation' ? '3px solid var(--color-primary-dark)' : 'none',
            fontWeight: 700,
            padding: '0.75rem 1.5rem',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Zap size={16} />
          Experimentation & Feedback
        </button>
      </div>

      {/* Tab Contents */}
      <div style={{ animation: 'slideUp 0.3s ease-out' }}>
        
        {/* Tab 1: PRD */}
        {activeTab === 'prd' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
            
            {/* PRD Main Card */}
            <div className="detail-card" style={{ margin: 0, padding: '2rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                <Bookmark size={18} color="var(--color-primary)" />
                {renderEditable('prd.title', 'span')}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                <div>
                  {renderEditable('prd.problemHeader', 'h4', { color: 'var(--color-primary-dark)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' })}
                  {renderEditable('prd.problemText', 'p', { fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 })}
                </div>

                <div>
                  {renderEditable('prd.valueHeader', 'h4', { color: 'var(--color-primary-dark)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' })}
                  {renderEditable('prd.valueText', 'p', { fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 })}
                </div>

                <div>
                  {renderEditable('prd.featuresHeader', 'h4', { color: 'var(--color-primary-dark)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' })}
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li style={{ display: 'list-item' }}>
                      {renderEditable('prd.feature1Title', 'strong', { marginRight: '0.25rem' })}: {renderEditable('prd.feature1Desc', 'span')}
                    </li>
                    <li style={{ display: 'list-item' }}>
                      {renderEditable('prd.feature2Title', 'strong', { marginRight: '0.25rem' })}: {renderEditable('prd.feature2Desc', 'span')}
                    </li>
                    <li style={{ display: 'list-item' }}>
                      {renderEditable('prd.feature3Title', 'strong', { marginRight: '0.25rem' })}: {renderEditable('prd.feature3Desc', 'span')}
                    </li>
                    <li style={{ display: 'list-item' }}>
                      {renderEditable('prd.feature4Title', 'strong', { marginRight: '0.25rem' })}: {renderEditable('prd.feature4Desc', 'span')}
                    </li>
                  </ul>
                </div>

              </div>
            </div>

            {/* Scope & Milestones Side Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Product KPIs */}
              <div className="detail-card" style={{ margin: 0, padding: '1.5rem', backgroundColor: '#faf5ff', border: '1px solid #f3e8ff' }}>
                <h4 style={{ color: 'var(--tier-best-text)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Zap size={16} />
                  {renderEditable('prd.okrHeader', 'span')}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {renderEditable('prd.okrGoal1Title', 'strong')}
                    {renderEditable('prd.okrGoal1Desc', 'div', { color: 'var(--text-secondary)' })}
                  </div>
                  <div style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {renderEditable('prd.okrGoal2Title', 'strong')}
                    {renderEditable('prd.okrGoal2Desc', 'div', { color: 'var(--text-secondary)' })}
                  </div>
                  <div style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {renderEditable('prd.okrGoal3Title', 'strong')}
                    {renderEditable('prd.okrGoal3Desc', 'div', { color: 'var(--text-secondary)' })}
                  </div>
                </div>
              </div>

              {/* Release Roadmap */}
              <div className="detail-card" style={{ margin: 0, padding: '1.5rem' }}>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <GitCommit size={16} color="var(--color-primary)" />
                  {renderEditable('prd.roadmapHeader', 'span')}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <CheckCircle size={14} color="var(--color-success)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      {renderEditable('prd.milestone1Title', 'strong')}
                      {renderEditable('prd.milestone1Desc', 'div', { color: 'var(--text-muted)' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <CheckCircle size={14} color="var(--color-success)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      {renderEditable('prd.milestone2Title', 'strong')}
                      {renderEditable('prd.milestone2Desc', 'div', { color: 'var(--text-muted)' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <CheckCircle size={14} color="var(--color-success)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      {renderEditable('prd.milestone3Title', 'strong')}
                      {renderEditable('prd.milestone3Desc', 'div', { color: 'var(--text-muted)' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <GitCommit size={14} color="var(--color-primary)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      {renderEditable('prd.milestone4Title', 'strong')}
                      {renderEditable('prd.milestone4Desc', 'div', { color: 'var(--text-muted)' })}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Personas */}
        {activeTab === 'personas' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            {/* Persona 1: Sarah */}
            <div className="detail-card" style={{ margin: 0, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: '4px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  backgroundColor: 'var(--color-primary-light)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: 'var(--color-primary-dark)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  S
                </div>
                <div>
                  {renderEditable('personas.sarahName', 'h3', { margin: 0, fontSize: '1.15rem' })}
                  {renderEditable('personas.sarahTitle', 'span', { fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-block' })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', fontSize: '0.85rem' }}>
                <div>
                  {renderEditable('personas.sarahRoleHeader', 'strong')}
                  {renderEditable('personas.sarahRoleDesc', 'p', { color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 })}
                </div>
                <div>
                  {renderEditable('personas.sarahUseHeader', 'strong')}
                  {renderEditable('personas.sarahUseDesc', 'p', { color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  {renderEditable('personas.sarahGoalsLabel', 'strong', { color: 'var(--color-success)', flexShrink: 0 })}
                  {renderEditable('personas.sarahGoalsDesc', 'span', { color: 'var(--text-secondary)' })}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  {renderEditable('personas.sarahPainLabel', 'strong', { color: 'var(--color-danger)', flexShrink: 0 })}
                  {renderEditable('personas.sarahPainDesc', 'span', { color: 'var(--text-secondary)' })}
                </div>
              </div>
            </div>

            {/* Persona 2: Marcus */}
            <div className="detail-card" style={{ margin: 0, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: '4px solid var(--color-success)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  backgroundColor: 'var(--color-success-bg)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: 'var(--color-success)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  M
                </div>
                <div>
                  {renderEditable('personas.marcusName', 'h3', { margin: 0, fontSize: '1.15rem' })}
                  {renderEditable('personas.marcusTitle', 'span', { fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-block' })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', fontSize: '0.85rem' }}>
                <div>
                  {renderEditable('personas.marcusRoleHeader', 'strong')}
                  {renderEditable('personas.marcusRoleDesc', 'p', { color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 })}
                </div>
                <div>
                  {renderEditable('personas.marcusUseHeader', 'strong')}
                  {renderEditable('personas.marcusUseDesc', 'p', { color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  {renderEditable('personas.marcusGoalsLabel', 'strong', { color: 'var(--color-success)', flexShrink: 0 })}
                  {renderEditable('personas.marcusGoalsDesc', 'span', { color: 'var(--text-secondary)' })}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  {renderEditable('personas.marcusPainLabel', 'strong', { color: 'var(--color-danger)', flexShrink: 0 })}
                  {renderEditable('personas.marcusPainDesc', 'span', { color: 'var(--text-secondary)' })}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Metrics */}
        {activeTab === 'metrics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }}>
            
            {/* Core Calculations Explanation */}
            <div className="detail-card" style={{ margin: 0, padding: '2rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <Calculator size={18} color="var(--color-primary)" />
                {renderEditable('metrics.coreHeader', 'span')}
              </h3>
              {renderEditable('metrics.coreIntro', 'p', { fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' })}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem' }}>
                <div style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {renderEditable('metrics.eq1Title', 'strong')}
                  {renderEditable('metrics.eq1Formula', 'div', { fontFamily: 'monospace', color: 'var(--color-primary-dark)', fontSize: '0.9rem' })}
                  {renderEditable('metrics.eq1Desc', 'div', { color: 'var(--text-muted)' })}
                </div>

                <div style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {renderEditable('metrics.eq2Title', 'strong')}
                  {renderEditable('metrics.eq2Formula', 'div', { fontFamily: 'monospace', color: 'var(--color-primary-dark)', fontSize: '0.9rem' })}
                  {renderEditable('metrics.eq2Desc', 'div', { color: 'var(--text-muted)' })}
                </div>

                <div style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {renderEditable('metrics.eq3Title', 'strong')}
                  {renderEditable('metrics.eq3Formula', 'div', { fontFamily: 'monospace', color: 'var(--color-primary-dark)', fontSize: '0.9rem' })}
                  {renderEditable('metrics.eq3Desc', 'div', { color: 'var(--text-muted)' })}
                </div>
              </div>
            </div>

            {/* Advanced Modeling Explanations */}
            <div className="detail-card" style={{ margin: 0, padding: '2rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <TrendingUp size={18} color="var(--color-primary)" />
                {renderEditable('metrics.advancedHeader', 'span')}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.85rem' }}>
                
                {/* Elasticity model */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, margin: '0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Percent size={14} color="var(--color-primary)" />
                    {renderEditable('metrics.spec1Title', 'span')}
                  </h4>
                  {renderEditable('metrics.spec1Formula', 'div', { backgroundColor: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: '6px', fontFamily: 'monospace', color: 'var(--color-primary-dark)', fontSize: '0.9rem' })}
                  {renderEditable('metrics.spec1Desc', 'p', { color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 })}
                </div>

                {/* Churn sensitivity model */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, margin: '0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Percent size={14} color="var(--color-primary)" />
                    {renderEditable('metrics.spec2Title', 'span')}
                  </h4>
                  {renderEditable('metrics.spec2Formula', 'div', { backgroundColor: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: '6px', fontFamily: 'monospace', color: 'var(--color-primary-dark)', fontSize: '0.9rem' })}
                  {renderEditable('metrics.spec2Desc', 'p', { color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 })}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Experimentation */}
        {activeTab === 'experimentation' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }}>
            
            {/* A/B Testing Framework */}
            <div className="detail-card" style={{ margin: 0, padding: '2rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <Zap size={18} color="var(--color-primary)" />
                {renderEditable('experimentation.frameworkHeader', 'span')}
              </h3>
              {renderEditable('experimentation.frameworkIntro', 'p', { fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' })}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', borderLeft: '3px solid var(--color-primary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {renderEditable('experimentation.hypoTitle', 'strong')}
                  {renderEditable('experimentation.hypoDesc', 'div', { color: 'var(--text-secondary)', lineHeight: 1.4, fontStyle: 'italic' })}
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', borderLeft: '3px solid var(--color-primary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {renderEditable('experimentation.splitsTitle', 'strong')}
                  {renderEditable('experimentation.splitsDesc', 'div', { color: 'var(--text-secondary)', lineHeight: 1.4, whiteSpace: 'pre-line' })}
                </div>
              </div>
            </div>

            {/* Direct Recommendation Feedback Loop */}
            <div className="detail-card" style={{ margin: 0, padding: '2rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <UserCheck size={18} color="var(--color-success)" />
                {renderEditable('experimentation.feedbackHeader', 'span')}
              </h3>
              {renderEditable('experimentation.feedbackIntro', 'p', { fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' })}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.85rem' }}>
                <div style={{ border: '1px solid var(--color-success-border)', padding: '1.25rem', borderRadius: '10px', backgroundColor: 'var(--color-success-bg)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-success)', fontWeight: 700 }}>
                    <ThumbsUp size={16} fill="var(--color-success)" />
                    {renderEditable('experimentation.upTitle', 'span')}
                  </div>
                  {renderEditable('experimentation.upDesc', 'p', { color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 })}
                </div>

                <div style={{ border: '1px solid var(--color-danger-border)', padding: '1.25rem', borderRadius: '10px', backgroundColor: 'var(--color-danger-bg)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-danger)', fontWeight: 700 }}>
                    <ThumbsDown size={16} fill="var(--color-danger)" />
                    {renderEditable('experimentation.downTitle', 'span')}
                  </div>
                  {renderEditable('experimentation.downDesc', 'p', { color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 })}
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', padding: '0.75rem', border: '1px dashed var(--border-color)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc' }}>
                <CheckCircle size={14} color="var(--color-success)" style={{ flexShrink: 0 }} />
                {renderEditable('experimentation.footerText', 'span', { flex: 1 })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
