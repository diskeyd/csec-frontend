export default function ActionList({ actions }) {
  return (
    <div className="r-actions">
      <h3>권장 대응</h3>
      <ol>
        {actions.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ol>
    </div>
  )
}
