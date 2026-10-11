import { NAV_ITEMS } from '../config/nav';
import { Zap } from 'lucide-react';

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Zap size={18} color="#fff" />
        </div>
        <div className="brand-text">
          <strong>RetailSense AI+</strong>
          <span>Intelligence Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((section) => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`nav-item${activePage === id ? ' active' : ''}`}
                onClick={() => onNavigate(id)}
                title={label}
              >
                <Icon size={16} className="nav-icon" />
                {label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        v1.0.0 &nbsp;·&nbsp; XGBoost Model
      </div>
    </aside>
  );
}
