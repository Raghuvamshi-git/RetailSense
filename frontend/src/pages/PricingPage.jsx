import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { DEMO_PRICING } from '../data/demoData';
import { Tag, TrendingUp, TrendingDown } from 'lucide-react';

const COLORS = { positive: '#10b981', negative: '#ef4444' };

export default function PricingPage() {
  const chartData = DEMO_PRICING.map((p) => ({
    name:    p.name.split(' ').slice(0, 2).join(' '),
    current: p.current,
    suggested: p.suggested,
    uplift: parseFloat(p.uplift),
  }));

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Pricing Optimization</h1>
        <p>AI-generated price recommendations — <strong style={{ color: 'var(--warning)' }}>DEMO DATA</strong> · Requires pricing engine endpoint (not yet exposed)</p>
      </div>

      <div className="section">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Tag size={14} color="var(--accent-purple-lt)" />
              Price Recommendation Table
            </div>
            <span className="demo-badge">DEMO DATA</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Current Price</th>
                <th>Suggested Price</th>
                <th>Revenue Uplift</th>
                <th>Confidence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_PRICING.map((p) => {
                const isUp = p.uplift.startsWith('+');
                return (
                  <tr key={p.sku}>
                    <td className="mono">{p.sku}</td>
                    <td>{p.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>${p.current.toFixed(2)}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${p.suggested.toFixed(2)}</td>
                    <td>
                      <span style={{ color: isUp ? 'var(--success)' : 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {p.uplift}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar-track" style={{ width: 60 }}>
                          <div className="progress-bar-fill" style={{ width: `${p.confidence}%`, background: 'var(--accent-blue)' }} />
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{p.confidence}%</span>
                      </div>
                    </td>
                    <td>
                      <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => alert('Pricing engine endpoint not yet exposed – DEMO ONLY')}>
                        Apply
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison chart */}
      <div className="card section">
        <div className="card-header">
          <div className="card-title">
            <Tag size={14} color="var(--accent-purple-lt)" />
            Current vs Suggested Prices
          </div>
          <span className="demo-badge">DEMO DATA</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(v) => `$${v.toFixed(2)}`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 8, color: 'var(--text-primary)' }} />
            <Bar dataKey="current"   name="Current Price"   fill="var(--bg-elevated)"    radius={[4,4,0,0]} />
            <Bar dataKey="suggested" name="Suggested Price" fill="var(--accent-purple)"  radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="ai-panel">
        <div className="ai-panel-header">
          <Tag size={16} /> Pricing Engine Note
        </div>
        <p>
          The backend contains a <code style={{ background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>src/pricing/</code> module.
          Once a <code style={{ background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>POST /pricing/</code> endpoint is added to the FastAPI
          router, this page will switch from demo data to real optimisation results automatically.
        </p>
      </div>
    </div>
  );
}
