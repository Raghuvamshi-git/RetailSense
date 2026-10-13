import { useState, useEffect } from 'react';
import { getHealth } from '../api/client';
import { Activity } from 'lucide-react';

export default function Topbar({ pageName }) {
  const [apiStatus, setApiStatus] = useState('checking'); // 'online'|'offline'|'checking'
  const [dateStr] = useState(() =>
    new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  );

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        await getHealth();
        if (!cancelled) setApiStatus('online');
      } catch {
        if (!cancelled) setApiStatus('offline');
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const statusLabel = { online: 'API Online', offline: 'API Offline', checking: 'Connecting…' }[apiStatus];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Activity size={16} color="var(--accent-cyan-lt)" />
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
          {pageName}
        </span>
      </div>
      <div className="topbar-right">
        <div className="api-status">
          <div className={`status-dot ${apiStatus}`} />
          {statusLabel}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {dateStr}
        </div>
      </div>
    </header>
  );
}
