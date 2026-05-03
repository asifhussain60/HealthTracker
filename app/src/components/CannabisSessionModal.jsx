import { useState } from 'react';
import { Modal, ConfirmModal } from './Modal';
import { useStore } from '../data/store';
import {
  CANNABIS_INTENDED_REASONS,
  CANNABIS_EFFECTS,
  CANNABIS_PRODUCTIVITY_IMPACTS,
  PRE_CANNABIS_CHECKLIST,
} from '../data/seed';
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

function getDefaultMethod(form) {
  if (form === 'capsule') return 'Oral';
  if (form === 'infused-preroll' || form === 'flower') return 'Smoked';
  return 'Vaped';
}

function ScoreSlider({ label, value, onChange, lowLabel = 'Low', highLabel = 'High', color = 'var(--teal)' }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <span className="form-label" style={{ marginBottom: 0 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
      </div>
      <input
        type="range" min={0} max={10} step={1} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dimmer)' }}>
        <span>{lowLabel}</span><span>{highLabel}</span>
      </div>
    </div>
  );
}

export function CannabisSessionModal({ onClose, planSession = null, isExtra = false }) {
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
  const currentHour = new Date().getHours();
  const inMorningBlock = currentHour < 12;

  const [showStackConfirm, setShowStackConfirm] = useState(false);
  const [pendingForm, setPendingForm] = useState(null);
  const [showPreUse, setShowPreUse] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);

  const [form, setForm] = useState(() => {
    // If a plan session is provided, pre-fill from it
    const productId = planSession?.productId || inventory[0]?.id || '';
    const product   = inventory.find((p) => p.id === productId) || inventory[0];
    const amount    = planSession?.recommendedAmount?.toString() || '';
    const thcMg     = planSession?.estimatedThcMg?.toString() || '';
    return {
      productId,
      form: product?.form || '',
      sessionNumber: todaySessions + 1,
      amount,
      unit: product?.remainingUnit || 'g',
      thcMg,
      method: getDefaultMethod(product?.form || ''),
      reason: planSession?.reason || 'Pain',
      effect: 'Calm',
      munchiesTriggered: false,
      notes: '',
      time: planSession?.plannedTime || format(new Date(), 'HH:mm'),
      // Pre-use state
      preUsePain: 0,
      preUseAnxiety: 0,
      preUseMood: 5,
      preUseEnergy: 5,
      // Checklist
      checklistConfirmed: false,
      // Assessment
      productivityImpacts: [],
      productivityScore: 5,
      munchiesLevel: 0,
      painRelief: 0,
      medicalBenefit: 5,
      wouldUseAgain: 'Maybe',
    };
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const selectedProduct = inventory.find((p) => p.id === form.productId);

  const autoThcMg = selectedProduct?.thcPercent && form.amount
    ? (parseFloat(form.amount) * 1000 * (selectedProduct.thcPercent / 100)).toFixed(1)
    : null;

  const handleProductChange = (id) => {
    const p = inventory.find((pr) => pr.id === id);
    if (p) {
      setForm((f) => ({ ...f, productId: id, form: p.form, unit: p.remainingUnit, method: getDefaultMethod(p.form) }));
    }
  };

  const toggleImpact = (impact) => {
    setForm((f) => ({
      ...f,
      productivityImpacts: f.productivityImpacts.includes(impact)
        ? f.productivityImpacts.filter((i) => i !== impact)
        : [...f.productivityImpacts, impact],
    }));
  };

  const handleSubmit = () => {
    if (!form.productId || !form.amount) return;

    const firstMealLogged = useStore.getState().getTodayFoodLogs().length > 0;
    if (!firstMealLogged) {
      addToast('⚠ Hard rule: No cannabis before your first meal of the day.', 'warning');
    }
    if (todaySessions >= dailyTarget) {
      addToast(`⚠ You've reached your daily target of ${dailyTarget} sessions.`, 'warning');
    }

    if (isStacking(form.productId, todayLogs)) {
      setPendingForm({ ...form });
      setShowStackConfirm(true);
      return;
    }

    submitLog(form);
  };

  const submitLog = (f) => {
    addCannabisLog({ ...f, thcMg: f.thcMg || autoThcMg || '' });
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
    <Modal title={planSession ? `Log Planned Session ${planSession.sessionNumber}` : 'Log Cannabis Session'} onClose={onClose}>
      {/* Plan session banner */}
      {planSession && (
        <div className="cp-modal-plan-banner">
          <div className="cp-modal-plan-title">📋 Planned Session {planSession.sessionNumber} — {planSession.timeLabel}</div>
          <div className="cp-modal-plan-detail">
            {planSession.productName} · {planSession.recommendedAmount}g · ~{planSession.estimatedThcMg}mg THC
          </div>
          <div className="cp-modal-plan-window">{planSession.useWindow}</div>
        </div>
      )}
      {/* Extra session warning */}
      {isExtra && (
        <div className="cp-modal-extra-warn">
          ⚠ UNPLANNED SESSION — This goes beyond your {dailyTarget}-session daily plan. Every extra session increases munchies risk, tolerance, and next-day grogginess. Proceed only if medically necessary.
        </div>
      )}
      {/* Time Block Warning */}
      {inMorningBlock && (
        <div className="medical-warning" style={{ marginBottom: 12 }}>
          ⛔ Morning block active — no cannabis before your most important work is done.
        </div>
      )}
      {todaySessions >= dailyTarget && (
        <div className="medical-warning" style={{ marginBottom: 12 }}>
          ⚠ Daily target of {dailyTarget} sessions reached. Proceeding will exceed your plan.
        </div>
      )}

      {/* Product & Time */}
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
        <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className={`risk-badge risk-${selectedProduct.riskLevel.replace(/-/g, '')}`}>
            {selectedProduct.riskLevel} risk
          </span>
          {selectedProduct.dayNight && (
            <span className="risk-badge" style={{
              background: 'var(--surface3)',
              color: 'var(--text-dim)',
            }}>
              {selectedProduct.useWindow?.split('—')[0].trim()}
            </span>
          )}
          {(RSO_IDS.includes(form.productId) || INFUSED_PREROLL_IDS.includes(form.productId)) && (
            <span style={{ fontSize: 11, color: 'var(--red)' }}>
              ⚠ Stacking with RSO + infused pre-roll is blocked
            </span>
          )}
          {selectedProduct.notToExceed && (
            <div className="product-nte" style={{ width: '100%', marginTop: 4 }}>
              ⚠ {selectedProduct.notToExceed}
            </div>
          )}
          {selectedProduct.startingDose && (
            <div style={{ width: '100%', fontSize: 11, color: 'var(--text-dim)' }}>
              Starting dose: <strong>{selectedProduct.startingDose}</strong>
              {selectedProduct.maxTestDose && <> &nbsp;|&nbsp; Max test: <strong>{selectedProduct.maxTestDose}</strong></>}
            </div>
          )}
        </div>
      )}

      {/* Dose, Method & THC */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Amount</label>
          <input className="form-input" type="number" step="0.025" placeholder="0" value={form.amount} onChange={(e) => set('amount', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Unit</label>
          <select className="form-select" value={form.unit} onChange={(e) => set('unit', e.target.value)}>
            <option value="g">g</option>
            <option value="capsule">capsule</option>
            <option value="pre-roll">pre-roll</option>
            <option value="puff">puff</option>
            <option value="mg THC">mg THC</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Method</label>
          <select className="form-select" value={form.method} onChange={(e) => set('method', e.target.value)}>
            <option>Smoked</option>
            <option>Vaped</option>
            <option>Oral</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Est. THC mg</label>
        <input className="form-input" type="number" placeholder={autoThcMg ? `Auto: ~${autoThcMg}mg` : 'optional'} value={form.thcMg} onChange={(e) => set('thcMg', e.target.value)} />
        {autoThcMg && !form.thcMg && (
          <div className="form-hint">
            Auto-calculated: {form.amount}g × {selectedProduct.thcPercent}% THC ≈ <strong>{autoThcMg}mg THC</strong>
          </div>
        )}
      </div>

      {/* Reason */}
      <div className="form-row">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Reason for Use</label>
          <select className="form-select" value={form.reason} onChange={(e) => set('reason', e.target.value)}>
            {CANNABIS_INTENDED_REASONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Pre-Cannabis Checklist */}
      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'space-between', marginBottom: showChecklist ? 8 : 0 }}
          onClick={() => setShowChecklist((v) => !v)}
        >
          <span>Pre-Cannabis Checklist</span>
          <span style={{ fontSize: 10, color: form.checklistConfirmed ? 'var(--green)' : 'var(--text-dimmer)' }}>
            {form.checklistConfirmed ? '✓ confirmed' : showChecklist ? '▲' : '▼'}
          </span>
        </button>
        {showChecklist && (
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px' }}>
            {PRE_CANNABIS_CHECKLIST.map((item) => (
              <div key={item} style={{ fontSize: 12, color: 'var(--text-dim)', padding: '3px 0' }}>☐ {item}</div>
            ))}
            <label className="form-checkbox" style={{ marginTop: 8 }}>
              <input type="checkbox" checked={form.checklistConfirmed} onChange={(e) => set('checklistConfirmed', e.target.checked)} />
              <span style={{ fontSize: 12 }}>I've reviewed the checklist</span>
            </label>
          </div>
        )}
      </div>

      {/* Pre-Use State */}
      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'space-between', marginBottom: showPreUse ? 8 : 0 }}
          onClick={() => setShowPreUse((v) => !v)}
        >
          <span>Pre-Use State (optional)</span>
          <span style={{ fontSize: 10, color: 'var(--text-dimmer)' }}>{showPreUse ? '▲' : '▼'}</span>
        </button>
        {showPreUse && (
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 14px' }}>
            <ScoreSlider label="Pain level" value={form.preUsePain} onChange={(v) => set('preUsePain', v)} lowLabel="None" highLabel="Severe" color="var(--red)" />
            <ScoreSlider label="Anxiety level" value={form.preUseAnxiety} onChange={(v) => set('preUseAnxiety', v)} lowLabel="None" highLabel="Severe" color="var(--orange)" />
            <ScoreSlider label="Mood" value={form.preUseMood} onChange={(v) => set('preUseMood', v)} lowLabel="Low" highLabel="Great" color="var(--teal)" />
            <ScoreSlider label="Energy" value={form.preUseEnergy} onChange={(v) => set('preUseEnergy', v)} lowLabel="Drained" highLabel="High" color="var(--green)" />
          </div>
        )}
      </div>

      {/* Session Assessment */}
      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'space-between', marginBottom: showAssessment ? 8 : 0 }}
          onClick={() => setShowAssessment((v) => !v)}
        >
          <span>Session Assessment (fill after use)</span>
          <span style={{ fontSize: 10, color: 'var(--text-dimmer)' }}>{showAssessment ? '▲' : '▼'}</span>
        </button>
        {showAssessment && (
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 14px' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Primary Effect</label>
                <select className="form-select" value={form.effect} onChange={(e) => set('effect', e.target.value)}>
                  {CANNABIS_EFFECTS.map((e) => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Would Use Again</label>
                <select className="form-select" value={form.wouldUseAgain} onChange={(e) => set('wouldUseAgain', e.target.value)}>
                  <option>Yes</option>
                  <option>No</option>
                  <option>Maybe</option>
                </select>
              </div>
            </div>

            <ScoreSlider label="Munchies level" value={form.munchiesLevel} onChange={(v) => set('munchiesLevel', v)} lowLabel="None" highLabel="Severe" color="var(--yellow)" />
            <ScoreSlider label="Productivity score after use" value={form.productivityScore} onChange={(v) => set('productivityScore', v)} lowLabel="Crashed" highLabel="Peak" color="var(--teal)" />
            <ScoreSlider label="Pain relief" value={form.painRelief} onChange={(v) => set('painRelief', v)} lowLabel="None" highLabel="Full relief" color="var(--green)" />
            <ScoreSlider label="Medical benefit" value={form.medicalBenefit} onChange={(v) => set('medicalBenefit', v)} lowLabel="None" highLabel="High" color="var(--teal)" />

            <div className="form-group" style={{ marginBottom: 4 }}>
              <label className="form-label">Productivity Impact</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CANNABIS_PRODUCTIVITY_IMPACTS.map((impact) => (
                  <label key={impact} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.productivityImpacts.includes(impact)}
                      onChange={() => toggleImpact(impact)}
                    />
                    {impact}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-checkbox">
                <input type="checkbox" checked={form.munchiesTriggered} onChange={(e) => set('munchiesTriggered', e.target.checked)} />
                Munchies triggered (unplanned eating)
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="form-textarea" rows={2} placeholder="What worked? What didn't? Did it help or steal time?" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </div>

      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button
          className={`btn ${isExtra ? 'btn-danger' : 'btn-primary'}`}
          onClick={handleSubmit}
          disabled={!form.productId || !form.amount}
        >
          {isExtra ? 'Log Extra Session' : planSession ? 'Log Planned Session' : 'Log Session'}
        </button>
      </div>
    </Modal>
  );
}
