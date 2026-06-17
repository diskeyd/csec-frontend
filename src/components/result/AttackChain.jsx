// severity → left-bar color (DESIGN.md: high/critical = danger). Uses real tokens only.
const SEVERITY_BORDER = {
  critical: '#D8634F',
  high: '#D8634F',
  medium: '#CC9473',
  low: '#D6D6D6',
  info: '#D6D6D6',
}

function stepLabel(n) {
  return String(n).padStart(2, '0')
}

export default function AttackChain({ nodes }) {
  return (
    <div className="r-chain">
      <h3>
        <span>공격 체인</span>
        <span className="sub">추정 실행 흐름</span>
      </h3>
      <div className="chain-list">
        {nodes.map((node, idx) => {
          const isEstimate = node.basis === 'model-estimate'
          const nodeClass = 'chain-node' + (isEstimate ? ' is-dashed' : '')

          const borderColor = SEVERITY_BORDER[node.severity]

          return (
            <div key={node.step}>
              <div
                className={nodeClass}
                style={{ borderLeftColor: borderColor }}
              >
                <span className="step">{stepLabel(node.step)}</span>
                <div className="body">
                  <div className="title">
                    {node.description}
                    {isEstimate && <span className="est-badge"> (추정)</span>}
                  </div>
                  <div className="meta mono">{node.phase}{node.mitreTacticId ? ` · ${node.mitreTacticId}` : ''}</div>
                </div>
              </div>
              {idx < nodes.length - 1 && (
                <div className="chain-arrow" aria-hidden>↓</div>
              )}
            </div>
          )
        })}
      </div>
      <div className="chain-foot">
        실선 = 정적 분석 근거 · 점선 = 모델 추정
      </div>
    </div>
  )
}
