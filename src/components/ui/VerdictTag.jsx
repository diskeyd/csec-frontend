export default function VerdictTag({ verdict }) {
  if (verdict === 'malicious')
    return (
      <span className="tag tag-danger">
        <span className="dot" />
        악성
      </span>
    )
  if (verdict === 'clean')
    return (
      <span className="tag tag-success">
        <span className="dot" />
        정상
      </span>
    )
  if (verdict === 'suspicious')
    return (
      <span className="tag tag-warn">
        <span className="dot" />
        의심
      </span>
    )
  if (verdict === 'analyzing')
    return (
      <span className="tag tag-info">
        <span className="dot" />
        분석중
      </span>
    )
  return <span className="tag tag-neutral">—</span>
}
