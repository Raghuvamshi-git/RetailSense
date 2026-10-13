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

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [inventoryPrefill, setInventoryPrefill] = useState({ demand: null, std: null });

  const handleNavigateToInventory = (demand, std) => {
    setInventoryPrefill({ demand, std });
    setActivePage('inventory');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage onNavigate={setActivePage} />;
      case 'forecast':
        return <ForecastPage onNavigateToInventory={handleNavigateToInventory} />;
      case 'inventory':
        return (
          <InventoryPage
            key={`${inventoryPrefill.demand}-${inventoryPrefill.std}`}
            prefillDemand={inventoryPrefill.demand}
            prefillStd={inventoryPrefill.std}
          />
        );
      case 'pricing':
        return <PricingPage />;
      case 'promotions':
        return <PromotionsPage />;
      case 'anomalies':
        return <AnomalyPage />;
      case 'explorer':
        return <ExplorerPage />;
      default:
        return <OverviewPage onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="main-content">
        <Topbar pageName={PAGE_TITLES[activePage] || 'Dashboard'} />
        <main className="page-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
