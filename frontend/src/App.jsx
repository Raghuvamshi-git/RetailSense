import { useState } from 'react';
import Sidebar   from './components/Sidebar';
import Topbar    from './components/Topbar';

import OverviewPage    from './pages/OverviewPage';
import ForecastPage    from './pages/ForecastPage';
import InventoryPage   from './pages/InventoryPage';
import PricingPage     from './pages/PricingPage';
import PromotionsPage  from './pages/PromotionsPage';
import AnomalyPage     from './pages/AnomalyPage';
import ExplorerPage    from './pages/ExplorerPage';

const PAGE_TITLES = {
  overview:   'Overview',
  forecast:   'Demand Forecasting',
  inventory:  'Inventory Intelligence',
  pricing:    'Pricing Optimization',
  promotions: 'Promotion Insights',
  anomalies:  'Anomaly Detection',
  explorer:   'Data Explorer',
};

const PAGES = {
  overview:   <OverviewPage />,
  forecast:   <ForecastPage />,
  inventory:  <InventoryPage />,
  pricing:    <PricingPage />,
  promotions: <PromotionsPage />,
  anomalies:  <AnomalyPage />,
  explorer:   <ExplorerPage />,
};

export default function App() {
  const [activePage, setActivePage] = useState('overview');

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="main-content">
        <Topbar pageName={PAGE_TITLES[activePage]} />
        <main className="page-content">
          {PAGES[activePage]}
        </main>
      </div>
    </div>
  );
}
