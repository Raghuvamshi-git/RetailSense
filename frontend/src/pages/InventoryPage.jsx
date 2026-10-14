import { useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { postInventory } from '../api/client';
import { LoadingState } from '../components/States';
import { DEMO_RISK_DIST } from '../data/demoData';
import {
  Package, AlertTriangle, Info, ShieldCheck, CheckCircle2,
  AlertCircle, Sparkles, SlidersHorizontal, ArrowDownCircle
} from 'lucide-react';

const PRESETS = [
  {
    name: 'Critical Stockout Scenario',
    data: {
      predicted_demand: 120.0,
      demand_std: 25.0,
      current_inventory: 150.0,
      lead_time: 7,
      service_level_z: 1.65,
    },
  },
  {
    name: 'Balanced Inventory Scenario',
    data: {
      predicted_demand: 50.0,
      demand_std: 8.0,
      current_inventory: 400.0,
      lead_time: 5,
      service_level_z: 1.65,
    },
  },
  {
    name: 'Overstocked / Safe Scenario',
    data: {
      predicted_demand: 20.0,
      demand_std: 3.5,
      current_inventory: 600.0,
      lead_time: 4,
      service_level_z: 1.65,
    },
  },
];

const SERVICE_LEVEL_PRESETS = [
  { label: '90% (Z=1.28)', z: 1.28 },
  { label: '95% (Z=1.65)', z: 1.65 },
  { label: '97.5% (Z=1.96)', z: 1.96 },
  { label: '99% (Z=2.33)', z: 2.33 },
];

const DEFAULT_FORM = {
  predicted_demand: 120,
  demand_std: 18,
  current_inventory: 400,
  lead_time: 7,
  service_level_z: 1.65,
};

const riskColors = {
  LOW: { bg: 'var(--success-bg)', color: 'var(--success)', border: 'var(--success)', cls: 'risk-low' },
  MEDIUM: { bg: 'var(--warning-bg)', color: 'var(--warning)', border: 'var(--warning)', cls: 'risk-medium' },
  HIGH: { bg: 'var(--danger-bg)', color: 'var(--danger)', border: 'var(--danger)', cls: 'risk-high' },
  CRITICAL: { bg: 'var(--danger-bg)', color: 'var(--danger)', border: 'var(--danger)', cls: 'risk-high' },
};

export default function InventoryPage({ prefillDemand, prefillStd }) {
  const [form, setForm] = useState(() => ({
    ...DEFAULT_FORM,
    predicted_demand: prefillDemand != null ? parseFloat(Number(prefillDemand).toFixed(2)) : DEFAULT_FORM.predicted_demand,
    demand_std: prefillStd != null ? parseFloat(Number(prefillStd).toFixed(2)) : DEFAULT_FORM.demand_std,
  }));
  const [validationErrors, setValidationErrors] = useState({});
  const [result, setResult] = useState(null);
  const [lastCalculatedForm, setLastCalculatedForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);

  const applyPreset = (preset) => {
    setForm(preset.data);
    setValidationErrors({});
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    setForm((prev) => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value),
    }));
  };

  const validate = () => {
    const errs = {};
    if (form.predicted_demand === '' || isNaN(form.predicted_demand) || Number(form.predicted_demand) < 0) {
      errs.predicted_demand = 'Predicted demand must be 0 or greater';
    }
    if (form.demand_std === '' || isNaN(form.demand_std) || Number(form.demand_std) < 0) {
      errs.demand_std = 'Demand std dev must be 0 or greater';
    }
    if (form.current_inventory === '' || isNaN(form.current_inventory) || Number(form.current_inventory) < 0) {
      errs.current_inventory = 'Current inventory must be 0 or greater';
    }
    if (form.lead_time === '' || isNaN(form.lead_time) || parseInt(form.lead_time, 10) <= 0) {
      errs.lead_time = 'Lead time must be at least 1 day';
    }
    if (form.service_level_z === '' || isNaN(form.service_level_z) || Number(form.service_level_z) <= 0) {
      errs.service_level_z = 'Service level Z must be greater than 0';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);
    setSuccessBanner(null);

    const payload = {
      predicted_demand: Number(form.predicted_demand),
      demand_std: Number(form.demand_std),
      current_inventory: Number(form.current_inventory),
      lead_time: parseInt(form.lead_time, 10),
      service_level_z: Number(form.service_level_z),
    };

    try {
      const data = await postInventory(payload);
      setResult(data);
      setLastCalculatedForm(payload);
      setSuccessBanner('Inventory decisions successfully evaluated by decision engine.');
    } catch (err) {
      setError(err.message || 'Failed to compute inventory decisions');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Radar data from real API result
  const radarData = result
    ? [
        { metric: 'Safety Stock', value: parseFloat(result.safety_stock.toFixed(1)) },
        { metric: 'Reorder Point', value: parseFloat(result.reorder_point.toFixed(1)) },
        { metric: 'Order Qty', value: parseFloat(result.recommended_order_quantity.toFixed(1)) },
        { metric: 'Risk Score %', value: parseFloat(result.risk_score.toFixed(1)) },
        { metric: 'Current Stock', value: Number(lastCalculatedForm?.current_inventory || form.current_inventory) },
      ]
    : [];

  // Stock comparison bar chart
  const stockComparisonData = result && lastCalculatedForm
    ? [
        {
          name: 'Inventory Levels',
          'Current Stock': lastCalculatedForm.current_inventory,
          'Reorder Point': parseFloat(result.reorder_point.toFixed(1)),
          'Safety Stock': parseFloat(result.safety_stock.toFixed(1)),
          'Recommended Order': parseFloat(result.recommended_order_quantity.toFixed(1)),
        },
      ]
    : [];

  const risk = result ? riskColors[result.risk_level?.toUpperCase()] || riskColors.MEDIUM : null;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Inventory Intelligence</h1>
        <p>
          Real-time safety stock, reorder point &amp; replenishment recommendations via API &nbsp;·&nbsp;
          Risk distribution breakdown uses <strong style={{ color: 'var(--warning)' }}>DEMO DATA</strong>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 20 }}>
        {/* ── Form Column ─────────────────────────────────────────── */}
        <div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Package size={15} color="var(--accent-cyan-lt)" />
                Inventory Parameters
              </div>
            </div>

            <div style={{
              fontSize: 11,
              color: 'var(--accent-cyan-lt)',
              marginBottom: 14,
              background: 'rgba(6,182,212,0.08)',
              border: '1px solid var(--border-cyan)',
              borderRadius: 6,
              padding: '8px 10px',
              display: 'flex',
              gap: 8,
              alignItems: 'center'
            }}>
              <Info size={14} style={{ flexShrink: 0 }} />
              <span>Calls live endpoint <strong>POST /inventory/</strong> via Decision Engine.</span>
            </div>

            {prefillDemand != null && (
              <div style={{
                fontSize: 11,
                color: 'var(--accent-cyan-lt)',
                marginBottom: 14,
                background: 'rgba(6,182,212,0.12)',
                border: '1px solid var(--border-cyan)',
                borderRadius: 6,
                padding: '8px 10px',
                display: 'flex',
                gap: 8,
                alignItems: 'center'
              }}>
                <CheckCircle2 size={14} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                <span>
                  Imported demand ({Number(prefillDemand).toFixed(1)} units/day){prefillStd != null ? ` and std dev (${Number(prefillStd).toFixed(1)})` : ''} from Demand Forecasting.
                </span>
              </div>
            )}

            {/* Quick Presets */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>
                Inventory Scenarios:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="btn-secondary"
                    style={{ padding: '5px 10px', fontSize: 11, justifyContent: 'flex-start' }}
                  >
                    <Sparkles size={11} color="var(--accent-cyan)" /> {p.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <label>Predicted Daily Demand (units/day) *</label>
                <input
                  className={`input-field ${validationErrors.predicted_demand ? 'input-error' : ''}`}
                  type="number"
                  name="predicted_demand"
                  value={form.predicted_demand}
                  step="0.1"
                  min="0"
                  onChange={handleChange}
                  required
                />
                {validationErrors.predicted_demand && <div className="error-text">{validationErrors.predicted_demand}</div>}
              </div>

              <div className="input-group">
                <label>Demand Standard Deviation (σ) *</label>
                <input
                  className={`input-field ${validationErrors.demand_std ? 'input-error' : ''}`}
                  type="number"
                  name="demand_std"
                  value={form.demand_std}
                  step="0.1"
                  min="0"
                  onChange={handleChange}
                  required
                />
                {validationErrors.demand_std && <div className="error-text">{validationErrors.demand_std}</div>}
              </div>

              <div className="input-group">
                <label>Current Inventory on Hand (units) *</label>
                <input
                  className={`input-field ${validationErrors.current_inventory ? 'input-error' : ''}`}
                  type="number"
                  name="current_inventory"
                  value={form.current_inventory}
                  step="1"
                  min="0"
                  onChange={handleChange}
                  required
                />
                {validationErrors.current_inventory && <div className="error-text">{validationErrors.current_inventory}</div>}
              </div>

              <div className="grid-2" style={{ gap: 10 }}>
                <div className="input-group">
                  <label>Supplier Lead Time (days) *</label>
                  <input
                    className={`input-field ${validationErrors.lead_time ? 'input-error' : ''}`}
                    type="number"
                    name="lead_time"
                    value={form.lead_time}
                    step="1"
                    min="1"
                    onChange={handleChange}
                    required
                  />
                  {validationErrors.lead_time && <div className="error-text">{validationErrors.lead_time}</div>}
                </div>

                <div className="input-group">
                  <label>Service Level Z-Score *</label>
                  <input
                    className={`input-field ${validationErrors.service_level_z ? 'input-error' : ''}`}
                    type="number"
                    name="service_level_z"
                    value={form.service_level_z}
                    step="0.01"
                    min="0.01"
                    onChange={handleChange}
                    required
                  />
                  {validationErrors.service_level_z && <div className="error-text">{validationErrors.service_level_z}</div>}
                </div>
              </div>

              {/* Service Level shortcut chips */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Common Service Levels:
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {SERVICE_LEVEL_PRESETS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, service_level_z: item.z }))}
                      style={{
                        background: form.service_level_z === item.z ? 'var(--accent-blue)' : 'var(--bg-elevated)',
                        color: form.service_level_z === item.z ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        padding: '2px 6px',
                        fontSize: 10,
                        cursor: 'pointer',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn-primary"
                type="submit"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    <span>Computing Decisions…</span>
                  </>
                ) : (
                  <>
                    <SlidersHorizontal size={15} /> Calculate Inventory Metrics
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Demo risk distribution */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header">
              <div className="card-title">
                <AlertTriangle size={14} color="var(--warning)" />
                SKU Risk Distribution
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

        {/* ── Results Column ────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Notifications */}
          {successBanner && (
            <div className="alert-success animate-in">
              <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <strong>Success:</strong> {successBanner}
              </div>
              <button
                type="button"
                onClick={() => setSuccessBanner(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          )}

          {error && (
            <div className="alert-error animate-in">
              <AlertCircle size={18} color="var(--danger)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <strong>API Error:</strong> {error}
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Ensure the FastAPI backend is running at <code>http://127.0.0.1:8000</code>.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="card">
              <LoadingState message="Computing safety stock, reorder point and inventory risk…" />
            </div>
          )}

          {/* Result State */}
          {result && !loading && (
            <>
              {/* Primary KPI Row */}
              <div className="grid-2">
                {[
                  {
                    label: 'Safety Stock',
                    value: `${result.safety_stock.toFixed(1)} units`,
                    sub: `Buffer against lead time variability`,
                    color: '#06b6d4',
                  },
                  {
                    label: 'Reorder Point (ROP)',
                    value: `${result.reorder_point.toFixed(1)} units`,
                    sub: `Trigger purchase when stock drops here`,
                    color: '#3b82f6',
                  },
                  {
                    label: 'Recommended Order Qty',
                    value: `${result.recommended_order_quantity.toFixed(1)} units`,
                    sub: result.recommended_order_quantity > 0 ? 'Replenishment order suggested now' : 'No order needed currently',
                    color: '#a855f7',
                  },
                  {
                    label: 'Stockout Risk Score',
                    value: `${result.risk_score.toFixed(1)}%`,
                    sub: `Risk Severity: ${result.risk_level}`,
                    color: risk?.color || 'var(--text-primary)',
                  },
                ].map(({ label, value, sub, color }) => (
                  <div
                    key={label}
                    className="card animate-in"
                    style={{ borderTop: `3px solid ${color}` }}
                  >
                    <div className="kpi-label">{label}</div>
                    <div className="kpi-value" style={{ fontSize: '1.6rem', color, margin: '6px 0 2px' }}>
                      {value}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
                  </div>
                ))}
              </div>

              {/* AI Recommendation Panel */}
              <div className="ai-panel animate-in">
                <div className="ai-panel-header" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldCheck size={18} />
                    <span>AI Inventory Action Recommendation — Live Backend Output</span>
                  </div>
                  <span className={`risk-badge ${risk?.cls}`}>
                    {result.risk_level} RISK
                  </span>
                </div>

                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 12
                }}>
                  <ArrowDownCircle size={24} color={risk?.color} style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Prescriptive Action
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                      {result.recommendation}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Decision engine calculated with <strong>{lastCalculatedForm?.lead_time} days</strong> lead time and{' '}
                  <strong>Z={lastCalculatedForm?.service_level_z}</strong> service level target.
                </div>
              </div>

              {/* Visualizations Grid */}
              <div className="grid-2">
                {/* Radar Chart */}
                <div className="card animate-in">
                  <div className="card-header">
                    <div className="card-title">
                      <Package size={14} color="var(--accent-cyan-lt)" />
                      Metric Profile (API Data)
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={230}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                      <Radar dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} strokeWidth={2} />
                      <Tooltip
                        formatter={(v) => v.toFixed(1)}
                        contentStyle={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-accent)',
                          borderRadius: 8,
                          color: 'var(--text-primary)',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Level Comparison Chart */}
                <div className="card animate-in">
                  <div className="card-header">
                    <div className="card-title">
                      <SlidersHorizontal size={14} color="var(--accent-blue-lt)" />
                      Inventory Balance vs Thresholds
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={stockComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-accent)',
                          borderRadius: 8,
                          color: 'var(--text-primary)',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="Current Stock" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Reorder Point" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Safety Stock" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Recommended Order" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* Empty State */}
          {!result && !loading && !error && (
            <div className="card">
              <div className="state-empty">
                <Package size={36} color="var(--accent-cyan-lt)" style={{ opacity: 0.6 }} />
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>No Inventory Evaluation Run</strong>
                <span style={{ maxWidth: 440 }}>
                  Enter inventory parameters or choose a scenario preset, then click <strong>Calculate Inventory Metrics</strong> to receive live safety stock, reorder point, order recommendations, and risk scoring from the decision engine.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
