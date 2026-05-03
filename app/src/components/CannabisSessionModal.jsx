import { useState } from 'react';
import { Modal, ConfirmModal } from './Modal';
import { useStore } from '../data/store';
import { CANNABIS_INTENDED_REASONS, CANNABIS_EFFECTS } from '../data/seed';
import { format } from 'date-fns';

const INFUSED_PREROLL_IDS = ['inv-5'];
const RSO_IDS = ['inv-1'];

function isStacking(productId, existingLogs) {
  const hasRSO = existingLogs.some((l) => RSO_IDS.includes(l.productId));
  const hasInfused = existingLogs.some((l) => INFUSED_PREROLL_IDS.includes(l.productId));
  if (RSO_IDS.includes(productId) && hasInfused) return true;
  if (INFUSED_PREROLL_IDS.includes(productId) && hasRSO) return true;
  return false;
}

export function CannabisSessionModal({ onClose }) {
  const addCannabisLog = useStore((s) => s.addCannabisLog);
  const logInventoryUse = useStore((s) => s.logInventoryUse);
  const addToast = useStore((s) => s.addToast);
  const inventory = useStore((s) => s.inventory);
  const getTodayCannabisLogs = useStore((s) => s.getTodayCannabisLogs);
  const getTodaySessions = useStore((s) => s.getTodaySessions);
  const profile = useStore((s) => s.profile);

  const todayLogs = getTodayCannabisLogs();
  const todaySessions = getTodaySessions();
  const dailyTarget = profile.cannabisTargets.dailySessions;

  const [showStackConfirm, setShowStackConfirm] = useState(false);
  const [pendingForm, setPendingForm] = useState(null);

  const [form, setForm] = useState({
    productId: inventory[0]?.id || '',
    form: inventory[0]?.form || '',
    sessionNumber: todaySessions + 1,
    amount: '',
    unit: inventory[0]?.remainingUnit || 'g',
    thcMg: '',
    reason: 'Anxiety',
    effect: 'Calm',
    munchiesTriggered: false,
    notes: '',
    time: format(new Date(), 'HH:mm'),
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const selectedProduct = inventory.find((p) => p.id === form.productId);

  const handleProductChange = (id) => {
    const p = inventory.find((pr) => pr.id === id);
    set('productId', id);
    if (p) {
      setForm((f) => ({ ...f, productId: id, form: p.form, unit: p.remainingUnit }));
    }
  };

  const handleSubmit = () => {
    if (!form.productId || !form.amount) return;

    // Cannabis hard rules — warnings (toasts)
    const firstMealLogged = useStore.getState().getTodayFoodLogs().length > 0;
    if (!firstMealLogged) {
      addToast('⚠ Hard rule: No cannabis before your first meal of the day.', 'warning');
    }
    if (todaySessions >= dailyTarget) {
      addToast(`⚠ You've reached your daily target of ${dailyTarget} sessions.`, 'warning');
    }

    // Stacking hard block
    if (isStacking(form.productId, todayLogs)) {
      setPendingForm({ ...form });
      setShowStackConfirm(true);
      return;
    }

    submitLog(form);
  };

  const submitLog = (f) => {
    addCannabisLog(f);
    logInventoryUse(f.productId, Number(f.amount) || 0);
    onClose();
  };

  if (showStackConfirm) {
    return (
      <ConfirmModal
        title="⛔ Stacking Warning — Hard Block"
        warning="RSO capsules + infused pre-rolls MUST NOT be stacked. This is a hard rule."
        message="You already have an RSO capsule or infused pre-roll logged today. Combining these is high-risk and against your plan. Are you sure you want to override and log this session anyway?"
        confirmLabel="Override & Log Anyway"
        confirmClass="btn btn-danger"
        onConfirm={() => {
          setShowStackConfirm(false);
          addToast('⚠ Stacking override logged — high risk noted.', 'error');
          submitLog(pendingForm);
        }}
        onCancel={() => { setShowStackConfirm(false); setPendingForm(null); }}
      />
    );
  }

  return (
    <Modal title="Log Cannabis Session" onClose={onClose}>
      {todaySessions >= dailyTarget && (
        <div className="medical-warning" style={{ marginBottom: 12 }}>
          ⚠ Daily target of {dailyTarget} sessions reached. Proceeding will exceed your plan.
        </div>
      )}

      <div className="form-row">
        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">Product</label>
          <select className="form-select" value={form.productId} onChange={(e) => handleProductChange(e.target.value)}>
            {inventory.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.remaining}{p.remainingUnit} left)
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Time</label>
          <input className="form-input" type="time" value={form.time} onChange={(e) => set('time', e.target.value)} />
        </div>
      </div>

      {selectedProduct && (
        <div style={{ marginBottom: 12 }}>
          <span className={`risk-badge risk-${selectedProduct.riskLevel.replace(/-/g, '')}`}>
            {selectedProduct.riskLevel} risk
          </span>
          {(RSO_IDS.includes(form.productId) || INFUSED_PREROLL_IDS.includes(form.productId)) && (
            <span style={{ fontSize: 11, color: 'var(--red)', marginLeft: 8 }}>
              ⚠ Stacking with RSO + infused pre-roll is blocked
            </span>
          )}
          {selectedProduct.notToExceed && (
            <div className="product-nte" style={{ marginTop: 8 }}>
              ⚠ {selectedProduct.notToExceed}
            </div>
          )}
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Amount</label>
          <input className="form-input" type="number" step="0.1" placeholder="0" value={form.amount} onChange={(e) => set('amount', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Unit</label>
          <select className="form-select" value={form.unit} onChange={(e) => set('unit', e.target.value)}>
            <option value="g">g</option>
            <option value="capsule">capsule</option>
            <option value="pre-roll">pre-roll</option>
            <option value="mg THC">mg THC</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Est. THC mg</label>
          <input className="form-input" type="number" placeholder="optional" value={form.thcMg} onChange={(e) => set('thcMg', e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Reason</label>
          <select className="form-select" value={form.reason} onChange={(e) => set('reason', e.target.value)}>
            {CANNABIS_INTENDED_REASONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Effect</label>
          <select className="form-select" value={form.effect} onChange={(e) => set('effect', e.target.value)}>
            {CANNABIS_EFFECTS.map((e) => <option key={e}>{e}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-checkbox">
          <input type="checkbox" checked={form.munchiesTriggered} onChange={(e) => set('munchiesTriggered', e.target.checked)} />
          Munchies triggered?
        </label>
      </div>

      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="form-textarea" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </div>

      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!form.productId || !form.amount}>
          Log Session
        </button>
      </div>
    </Modal>
  );
}
