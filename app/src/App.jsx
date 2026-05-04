// App.jsx — Route dispatcher (AC-P0-C6). Nav driven by ROUTES registry.
import { useState } from 'react';
import { format } from 'date-fns';
import { useStore } from './data/store';
import { ROUTES } from './app/routes.jsx';
import { ToastContainer } from './components/ToastContainer';
import { QuickAddModal } from './components/QuickAddModal';
import './index.css';

const NAV = ROUTES.filter((r) => r.navOrder >= 0).sort((a, b) => a.navOrder - b.navOrder);

export default function App() {
  const [activeView, setActiveView] = useState('today');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const demoMode = useStore((s) => s.demoMode);
  const toggleDemoMode = useStore((s) => s.toggleDemoMode);
  const route = ROUTES.find((r) => r.id === activeView) ?? ROUTES[0];
  const View  = route.component;

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="sidebar-logo"><h2>Health Tracker</h2><span>Asif · Local</span></div>
        {NAV.map((r) => (
          <div key={r.id} className={`nav-item${activeView === r.id ? ' active' : ''}`} onClick={() => setActiveView(r.id)}>
            <r.icon />{r.label}
          </div>
        ))}
      </nav>

      <div className="main-content">
        <div className="top-header">
          <div className="header-title-group">
            <h1>{route.title}</h1>
            {activeView === 'today' && <span className="date-label">· {format(new Date(), 'EEEE, MMMM d')}</span>}
          </div>
          <div className="header-actions">
            {activeView === 'today' && (<>
              <button className="btn btn-ghost btn-sm" disabled>Import</button>
              <button className={`btn btn-ghost btn-sm btn-demo${demoMode ? ' demo-active' : ''}`} onClick={toggleDemoMode}>{demoMode ? 'Demo ON' : 'Demo'}</button>
              <button className="btn btn-primary btn-sm" onClick={() => setShowQuickAdd(true)}>+ Quick Add</button>
            </>)}
          </div>
        </div>
        <View />
      </div>

      <nav className="bottom-nav">
        {NAV.map((r) => (
          <div key={r.id} className={`bottom-nav-item${activeView === r.id ? ' active' : ''}`} onClick={() => setActiveView(r.id)}>
            <r.icon /><span>{r.label}</span>
          </div>
        ))}
      </nav>

      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
      <ToastContainer />
    </div>
  );
}
