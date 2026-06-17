const SEVERITY_RANK = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
}

const SEVERITY_LABEL = {
  critical: 'CRIT',
  high: 'HIGH',
  medium: 'MED',
  low: 'LOW',
  info: 'INFO',
}

export default function ReasonList({ reasons }) {
  const sorted = [...reasons].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
  )

  return (
    <>
      {sorted.map((r) => (
        <div key={r.id} className="reason-row">
          <div className="top">
            <span className={'sev ' + r.severity}>{SEVERITY_LABEL[r.severity]}</span>
            <h4>{r.title}</h4>
            <span className="pct">{r.impactPct.toFixed(0)}%</span>
          </div>
          <p className="detail">{r.detail}</p>
          <div
            className="impact-bar"
            style={{ width: r.impactPct + '%', height: 3, background: '#D8634F', opacity: 0.35, marginTop: 6, borderRadius: 2 }}
          />
        </div>
      ))}
    </>
  )
}
