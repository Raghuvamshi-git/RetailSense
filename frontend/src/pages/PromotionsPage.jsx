import { DEMO_PROMOTIONS } from '../data/demoData';
import { Gift, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const statusConfig = {
  ACTIVE:    { color: 'var(--success)', bg: 'var(--success-bg)', icon: CheckCircle, label: 'Active' },
  SCHEDULED: { color: 'var(--info)',    bg: 'var(--info-bg)',    icon: Clock,        label: 'Scheduled' },
  ENDED:     { color: 'var(--text-muted)', bg: 'rgba(100,116,139,0.1)', icon: AlertCircle, label: 'Ended' },
};

export default function PromotionsPage() {
  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Promotion Insights</h1>
        <p>Campaign performance and uplift analysis — <strong style={{ color: 'var(--warning)' }}>DEMO DATA</strong> · Requires promotions API endpoint</p>
      </div>

      {/* Summary KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
        {[
          { label: 'Active Campaigns', value: '2', color: 'var(--success)' },
          { label: 'Avg Revenue Uplift', value: '+21%', color: 'var(--accent-cyan)' },
          { label: 'Campaigns This Month', value: '4', color: 'var(--accent-blue-lt)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {label} <span className="demo-badge">DEMO</span>
            </div>
            <div className="kpi-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Campaign cards */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">
            <Gift size={16} color="var(--accent-cyan-lt)" />
            Campaign Overview
          </div>
          <span className="demo-badge">DEMO DATA</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {DEMO_PROMOTIONS.map((promo) => {
            const { color, bg, icon: StatusIcon, label } = statusConfig[promo.status] || statusConfig.ENDED;
            return (
              <div key={promo.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Gift size={20} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{promo.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {promo.type} &nbsp;·&nbsp; Ends {promo.ends}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1.1rem' }}>{promo.uplift}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Revenue Uplift</div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: bg, color, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600
                }}>
                  <StatusIcon size={12} />
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ai-panel">
        <div className="ai-panel-header">
          <Gift size={16} /> Promotions Engine Note
        </div>
        <p>
          The backend contains a <code style={{ background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>src/promotion/</code> module.
          Expose a <code style={{ background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>GET /promotions/</code> endpoint to replace this demo data with live campaign data.
        </p>
      </div>
    </div>
  );
}
