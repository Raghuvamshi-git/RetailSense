import {
  LayoutDashboard, TrendingUp, Package, Tag, Gift, AlertTriangle, Database,
  ShoppingCart, Zap, Activity
} from 'lucide-react';

export const NAV_ITEMS = [
  {
    section: 'Main',
    items: [
      { id: 'overview',    label: 'Overview',            icon: LayoutDashboard },
      { id: 'forecast',    label: 'Demand Forecasting',  icon: TrendingUp      },
      { id: 'inventory',   label: 'Inventory Intelligence', icon: Package      },
    ],
  },
  {
    section: 'Insights',
    items: [
      { id: 'pricing',     label: 'Pricing Optimization', icon: Tag            },
      { id: 'promotions',  label: 'Promotion Insights',   icon: Gift           },
      { id: 'anomalies',   label: 'Anomaly Detection',    icon: AlertTriangle  },
    ],
  },
  {
    section: 'Data',
    items: [
      { id: 'explorer',    label: 'Data Explorer',        icon: Database       },
    ],
  },
];

export { ShoppingCart, Zap, Activity };
