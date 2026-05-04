import { useState } from 'react';
import { useStore } from '../data/store';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend,
} from 'recharts';
import { subDays, format, parseISO, isAfter } from 'date-fns';

const RANGES = [
  { label: 'Week', days: 7 },
  { label: 'Month', days: 30 },
  { label: '3-Month', days: 90 },
  { label: 'All', days: 9999 },
];

const tooltipStyle = {
  contentStyle: { background: '#1a1d27', border: '1px solid #2e3348', borderRadius: 6, fontSize: 12 },
  labelStyle: { color: '#94a3b8' },
};

function filterByRange(entries, days) {
  if (days >= 9999) return entries;
  const cutoff = subDays(new Date(), days);
  return entries.filter((e) => isAfter(parseISO(e.date), cutoff));
}

function ChartCard({ title, children, empty }) {
  return (
    <div className="chart-card">
      <div className="chart-title">{title}</div>
      {empty ? <div className="chart-empty">Not enough data yet — keep logging!</div> : children}
    </div>
  );
}

export function HistoryView() {
  const [range, setRange] = useState(7);
  const weightHistory = useStore((s) => s.weightHistory);
  // foodLogs removed per Decision #13 (D13). Nutrition chart is a placeholder
  // until mealPlanSlice calorie sums land in Phase 1.E (E5).
  const foodLogs = [];
  const cannabisLogs = useStore((s) => s.cannabisLogs);
  const workoutLogs = useStore((s) => s.workoutLogs);
  const photos = useStore((s) => s.photos);

  // Weight data
  const weightData = filterByRange(
    [...weightHistory].sort((a, b) => a.date.localeCompare(b.date)),
    range
  ).map((e) => ({ date: format(parseISO(e.date), 'M/d'), weight: e.weight }));

  // Calories & protein by day
  const foodByDay = {};
  filterByRange(foodLogs, range).forEach((e) => {
    if (!foodByDay[e.date]) foodByDay[e.date] = { cal: 0, protein: 0, munchies: 0 };
    foodByDay[e.date].cal += Number(e.calories) || 0;
    foodByDay[e.date].protein += Number(e.protein) || 0;
    if (e.munchiesRelated) foodByDay[e.date].munchies += 1;
  });
  const nutritionData = Object.entries(foodByDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({ date: format(parseISO(date), 'M/d'), calories: v.cal, protein: v.protein }));

  // Cannabis sessions by day
  const cannabisByDay = {};
  filterByRange(cannabisLogs, range).forEach((e) => {
    if (!cannabisByDay[e.date]) cannabisByDay[e.date] = { sessions: 0, thcMg: 0 };
    cannabisByDay[e.date].sessions += 1;
    cannabisByDay[e.date].thcMg += Number(e.thcMg) || 0;
  });
  const cannabisData = Object.entries(cannabisByDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({ date: format(parseISO(date), 'M/d'), sessions: v.sessions, thcMg: v.thcMg }));

  // Steps by day
  const stepsData = filterByRange(workoutLogs, range)
    .filter((e) => e.steps > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ date: format(parseISO(e.date), 'M/d'), steps: e.steps }));

  return (
    <div className="view-container">
      <div className="range-tabs">
        {RANGES.map((r) => (
          <button
            key={r.days}
            className={`range-tab ${range === r.days ? 'active' : ''}`}
            onClick={() => setRange(r.days)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <ChartCard title="⚖️ Weight Trend (lbs)" empty={weightData.length < 2}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weightData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3348" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 11 }} width={45} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="weight" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3, fill: '#14b8a6' }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="🍽 Calories & Protein" empty={nutritionData.length === 0}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={nutritionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3348" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} width={45} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="calories" fill="#14b8a6" name="Calories" radius={[2, 2, 0, 0]} />
            <Bar dataKey="protein" fill="#22c55e" name="Protein (g)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="🌿 Cannabis Sessions / THC" empty={cannabisData.length === 0}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={cannabisData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3348" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} width={40} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="sessions" fill="#f97316" name="Sessions" radius={[2, 2, 0, 0]} />
            <Bar dataKey="thcMg" fill="#eab308" name="THC mg" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="👟 Steps" empty={stepsData.length === 0}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={stepsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3348" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} width={50} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="steps" fill="#94a3b8" name="Steps" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Progress Photos */}
      <div className="chart-card">
        <div className="chart-title">📸 Progress Photos</div>
        {photos.length === 0 ? (
          <div className="chart-empty">No photos yet — add them in the Profile view.</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {[...photos]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((p) => (
                <div key={p.id} style={{ textAlign: 'center', fontSize: 11 }}>
                  <img
                    src={p.dataUrl}
                    alt={p.viewType}
                    style={{ width: 100, height: 140, objectFit: 'cover', borderRadius: 6, display: 'block', border: '1px solid var(--border)' }}
                  />
                  <div style={{ marginTop: 4, color: 'var(--text-dim)' }}>{p.viewType}</div>
                  <div style={{ color: 'var(--text-dimmer)' }}>{p.date}</div>
                  {p.weight && <div style={{ color: 'var(--text-dimmer)' }}>{p.weight} lb</div>}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
