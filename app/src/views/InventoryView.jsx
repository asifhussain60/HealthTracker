import { useState } from 'react';
import { useStore } from '../data/store';
import { Modal } from '../components/Modal';
import { DAY_NIGHT_LABELS } from '../data/seed';
import { format } from 'date-fns';

function RiskBadge({ level }) {
  const cls = (level || '').replace(/-/g, '');
  return <span className={`risk-badge risk-${cls}`}>{level}</span>;
}

function DayNightBadge({ dayNight }) {
  const info = DAY_NIGHT_LABELS[dayNight];
  if (!info) return null;
  return (
    <span style={{
      fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
      background: 'var(--surface3)', color: info.color, border: `1px solid ${info.color}`,
    }}>
      {info.label}
    </span>
  );
}

function getRemainingPct(item) {
  const ratio = item.orderedAmount > 0 ? item.remaining / item.orderedAmount : 0;
  return Math.min(100, Math.max(0, ratio * 100));
}

function getBarColor(riskLevel) {
  if (riskLevel === 'high') return 'var(--red)';
  if (riskLevel === 'medium-high') return 'var(--orange)';
  if (riskLevel === 'medium') return 'var(--yellow)';
  return 'var(--green)';
}

function LogUseModal({ product, onClose }) {
  const logInventoryUse = useStore((s) => s.logInventoryUse);
  const addCannabisLog = useStore((s) => s.addCannabisLog);
  const [amount, setAmount] = useState('');

  const handleLog = () => {
    const a = Number(amount);
    if (!a) return;
    logInventoryUse(product.id, a);
    addCannabisLog({
      productId: product.id,
      form: product.form,
      sessionNumber: 1,
      amount: a,
      unit: product.remainingUnit,
      time: format(new Date(), 'HH:mm'),
      method: product.form === 'capsule' ? 'Oral' : 'Smoked',
      reason: 'Other',
      effect: 'Calm',
      munchiesTriggered: false,
      munchiesLevel: 0,
      productivityScore: 5,
      medicalBenefit: 5,
      wouldUseAgain: 'Maybe',
      notes: 'Logged from Inventory',
    });
    onClose();
  };

  return (
    <Modal title={`Log Use — ${product.name}`} onClose={onClose}>
      <div className="form-group">
        <label className="form-label">Amount used ({product.remainingUnit})</label>
        <input className="form-input" type="number" step="0.025" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
        <div className="form-hint">Remaining: {product.remaining} {product.remainingUnit}</div>
      </div>
      {product.startingDose && (
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>
          Starting dose: <strong>{product.startingDose}</strong>
          {product.maxTestDose && <> &nbsp;|&nbsp; Max test: <strong>{product.maxTestDose}</strong></>}
        </div>
      )}
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleLog} disabled={!amount}>Log Use</button>
      </div>
    </Modal>
  );
}

function ProductScorecard() {
  const cannabisLogs = useStore((s) => s.cannabisLogs);
  const inventory = useStore((s) => s.inventory);

  const scorecardData = inventory.map((product) => {
    const logs = cannabisLogs.filter((l) => l.productId === product.id);
    if (logs.length === 0) return { product, logs: 0, verdict: 'No data' };

    const avg = (key) => {
      const vals = logs.map((l) => Number(l[key])).filter((v) => !isNaN(v) && v > 0);
      return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
    };

    const medBenefit = avg('medicalBenefit');
    const munchies = avg('munchiesLevel');
    const productivity = avg('productivityScore');

    const yesCount = logs.filter((l) => l.wouldUseAgain === 'Yes').length;
    const wouldUseRate = `${yesCount}/${logs.length}`;

    let verdict = 'Insufficient data';
    if (logs.length >= 3) {
      const mb = parseFloat(medBenefit);
      const mu = parseFloat(munchies);
      const pr = parseFloat(productivity);
      if (!isNaN(mb) && !isNaN(mu) && !isNaN(pr)) {
        if (mb >= 7 && pr >= 7 && mu <= 4) verdict = '✓ Keep';
        else if (mb >= 5 || pr >= 5) verdict = '⚠ Limit';
        else verdict = '✗ Avoid';
      }
    }

    return { product, logs: logs.length, medBenefit, munchies, productivity, wouldUseRate, verdict };
  });

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Product Scorecard</div>
      <div style={{ fontSize: 11, color: 'var(--text-dimmer)', marginBottom: 12 }}>
        Verdict requires ≥ 3 sessions. Keep = medical benefit ≥7 AND productivity ≥7 AND munchies ≤4.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dimmer)' }}>
              <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 500 }}>Product</th>
              <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 500 }}>Sessions</th>
              <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 500 }}>Med Benefit</th>
              <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 500 }}>Productivity</th>
              <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 500 }}>Munchies</th>
              <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 500 }}>Use Again</th>
              <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 500 }}>Verdict</th>
            </tr>
          </thead>
          <tbody>
            {scorecardData.map(({ product, logs, medBenefit, munchies, productivity, wouldUseRate, verdict }) => {
              const verdictColor = verdict?.startsWith('✓') ? 'var(--green)'
                : verdict?.startsWith('⚠') ? 'var(--yellow)'
                : verdict?.startsWith('✗') ? 'var(--red)'
                : 'var(--text-dimmer)';
              return (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 8px' }}>
                    <div style={{ fontWeight: 500 }}>{product.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dimmer)' }}>{product.brand}</div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px 8px', color: logs > 0 ? 'var(--teal)' : 'var(--text-dimmer)' }}>
                    {logs}
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px 8px' }}>{medBenefit ?? '—'}</td>
                  <td style={{ textAlign: 'center', padding: '8px 8px' }}>{productivity ?? '—'}</td>
                  <td style={{ textAlign: 'center', padding: '8px 8px', color: parseFloat(munchies) > 6 ? 'var(--yellow)' : undefined }}>
                    {munchies ?? '—'}
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px 8px' }}>{wouldUseRate ?? '—'}</td>
                  <td style={{ textAlign: 'center', padding: '8px 8px', fontWeight: 600, color: verdictColor }}>
                    {verdict}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function InventoryView() {
  const inventory = useStore((s) => s.inventory);
  const [logTarget, setLogTarget] = useState(null);

  const totalFlowerG = inventory
    .filter((p) => p.form === 'flower')
    .reduce((sum, p) => sum + p.remaining, 0);

  const highRiskCount = inventory.filter((p) => p.riskLevel === 'high').length;

  return (
    <div className="view-container">
      <div className="inventory-summary">
        <div className="inv-stat">
          <div className="inv-stat-value">{inventory.length}</div>
          <div className="inv-stat-label">Total Products</div>
        </div>
        <div className="inv-stat">
          <div className="inv-stat-value" style={{ color: 'var(--teal)' }}>{totalFlowerG.toFixed(1)}g</div>
          <div className="inv-stat-label">Flower Remaining</div>
        </div>
        <div className="inv-stat">
          <div className="inv-stat-value" style={{ color: 'var(--red)' }}>{highRiskCount}</div>
          <div className="inv-stat-label">High-Risk Products</div>
        </div>
      </div>

      {inventory.map((product) => (
        <div key={product.id} className="product-card">
          <div className="product-header">
            <div>
              <div className="product-name">{product.name}</div>
              <div className="product-brand">{product.brand}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-end' }}>
              <RiskBadge level={product.riskLevel} />
              {product.dayNight && <DayNightBadge dayNight={product.dayNight} />}
            </div>
          </div>

          <div className="product-badges">
            <span className="form-badge">{product.form}</span>
            <span className="form-badge">{product.type}</span>
            {product.thcPercent && <span className="form-badge">{product.thcPercent}% THC</span>}
            {product.thcMgPerUnit && <span className="form-badge">{product.thcMgPerUnit}mg/unit</span>}
          </div>

          {product.useWindow && (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>
              🕐 <strong>Use window:</strong> {product.useWindow}
            </div>
          )}

          {product.startingDose && (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>
              💊 <strong>Start:</strong> {product.startingDose}
              {product.maxTestDose && <> &nbsp;|&nbsp; <strong>Max test:</strong> {product.maxTestDose}</>}
            </div>
          )}

          <div className="product-stats">
            <span>Remaining: <strong>{product.remaining} {product.remainingUnit}</strong></span>
            <span>Ordered: <strong>{product.orderedLabel}</strong></span>
            {product.munchiesRisk !== 'low' && (
              <span>Munchies risk: <strong style={{ color: product.munchiesRisk === 'high' ? 'var(--red)' : 'var(--yellow)' }}>{product.munchiesRisk}</strong></span>
            )}
          </div>

          <div className="product-remaining-bar">
            <div
              className="product-remaining-fill"
              style={{
                width: `${getRemainingPct(product)}%`,
                background: getBarColor(product.riskLevel),
              }}
            />
          </div>

          {product.effects?.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
              {product.effects.map((e) => (
                <span key={e} className="form-badge" style={{ background: 'var(--teal-bg)', color: 'var(--teal)' }}>{e}</span>
              ))}
            </div>
          )}

          <div className="product-plan">📋 {product.usagePlan}</div>
          <div className="product-nte">⚠ {product.notToExceed}</div>

          {product.notes && (
            <div style={{ fontSize: 11, color: 'var(--text-dimmer)', marginBottom: 8 }}>{product.notes}</div>
          )}

          <div style={{ fontSize: 11, color: 'var(--text-dimmer)', marginBottom: 8 }}>
            Last used: {product.lastUsed || 'Never'}
          </div>

          <div className="product-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setLogTarget(product)}>
              − Log Use
            </button>
          </div>
        </div>
      ))}

      <ProductScorecard />

      {logTarget && <LogUseModal product={logTarget} onClose={() => setLogTarget(null)} />}
    </div>
  );
}
