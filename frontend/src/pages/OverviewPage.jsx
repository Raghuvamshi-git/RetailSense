import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import KpiCard from '../components/KpiCard';
import {
  DollarSign, ShoppingBag, AlertTriangle, Target,
  TrendingUp, Package
} from 'lucide-react';
import {
  DEMO_KPI, DEMO_FORECAST_SERIES, DEMO_WEEKLY_REVENUE,
  DEMO_CATEGORY_DEMAND, DEMO_ANOMALIES, DEMO_TOP_PRODUCTS
} from '../data/demoData';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const severityColor = { HIGH: 'var(--danger)', MEDIUM: 'var(--warning)', LOW: 'var(--success)' };
const riskClass = { HIGH: 'risk-high', MEDIUM: 'risk-medium', LOW: 'risk-low' };

export default function OverviewPage() {
  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Overview</h1>
        <p>Executive summary of retail operations · All KPIs below are <strong style={{color:'var(--warning)'}}>DEMO DATA</strong></p>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <KpiCard
          label="Total Revenue (MTD)"
          value={DEMO_KPI.totalRevenue.value}
          delta={DEMO_KPI.totalRevenue.delta}
          trend="up"
          icon={DollarSign}
          color="blue"
          isDemo
        />
        <KpiCard
          label="Total Orders (MTD)"
          value={DEMO_KPI.totalOrders.value}
          delta={DEMO_KPI.totalOrders.delta}
          trend="up"
          icon={ShoppingBag}
          color="cyan"
          isDemo
        />
        <KpiCard
          label="Stockout Risk Items"
          value={DEMO_KPI.stockoutRisk.value}
          delta={DEMO_KPI.stockoutRisk.delta}
          trend="up"
          icon={AlertTriangle}
          color="orange"
          isDemo
        />
        <KpiCard
          label="Forecast Accuracy"
          value={DEMO_KPI.forecastAccuracy.value}
          delta={DEMO_KPI.forecastAccuracy.delta}
          trend="up"
          icon={Target}
          color="green"
          isDemo
        />
      </div>

      {/* Charts Row */}
      <div className="grid-2 section">
        {/* Weekly Revenue */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={14} color="var(--accent-blue-lt)" />
              Weekly Revenue Trend
            </div>
            <span className="demo-badge">DEMO DATA</span>
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={DEMO_WEEKLY_REVENUE}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#2563eb" strokeWidth={2} fill="url(#revGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Demand */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Package size={14} color="var(--accent-cyan-lt)" />
              Category Demand Breakdown
            </div>
            <span className="demo-badge">DEMO DATA</span>
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={DEMO_CATEGORY_DEMAND} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="category" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="demand" name="Units/day" fill="url(#catGrad)" radius={[0, 4, 4, 0]} />
                <defs>
                  <linearGradient id="catGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-2 section">
        {/* Top Products table */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Package size={14} color="var(--accent-cyan-lt)" />
              Top Products by Demand
            </div>
            <span className="demo-badge">DEMO DATA</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Demand/day</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_TOP_PRODUCTS.slice(0, 5).map((p) => (
                <tr key={p.id}>
                  <td className="truncate" style={{ maxWidth: 180 }}>{p.name}</td>
                  <td>{p.demand}</td>
                  <td><span className={`risk-badge ${riskClass[p.risk]}`}>{p.risk}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Anomalies */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <AlertTriangle size={14} color="var(--warning)" />
              Recent Anomalies
            </div>
            <span className="demo-badge">DEMO DATA</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DEMO_ANOMALIES.map((a) => (
              <div key={a.id} style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderLeft: `3px solid ${severityColor[a.severity]}`,
                borderRadius: 8,
                padding: '10px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: severityColor[a.severity] }}>{a.type.replace(/_/g,' ')}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.ts}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
