export default function ShapBarChart({ explainability }) {
  const { features, positiveLabel, negativeLabel } = explainability

  // Bars are anchored at the track center (left/right: 50%), so the max bar must
  // fill at most the HALF-track (50%) — scaling to 100% overflowed into the next column.
  const maxAbs = Math.max(...features.map((f) => Math.abs(f.shapValue)), 0.001)

  return (
    <div className="r-shap">
      <h3>
        <span>특성 기여도 분석</span>
        <span className="sub">상위 {features.length}개 특성 · {explainability.modelId}</span>
      </h3>
      {features.map((f, i) => {
        const isPos = f.shapValue > 0
        const barWidth = (Math.abs(f.shapValue) / maxAbs) * 50
        return (
          <div key={i} className="shap-row">
            <span className="name">{f.featureName}</span>
            <div className="shap-track">
              <div className="shap-mid" />
              <div
                className={'shap-bar ' + (isPos ? 'pos' : 'neg')}
                style={{ width: barWidth + '%' }}
              />
            </div>
            <span className="val">
              {isPos ? '+' : ''}{f.shapValue.toFixed(3)}
            </span>
          </div>
        )
      })}
      <div className="shap-legend">
        <span><span className="sw sw-neg" />{negativeLabel}</span>
        <span><span className="sw sw-pos" />{positiveLabel}</span>
        <span className="src">SHAP value · TreeExplainer</span>
      </div>
    </div>
  )
}
