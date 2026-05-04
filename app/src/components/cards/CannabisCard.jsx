/**
 * CannabisCard.jsx — Cannabis Control card.
 *
 * AC-P0-C2
 * Extracted from TodayView.jsx. Consumes props — no store reads.
 * All colours via CSS variables.
 *
 * @param {object}    props
 * @param {number}    props.sessions
 * @param {number}    props.sessionTarget
 * @param {Object[]}  props.dailyPlan       - From getDailyCannabisPlan()
 * @param {Object[]}  props.cannabisLogs    - Today's sessions
 * @param {Object[]}  props.inventory       - Cannabis products
 * @param {boolean}   props.demoMode
 * @param {Function}  props.onLogSession    - (planSession) => void
 * @param {Function}  props.onAddExtra      - () => void
 */
const RISK_CLASS = { high: 'risk-high', medium: 'risk-medium', low: 'risk-low' };

export function CannabisCard({
  sessions,
  sessionTarget,
  dailyPlan,
  cannabisLogs,
  inventory,
  demoMode,
  onLogSession,
  onAddExtra,
}) {
  const overLimit = sessions >= sessionTarget;
  const planLogs  = dailyPlan.map((_, i) => cannabisLogs[i] || null);
  const extraLogs = cannabisLogs.slice(dailyPlan.length);
  const totalThcMg = cannabisLogs.reduce((s, l) => s + (parseFloat(l.thcMg) || 0), 0);

  // Aggregate grams per flower product logged today
  const gramsMap = {};
  cannabisLogs.forEach((l) => {
    const prod = inventory.find((p) => p.id === l.productId);
    if (prod?.form === 'flower' && l.unit === 'g') {
      gramsMap[prod.name] = (gramsMap[prod.name] || 0) + (parseFloat(l.amount) || 0);
    }
  });
  const gramsEntries = Object.entries(gramsMap);

  return (
    <div className="v2-card v2-card--cannabis v2-card--flush">
      <div className="v2-card-header">
        <div className="v2-card-header-left">
          <div className="v2-card-icon v2-card-icon--cannabis">🌿</div>
          <div>
            <div className="v2-card-title">Cannabis Control</div>
            <div className="v2-card-sub">
              {sessions}/{sessionTarget} sessions · plan: {dailyPlan.length} sessions
            </div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm cp-btn-extra" onClick={onAddExtra}>
          + Extra ⚠
        </button>
      </div>

      {/* Daily THC summary */}
      {(cannabisLogs.length > 0 || gramsEntries.length > 0) && (
        <div className="cp-thc-bar">
          <div className="cp-thc-stat">
            <span className="cp-thc-val">
              {totalThcMg.toFixed(1)}<span className="cp-thc-unit">mg</span>
            </span>
            <span className="cp-thc-label">THC today</span>
          </div>
          {gramsEntries.map(([name, grams]) => (
            <div className="cp-thc-stat" key={name}>
              <span className="cp-thc-val">
                {grams.toFixed(3)}<span className="cp-thc-unit">g</span>
              </span>
              <span className="cp-thc-label">{name.split(' ').slice(0, 2).join(' ')}</span>
            </div>
          ))}
          <div className="cp-thc-stat">
            <span className="cp-thc-val">
              {sessions}<span className="cp-thc-unit">/{sessionTarget}</span>
            </span>
            <span className="cp-thc-label">sessions</span>
          </div>
        </div>
      )}

      {/* TODAY'S PLAN */}
      <div className="cp-section-label">TODAY'S PLAN</div>

      {dailyPlan.length === 0 ? (
        <div className="empty-state empty-state--compact">
          No eligible products in inventory for today's plan.
        </div>
      ) : (
        dailyPlan.map((ps, i) => {
          const logged = planLogs[i];
          return (
            <div key={ps.sessionNumber} className={`cp-plan-card${logged ? ' cp-plan-card--done' : ''}`}>
              <div className="cp-plan-num">{ps.sessionNumber}</div>
              <div className="cp-plan-body">
                <div className="cp-plan-slot">{ps.timeLabel} · ~{ps.plannedTime}</div>
                <div className="cp-plan-product">{ps.productName}</div>
                <div className="cp-plan-dose">
                  {ps.recommendedAmount}g · ~{ps.estimatedThcMg}mg THC
                  {ps.thcPercent ? ` · ${ps.thcPercent}% THC flower` : ''}
                </div>
                <div className="cp-plan-window">
                  {ps.useWindow?.split('—').slice(1).join('—').trim()}
                </div>
                {logged && (
                  <div className="cp-plan-logged-detail">
                    ✓ Logged {logged.time} · {logged.amount}{logged.unit} · ~{logged.thcMg}mg THC
                    {logged.effect && <> · <span className="text-teal">{logged.effect}</span></>}
                  </div>
                )}
              </div>
              {!logged ? (
                <button
                  className="btn btn-primary btn-sm cp-plan-btn"
                  disabled={demoMode}
                  onClick={() => onLogSession(ps)}
                >
                  Log This
                </button>
              ) : (
                <div className="cp-plan-check">✓</div>
              )}
            </div>
          );
        })
      )}

      {/* EXTRA SESSIONS */}
      {extraLogs.length > 0 && (
        <>
          <div className="cp-section-label cp-section-label--extra">⚠ EXTRA SESSIONS (Beyond Plan)</div>
          {extraLogs.map((log, i) => {
            const prod      = inventory.find((p) => p.id === log.productId);
            const riskClass = RISK_CLASS[prod?.riskLevel] || 'risk-unknown';
            return (
              <div key={log.id} className="cp-extra-card">
                <div className={`v2-session-num ${riskClass}`}>{dailyPlan.length + i + 1}</div>
                <div className="v2-session-body">
                  <div className="v2-session-product">{prod?.name || 'Unknown'}</div>
                  <div className="v2-session-detail">
                    {log.time} · {log.amount}{log.unit} · ~{log.thcMg}mg THC · {log.method}
                  </div>
                  <div className="v2-session-reason">
                    {log.reason}{log.effect ? ` · ${log.effect}` : ''}
                  </div>
                  {log.munchiesTriggered && (
                    <span className="badge badge-munchies badge-inline">🍿 munchies</span>
                  )}
                </div>
                <div className={`v2-risk-tag ${riskClass}`}>{prod?.riskLevel}</div>
              </div>
            );
          })}
        </>
      )}

      {overLimit && <div className="v2-limit-alert">⚠ Daily limit reached</div>}
    </div>
  );
}
