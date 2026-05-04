import { useState } from 'react';
import { Modal } from './Modal';
import { useStore } from '../data/store';
import { MEAL_LABEL_SUGGESTIONS } from '../data/seed';
import { format } from 'date-fns';

export function FoodEntryModal({ onClose, prefill = null }) {
  // addFoodLog removed per Decision #13 (D13). FoodEntryModal is a placeholder
  // stub until mealPlanSlice check-off lands in Phase 1.E (E5). For now,
  // submissions are silently dropped so the app boots without crashing.
  // Debt: P1.E E5 — see observed-debt.md entry [2026-05-04].
  const addFoodLog = () => {}; // stub: no-op until P1.E replaces with mealPlanSlice
  const mealTemplates = useStore((s) => s.mealTemplates);
  const saveMealTemplate = useStore((s) => s.saveMealTemplate);

  const [form, setForm] = useState({
    label: prefill?.label || 'Meal',
    name: prefill?.name || '',
    time: prefill?.time || format(new Date(), 'HH:mm'),
    calories: prefill?.calories || '',
    protein: prefill?.protein || '',
    carbs: prefill?.carbs || '',
    fat: prefill?.fat || '',
    notes: prefill?.notes || '',
    cannabisTriggered: prefill?.cannabisTriggered || false,
    munchiesRelated: prefill?.munchiesRelated || false,
    source: prefill?.source || 'Manual',
  });
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name || !form.calories) return;
    addFoodLog({ ...form });
    if (saveAsTemplate && templateName) {
      saveMealTemplate({ name: templateName, ...form });
    }
    onClose();
  };

  const applyTemplate = (t) => {
    setForm((f) => ({
      ...f,
      label: t.label,
      name: t.name,
      calories: t.calories,
      protein: t.protein,
      carbs: t.carbs || '',
      fat: t.fat || '',
      notes: t.notes || '',
      source: 'Template',
    }));
    setShowTemplates(false);
  };

  return (
    <Modal title="Log Food / Meal" onClose={onClose}>
      {mealTemplates.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowTemplates(!showTemplates)}>
            📋 Use Template ({mealTemplates.length})
          </button>
          {showTemplates && (
            <div style={{ marginTop: 8, background: 'var(--surface2)', borderRadius: 6, padding: 8, maxHeight: 160, overflowY: 'auto' }}>
              {mealTemplates.map((t) => (
                <div
                  key={t.id}
                  style={{ padding: '6px 8px', cursor: 'pointer', borderRadius: 4, fontSize: 13 }}
                  onClick={() => applyTemplate(t)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface3)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = ''}
                >
                  <strong>{t.name}</strong>
                  <span style={{ color: 'var(--text-dimmer)', marginLeft: 8 }}>{t.calories} kcal · {t.protein}g protein</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Label</label>
          <select className="form-select" value={form.label} onChange={(e) => set('label', e.target.value)}>
            {MEAL_LABEL_SUGGESTIONS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Time</label>
          <input className="form-input" type="time" value={form.time} onChange={(e) => set('time', e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Food / Meal Name *</label>
        <input className="form-input" placeholder="e.g. Chicken biryani, Protein shake…" value={form.name} onChange={(e) => set('name', e.target.value)} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Calories *</label>
          <input className="form-input" type="number" placeholder="kcal" value={form.calories} onChange={(e) => set('calories', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Protein (g) *</label>
          <input className="form-input" type="number" placeholder="g" value={form.protein} onChange={(e) => set('protein', e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Carbs (g)</label>
          <input className="form-input" type="number" placeholder="optional" value={form.carbs} onChange={(e) => set('carbs', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Fat (g)</label>
          <input className="form-input" type="number" placeholder="optional" value={form.fat} onChange={(e) => set('fat', e.target.value)} />
        </div>
      </div>

      <div className="form-group" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <label className="form-checkbox">
          <input type="checkbox" checked={form.cannabisTriggered} onChange={(e) => set('cannabisTriggered', e.target.checked)} />
          Cannabis-triggered?
        </label>
        <label className="form-checkbox">
          <input type="checkbox" checked={form.munchiesRelated} onChange={(e) => set('munchiesRelated', e.target.checked)} />
          Munchies-related?
        </label>
      </div>

      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="form-textarea" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-checkbox">
          <input type="checkbox" checked={saveAsTemplate} onChange={(e) => setSaveAsTemplate(e.target.checked)} />
          Save as template
        </label>
        {saveAsTemplate && (
          <input
            className="form-input"
            placeholder="Template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            style={{ marginTop: 6 }}
          />
        )}
      </div>

      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!form.name || !form.calories}>
          Log Food
        </button>
      </div>
    </Modal>
  );
}
