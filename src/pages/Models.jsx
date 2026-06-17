import PageHead from '../components/chrome/PageHead'
import { useModels } from '../hooks/useModels'

export default function Models() {
  const { data: models, isLoading, isError } = useModels()

  return (
    <div className="page2">
      <PageHead
        eyebrow="MODELS"
        title="활성 모델"
        lead="현재 운영 중인 분류 모델 및 룰셋 목록입니다."
      />

      {isLoading && (
        <div style={{ color: 'var(--text-mute)', fontSize: 13 }}>모델 정보 로딩 중…</div>
      )}

      {isError && (
        <div style={{ color: 'var(--danger)', fontSize: 13 }}>모델 정보를 불러오지 못했습니다.</div>
      )}

      {models && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl2" style={{ borderRadius: 0, border: 'none' }}>
            <thead>
              <tr>
                <th>모델</th>
                <th>유형</th>
                <th>설명 방식</th>
                <th>정확도</th>
                <th>학습 데이터</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="file-name">{m.name}</div>
                    <div className="meta">{m.id}</div>
                  </td>
                  <td style={{ color: 'var(--text-default)', fontSize: 12.5 }}>{m.type}</td>
                  <td style={{ color: 'var(--text-mute)', fontSize: 12.5 }}>{m.explain}</td>
                  <td>
                    <span
                      className="t-num"
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: 'var(--text-strong)',
                      }}
                    >
                      {m.accuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-mute)', fontSize: 12 }}>{m.data}</td>
                  <td>
                    <span className="badge badge-success">{m.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
