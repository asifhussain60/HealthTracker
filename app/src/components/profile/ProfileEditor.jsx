/**
 * ProfileEditor.jsx — Real profile editor component.
 *
 * Renders all ProfileFields via grouped controls.
 * Reads/writes exclusively through useProfileRepo (HT-CORE-003).
 * Deep-link buttons navigate to library sub-routes.
 *
 * AC-P1D-D2
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileRepo } from '../../data/repositories/useProfileRepo.js';

/**
 * A labeled text input helper.
 */
function Field({ label, id, type = 'text', value, onChange }) {
  return (
    <div className="profile-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value ?? ''}
        onChange={onChange}
      />
    </div>
  );
}

/**
 * Section header.
 */
function Section({ title, children }) {
  return (
    <section className="profile-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function ProfileEditor() {
  const { getProfile, updateProfile } = useProfileRepo();
  const navigate = useNavigate();

  const profile = getProfile();

  // ── Local form state initialised from profile ──────────────────────────────
  const [form, setForm] = useState(() => ({
    // Identity
    name: profile?.name ?? '',
    heightCm: profile?.heightCm ?? '',
    ageYears: profile?.ageYears ?? '',

    // Calorie target
    dailyCalorieTarget: profile?.dailyCalorieTarget ?? '',

    // Intermittent fasting
    ifWindowStart: profile?.intermittentFasting?.windowStart ?? '',
    ifWindowEnd: profile?.intermittentFasting?.windowEnd ?? '',

    // Sleep
    bedtime: profile?.sleepSchedule?.bedtime ?? '',
    wakeTime: profile?.sleepSchedule?.wakeTime ?? '',

    // Prayer settings
    prayerLat: profile?.prayerSettings?.lat ?? '',
    prayerLng: profile?.prayerSettings?.lng ?? '',
    calculationMethod: profile?.prayerSettings?.calculationMethod ?? '',
    asrSchool: profile?.prayerSettings?.asrSchool ?? '',
    remindersEnabled: profile?.prayerSettings?.remindersEnabled ?? false,

    // Fitness
    fitnessLevel: profile?.fitnessLevel ?? '',

    // Workout plan
    walkDailyMinutes: profile?.workoutPlan?.walkDailyMinutes ?? '',
    kickboxingPerWeek: profile?.workoutPlan?.kickboxingPerWeek ?? '',
    weightsPerWeek: profile?.workoutPlan?.weightsPerWeek ?? '',
    dailyWeightSessionCap: profile?.workoutPlan?.dailyWeightSessionCap ?? '',

    // Sweet tooth plan
    sweetToothWeeklyCap: profile?.sweetToothPlan?.weeklyCap ?? '',
  }));

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave(e) {
    e.preventDefault();
    updateProfile({
      name: form.name,
      heightCm: Number(form.heightCm) || undefined,
      ageYears: Number(form.ageYears) || undefined,
      dailyCalorieTarget: Number(form.dailyCalorieTarget) || undefined,
      intermittentFasting: {
        windowStart: form.ifWindowStart,
        windowEnd: form.ifWindowEnd,
      },
      sleepSchedule: {
        bedtime: form.bedtime,
        wakeTime: form.wakeTime,
      },
      prayerSettings: {
        lat: Number(form.prayerLat) || undefined,
        lng: Number(form.prayerLng) || undefined,
        calculationMethod: form.calculationMethod,
        asrSchool: form.asrSchool,
        remindersEnabled: form.remindersEnabled,
      },
      fitnessLevel: form.fitnessLevel,
      workoutPlan: {
        walkDailyMinutes: Number(form.walkDailyMinutes) || undefined,
        kickboxingPerWeek: Number(form.kickboxingPerWeek) || undefined,
        weightsPerWeek: Number(form.weightsPerWeek) || undefined,
        dailyWeightSessionCap: Number(form.dailyWeightSessionCap) || undefined,
      },
      sweetToothPlan: {
        weeklyCap: Number(form.sweetToothWeeklyCap) || undefined,
        confirmEachLog: true,   // locked true per spec
        deletable: false,       // locked false per spec
      },
    });
  }

  return (
    <form className="profile-editor" onSubmit={handleSave}>
      {/* Identity */}
      <Section title="Identity">
        <Field
          label="Display Name"
          id="pe-name"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />
        <Field
          label="Height (cm)"
          id="pe-heightCm"
          type="number"
          value={form.heightCm}
          onChange={(e) => set('heightCm', e.target.value)}
        />
        <Field
          label="Age (years)"
          id="pe-ageYears"
          type="number"
          value={form.ageYears}
          onChange={(e) => set('ageYears', e.target.value)}
        />
      </Section>

      {/* Calorie target */}
      <Section title="Calorie Target">
        <Field
          label="Daily Calorie Target"
          id="pe-calories"
          type="number"
          value={form.dailyCalorieTarget}
          onChange={(e) => set('dailyCalorieTarget', e.target.value)}
        />
      </Section>

      {/* Intermittent Fasting */}
      <Section title="Intermittent Fasting">
        <Field
          label="Window Start"
          id="pe-ifStart"
          type="time"
          value={form.ifWindowStart}
          onChange={(e) => set('ifWindowStart', e.target.value)}
        />
        <Field
          label="Window End"
          id="pe-ifEnd"
          type="time"
          value={form.ifWindowEnd}
          onChange={(e) => set('ifWindowEnd', e.target.value)}
        />
      </Section>

      {/* Sleep */}
      <Section title="Sleep">
        <Field
          label="Bedtime"
          id="pe-bedtime"
          type="time"
          value={form.bedtime}
          onChange={(e) => set('bedtime', e.target.value)}
        />
        <Field
          label="Wake Time"
          id="pe-wakeTime"
          type="time"
          value={form.wakeTime}
          onChange={(e) => set('wakeTime', e.target.value)}
        />
      </Section>

      {/* Prayer Settings */}
      <Section title="Prayer Settings">
        <Field
          label="Latitude"
          id="pe-lat"
          type="number"
          value={form.prayerLat}
          onChange={(e) => set('prayerLat', e.target.value)}
        />
        <Field
          label="Longitude"
          id="pe-lng"
          type="number"
          value={form.prayerLng}
          onChange={(e) => set('prayerLng', e.target.value)}
        />
      </Section>

      {/* Fitness */}
      <Section title="Fitness">
        <div className="profile-field">
          <label htmlFor="pe-fitnessLevel">Fitness Level</label>
          <select
            id="pe-fitnessLevel"
            value={form.fitnessLevel}
            onChange={(e) => set('fitnessLevel', e.target.value)}
          >
            <option value="">Select...</option>
            <option value="sedentary">Sedentary</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="athlete">Athlete</option>
          </select>
        </div>
      </Section>

      {/* Workout Plan */}
      <Section title="Workout Plan">
        <Field
          label="Walk Daily Minutes"
          id="pe-walkMins"
          type="number"
          value={form.walkDailyMinutes}
          onChange={(e) => set('walkDailyMinutes', e.target.value)}
        />
        <Field
          label="Kickboxing Per Week"
          id="pe-kickboxing"
          type="number"
          value={form.kickboxingPerWeek}
          onChange={(e) => set('kickboxingPerWeek', e.target.value)}
        />
        <Field
          label="Weights Per Week"
          id="pe-weights"
          type="number"
          value={form.weightsPerWeek}
          onChange={(e) => set('weightsPerWeek', e.target.value)}
        />
        <Field
          label="Daily Weight Session Cap"
          id="pe-weightCap"
          type="number"
          value={form.dailyWeightSessionCap}
          onChange={(e) => set('dailyWeightSessionCap', e.target.value)}
        />
      </Section>

      {/* Sweet Tooth Plan */}
      <Section title="Sweet Tooth Plan">
        <Field
          label="Weekly Cap"
          id="pe-sweetCap"
          type="number"
          value={form.sweetToothWeeklyCap}
          onChange={(e) => set('sweetToothWeeklyCap', e.target.value)}
        />
        <p className="profile-locked-note">Confirm each log: locked ON. Deletable: locked OFF.</p>
      </Section>

      {/* Library deep-links */}
      <Section title="Manage Libraries">
        <button
          type="button"
          aria-label="Manage Fasting-Safe Items"
          onClick={() => navigate('/profile/fasting-safe')}
        >
          Manage Fasting-Safe Items
        </button>
        <button
          type="button"
          aria-label="Manage Work Locations"
          onClick={() => navigate('/profile/work-locations')}
        >
          Manage Work Locations
        </button>
        <button
          type="button"
          aria-label="Manage Sweet Tooth Items"
          onClick={() => navigate('/profile/sweet-tooth')}
        >
          Manage Sweet Tooth Items
        </button>
      </Section>

      <button type="submit" aria-label="Save profile">
        Save
      </button>
    </form>
  );
}
