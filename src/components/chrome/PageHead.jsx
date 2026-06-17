export default function PageHead({ eyebrow, title, lead, actions }) {
  return (
    <div className="head2">
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="eyebrow">
          <span>{eyebrow}</span>
        </div>
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
      </div>
      {actions && <div className="acts">{actions}</div>}
    </div>
  )
}
