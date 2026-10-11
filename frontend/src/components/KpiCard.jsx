import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const GRADIENTS = {
  blue:   'linear-gradient(90deg,#2563eb,#06b6d4)',
  cyan:   'linear-gradient(90deg,#06b6d4,#0d9488)',
  purple: 'linear-gradient(90deg,#7c3aed,#2563eb)',
  green:  'linear-gradient(90deg,#059669,#10b981)',
  orange: 'linear-gradient(90deg,#d97706,#f59e0b)',
  red:    'linear-gradient(90deg,#dc2626,#ef4444)',
};

const BG_ICONS = {
  blue:   'rgba(37,99,235,0.15)',
  cyan:   'rgba(6,182,212,0.15)',
  purple: 'rgba(124,58,237,0.15)',
  green:  'rgba(16,185,129,0.15)',
  orange: 'rgba(245,158,11,0.15)',
  red:    'rgba(239,68,68,0.15)',
};

/**
 * KPI Card
 * @param {string} label
 * @param {string} value
 * @param {string} delta  – e.g. "+12.3%"
 * @param {'up'|'down'|'neutral'} trend
 * @param {React.ElementType} icon
 * @param {'blue'|'cyan'|'purple'|'green'|'orange'|'red'} color
 * @param {boolean} isDemo
 */
export default function KpiCard({ label, value, delta, trend = 'neutral', icon: Icon, color = 'blue', isDemo = false }) {
  const DeltaIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  return (
    <div className="kpi-card" style={{ '--kpi-gradient': GRADIENTS[color] }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {Icon && (
          <div className="kpi-icon" style={{ background: BG_ICONS[color] }}>
            <Icon size={20} color={color === 'blue' ? 'var(--accent-blue-lt)' : `var(--accent-${color === 'cyan' ? 'cyan-lt' : color})`} />
          </div>
        )}
        {isDemo && <span className="demo-badge">DEMO</span>}
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {delta && (
        <div className={`kpi-delta ${trend}`}>
          <DeltaIcon size={12} />
          <span>{delta} vs last period</span>
        </div>
      )}
    </div>
  );
}
