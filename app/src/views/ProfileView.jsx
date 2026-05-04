import { useState, useRef } from 'react';
import { useStore } from '../data/store';

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="profile-section">
      <div className="profile-section-header">{icon} {title}</div>
      {children}
    </div>
  );
}

function Row({ label, value, valueStyle }) {
  return (
    <div className="profile-row">
      <span className="profile-row-label">{label}</span>
      <span style={valueStyle}>{value}</span>
    </div>
  );
}

export function ProfileView() {
  const profile = useStore((s) => s.profile);
  const setMedicalClearance = useStore((s) => s.setMedicalClearance);
  const toggleCertificationLock = useStore((s) => s.toggleCertificationLock);
  const addPhoto = useStore((s) => s.addPhoto);
  const deletePhoto = useStore((s) => s.deletePhoto);
  const photos = useStore((s) => s.photos);
  const exportJSON = useStore((s) => s.exportJSON);
  const exportCSV = useStore((s) => s.exportCSV);
  const importJSON = useStore((s) => s.importJSON);
  const addToast = useStore((s) => s.addToast);

  const [showClearanceConfirm, setShowClearanceConfirm] = useState(false);
  const [clearanceDate, setClearanceDate] = useState('');
  const [photoForm, setPhotoForm] = useState({ viewType: 'Front', weight: '', date: new Date().toISOString().slice(0, 10) });
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoInputRef = useRef();
  const importInputRef = useRef();

  const { bodyMetrics, medicalFlags, dietaryRules, nutritionTargets, certification } = profile;

  const handleClearanceToggle = (val) => {
    if (val) {
      setShowClearanceConfirm(true);
    } else {
      setMedicalClearance(false, null);
      addToast('Medical clearance removed.', 'warning');
    }
  };

  const handleClearanceConfirm = () => {
    setMedicalClearance(true, clearanceDate);
    setShowClearanceConfirm(false);
    addToast('Medical clearance confirmed. Hard workouts unlocked.', 'success');
  };

  const handlePhotoFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = () => {
    if (!photoPreview) return;
    addPhoto({ ...photoForm, dataUrl: photoPreview, weight: photoForm.weight ? Number(photoForm.weight) : null });
    setPhotoPreview(null);
    photoInputRef.current.value = '';
    addToast('Photo saved.', 'success');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const success = importJSON(ev.target.result);
      addToast(success ? 'Backup restored successfully.' : 'Import failed — invalid file.', success ? 'success' : 'error');
    };
    reader.readAsText(file);
    importInputRef.current.value = '';
  };

  return (
    <div className="view-container">

      {/* User Info */}
      <Section title="User Info" icon="👤">
        <Row label="Name" value={profile.name} />
        <Row label="Height" value={`${profile.height.ft}ft ${profile.height.in}in`} />
        <Row label="Starting Weight" value={`${profile.startingWeight} lb`} />
        <Row label="Current Weight" value={`${profile.currentWeight} lb`} />
        <Row label="Goal Weight" value={`${profile.goalWeight} lb`} />
        <Row label="To lose" value={`${(profile.currentWeight - profile.goalWeight).toFixed(1)} lb`} />
      </Section>

      {/* Body Baseline */}
      <Section title="Body Baseline (Renpho)" icon="📊">
        <Row label="BMI" value={bodyMetrics.bmi} />
        <Row label="Body Fat" value={`${bodyMetrics.bodyFat}%`} />
        <Row label="Muscle Mass" value={`${bodyMetrics.muscleMass} lb`} />
        <Row label="Visceral Fat" value={bodyMetrics.visceralFat} />
        <Row label="BMR" value={`${bodyMetrics.bmr} kcal`} />
        <Row label="Metabolic Age" value={bodyMetrics.metabolicAge} />
        <Row label="Skeletal Muscle" value={`${bodyMetrics.skeletalMuscle}%`} />
        <Row label="Body Water" value={`${bodyMetrics.bodyWater}%`} />
        <Row label="Fat-free Mass" value={`${bodyMetrics.fatFreeMass} lb`} />
        <Row label="Bone Mass" value={`${bodyMetrics.boneMass} lb`} />
        <Row label="Last Updated" value={bodyMetrics.lastUpdated} />
      </Section>

      {/* Medical Flags */}
      <Section title="Medical Flags" icon="⚕️">
        {[
          ['Prediabetes', medicalFlags.prediabetes],
          ['High Cholesterol', medicalFlags.highCholesterol],
          ['Chest Pain', medicalFlags.chestPain],
          ['Shortness of Breath', medicalFlags.shortnessOfBreath],
          ['Xanax Use', medicalFlags.xanaxUse],
          ['Lexapro Use', medicalFlags.lexaproUse],
          ['Medical Cannabis', medicalFlags.medicalCannabisUse],
        ].filter(([, v]) => v).map(([label]) => (
          <div key={label} className="medical-flag">
            <span className="flag-dot" />
            {label}
          </div>
        ))}
        <div className="toggle-row" style={{ marginTop: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Medical Clearance</div>
            <div style={{ fontSize: 11, color: 'var(--text-dimmer)' }}>
              {medicalFlags.medicalClearance
                ? `Confirmed ${medicalFlags.medicalClearanceDate || ''} — hard workouts unlocked`
                : 'Not confirmed — hard workouts locked'}
            </div>
          </div>
          <Toggle checked={medicalFlags.medicalClearance} onChange={handleClearanceToggle} />
        </div>
      </Section>

      {/* Dietary Rules */}
      <Section title="Dietary Rules" icon="🥗">
        <Row label="Style" value={dietaryRules.style} />
        <Row label="Eating Pattern" value={dietaryRules.eatingPattern} />
        <Row label="Allergies" value={dietaryRules.allergies.join(', ')} />
        <Row label="Sugar" value={dietaryRules.sugar} />
        <Row label="Cuisine" value={dietaryRules.cuisine.join(', ')} />
        <Row label="Calorie Target (rest)" value={`${nutritionTargets.caloriesRest} kcal`} />
        <Row label="Calorie Target (workout)" value={`${nutritionTargets.caloriesWorkout} kcal`} />
        <Row label="Protein Target" value={`${nutritionTargets.protein}g`} />
      </Section>

      {/* Cannabis Certification */}
      <Section title="Cannabis Certification (NY State)" icon="🏥">
        <div className="cert-card">
          {certification.unlocked ? (
            <>
              <div className="cert-row"><span className="cert-label">Program</span><span>{certification.program}</span></div>
              <div className="cert-row"><span className="cert-label">Cert #</span><span>{certification.certificationNumber}</span></div>
              <div className="cert-row"><span className="cert-label">Registry ID</span><span>{certification.registryId}</span></div>
              <div className="cert-row"><span className="cert-label">Issued</span><span>{certification.issueDate}</span></div>
              <div className="cert-row"><span className="cert-label">Expires</span><span>{certification.expirationDate}</span></div>
              <div className="cert-row"><span className="cert-label">Practitioner</span><span>{certification.practitioner}</span></div>
              <div className="cert-row"><span className="cert-label">Dosing</span><span>{certification.dosingRecommendation}</span></div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-dim)', padding: '4px 0' }}>
              NY State Medical Cannabis Program · Expires {certification.expirationDate}
            </div>
          )}
          <div className="privacy-note">
            🔒 Personal identifying details stay hidden unless explicitly unlocked.
          </div>
          <div style={{ marginTop: 10 }}>
            <button className="btn btn-ghost btn-sm" onClick={toggleCertificationLock}>
              {certification.unlocked ? '🔒 Lock Details' : '🔓 Unlock Details'}
            </button>
          </div>
        </div>
      </Section>

      {/* Progress Photos */}
      <Section title="Progress Photos" icon="📸">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          {photos.map((p) => (
            <div key={p.id} style={{ textAlign: 'center', fontSize: 11 }}>
              <img src={p.dataUrl} alt={p.viewType} style={{ width: 90, height: 120, objectFit: 'cover', borderRadius: 6, display: 'block', border: '1px solid var(--border)' }} />
              <div style={{ color: 'var(--text-dim)', marginTop: 3 }}>{p.viewType} · {p.date}</div>
              {p.weight && <div style={{ color: 'var(--text-dimmer)' }}>{p.weight} lb</div>}
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 4 }} onClick={() => deletePhoto(p.id)}>Remove</button>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Add Progress Photo</div>
          <div className="form-row" style={{ marginBottom: 10 }}>
            <div className="form-group">
              <label className="form-label">View Type</label>
              <select className="form-select" value={photoForm.viewType} onChange={(e) => setPhotoForm((f) => ({ ...f, viewType: e.target.value }))}>
                {['Front', 'Side', 'Back'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={photoForm.date} onChange={(e) => setPhotoForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (lbs)</label>
              <input className="form-input" type="number" step="0.1" placeholder="optional" value={photoForm.weight} onChange={(e) => setPhotoForm((f) => ({ ...f, weight: e.target.value }))} />
            </div>
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoFile} />
          {photoPreview && (
            <div style={{ marginBottom: 10 }}>
              <img src={photoPreview} alt="preview" style={{ width: 80, height: 100, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--teal)' }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => photoInputRef.current.click()}>
              Choose Photo
            </button>
            {photoPreview && (
              <button className="btn btn-primary btn-sm" onClick={handleSavePhoto}>
                Save Photo
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* Integrations */}
      <Section title="Integrations" icon="🔗">
        <div className="card" style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>MyNetDiary Import</div>
              <div style={{ fontSize: 11, color: 'var(--text-dimmer)' }}>Placeholder until API/export method confirmed</div>
            </div>
            <button className="btn btn-ghost btn-sm" disabled style={{ opacity: 0.4 }}>Import CSV</button>
          </div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Renpho Sync</div>
              <div style={{ fontSize: 11, color: 'var(--text-dimmer)' }}>Manual entry via Body Baseline section above</div>
            </div>
            <button className="btn btn-ghost btn-sm" disabled style={{ opacity: 0.4 }}>Import</button>
          </div>
        </div>
      </Section>

      {/* Backup & Export */}
      <Section title="Backup / Export" icon="💾">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={exportJSON}>📦 Export JSON Backup</button>
          <button className="btn btn-ghost btn-sm" onClick={() => exportCSV('food')}>📋 CSV: Food</button>
          <button className="btn btn-ghost btn-sm" onClick={() => exportCSV('cannabis')}>📋 CSV: Cannabis</button>
          <button className="btn btn-ghost btn-sm" onClick={() => exportCSV('workouts')}>📋 CSV: Workouts</button>
          <button className="btn btn-ghost btn-sm" onClick={() => exportCSV('weight')}>📋 CSV: Weight</button>
        </div>
        <div style={{ marginTop: 12 }}>
          <input ref={importInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          <button className="btn btn-ghost btn-sm" onClick={() => importInputRef.current.click()}>
            📥 Restore from JSON Backup
          </button>
        </div>
      </Section>

      {/* Medical Clearance Confirmation Modal */}
      {showClearanceConfirm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowClearanceConfirm(false)}>
          <div className="modal confirm-modal">
            <button className="modal-close" onClick={() => setShowClearanceConfirm(false)}>×</button>
            <div className="modal-title">Confirm Medical Clearance</div>
            <div className="confirm-message">
              Only confirm this if your doctor has explicitly cleared you for harder physical activity. This will unlock HIIT, running, heavy lifting, and other high-intensity workout types.
            </div>
            <div className="form-group">
              <label className="form-label">Clearance Date</label>
              <input className="form-input" type="date" value={clearanceDate} onChange={(e) => setClearanceDate(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowClearanceConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleClearanceConfirm} disabled={!clearanceDate}>
                Confirm Clearance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
