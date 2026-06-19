const STORAGE_KEY = 'next_best_decision_db';

export const DEFAULT_SUITES = [
  {
    id: 'suite-endpoint',
    name: 'Endpoint Shield Suite',
    description: 'Protection for workstations, mobile devices, and servers.'
  },
  {
    id: 'suite-cloud',
    name: 'Cloud Sentinel Suite',
    description: 'Cloud infrastructure security posture and container guard.'
  },
  {
    id: 'suite-identity',
    name: 'Identity & Access Suite',
    description: 'Multi-factor authentication, single sign-on, and Zero Trust access.'
  }
];

export const DEFAULT_PRODUCTS = [
  // Endpoint Shield Suite
  {
    id: 'prod-endpoint-basic',
    suiteId: 'suite-endpoint',
    name: 'Core Antivirus & Firewall',
    tier: 'good',
    price: 15,
    targetSales: 600,
    weeklyVolume: 535,
    lastWeekVolume: 510,
    history: [
      { month: 'Jun 2025', volume: 420 },
      { month: 'Jul 2025', volume: 430 },
      { month: 'Aug 2025', volume: 440 },
      { month: 'Sep 2025', volume: 435 },
      { month: 'Oct 2025', volume: 450 },
      { month: 'Nov 2025', volume: 460 },
      { month: 'Dec 2025', volume: 480 },
      { month: 'Jan 2026', volume: 475 },
      { month: 'Feb 2026', volume: 490 },
      { month: 'Mar 2026', volume: 500 },
      { month: 'Apr 2026', volume: 515 },
      { month: 'May 2026', volume: 525 },
      { month: 'Jun 2026', volume: 535 }
    ]
  },
  {
    id: 'prod-endpoint-pro',
    suiteId: 'suite-endpoint',
    name: 'Advanced Endpoint Protection',
    tier: 'better',
    price: 35,
    targetSales: 350,
    weeklyVolume: 275,
    lastWeekVolume: 285,
    history: [
      { month: 'Jun 2025', volume: 210 },
      { month: 'Jul 2025', volume: 220 },
      { month: 'Aug 2025', volume: 225 },
      { month: 'Sep 2025', volume: 230 },
      { month: 'Oct 2025', volume: 240 },
      { month: 'Nov 2025', volume: 250 },
      { month: 'Dec 2025', volume: 255 },
      { month: 'Jan 2026', volume: 260 },
      { month: 'Feb 2026', volume: 270 },
      { month: 'Mar 2026', volume: 275 },
      { month: 'Apr 2026', volume: 282 },
      { month: 'May 2026', volume: 290 },
      { month: 'Jun 2026', volume: 275 }
    ]
  },
  {
    id: 'prod-endpoint-best',
    suiteId: 'suite-endpoint',
    name: 'Managed Detection & Response (MDR)',
    tier: 'best',
    price: 75,
    targetSales: 160,
    weeklyVolume: 142,
    lastWeekVolume: 138,
    history: [
      { month: 'Jun 2025', volume: 90 },
      { month: 'Jul 2025', volume: 95 },
      { month: 'Aug 2025', volume: 100 },
      { month: 'Sep 2025', volume: 105 },
      { month: 'Oct 2025', volume: 110 },
      { month: 'Nov 2025', volume: 115 },
      { month: 'Dec 2025', volume: 120 },
      { month: 'Jan 2026', volume: 122 },
      { month: 'Feb 2026', volume: 125 },
      { month: 'Mar 2026', volume: 130 },
      { month: 'Apr 2026', volume: 132 },
      { month: 'May 2026', volume: 136 },
      { month: 'Jun 2026', volume: 142 }
    ]
  },

  // Cloud Sentinel Suite
  {
    id: 'prod-cloud-basic',
    suiteId: 'suite-cloud',
    name: 'Cloud Security Posture (CSPM)',
    tier: 'good',
    price: 49,
    targetSales: 250,
    weeklyVolume: 175,
    lastWeekVolume: 174,
    history: [
      { month: 'Jun 2025', volume: 160 },
      { month: 'Jul 2025', volume: 162 },
      { month: 'Aug 2025', volume: 165 },
      { month: 'Sep 2025', volume: 163 },
      { month: 'Oct 2025', volume: 168 },
      { month: 'Nov 2025', volume: 170 },
      { month: 'Dec 2025', volume: 175 },
      { month: 'Jan 2026', volume: 172 },
      { month: 'Feb 2026', volume: 174 },
      { month: 'Mar 2026', volume: 176 },
      { month: 'Apr 2026', volume: 173 },
      { month: 'May 2026', volume: 175 },
      { month: 'Jun 2026', volume: 175 }
    ]
  },
  {
    id: 'prod-cloud-pro',
    suiteId: 'suite-cloud',
    name: 'Container Guard Pro',
    tier: 'better',
    price: 99,
    targetSales: 150,
    weeklyVolume: 92,
    lastWeekVolume: 95,
    history: [
      { month: 'Jun 2025', volume: 115 },
      { month: 'Jul 2025', volume: 112 },
      { month: 'Aug 2025', volume: 110 },
      { month: 'Sep 2025', volume: 108 },
      { month: 'Oct 2025', volume: 105 },
      { month: 'Nov 2025', volume: 102 },
      { month: 'Dec 2025', volume: 100 },
      { month: 'Jan 2026', volume: 98 },
      { month: 'Feb 2026', volume: 97 },
      { month: 'Mar 2026', volume: 96 },
      { month: 'Apr 2026', volume: 94 },
      { month: 'May 2026', volume: 93 },
      { month: 'Jun 2026', volume: 92 }
    ]
  },
  {
    id: 'prod-cloud-best',
    suiteId: 'suite-cloud',
    name: 'Hybrid Cloud Defense',
    tier: 'best',
    price: 199,
    targetSales: 60,
    weeklyVolume: 43,
    lastWeekVolume: 44,
    history: [
      { month: 'Jun 2025', volume: 46 },
      { month: 'Jul 2025', volume: 45 },
      { month: 'Aug 2025', volume: 45 },
      { month: 'Sep 2025', volume: 44 },
      { month: 'Oct 2025', volume: 44 },
      { month: 'Nov 2025', volume: 43 },
      { month: 'Dec 2025', volume: 43 },
      { month: 'Jan 2026', volume: 42 },
      { month: 'Feb 2026', volume: 42 },
      { month: 'Mar 2026', volume: 42 },
      { month: 'Apr 2026', volume: 43 },
      { month: 'May 2026', volume: 43 },
      { month: 'Jun 2026', volume: 43 }
    ]
  },

  // Identity & Access Suite
  {
    id: 'prod-identity-basic',
    suiteId: 'suite-identity',
    name: 'Multi-Factor Authentication (MFA) Basic',
    tier: 'good',
    price: 5,
    targetSales: 2500,
    weeklyVolume: 2150,
    lastWeekVolume: 1980,
    history: [
      { month: 'Jun 2025', volume: 1300 },
      { month: 'Jul 2025', volume: 1350 },
      { month: 'Aug 2025', volume: 1420 },
      { month: 'Sep 2025', volume: 1480 },
      { month: 'Oct 2025', volume: 1550 },
      { month: 'Nov 2025', volume: 1620 },
      { month: 'Dec 2025', volume: 1700 },
      { month: 'Jan 2026', volume: 1750 },
      { month: 'Feb 2026', volume: 1820 },
      { month: 'Mar 2026', volume: 1900 },
      { month: 'Apr 2026', volume: 1980 },
      { month: 'May 2026', volume: 2050 },
      { month: 'Jun 2026', volume: 2150 }
    ]
  },
  {
    id: 'prod-identity-pro',
    suiteId: 'suite-identity',
    name: 'Single Sign-On (SSO) Enterprise',
    tier: 'better',
    price: 12,
    targetSales: 1100,
    weeklyVolume: 980,
    lastWeekVolume: 920,
    history: [
      { month: 'Jun 2025', volume: 610 },
      { month: 'Jul 2025', volume: 640 },
      { month: 'Aug 2025', volume: 680 },
      { month: 'Sep 2025', volume: 710 },
      { month: 'Oct 2025', volume: 740 },
      { month: 'Nov 2025', volume: 770 },
      { month: 'Dec 2025', volume: 800 },
      { month: 'Jan 2026', volume: 830 },
      { month: 'Feb 2026', volume: 860 },
      { month: 'Mar 2026', volume: 890 },
      { month: 'Apr 2026', volume: 920 },
      { month: 'May 2026', volume: 950 },
      { month: 'Jun 2026', volume: 980 }
    ]
  },
  {
    id: 'prod-identity-best',
    suiteId: 'suite-identity',
    name: 'Zero Trust Access Control',
    tier: 'best',
    price: 25,
    targetSales: 600,
    weeklyVolume: 510,
    lastWeekVolume: 470,
    history: [
      { month: 'Jun 2025', volume: 180 },
      { month: 'Jul 2025', volume: 210 },
      { month: 'Aug 2025', volume: 240 },
      { month: 'Sep 2025', volume: 270 },
      { month: 'Oct 2025', volume: 300 },
      { month: 'Nov 2025', volume: 330 },
      { month: 'Dec 2025', volume: 360 },
      { month: 'Jan 2026', volume: 380 },
      { month: 'Feb 2026', volume: 410 },
      { month: 'Mar 2026', volume: 440 },
      { month: 'Apr 2026', volume: 460 },
      { month: 'May 2026', volume: 480 },
      { month: 'Jun 2026', volume: 510 }
    ]
  }
];

export function getDatabase() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const initialDb = { 
      suites: DEFAULT_SUITES, 
      products: DEFAULT_PRODUCTS,
      decisionStates: {
        'suite-endpoint': 'active',
        'suite-cloud': 'active',
        'suite-identity': 'active'
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb));
    return initialDb;
  }
  const db = JSON.parse(data);
  
  // Auto-migration to justify warning badge for Endpoint Shield
  const targetProd = db.products.find(p => p.id === 'prod-endpoint-pro');
  if (targetProd && targetProd.weeklyVolume === 298) {
    targetProd.weeklyVolume = 275;
    if (targetProd.history && targetProd.history.length > 0) {
      targetProd.history[targetProd.history.length - 1].volume = 275;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  if (!db.decisionStates) {
    db.decisionStates = {
      'suite-endpoint': 'active',
      'suite-cloud': 'active',
      'suite-identity': 'active'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
  return db;
}

export function saveDatabase(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetDatabase() {
  const initialDb = { 
    suites: DEFAULT_SUITES, 
    products: DEFAULT_PRODUCTS,
    decisionStates: {
      'suite-endpoint': 'active',
      'suite-cloud': 'active',
      'suite-identity': 'active'
    }
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb));
  return initialDb;
}

export function updateProduct(updatedProduct) {
  const db = getDatabase();
  const index = db.products.findIndex(p => p.id === updatedProduct.id);
  if (index !== -1) {
    db.products[index] = updatedProduct;
    saveDatabase(db);
  }
  return db;
}

export function addProduct(newProduct) {
  const db = getDatabase();
  db.products.push(newProduct);
  saveDatabase(db);
  return db;
}

export function deleteProduct(productId) {
  const db = getDatabase();
  db.products = db.products.filter(p => p.id !== productId);
  saveDatabase(db);
  return db;
}

export function updateDecisionState(suiteId, status) {
  const db = getDatabase();
  if (!db.decisionStates) {
    db.decisionStates = {};
  }
  db.decisionStates[suiteId] = status;
  saveDatabase(db);
  return db;
}

export function updateDecisionFeedback(suiteId, feedback) {
  const db = getDatabase();
  if (!db.decisionFeedback) {
    db.decisionFeedback = {};
  }
  if (db.decisionFeedback[suiteId] === feedback) {
    delete db.decisionFeedback[suiteId];
  } else {
    db.decisionFeedback[suiteId] = feedback;
  }
  saveDatabase(db);
  return db;
}

export function addGeneralFeedback(feedbackItem) {
  const db = getDatabase();
  if (!db.feedbacks) {
    db.feedbacks = [];
  }
  db.feedbacks.push({
    id: 'feedback-' + Date.now(),
    timestamp: new Date().toISOString(),
    ...feedbackItem
  });
  saveDatabase(db);
  return db;
}

export function saveStrategyHubContent(content) {
  const db = getDatabase();
  db.strategyHubContent = content;
  saveDatabase(db);
  return db;
}
