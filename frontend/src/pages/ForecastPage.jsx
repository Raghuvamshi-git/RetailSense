import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { postForecast } from '../api/client';
import { LoadingState } from '../components/States';
import { DEMO_FORECAST_SERIES } from '../data/demoData';
import { TrendingUp, Cpu, Info, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

const PRESETS = [
  {
    name: 'Coffee Blend (CA_1)',
    data: {
      item_id: 'ITEM_001',
      store_id: 'STORE_CA_1',
      lag_7: 95.0,
      lag_28: 88.0,
      rolling_mean_7: 92.0,
      rolling_std_7: 8.0,
      sell_price: 9.99,
      is_festival: 0,
      snap: 0,
    },
  },
  {
    name: 'Organic Milk (TX_2)',
    data: {
      item_id: 'ITEM_002',
      store_id: 'STORE_TX_2',
      lag_7: 42.0,
      lag_28: 38.0,
      rolling_mean_7: 40.5,
      rolling_std_7: 5.2,
      sell_price: 1.79,
      is_festival: 0,
      snap: 1,
    },
  },
  {
    name: 'Free-Range Eggs (WI_1)',
    data: {
      item_id: 'ITEM_005',
      store_id: 'STORE_WI_1',
      lag_7: 31.0,
      lag_28: 27.0,
      rolling_mean_7: 29.8,
      rolling_std_7: 4.1,
      sell_price: 3.49,
      is_festival: 1,
      snap: 0,
    },
  },
];

function deriveDateFields(dateStr) {
  if (!dateStr) return { month: 10, quarter: 4, is_weekend: 0 };
  const d = new Date(dateStr + 'T00:00:00');
  const month = d.getMonth() + 1;
  const quarter = Math.ceil(month / 3);
  const day = d.getDay();
  const is_weekend = (day === 0 || day === 6) ? 1 : 0;
  return { month, quarter, is_weekend };
}

const initialDate = new Date().toISOString().slice(0, 10);
const initialDerived = deriveDateFields(initialDate);

const DEFAULT_FORM = {
  item_id: 'ITEM_001',
  store_id: 'STORE_CA_1',
  forecast_date: initialDate,
  lag_7: 95.0,
  lag_28: 88.0,
  rolling_mean_7: 92.0,
  rolling_std_7: 8.0,
  sell_price: 9.99,
  month: initialDerived.month,
  quarter: initialDerived.quarter,
  is_weekend: initialDerived.is_weekend,
  is_festival: 0,
  snap: 0,
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.map((p) => p.value != null && (
        <div key={p.name} style={{ color: p.color, marginBottom: 2, fontSize: 12 }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function ForecastPage({ onNavigateToInventory }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [validationErrors, setValidationErrors] = useState({});
  const [result, setResult] = useState(null);
  const [lastSubmittedPayload, setLastSubmittedPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);

  const applyPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      ...preset.data,
    }));
    setValidationErrors({});
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (name === 'forecast_date') {
      const derived = deriveDateFields(value);
      setForm((prev) => ({
        ...prev,
        forecast_date: value,
        month: derived.month,
        quarter: derived.quarter,
        is_weekend: derived.is_weekend,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.item_id || !form.item_id.trim()) {
      errs.item_id = 'Item ID is required';
    }
    if (!form.store_id || !form.store_id.trim()) {
      errs.store_id = 'Store ID is required';
    }
    if (!form.forecast_date) {
      errs.forecast_date = 'Forecast date is required';
    }
    if (form.sell_price === '' || isNaN(form.sell_price) || Number(form.sell_price) <= 0) {
      errs.sell_price = 'Price must be greater than 0';
    }
    ['lag_7', 'lag_28', 'rolling_mean_7', 'rolling_std_7'].forEach((field) => {
      if (form[field] === '' || isNaN(form[field]) || Number(form[field]) < 0) {
        errs[field] = 'Must be 0 or greater';
      }
    });

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
      item_id: String(form.item_id).trim(),
      store_id: String(form.store_id).trim(),
      forecast_date: String(form.forecast_date),
      lag_7: Number(form.lag_7),
      lag_28: Number(form.lag_28),
      rolling_mean_7: Number(form.rolling_mean_7),
      rolling_std_7: Number(form.rolling_std_7),
      sell_price: Number(form.sell_price),
      month: parseInt(form.month, 10),
      quarter: parseInt(form.quarter, 10),
      is_weekend: parseInt(form.is_weekend, 10),
      is_festival: parseInt(form.is_festival, 10),
      snap: parseInt(form.snap, 10),
    };

    try {
      const data = await postForecast(payload);
      setResult(data);
      setLastSubmittedPayload(payload);
      setSuccessBanner(data.message || 'Forecast generated and saved successfully');
    } catch (err) {
      setError(err.message || 'Failed to generate demand forecast');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Build chart series: show demo history + API result if available
  const chartData = DEMO_FORECAST_SERIES.map((d) => ({ ...d }));
  if (result && lastSubmittedPayload) {
    const todayLabel = new Date(lastSubmittedPayload.forecast_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const idx = chartData.findIndex((d) => d.date === todayLabel);
    if (idx !== -1) {
      chartData[idx].api_forecast = parseFloat(result.predicted_demand.toFixed(2));
    } else {
      // Add or append point
      chartData.push({
        date: todayLabel,
        actual: null,
        forecast: null,
        api_forecast: parseFloat(result.predicted_demand.toFixed(2)),
      });
    }
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Demand Forecasting</h1>
        <p>
          Generate live demand predictions via the XGBoost machine learning model &nbsp;·&nbsp;
          Historical timeline uses <strong style={{ color: 'var(--warning)' }}>DEMO DATA</strong>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20 }}>
        {/* ── Input Form ─────────────────────────────────────── */}
        <div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Cpu size={15} color="var(--accent-blue-lt)" />
                Forecast Parameters
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
              <span>Calls live endpoint <strong>POST /forecast/</strong> and stores to MySQL.</span>
            </div>

            {/* Quick Presets */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>
                Quick Presets:
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="btn-secondary"
                    style={{ padding: '3px 8px', fontSize: 11, borderRadius: 4 }}
                  >
                    <Sparkles size={10} color="var(--accent-cyan)" /> {p.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Identifiers */}
              <div className="grid-2" style={{ gap: 10, marginBottom: 10 }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Item ID *</label>
                  <input
                    className={`input-field ${validationErrors.item_id ? 'input-error' : ''}`}
                    name="item_id"
                    value={form.item_id}
                    onChange={handleChange}
                    placeholder="e.g. ITEM_001"
                    required
                  />
                  {validationErrors.item_id && <div className="error-text">{validationErrors.item_id}</div>}
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Store ID *</label>
                  <input
                    className={`input-field ${validationErrors.store_id ? 'input-error' : ''}`}
                    name="store_id"
                    value={form.store_id}
                    onChange={handleChange}
                    placeholder="e.g. STORE_CA_1"
                    required
                  />
                  {validationErrors.store_id && <div className="error-text">{validationErrors.store_id}</div>}
                </div>
              </div>

              <div className="input-group" style={{ marginTop: 10 }}>
                <label>Target Forecast Date *</label>
                <input
                  className={`input-field ${validationErrors.forecast_date ? 'input-error' : ''}`}
                  type="date"
                  name="forecast_date"
                  value={form.forecast_date}
                  onChange={handleChange}
                  required
                />
                {validationErrors.forecast_date && <div className="error-text">{validationErrors.forecast_date}</div>}
              </div>

              <div className="divider" />
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: 10,
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                Feature Engineering Inputs
              </div>

              {/* Lag features */}
              <div className="grid-2" style={{ gap: 10, marginBottom: 10 }}>
                {[
                  { name: 'lag_7', label: 'Lag 7 (sales)', step: '0.1' },
                  { name: 'lag_28', label: 'Lag 28 (sales)', step: '0.1' },
                  { name: 'rolling_mean_7', label: 'Rolling Mean 7d', step: '0.1' },
                  { name: 'rolling_std_7', label: 'Rolling Std 7d', step: '0.1' },
                ].map(({ name, label, step }) => (
                  <div className="input-group" key={name} style={{ marginBottom: 0 }}>
                    <label>{label} *</label>
                    <input
                      className={`input-field ${validationErrors[name] ? 'input-error' : ''}`}
                      type="number"
                      step={step}
                      min="0"
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      required
                    />
                    {validationErrors[name] && <div className="error-text">{validationErrors[name]}</div>}
                  </div>
                ))}
              </div>

              <div className="input-group">
                <label>Sell Price ($) *</label>
                <input
                  className={`input-field ${validationErrors.sell_price ? 'input-error' : ''}`}
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="sell_price"
                  value={form.sell_price}
                  onChange={handleChange}
                  required
                />
                {validationErrors.sell_price && <div className="error-text">{validationErrors.sell_price}</div>}
              </div>

              {/* Categoricals & Temporal Context */}
              <div className="grid-3" style={{ gap: 8, marginBottom: 10 }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Month (1-12)</label>
                  <input
                    className="input-field"
                    type="number"
                    min="1"
                    max="12"
                    name="month"
                    value={form.month}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Quarter (1-4)</label>
                  <input
                    className="input-field"
                    type="number"
                    min="1"
                    max="4"
                    name="quarter"
                    value={form.quarter}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Weekend</label>
                  <select className="input-field" name="is_weekend" value={form.is_weekend} onChange={handleChange}>
                    <option value={0}>0 - No</option>
                    <option value={1}>1 - Yes</option>
                  </select>
                </div>
              </div>

              <div className="grid-2" style={{ gap: 10 }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Festival / Event</label>
                  <select className="input-field" name="is_festival" value={form.is_festival} onChange={handleChange}>
                    <option value={0}>0 – Regular Day</option>
                    <option value={1}>1 – Festival / Holiday</option>
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>SNAP Benefit Day</label>
                  <select className="input-field" name="snap" value={form.snap} onChange={handleChange}>
                    <option value={0}>0 – No SNAP</option>
                    <option value={1}>1 – SNAP Day</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                      <span>Running XGBoost Model…</span>
                    </>
                  ) : (
                    <>
                      <Cpu size={16} /> Run Demand Forecast
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Results Panel ──────────────────────────────────── */}
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
                  Verify that the FastAPI backend is active at <code>http://127.0.0.1:8000</code>.
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

          {/* Chart */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <TrendingUp size={15} color="var(--accent-blue-lt)" />
                Demand Forecast Timeline
              </div>
              <span className="demo-badge">DEMO history · API prediction highlighted</span>
            </div>
            <div className="chart-area">
              <ResponsiveContainer width="100%" height={250}>
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
                  <ReferenceLine
                    x={initialDate ? new Date(initialDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    stroke="var(--accent-cyan)"
                    strokeDasharray="4 4"
                    label={{ value: 'Today', fill: 'var(--accent-cyan-lt)', fontSize: 10 }}
                  />
                  <Line type="monotone" dataKey="actual" name="Actual Sales (Demo)" stroke="#94a3b8" strokeWidth={2} dot={false} connectNulls={false} />
                  <Line type="monotone" dataKey="forecast" name="Demo Baseline" stroke="#2563eb" strokeWidth={2} strokeDasharray="5 3" dot={false} connectNulls={false} />
                  <Line type="monotone" dataKey="api_forecast" name="Live API Prediction" stroke="#06b6d4" strokeWidth={3} dot={{ r: 6, fill: '#06b6d4' }} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="card">
              <LoadingState message="Executing XGBoost model inference and saving to database…" />
            </div>
          )}

          {/* Result State */}
          {result && !loading && (
            <div className="ai-panel animate-in">
              <div className="ai-panel-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Cpu size={18} /> Live ML Forecast Result
                </div>
                <span style={{
                  background: 'rgba(6,182,212,0.15)',
                  color: 'var(--accent-cyan-lt)',
                  border: '1px solid var(--border-cyan)',
                  borderRadius: 12,
                  padding: '2px 10px',
                  fontSize: 11,
                  fontWeight: 600
                }}>
                  Model: {result.model_name || 'XGBoost'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '14px 16px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Predicted Daily Demand</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-cyan-lt)' }}>
                    {result.predicted_demand != null ? result.predicted_demand.toFixed(2) : '—'}
                    <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>units/day</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                    ≈ {Math.round(result.predicted_demand || 0)} units rounded
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '14px 16px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Item &amp; Store Target</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {lastSubmittedPayload?.item_id}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Store: {lastSubmittedPayload?.store_id}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Date: {lastSubmittedPayload?.forecast_date}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '14px 16px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Database Record</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontWeight: 600, fontSize: 13, marginTop: 4 }}>
                    <CheckCircle2 size={16} /> Saved to MySQL
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Table: <code>forecasts</code>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(10,22,40,0.6)',
                borderRadius: 8,
                padding: '12px 16px',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Status Message: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{result.message}</strong>
                </div>
                {onNavigateToInventory && (
                  <button
                    type="button"
                    onClick={() => onNavigateToInventory(result.predicted_demand, lastSubmittedPayload?.rolling_std_7)}
                    className="btn-primary"
                    style={{ padding: '6px 14px', fontSize: 12 }}
                  >
                    Send Demand to Inventory Calculator <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!result && !loading && !error && (
            <div className="card">
              <div className="state-empty">
                <TrendingUp size={36} color="var(--accent-blue-lt)" style={{ opacity: 0.6 }} />
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>No Forecast Generated Yet</strong>
                <span style={{ maxWidth: 440 }}>
                  Adjust parameters in the left panel or click a Quick Preset, then submit to trigger live inference from the XGBoost ML model.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
