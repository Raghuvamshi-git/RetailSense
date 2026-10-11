import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { postForecast } from '../api/client';
import { LoadingState, ErrorState } from '../components/States';
import { DEMO_FORECAST_SERIES } from '../data/demoData';
import { TrendingUp, Cpu, Info } from 'lucide-react';

// Default prefilled form values that match the ForecastRequest schema exactly
const DEFAULT_FORM = {
  item_id:        'ITEM_001',
  store_id:       'STORE_CA_1',
  forecast_date:  new Date().toISOString().slice(0, 10),
  lag_7:          95,
  lag_28:         88,
  rolling_mean_7: 92,
  rolling_std_7:  8,
  sell_price:     9.99,
  month:          new Date().getMonth() + 1,
  quarter:        Math.ceil((new Date().getMonth() + 1) / 3),
  is_weekend:     [0, 6].includes(new Date().getDay()) ? 1 : 0,
  is_festival:    0,
  snap:           0,
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.map((p) => p.value != null && (
        <div key={p.name} style={{ color: p.color, marginBottom: 2, fontSize: 12 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function ForecastPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Coerce integer fields
      const payload = {
        ...form,
        month: parseInt(form.month, 10),
        quarter: parseInt(form.quarter, 10),
        is_weekend: parseInt(form.is_weekend, 10),
        is_festival: parseInt(form.is_festival, 10),
        snap: parseInt(form.snap, 10),
      };
      const data = await postForecast(payload);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Build chart series: show demo history + API result if available
  const chartData = DEMO_FORECAST_SERIES.map((d) => ({ ...d }));
  if (result) {
    // Insert API result as the next forecast point
    const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const idx = chartData.findIndex((d) => d.date === todayLabel);
    if (idx !== -1) chartData[idx].api_forecast = parseFloat(result.predicted_demand.toFixed(1));
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Demand Forecasting</h1>
        <p>Generate real demand predictions via the XGBoost model API &nbsp;·&nbsp;
          History chart uses <strong style={{ color: 'var(--warning)' }}>DEMO DATA</strong>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
        {/* ── Input Form ─────────────────────────────────────── */}
        <div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Cpu size={14} color="var(--accent-blue-lt)" />
                Forecast Parameters
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--accent-cyan-lt)', marginBottom: 14,
              background: 'rgba(6,182,212,0.08)', border: '1px solid var(--border-cyan)',
              borderRadius: 6, padding: '6px 10px', display: 'flex', gap: 6, alignItems: 'center' }}>
              <Info size={12} /> Real API call – POST /forecast/
            </div>
            <form onSubmit={handleSubmit}>
              {/* Identifiers */}
              <div className="grid-2" style={{ gap: 10, marginBottom: 10 }}>
                <div className="input-group">
                  <label>Item ID</label>
                  <input className="input-field" name="item_id" value={form.item_id} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Store ID</label>
                  <input className="input-field" name="store_id" value={form.store_id} onChange={handleChange} required />
                </div>
              </div>
              <div className="input-group">
                <label>Forecast Date</label>
                <input className="input-field" type="date" name="forecast_date" value={form.forecast_date} onChange={handleChange} required />
              </div>

              <div className="divider" />
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Feature Inputs</div>

              {/* Lag features */}
              <div className="grid-2" style={{ gap: 10, marginBottom: 10 }}>
                {[
                  { name: 'lag_7', label: 'Lag 7 (sales)' },
                  { name: 'lag_28', label: 'Lag 28 (sales)' },
                  { name: 'rolling_mean_7', label: 'Rolling Mean 7d' },
                  { name: 'rolling_std_7', label: 'Rolling Std 7d' },
                ].map(({ name, label }) => (
                  <div className="input-group" key={name} style={{ marginBottom: 0 }}>
                    <label>{label}</label>
                    <input className="input-field" type="number" step="any" name={name} value={form[name]} onChange={handleChange} required />
                  </div>
                ))}
              </div>

              <div className="input-group">
                <label>Sell Price ($)</label>
                <input className="input-field" type="number" step="0.01" name="sell_price" value={form.sell_price} onChange={handleChange} required />
              </div>

              {/* Categorical */}
              <div className="grid-2" style={{ gap: 10 }}>
                {[
                  { name: 'is_weekend', label: 'Is Weekend (0/1)' },
                  { name: 'is_festival', label: 'Is Festival (0/1)' },
                  { name: 'snap', label: 'SNAP Day (0/1)' },
                ].map(({ name, label }) => (
                  <div className="input-group" key={name} style={{ marginBottom: 0 }}>
                    <label>{label}</label>
                    <select className="input-field" name={name} value={form[name]} onChange={handleChange}>
                      <option value={0}>0 – No</option>
                      <option value={1}>1 – Yes</option>
                    </select>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16 }}>
                <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? 'Running Model…' : '▶ Run Forecast'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Results Panel ──────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Chart */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <TrendingUp size={14} color="var(--accent-blue-lt)" />
                Demand Forecast Chart
              </div>
              <span className="demo-badge">DEMO history · API result highlighted</span>
            </div>
            <div className="chart-area">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="fcastGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop stopColor="#2563eb" /><stop offset="1" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                  <ReferenceLine x={new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    stroke="var(--accent-cyan)" strokeDasharray="4 4" label={{ value: 'Today', fill: 'var(--accent-cyan-lt)', fontSize: 10 }} />
                  <Line type="monotone" dataKey="actual"     name="Actual Sales"    stroke="#94a3b8" strokeWidth={2} dot={false} connectNulls={false} />
                  <Line type="monotone" dataKey="forecast"   name="Demo Forecast"   stroke="#2563eb" strokeWidth={2} strokeDasharray="5 3" dot={false} connectNulls={false} />
                  <Line type="monotone" dataKey="api_forecast" name="API Prediction" stroke="#06b6d4" strokeWidth={3} dot={{ r: 6, fill: '#06b6d4' }} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Result */}
          {loading && (
            <div className="card"><LoadingState message="Calling XGBoost model…" /></div>
          )}
          {error && (
            <div className="card">
              <ErrorState message={`API Error: ${error} — ensure the backend is running at localhost:8000`} />
            </div>
          )}
          {result && !loading && (
            <div className="ai-panel animate-in">
              <div className="ai-panel-header">
                <Cpu size={16} /> XGBoost API Result — Real Prediction
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 12 }}>
                {[
                  { label: 'Predicted Demand',  value: result.predicted_demand?.toFixed(2) },
                  { label: 'Model',             value: result.model_name || 'XGBoost' },
                  { label: 'Item',              value: form.item_id },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '12px 16px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12 }}>{result.message}</p>
            </div>
          )}
          {!result && !loading && !error && (
            <div className="card">
              <div className="state-empty">
                <TrendingUp size={32} color="var(--text-muted)" />
                <span>Fill in the parameters and click <strong>Run Forecast</strong> to get a real prediction from the XGBoost model.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
