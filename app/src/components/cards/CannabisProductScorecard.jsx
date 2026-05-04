/**
 * CannabisProductScorecard.jsx — Product performance scorecard.
 *
 * AC-P0-C8
 * Extracted from InventoryView.jsx (was inline 87-line nested component).
 * Consumes props — no store reads. All colours via CSS variables.
 *
 * Verdict logic:
 *   Requires ≥ 3 sessions.
 *   Keep    = medical benefit ≥7 AND productivity ≥7 AND munchies ≤4
 *   Limit   = medical benefit ≥5 OR productivity ≥5
 *   Avoid   = otherwise
 *
 * @param {object}   props
 * @param {Object[]} props.inventory     - CannabisProduct[]
 * @param {Object[]} props.cannabisLogs  - CannabisSession[]
 */
export function CannabisProductScorecard({ inventory, cannabisLogs }) {
  const scorecardData = inventory.map((product) => {
    const logs = cannabisLogs.filter((l) => l.productId === product.id);
    if (logs.length === 0) return { product, logs: 0, verdict: 'No data' };

    const avg = (key) => {
      const vals = logs.map((l) => Number(l[key])).filter((v) => !isNaN(v) && v > 0);
      return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
    };

    const medBenefit  = avg('medicalBenefit');
    const munchies    = avg('munchiesLevel');
    const productivity = avg('productivityScore');

    const yesCount   = logs.filter((l) => l.wouldUseAgain === 'Yes').length;
    const wouldUseRate = `${yesCount}/${logs.length}`;

    let verdict = 'Insufficient data';
    if (logs.length >= 3) {
      const mb = parseFloat(medBenefit);
      const mu = parseFloat(munchies);
      const pr = parseFloat(productivity);
      if (!isNaN(mb) && !isNaN(mu) && !isNaN(pr)) {
        if (mb >= 7 && pr >= 7 && mu <= 4) verdict = '✓ Keep';
        else if (mb >= 5 || pr >= 5)       verdict = '⚠ Limit';
        else                                verdict = '✗ Avoid';
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
              <th style={{ textAlign: 'left',   padding: '6px 8px', fontWeight: 500 }}>Product</th>
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
