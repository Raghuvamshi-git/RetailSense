// ── Shared demo data used across pages ──────────────────────────────────────
// All values labelled DEMO DATA – not from the API.

export const DEMO_KPI = {
  totalRevenue:  { value: '$2.47M', delta: '+12.3%', trend: 'up' },
  totalOrders:   { value: '18,432', delta: '+8.1%',  trend: 'up' },
  stockoutRisk:  { value: '7 SKUs', delta: '-3',      trend: 'up' },   // fewer stockouts = good
  forecastAccuracy: { value: '94.2%', delta: '+1.8%', trend: 'up' },
};

// Demand forecast trend (last 14 days + 7-day forecast)
export const DEMO_FORECAST_SERIES = (() => {
  const days = [];
  const today = new Date();
  for (let i = -13; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const base = 120 + Math.sin(i * 0.5) * 40;
    const actual = i <= 0 ? Math.round(base + (Math.random() - 0.5) * 20) : null;
    const forecast = i >= -2 ? Math.round(base + (Math.random() - 0.5) * 15) : null;
    days.push({ date: label, actual, forecast });
  }
  return days;
})();

// Top 10 products by predicted demand
export const DEMO_TOP_PRODUCTS = [
  { id: 'ITEM_001', name: 'Premium Coffee Blend 500g', category: 'Beverages', demand: 482, stock: 1240, risk: 'LOW' },
  { id: 'ITEM_002', name: 'Organic Whole Milk 1L',     category: 'Dairy',     demand: 374, stock:  320, risk: 'HIGH' },
  { id: 'ITEM_003', name: 'Sourdough Bread Loaf',      category: 'Bakery',    demand: 321, stock:  560, risk: 'MEDIUM' },
  { id: 'ITEM_004', name: 'Greek Yogurt 500g',         category: 'Dairy',     demand: 298, stock:  890, risk: 'LOW' },
  { id: 'ITEM_005', name: 'Free-Range Eggs 12pk',      category: 'Produce',   demand: 271, stock:  170, risk: 'HIGH' },
  { id: 'ITEM_006', name: 'Sparkling Water 6pk',       category: 'Beverages', demand: 243, stock: 2100, risk: 'LOW' },
  { id: 'ITEM_007', name: 'Cheddar Cheese 400g',       category: 'Dairy',     demand: 218, stock:  420, risk: 'MEDIUM' },
  { id: 'ITEM_008', name: 'Pasta Fusilli 500g',        category: 'Pantry',    demand: 197, stock: 1800, risk: 'LOW' },
];

// Inventory risk distribution (for donut / bar)
export const DEMO_RISK_DIST = [
  { label: 'Critical',  value: 4,  color: '#ef4444' },
  { label: 'High',      value: 12, color: '#f59e0b' },
  { label: 'Medium',    value: 28, color: '#06b6d4' },
  { label: 'Low',       value: 56, color: '#10b981' },
];

// Pricing optimisation suggestions
export const DEMO_PRICING = [
  { sku: 'ITEM_001', name: 'Premium Coffee Blend 500g', current: 9.99,  suggested: 11.49, uplift: '+15.0%', confidence: 88 },
  { sku: 'ITEM_002', name: 'Organic Whole Milk 1L',     current: 1.79,  suggested: 1.65,  uplift: '-7.8%',  confidence: 92 },
  { sku: 'ITEM_003', name: 'Sourdough Bread Loaf',      current: 4.49,  suggested: 4.99,  uplift: '+11.1%', confidence: 76 },
  { sku: 'ITEM_004', name: 'Greek Yogurt 500g',         current: 2.99,  suggested: 3.29,  uplift: '+10.0%', confidence: 81 },
  { sku: 'ITEM_007', name: 'Cheddar Cheese 400g',       current: 5.49,  suggested: 4.99,  uplift: '-9.1%',  confidence: 85 },
];

// Promotions
export const DEMO_PROMOTIONS = [
  { id: 'PROMO_1', name: 'Summer Beverage Boost',   type: 'BOGO',        uplift: '+24%', status: 'ACTIVE',   ends: '2026-10-20' },
  { id: 'PROMO_2', name: 'Dairy Bundle Deal',        type: '10% Off',     uplift: '+18%', status: 'ACTIVE',   ends: '2026-10-15' },
  { id: 'PROMO_3', name: 'Weekend Bakery Special',   type: 'Flash Sale',  uplift: '+31%', status: 'SCHEDULED',ends: '2026-10-12' },
  { id: 'PROMO_4', name: 'Pantry Essentials Week',   type: '5% Off',      uplift: '+9%',  status: 'ENDED',    ends: '2026-10-05' },
];

// Anomalies
export const DEMO_ANOMALIES = [
  { id: 'AN_001', type: 'DEMAND_SPIKE',   severity: 'HIGH',   item: 'ITEM_002', desc: 'Demand 3.2× above forecast – potential supply event', ts: '2026-10-10 18:04' },
  { id: 'AN_002', type: 'PRICE_DROP',     severity: 'MEDIUM', item: 'ITEM_007', desc: 'Competitor price cut detected – suggest repricing',    ts: '2026-10-10 14:22' },
  { id: 'AN_003', type: 'STOCKOUT_RISK',  severity: 'HIGH',   item: 'ITEM_005', desc: 'Projected stockout in 48 h at current sell rate',      ts: '2026-10-10 11:50' },
  { id: 'AN_004', type: 'SLOW_MOVER',     severity: 'LOW',    item: 'ITEM_008', desc: 'Units/day dropped 60% vs. 30-day avg',                 ts: '2026-10-09 09:17' },
];

// Weekly revenue for overview sparkline
export const DEMO_WEEKLY_REVENUE = [
  { week: 'W37', revenue: 380000 },
  { week: 'W38', revenue: 410000 },
  { week: 'W39', revenue: 395000 },
  { week: 'W40', revenue: 442000 },
  { week: 'W41', revenue: 470000 },
  { week: 'W42', revenue: 465000 },
  { week: 'W43', revenue: 487000 },
];

// Category demand breakdown
export const DEMO_CATEGORY_DEMAND = [
  { category: 'Beverages', demand: 1280 },
  { category: 'Dairy',     demand: 940  },
  { category: 'Bakery',    demand: 720  },
  { category: 'Produce',   demand: 610  },
  { category: 'Pantry',    demand: 540  },
  { category: 'Snacks',    demand: 430  },
];
