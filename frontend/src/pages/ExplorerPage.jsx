import { useState } from 'react';
import { DEMO_TOP_PRODUCTS } from '../data/demoData';
import { Database, Search } from 'lucide-react';

const riskClass = { HIGH: 'risk-high', MEDIUM: 'risk-medium', LOW: 'risk-low' };

export default function ExplorerPage() {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', ...new Set(DEMO_TOP_PRODUCTS.map((p) => p.category))];

  const filtered = DEMO_TOP_PRODUCTS.filter((p) => {
    const matchQ = p.name.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase());
    const matchC = categoryFilter === 'All' || p.category === categoryFilter;
    return matchQ && matchC;
  });

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Data Explorer</h1>
        <p>Browse and search product catalogue — <strong style={{ color: 'var(--warning)' }}>DEMO DATA</strong> · Connect to real DB for live records</p>
      </div>

      {/* Search & filter bar */}
      <div className="card section" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input-field"
              style={{ paddingLeft: 34 }}
              placeholder="Search product name or SKU…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                style={{
                  background: categoryFilter === c ? 'var(--accent-blue)' : 'var(--bg-elevated)',
                  color: categoryFilter === c ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: categoryFilter === c ? 'var(--accent-blue)' : 'var(--border)',
                  borderRadius: 20,
                  padding: '5px 14px',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <span className="demo-badge">DEMO DATA</span>
        </div>
      </div>

      {/* Product table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Database size={14} color="var(--accent-cyan-lt)" />
            Product Catalogue ({filtered.length} results)
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="state-empty">
            <Search size={28} color="var(--text-muted)" />
            <span>No products match your search.</span>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Demand/day</th>
                <th>Stock Units</th>
                <th>Stock Cover</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const cover = (p.stock / p.demand).toFixed(1);
                return (
                  <tr key={p.id}>
                    <td className="mono" style={{ color: 'var(--accent-cyan-lt)' }}>{p.id}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                    <td>
                      <span style={{
                        background: 'var(--bg-elevated)', borderRadius: 4, padding: '2px 8px', fontSize: 11
                      }}>{p.category}</span>
                    </td>
                    <td>{p.demand}</td>
                    <td>{p.stock.toLocaleString()}</td>
                    <td>
                      <span style={{ color: parseFloat(cover) < 3 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                        {cover}d
                      </span>
                    </td>
                    <td><span className={`risk-badge ${riskClass[p.risk]}`}>{p.risk}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="ai-panel" style={{ marginTop: 16 }}>
        <div className="ai-panel-header">
          <Database size={16} /> Data Explorer Note
        </div>
        <p>
          This explorer currently shows demo product data. To connect to the real database, expose a
          <code style={{ background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}> GET /products/</code> endpoint
          in the FastAPI router and update <code style={{ background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>src/api/client.js</code>.
          The backend's MySQL database already stores forecast records via <code style={{ background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>forecasts</code> table.
        </p>
      </div>
    </div>
  );
}
