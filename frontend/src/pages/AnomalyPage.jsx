import { DEMO_ANOMALIES } from '../data/demoData';
import { AlertTriangle, Zap, TrendingDown, TrendingUp, Package } from 'lucide-react';

const severityStyle = {
  HIGH:   { color: 'var(--danger)',  bg: 'var(--danger-bg)',  border: 'var(--danger)' },
  MEDIUM: { color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'var(--warning)' },
  LOW:    { color: 'var(--success)', bg: 'var(--success-bg)', border: 'var(--success)' },
};

const typeIcons = {
  DEMAND_SPIKE:  TrendingUp,
  PRICE_DROP:    TrendingDown,
  STOCKOUT_RISK: Package,
  SLOW_MOVER:    TrendingDown,
};

export default function AnomalyPage() {
  const high   = DEMO_ANOMALIES.filter((a) => a.severity === 'HIGH');
  const medium = DEMO_ANOMALIES.filter((a) => a.severity === 'MEDIUM');
  const low    = DEMO_ANOMALIES.filter((a) => a.severity === 'LOW');

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Anomaly Detection</h1>
        <p>Automated retail signal monitoring — <strong style={{ color: 'var(--warning)' }}>DEMO DATA</strong> · Requires anomaly detection API endpoint</p>
      </div>

      {/* Severity summary */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: 'High Severity', count: high.length,   color: 'var(--danger)',  bg: 'var(--danger-bg)' },
          { label: 'Medium',        count: medium.length, color: 'var(--warning)', bg: 'var(--warning-bg)' },
          { label: 'Low',           count: low.length,    color: 'var(--success)', bg: 'var(--success-bg)' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color={color} />
            </div>
            <div>
              <div className="kpi-label" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {label} <span className="demo-badge">DEMO</span>
              </div>
              <div className="kpi-value" style={{ color, fontSize: '1.4rem' }}>{count}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Anomaly feed */}
      <div className="card section">
        <div className="card-header">
          <div className="card-title">
            <Zap size={14} color="var(--warning)" />
            Active Anomaly Feed
          </div>
          <span className="demo-badge">DEMO DATA</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {DEMO_ANOMALIES.map((a) => {
            const style = severityStyle[a.severity] || severityStyle.LOW;
            const TypeIcon = typeIcons[a.type] || AlertTriangle;
            return (
              <div key={a.id} style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${style.border}`,
                borderLeft: `4px solid ${style.border}`,
                borderRadius: 10,
                padding: '14px 18px',
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: style.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TypeIcon size={18} color={style.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: style.color }}>
                      {a.type.replace(/_/g, ' ')}
                    </span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.item}</span>
                    <span style={{
                      marginLeft: 'auto', fontSize: 10,
                      background: style.bg, color: style.color,
                      border: `1px solid ${style.border}`,
                      borderRadius: 12, padding: '2px 8px', fontWeight: 600
                    }}>
                      {a.severity}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, margin: 0 }}>{a.desc}</p>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{a.ts}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ai-panel">
        <div className="ai-panel-header">
          <AlertTriangle size={16} /> Anomaly Engine Note
        </div>
        <p>
          The backend contains a <code style={{ background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>src/anomaly_detection/</code> module.
          Expose a <code style={{ background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>GET /anomalies/</code> endpoint to replace this demo data with live detection results.
        </p>
      </div>
    </div>
  );
}
