import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { postPricing } from '../api/client';
import { LoadingState } from '../components/States';
import { DEMO_PRICING } from '../data/demoData';
import {
  Tag, TrendingUp, TrendingDown, Info, CheckCircle2,
  AlertCircle, Sparkles, SlidersHorizontal, Minus
} from 'lucide-react';

const PRESETS = [
  {
    name: 'ITEM_001 (Coffee Blend 500g)',
    data: {
      item_id: 'ITEM_001',
      current_price: 9.99,
      current_revenue: 100.0,
      price_down_revenue: 85.0,
      price_up_revenue: 118.0,
      price_change_percent: 10.0,
    },
  },
  {
    name: 'ITEM_002 (Organic Milk 1L)',
    data: {
      item_id: 'ITEM_002',
      current_price: 1.79,
      current_revenue: 179.0,
      price_down_revenue: 201.38,
      price_up_revenue: 157.52,
      price_change_percent: 10.0,
    },
  },
  {
    name: 'ITEM_003 (Sourdough Bread)',
    data: {
      item_id: 'ITEM_003',
      current_price: 4.49,
      current_revenue: 224.5,
      price_down_revenue: 210.0,
      price_up_revenue: 215.0,
      price_change_percent: 10.0,
    },
  },
  {
    name: 'ITEM_004 (Greek Yogurt 500g)',
    data: {
      item_id: 'ITEM_004',
      current_price: 2.99,
      current_revenue: 150.0,
      price_down_revenue: 135.0,
      price_up_revenue: 172.5,
      price_change_percent: 10.0,
    },
  },
];

const DEFAULT_FORM = {
  item_id: 'ITEM_001',
  current_price: 9.99,
  current_revenue: 100.0,
  price_down_revenue: 85.0,
  price_up_revenue: 118.0,
  price_change_percent: 10.0,
};

const getRecBadge = (rec) => {
  if (rec === 'Consider increasing price') {
    return { cls: 'risk-low', color: 'var(--success)', icon: TrendingUp, label: 'Increase Price' };
  }
  if (rec === 'Consider reducing price') {
    return { cls: 'risk-medium', color: 'var(--info)', icon: TrendingDown, label: 'Reduce Price' };
  }
  return { cls: 'risk-low', color: 'var(--warning)', icon: Minus, label: 'Keep Price' };
};

export default function PricingPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [validationErrors, setValidationErrors] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);

  // Table items state allowing live evaluation for individual rows
  const [tableItems, setTableItems] = useState(() =>
    DEMO_PRICING.map((p) => ({
      ...p,
      isLive: false,
      algorithmRecommendation: null,
    }))
  );
  const [evaluatingSku, setEvaluatingSku] = useState(null);

  const applyPreset = (preset) => {
    setForm(preset.data);
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

    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.item_id || !String(form.item_id).trim()) {
      errs.item_id = 'Item ID is required';
    }
    if (form.current_price === '' || isNaN(form.current_price) || Number(form.current_price) <= 0) {
      errs.current_price = 'Current price must be greater than 0';
    }
    if (form.current_revenue === '' || isNaN(form.current_revenue) || Number(form.current_revenue) < 0) {
      errs.current_revenue = 'Current revenue must be 0 or greater';
    }
    if (form.price_down_revenue === '' || isNaN(form.price_down_revenue) || Number(form.price_down_revenue) < 0) {
      errs.price_down_revenue = 'Price-down revenue must be 0 or greater';
    }
    if (form.price_up_revenue === '' || isNaN(form.price_up_revenue) || Number(form.price_up_revenue) < 0) {
      errs.price_up_revenue = 'Price-up revenue must be 0 or greater';
    }
    if (form.price_change_percent === '' || isNaN(form.price_change_percent) || Number(form.price_change_percent) <= 0) {
      errs.price_change_percent = 'Percentage must be greater than 0';
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
      item_id: String(form.item_id).trim(),
      current_price: Number(form.current_price),
      current_revenue: Number(form.current_revenue),
      price_down_revenue: Number(form.price_down_revenue),
      price_up_revenue: Number(form.price_up_revenue),
      price_change_percent: Number(form.price_change_percent),
    };

    try {
      const data = await postPricing(payload);
      setResult(data);
      setSuccessBanner(data.message || `Pricing recommendation calculated successfully.`);

      // Also update matching table item if present
      setTableItems((prev) =>
        prev.map((row) => {
          if (row.sku === data.item_id) {
            return {
              ...row,
              current: data.current_price,
              suggested: data.suggested_price,
              uplift: `${data.revenue_uplift_percent >= 0 ? '+' : ''}${data.revenue_uplift_percent.toFixed(1)}%`,
              isLive: true,
              algorithmRecommendation: data.recommendation,
            };
          }
          return row;
        })
      );
    } catch (err) {
      setError(err.message || 'Failed to calculate pricing recommendation');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateRow = async (row) => {
    setEvaluatingSku(row.sku);
    setError(null);

    // Compute realistic scenario inputs based on current product pricing
    const currentPrice = row.current;
    const estUnits = 50.0;
    const currentRev = currentPrice * estUnits;

    // Simulate elasticity based on typical grocery/retail elasticity
    const step = 0.10;
    const priceDown = currentPrice * (1.0 - step);
    const priceUp = currentPrice * (1.0 + step);

    // High margin items benefit from price increase, everyday items benefit from reduction
    const isElastic = row.sku === 'ITEM_002' || row.sku === 'ITEM_007';
    const downUnits = isElastic ? estUnits * 1.25 : estUnits * 1.05;
    const upUnits = isElastic ? estUnits * 0.75 : estUnits * 0.95;

    const payload = {
      item_id: row.sku,
      current_price: currentPrice,
      current_revenue: currentRev,
      price_down_revenue: priceDown * downUnits,
      price_up_revenue: priceUp * upUnits,
      price_change_percent: 10.0,
    };

    try {
      const data = await postPricing(payload);
      setTableItems((prev) =>
        prev.map((item) => {
          if (item.sku === row.sku) {
            return {
              ...item,
              current: data.current_price,
              suggested: data.suggested_price,
              uplift: `${data.revenue_uplift_percent >= 0 ? '+' : ''}${data.revenue_uplift_percent.toFixed(1)}%`,
              isLive: true,
              algorithmRecommendation: data.recommendation,
            };
          }
          return item;
        })
      );
      setResult(data);
      setForm({
        item_id: data.item_id,
        current_price: data.current_price,
        current_revenue: data.current_revenue,
        price_down_revenue: data.price_down_revenue,
        price_up_revenue: data.price_up_revenue,
        price_change_percent: data.price_change_percent,
      });
      setSuccessBanner(`Live algorithm recommendation applied to ${row.name}: ${data.recommendation}`);
    } catch (err) {
      setError(`Failed to evaluate ${row.sku}: ${err.message}`);
    } finally {
      setEvaluatingSku(null);
    }
  };

  // Build chart data combining table items
  const chartData = tableItems.map((p) => ({
    name: p.name.split(' ').slice(0, 2).join(' '),
    current: p.current,
    suggested: p.suggested,
    isLive: p.isLive,
  }));

  const recMeta = result ? getRecBadge(result.recommendation) : null;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Pricing Optimization</h1>
        <p>
          Prescriptive price recommendations via the pricing engine &nbsp;·&nbsp;
          Powered by live endpoint <strong>POST /pricing/</strong>
        </p>
      </div>

      {/* Notifications */}
      {successBanner && (
        <div className="alert-success animate-in" style={{ marginBottom: 16 }}>
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
        <div className="alert-error animate-in" style={{ marginBottom: 16 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20 }}>
        {/* ── Input Form ─────────────────────────────────────── */}
        <div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Tag size={15} color="var(--accent-purple-lt)" />
                Pricing Simulator &amp; Optimizer
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
              <span>Calls live endpoint <strong>POST /pricing/</strong> wrapping <code>src/pricing/recommendation.py</code>.</span>
            </div>

            {/* Presets */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>
                Product Presets:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="btn-secondary"
                    style={{ padding: '4px 8px', fontSize: 11, justifyContent: 'flex-start' }}
                  >
                    <Sparkles size={11} color="var(--accent-purple-lt)" /> {p.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="grid-2" style={{ gap: 10 }}>
                <div className="input-group">
                  <label>SKU / Item ID *</label>
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

                <div className="input-group">
                  <label>Current Price ($) *</label>
                  <input
                    className={`input-field ${validationErrors.current_price ? 'input-error' : ''}`}
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="current_price"
                    value={form.current_price}
                    onChange={handleChange}
                    required
                  />
                  {validationErrors.current_price && <div className="error-text">{validationErrors.current_price}</div>}
                </div>
              </div>

              <div className="input-group">
                <label>Current Baseline Revenue ($) *</label>
                <input
                  className={`input-field ${validationErrors.current_revenue ? 'input-error' : ''}`}
                  type="number"
                  step="0.1"
                  min="0"
                  name="current_revenue"
                  value={form.current_revenue}
                  onChange={handleChange}
                  required
                />
                {validationErrors.current_revenue && <div className="error-text">{validationErrors.current_revenue}</div>}
              </div>

              <div className="grid-2" style={{ gap: 10 }}>
                <div className="input-group">
                  <label>Price Down Rev ($) *</label>
                  <input
                    className={`input-field ${validationErrors.price_down_revenue ? 'input-error' : ''}`}
                    type="number"
                    step="0.1"
                    min="0"
                    name="price_down_revenue"
                    value={form.price_down_revenue}
                    onChange={handleChange}
                    required
                  />
                  {validationErrors.price_down_revenue && <div className="error-text">{validationErrors.price_down_revenue}</div>}
                </div>

                <div className="input-group">
                  <label>Price Up Rev ($) *</label>
                  <input
                    className={`input-field ${validationErrors.price_up_revenue ? 'input-error' : ''}`}
                    type="number"
                    step="0.1"
                    min="0"
                    name="price_up_revenue"
                    value={form.price_up_revenue}
                    onChange={handleChange}
                    required
                  />
                  {validationErrors.price_up_revenue && <div className="error-text">{validationErrors.price_up_revenue}</div>}
                </div>
              </div>

              <div className="input-group">
                <label>Scenario Price Step (%) *</label>
                <input
                  className={`input-field ${validationErrors.price_change_percent ? 'input-error' : ''}`}
                  type="number"
                  step="1"
                  min="1"
                  max="50"
                  name="price_change_percent"
                  value={form.price_change_percent}
                  onChange={handleChange}
                  required
                />
                {validationErrors.price_change_percent && <div className="error-text">{validationErrors.price_change_percent}</div>}
              </div>

              <div style={{ marginTop: 16 }}>
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                      <span>Optimizing Price…</span>
                    </>
                  ) : (
                    <>
                      <SlidersHorizontal size={15} /> Calculate Optimal Price
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Results Panel ──────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Loading State */}
          {loading && (
            <div className="card">
              <LoadingState message="Evaluating pricing elasticity & running recommendation algorithm…" />
            </div>
          )}

          {/* Live Result State */}
          {result && !loading && (
            <div className="ai-panel animate-in">
              <div className="ai-panel-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag size={18} />
                  <span>Optimal Price Decision — Live Output</span>
                </div>
                {recMeta && (
                  <span className={`risk-badge ${recMeta.cls}`} style={{ color: recMeta.color, borderColor: recMeta.color }}>
                    {result.recommendation}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                <div style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Current Price</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ${result.current_price.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    SKU: {result.item_id}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Suggested Price</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-purple-lt)' }}>
                    ${result.suggested_price.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Step: ±{result.price_change_percent}%
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Projected Revenue</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-cyan-lt)' }}>
                    ${result.projected_revenue.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Base: ${result.current_revenue.toFixed(2)}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Revenue Uplift</div>
                  <div style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: result.revenue_uplift >= 0 ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {result.revenue_uplift_percent >= 0 ? '+' : ''}{result.revenue_uplift_percent.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    ${result.revenue_uplift >= 0 ? '+' : ''}{result.revenue_uplift.toFixed(2)} net
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
                  <span style={{ color: 'var(--text-muted)' }}>Prescriptive Action: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{result.recommendation}</strong>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: 8 }}>
                    (Down: ${result.price_down_revenue.toFixed(1)} vs Up: ${result.price_up_revenue.toFixed(1)})
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--accent-cyan-lt)' }}>
                  Algorithm: <code>src.pricing.recommendation.generate_price_recommendation</code>
                </div>
              </div>
            </div>
          )}

          {/* Empty Prompt */}
          {!result && !loading && (
            <div className="card">
              <div className="state-empty">
                <Tag size={36} color="var(--accent-purple-lt)" style={{ opacity: 0.6 }} />
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>No Pricing Evaluation Run</strong>
                <span style={{ maxWidth: 440 }}>
                  Select a product preset on the left or click <strong>Optimize Live</strong> on any table item to query the pricing algorithm.
                </span>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Tag size={14} color="var(--accent-purple-lt)" />
                Product Pricing Recommendations
              </div>
              <span className="demo-badge">LIVE EVALUATION READY</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Current Price</th>
                  <th>Suggested Price</th>
                  <th>Revenue Uplift</th>
                  <th>Recommendation</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tableItems.map((p) => {
                  const isUp = String(p.uplift).startsWith('+');
                  return (
                    <tr key={p.sku}>
                      <td className="mono">{p.sku}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{p.name}</span>
                          {p.isLive && (
                            <span style={{
                              fontSize: 9,
                              background: 'var(--success-bg)',
                              color: 'var(--success)',
                              border: '1px solid var(--success)',
                              borderRadius: 4,
                              padding: '1px 5px',
                              fontWeight: 700
                            }}>
                              LIVE API
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>${Number(p.current).toFixed(2)}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${Number(p.suggested).toFixed(2)}</td>
                      <td>
                        <span style={{ color: isUp ? 'var(--success)' : 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {p.uplift}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 11, color: p.isLive ? 'var(--accent-cyan-lt)' : 'var(--text-muted)' }}>
                          {p.algorithmRecommendation || (isUp ? 'Consider increasing price' : 'Consider reducing price')}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: 11 }}
                          disabled={evaluatingSku === p.sku}
                          onClick={() => handleEvaluateRow(p)}
                        >
                          {evaluatingSku === p.sku ? 'Evaluating…' : 'Optimize Live'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Comparison chart */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Tag size={14} color="var(--accent-purple-lt)" />
                Current vs Suggested Prices Comparison
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="current" name="Current Price" fill="var(--bg-elevated)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="suggested" name="Suggested Price" fill="var(--accent-purple)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
