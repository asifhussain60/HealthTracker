import { useState } from 'react';
import { format } from 'date-fns';
import { TodayView } from './views/TodayView';
import { InventoryView } from './views/InventoryView';
import { HistoryView } from './views/HistoryView';
import { ProfileView } from './views/ProfileView';
import { ToastContainer } from './components/ToastContainer';
import { QuickAddModal } from './components/QuickAddModal';
import './index.css';

const VIEWS = [
  {
    key: 'today', label: 'Today',
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>),
  },
  {
    key: 'inventory', label: 'Inventory',
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6l9-4 9 4v12l-9 4-9-4V6z"/><path d="M12 2v20M3 6l9 4 9-4"/></svg>),
  },
  {
    key: 'history', label: 'History',
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>),
  },
  {
    key: 'profile', label: 'Profile',
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>),
  },
];

export default function App() {
  const [activeView, setActiveView] = useState('today');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const dateLabel = format(new Date(), 'EEEE, MMMM d');
  const viewTitles = { today: 'Today', inventory: 'Cannabis Inventory', history: 'History', profile: 'Profile' };

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="sidebar-logo">
          <h2>Health Tracker</h2>
          <span>Asif · Local</span>
        </div>
        {VIEWS.map((v) => (
          <div key={v.key} className={`nav-item ${activeView === v.key ? 'active' : ''}`} onClick={() => setActiveView(v.key)}>
            {v.icon}{v.label}
          </div>
        ))}
      </nav>

      <div className="main-content">
        <div className="top-header">
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <h1>{viewTitles[activeView]}</h1>
            {activeView === 'today' && <span className="date-label">· {dateLabel}</span>}
          </div>
          <div className="header-actions">
            {activeView === 'today' && (
              <>
                <button className="btn btn-ghost btn-sm" disabled style={{ opacity: 0.4 }}>Import</button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowQuickAdd(true)}>+ Quick Add</button>
              </>
            )}
          </div>
        </div>

        {activeView === 'today' && <TodayView />}
        {activeView === 'inventory' && <InventoryView />}
        {activeView === 'history' && <HistoryView />}
        {activeView === 'profile' && <ProfileView />}
      </div>

      <nav className="bottom-nav">
        {VIEWS.map((v) => (
          <div key={v.key} className={`bottom-nav-item ${activeView === v.key ? 'active' : ''}`} onClick={() => setActiveView(v.key)}>
            {v.icon}<span>{v.label}</span>
          </div>
        ))}
      </nav>

      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
      <ToastContainer />
    </div>
  );
}
