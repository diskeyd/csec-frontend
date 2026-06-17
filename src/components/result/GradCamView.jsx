export default function GradCamView({ explainability }) {
  const { note, highlightedRegions } = explainability

  return (
    <div className="r-shap">
      <h3>
        <span>바이트 플롯 히트맵</span>
        <span className="sub">Grad-CAM · {explainability.modelId}</span>
      </h3>
      <div
        className="gradcam-placeholder"
        style={{
          background: '#F4F5F7',
          border: '1px dashed #EAEAEA',
          borderRadius: '4px',
          padding: '32px 24px',
          textAlign: 'center',
          color: '#737373',
          fontSize: 13,
          marginBottom: 12,
        }}
      >
        <div style={{ fontWeight: 500, marginBottom: 6, fontSize: 14 }}>
          Grad-CAM 히트맵 (백엔드 연동 후 제공)
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.6 }}>{note}</div>
      </div>
      {highlightedRegions.length > 0 && (
        <div>
          <div style={{ fontSize: 12, color: '#A8A8A8', marginBottom: 6 }}>
            강조 영역
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 12, lineHeight: 1.8, color: '#737373' }}>
            {highlightedRegions.map((r, i) => (
              <li key={i}>{r.label}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
