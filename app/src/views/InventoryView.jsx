/**
 * InventoryView.jsx — Cannabis inventory view (renamed "Cannabis" in nav).
 *
 * AC-P0-C8
 * ProductScorecard extracted to CannabisProductScorecard.jsx.
 * useStore direct reads replaced with useCannabisRepo() per P1 audit finding.
 */
import { useState } from 'react';
import { useStore } from '../data/store';
import { useCannabisRepo } from '../data/repositories/useCannabisRepo';
import { Modal } from '../components/Modal';
import { DAY_NIGHT_LABELS } from '../data/seed';
import { CannabisProductScorecard } from '../components/cards/CannabisProductScorecard';
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
  if (riskLevel === 'high')        return 'var(--red)';
  if (riskLevel === 'medium-high') return 'var(--orange)';
  if (riskLevel === 'medium')      return 'var(--yellow)';
  return 'var(--green)';
}

function LogUseModal({ product, onClose }) {
  const logInventoryUse = useStore((s) => s.logInventoryUse);
  const addCannabisLog  = useStore((s) => s.addCannabisLog);
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

export function InventoryView() {
  const cannabisRepo  = useCannabisRepo();
  const inventory     = cannabisRepo.listProducts();
  const cannabisLogs  = cannabisRepo.listSessions();
  const [logTarget, setLogTarget] = useState(null);

  const totalFlowerG  = inventory
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
              style={{ width: `${getRemainingPct(product)}%`, background: getBarColor(product.riskLevel) }}
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

      <CannabisProductScorecard inventory={inventory} cannabisLogs={cannabisLogs} />

      {logTarget && <LogUseModal product={logTarget} onClose={() => setLogTarget(null)} />}
    </div>
  );
}
