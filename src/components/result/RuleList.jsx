const SEVERITY_LABEL = {
  critical: 'CRIT',
  high: 'HIGH',
  medium: 'MED',
  low: 'LOW',
  info: 'INFO',
}

export default function RuleList({ explainability }) {
  const { triggeredRules, note } = explainability

  return (
    <div className="r-shap">
      <h3>
        <span>휴리스틱 규칙 탐지</span>
        <span className="sub">{triggeredRules.length}개 규칙 적중 · heur</span>
      </h3>
      {note && (
        <div style={{ fontSize: 12, color: '#737373', marginBottom: 12 }}>{note}</div>
      )}
      {triggeredRules.map((rule) => (
        <div
          key={rule.ruleId}
          className="reason-row"
          style={{ marginBottom: 8 }}
        >
          <div className="top">
            <span className={'sev ' + rule.severity}>{SEVERITY_LABEL[rule.severity]}</span>
            <h4 style={{ fontFamily: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace', fontSize: 12 }}>{rule.ruleId}</h4>
          </div>
          <p className="detail">{rule.description}</p>
        </div>
      ))}
    </div>
  )
}
