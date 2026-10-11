import { useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { postInventory } from '../api/client';
import { LoadingState, ErrorState } from '../components/States';
import { DEMO_RISK_DIST } from '../data/demoData';
import { Package, AlertTriangle, Info, ShieldCheck } from 'lucide-react';

const DEFAULT_FORM = {
  predicted_demand:  120,
  demand_std:        18,
  current_inventory: 400,
  lead_time:         7,
  service_level_z:   1.65,
};

const riskColors = {
  LOW:      { bg: 'var(--success-bg)', color: 'var(--success)', cls: 'risk-low' },
  MEDIUM:   { bg: 'var(--warning-bg)', color: 'var(--warning)', cls: 'risk-medium' },
  HIGH:     { bg: 'var(--danger-bg)',  color: 'var(--danger)',  cls: 'risk-high' },
  CRITICAL: { bg: 'var(--danger-bg)', color: 'var(--danger)',  cls: 'risk-high' },
};

export default function InventoryPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        ...form,
        lead_time: parseInt(form.lead_time, 10),
      };
      const data = await postInventory(payload);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Radar data from API result
  const radarData = result
    ? [
        { metric: 'Safety Stock',   value: parseFloat(result.safety_stock.toFixed(1)) },
        { metric: 'Reorder Point',  value: parseFloat(result.reorder_point.toFixed(1)) },
        { metric: 'Order Qty',      value: parseFloat(result.recommended_order_quantity.toFixed(1)) },
        { metric: 'Risk Score',     value: parseFloat((result.risk_score * 100).toFixed(1)) },
        { metric: 'Current Stock',  value: form.current_inventory },
      ]
    : [];

  const risk = result ? riskColors[result.risk_level?.toUpperCase()] || riskColors.MEDIUM : null;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Inventory Intelligence</h1>
        <p>Real-time safety stock, reorder points &amp; risk scoring via API &nbsp;·&nbsp;
          Distribution chart uses <strong style={{ color: 'var(--warning)' }}>DEMO DATA</strong>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* ── Form ─────────────────────────────────────────── */}
        <div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Package size={14} color="var(--accent-cyan-lt)" />
                Inventory Parameters
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--accent-cyan-lt)', marginBottom: 14,
              background: 'rgba(6,182,212,0.08)', border: '1px solid var(--border-cyan)',
              borderRadius: 6, padding: '6px 10px', display: 'flex', gap: 6, alignItems: 'center' }}>
              <Info size={12} /> Real API call – POST /inventory/
            </div>
            <form onSubmit={handleSubmit}>
              {[
                { name: 'predicted_demand',  label: 'Predicted Daily Demand', step: '0.1', min: 0 },
                { name: 'demand_std',        label: 'Demand Std Deviation',   step: '0.1', min: 0 },
                { name: 'current_inventory', label: 'Current Inventory',      step: '1',   min: 0 },
                { name: 'lead_time',         label: 'Lead Time (days)',       step: '1',   min: 1 },
                { name: 'service_level_z',   label: 'Service Level Z-score',  step: '0.01',min: 0 },
              ].map(({ name, label, step, min }) => (
                <div className="input-group" key={name}>
                  <label>{label}</label>
                  <input
                    className="input-field"
                    type="number"
                    name={name}
                    value={form[name]}
                    step={step}
                    min={min}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}
              <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Calculating…' : '▶ Calculate Inventory'}
              </button>
            </form>
          </div>

          {/* Demo risk distribution */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header">
              <div className="card-title">
                <AlertTriangle size={14} color="var(--warning)" />
                Risk Distribution
              </div>
              <span className="demo-badge">DEMO DATA</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DEMO_RISK_DIST.map((r) => (
                <div key={r.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: r.color, fontWeight: 600 }}>{r.label}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{r.value} SKUs</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${r.value}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Results ────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading && <div className="card"><LoadingState message="Computing inventory metrics…" /></div>}
          {error && (
            <div className="card">
              <ErrorState message={`API Error: ${error} — ensure the backend is running at localhost:8000`} />
            </div>
          )}

          {result && !loading && (
            <>
              {/* KPI row */}
              <div className="grid-2">
                {[
                  { label: 'Safety Stock',         value: result.safety_stock.toFixed(1) + ' units',       color: '#06b6d4' },
                  { label: 'Reorder Point',        value: result.reorder_point.toFixed(1) + ' units',      color: '#2563eb' },
                  { label: 'Recommended Order Qty',value: result.recommended_order_quantity.toFixed(1)+' units', color: '#7c3aed' },
                  { label: 'Risk Score',           value: (result.risk_score * 100).toFixed(1) + '%',      color: risk?.color },
                ].map(({ label, value, color }) => (
                  <div key={label} className="card animate-in" style={{ '--kpi-gradient': `linear-gradient(90deg,${color},transparent)` }}>
                    <div className="kpi-label">{label}</div>
                    <div className="kpi-value" style={{ fontSize: '1.4rem', color }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Risk level + recommendation */}
              <div className="ai-panel animate-in">
                <div className="ai-panel-header">
                  <ShieldCheck size={16} /> AI Inventory Recommendation — Real API Output
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span className={`risk-badge ${risk?.cls}`}>
                    {result.risk_level} RISK
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Risk Score: {(result.risk_score * 100).toFixed(1)}%</span>
                </div>
                <p>{result.recommendation}</p>
              </div>

              {/* Radar chart */}
              <div className="card animate-in">
                <div className="card-header">
                  <div className="card-title">
                    <Package size={14} color="var(--accent-blue-lt)" />
                    Inventory Metrics Radar — API Data
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                    <Radar dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                    <Tooltip formatter={(v) => v.toFixed(1)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {!result && !loading && !error && (
            <div className="card">
              <div className="state-empty">
                <Package size={32} color="var(--text-muted)" />
                <span>Fill in inventory parameters and click <strong>Calculate Inventory</strong> to get real AI-powered decisions.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
