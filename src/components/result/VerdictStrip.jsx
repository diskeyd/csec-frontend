import Icon from '../ui/Icon'

function stripContent(verdict) {
  switch (verdict) {
    case 'malicious':
      return {
        icon: 'warning',
        iconWeight: 'fill',
        title: '악성 파일로 판정됨',
        sub: '악성 패턴 다수 발견 · 실행 시 시스템 손상 가능성 높음',
      }
    case 'suspicious':
      return {
        icon: 'warning-circle',
        iconWeight: 'fill',
        title: '의심 파일로 판정됨',
        sub: '잠재적 위협 패턴 발견 · 신중한 처리 권장',
      }
    case 'clean':
      return {
        icon: 'check-circle',
        iconWeight: 'fill',
        title: '악성 위협 미발견',
        sub: '알려진 위협 패턴과 일치하지 않음',
      }
    case 'analyzing':
      return {
        icon: 'circle-notch',
        iconWeight: 'regular',
        title: '분석 진행 중',
        sub: '모델 추론 중 · 잠시 기다려 주십시오',
      }
  }
}

export default function VerdictStrip({ verdict, confidence, threshold }) {
  const { icon, iconWeight, title, sub } = stripContent(verdict)
  const confPct = confidence * 100
  const thrPct = threshold * 100
  const isAnalyzing = verdict === 'analyzing'

  return (
    <div className={'result-strip is-' + verdict}>
      <div className="rs-verdict">
        <div className="rs-icon">
          <Icon name={icon} size={22} weight={iconWeight} />
        </div>
        <div className="rs-text">
          <h2>{title}</h2>
          <div className="file-line">{sub}</div>
        </div>
      </div>
      <div className="conf-block">
        <div className="conf-row">
          <span className="lbl">신뢰도</span>
          <span className="num">{isAnalyzing ? '—' : confPct.toFixed(1) + '%'}</span>
        </div>
        <div className="conf-track2">
          <div className="conf-fill2" style={{ width: (isAnalyzing ? 0 : confPct) + '%' }} />
          <div className="conf-thr" style={{ left: thrPct + '%' }} />
          <div className="conf-thr-lbl" style={{ left: thrPct + '%' }}>
            판정 임계값 {thrPct.toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  )
}
