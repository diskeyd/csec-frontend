import { useNavigate, useParams } from 'react-router-dom'
import PageHead from '../components/chrome/PageHead'
import Icon from '../components/ui/Icon'
import VerdictTag from '../components/ui/VerdictTag'
import { useScan } from '../hooks/useScan'
import { useReport } from '../hooks/useReport'

// ── helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(1)} KB`
  return `${bytes} bytes`
}

function fmtDate(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Seoul',
    }) + ' (KST)'
  } catch {
    return iso
  }
}

function fmtTime(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Seoul',
    }) + ' KST'
  } catch {
    return iso
  }
}

/** Map 5-tier Severity to display label */
function severityLabel(s) {
  if (s === 'critical' || s === 'high') return 'HIGH'
  return 'MED'
}

/** Stamp text + inline color for pdf-paper2 (.doc-stamp is always applied) */
function stampFor(verdict) {
  if (verdict === 'malicious') return { text: 'MALICIOUS', color: '#b04535' }
  if (verdict === 'suspicious') return { text: 'SUSPICIOUS', color: '#9a6a10' }
  return { text: 'CLEAN', color: '#4a7a3e' }
}

/** Korean verdict label for the 판정 card */
function verdictKo(verdict) {
  if (verdict === 'malicious') return '악성'
  if (verdict === 'suspicious') return '의심'
  if (verdict === 'clean') return '정상'
  return '분석중'
}

/** CSS color var for verdict */
function verdictColor(verdict) {
  if (verdict === 'malicious') return 'var(--danger)'
  if (verdict === 'suspicious') return 'var(--warning)'
  if (verdict === 'clean') return 'var(--success)'
  return 'var(--text-mute)'
}

/** File type label from MIME / category */
function fileTypeLabel(mime) {
  if (mime.includes('pdf')) return 'PDF'
  if (mime.includes('executable') || mime.includes('msdownload')) return 'EXE'
  if (mime.includes('officedocument') || mime.includes('ms-excel') || mime.includes('ms-word'))
    return 'Office'
  if (mime.includes('zip') || mime.includes('x-rar')) return 'Archive'
  return mime.split('/').pop()?.toUpperCase() ?? '파일'
}

// ── component ─────────────────────────────────────────────────────────────────

export default function Report() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Both hooks called unconditionally to maintain stable hook order.
  // useReport is gated by enabled: id.length>0 and scan?.reportId being non-empty.
  const { data: scan, isLoading, isError } = useScan(id)
  const { data: report } = useReport(scan?.reportId ?? '')

  // ── loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="page2">
        <PageHead
          eyebrow={<><span>REPORT</span><span style={{ color: 'var(--text-faint)' }}>·</span><span className="id">…</span></>}
          title="분석 보고서"
          lead="감사 추적용 표준 형식 보고서. PDF로 내보내거나 인쇄할 수 있습니다."
        />
        <div className="card2" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-mute)' }}>
          불러오는 중…
        </div>
      </div>
    )
  }

  // ── error / not found ─────────────────────────────────────────────────────
  if (isError || !scan) {
    return (
      <div className="page2">
        <PageHead
          eyebrow={<><span>REPORT</span><span style={{ color: 'var(--text-faint)' }}>·</span><span className="id">{id}</span></>}
          title="분석 보고서"
          lead="감사 추적용 표준 형식 보고서. PDF로 내보내거나 인쇄할 수 있습니다."
          actions={
            <button className="btn2 btn2-outline btn2-sm" onClick={() => navigate(`/scans/${id}`)}>
              ← 결과로
            </button>
          }
        />
        <div className="card2" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--danger)' }}>
          스캔 정보를 불러올 수 없습니다.
        </div>
      </div>
    )
  }

  // ── derived values ────────────────────────────────────────────────────────
  const { verdict, confidence, threshold, fileMeta, reasons, scanId, analyzedAt, durationMs, modelDisplayName, reportId } = scan
  const isMal = verdict === 'malicious'
  const isThreat = verdict === 'malicious' || verdict === 'suspicious'
  const confPct = (confidence * 100).toFixed(1)
  const thrPct = Math.round(threshold * 100)
  const stamp = stampFor(verdict)
  const repLabel = reportId ?? '—'
  const fileLabel = fileTypeLabel(fileMeta.mimeType)
  const sizeLabel = `${fileMeta.sizeBytes.toLocaleString('en')} bytes (${formatBytes(fileMeta.sizeBytes)})`

  // Verdict box title
  const verdictTitle = isMal
    ? `악성 파일로 판정됨 (신뢰도 ${confPct}%)`
    : verdict === 'suspicious'
      ? `의심 파일로 분류됨 (신뢰도 ${confPct}%)`
      : `악성 위협 미발견 (신뢰도 ${confPct}%)`

  // AI summary: reportId present → summary or loading placeholder; no reportId → no report was generated
  const summaryBody = reportId
    ? (report?.summary ?? '요약 생성 중입니다…')
    : '이 분석에는 보고서가 생성되지 않았습니다.'

  return (
    <div className="page2">
      <PageHead
        eyebrow={
          <>
            <span>REPORT</span>
            <span style={{ color: 'var(--text-faint)' }}>·</span>
            <span className="id">{repLabel}</span>
          </>
        }
        title="분석 보고서"
        lead="감사 추적용 표준 형식 보고서. PDF로 내보내거나 인쇄할 수 있습니다."
        actions={
          <>
            <button
              className="btn2 btn2-outline btn2-sm"
              onClick={() => navigate(`/scans/${id}`)}
            >
              ← 결과로
            </button>
            <button
              className="btn2 btn2-outline btn2-sm"
              onClick={() => navigator.clipboard.writeText(window.location.href)}
            >
              <Icon name="copy" size={13} /> 링크 복사
            </button>
            <button className="btn2 btn2-primary btn2-sm">
              <Icon name="download" size={13} weight="fill" /> PDF 다운로드
            </button>
          </>
        }
      />

      <div className="rep-grid">
        {/* ── PDF preview ── */}
        <div className="pdf-host">
          {/* toolbar — decorative only */}
          <div className="pdf-tb">
            <button className="pdf-tb-btn" aria-label="이전 페이지"><Icon name="caret-left" size={11} /></button>
            <span className="pn">1 / {report?.pageCount ?? '—'}</span>
            <button className="pdf-tb-btn" aria-label="다음 페이지"><Icon name="caret-right" size={11} /></button>
            <div style={{ flex: 1 }} />
            <button className="pdf-tb-btn" aria-label="검색"><Icon name="search" size={12} /></button>
            <button className="pdf-tb-btn" aria-label="다운로드"><Icon name="download" size={12} /></button>
          </div>

          <div className="pdf-stage">
            <div className="pdf-paper2">
              {/* watermark stamp — inline color keeps it within the paper's print-faithful palette */}
              <div className="doc-stamp" style={{ borderColor: stamp.color, color: stamp.color }}>
                {stamp.text}
              </div>

              {/* document header */}
              <div className="doc-head">
                <div className="doc-mark">M</div>
                <div className="doc-title">MalGuard · 악성파일 분석 보고서</div>
                <div className="doc-id">{repLabel}</div>
              </div>

              <h2>분석 결과 — {fileMeta.name}</h2>
              <div className="doc-sub">
                {fmtDate(analyzedAt)} 발행
              </div>

              {/* Section 1 — AI summary */}
              <div className="ds">
                1. 요약{' '}
                <span style={{ fontSize: 8, fontWeight: 400, color: 'var(--text-mute)', marginLeft: 6 }}>
                  {report ? `${report.generatedBy} 자동 생성` : 'AI 자동 생성'}
                </span>
              </div>
              <div className={'ver-box' + (isMal ? '' : verdict === 'suspicious' ? ' suspicious' : ' clean')}>
                <div className="v-title">{verdictTitle}</div>
                <div>{summaryBody}</div>
              </div>

              {/* Section 2 — file info */}
              <div className="ds">2. 파일 정보</div>
              <div className="row2"><div className="k">파일명</div><div className="v">{fileMeta.name}</div></div>
              <div className="row2"><div className="k">파일 타입</div><div className="v">{fileLabel}</div></div>
              <div className="row2"><div className="k">크기</div><div className="v">{sizeLabel}</div></div>
              <div className="row2">
                <div className="k">SHA-256</div>
                <div className="v" style={{ fontFamily: 'monospace', fontSize: 8, wordBreak: 'break-all' }}>
                  {fileMeta.sha256}
                </div>
              </div>
              <div className="row2">
                <div className="k">출처</div>
                <div className="v">{fileMeta.source ?? '—'}</div>
              </div>

              {/* Section 3 — evidence table (shown when reasons exist) */}
              {reasons.length > 0 && (
                <>
                  <div className="ds">3. 탐지 근거</div>
                  <table className="doc-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>유형</th>
                        <th>심각도</th>
                        <th>기여도</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reasons.map((r, i) => (
                        <tr key={r.id}>
                          <td>{i + 1}</td>
                          <td>{r.title}</td>
                          <td>{severityLabel(r.severity)}</td>
                          <td>{r.impactPct.toFixed(0)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* document footer */}
              <div className="doc-foot">
                <span>MalGuard · 분석 보고서</span>
                <span>Page 1 of {report?.pageCount ?? '—'} · {new Date(analyzedAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── side cards ── */}
        <div className="rep-side">
          {/* 판정 card — VerdictTag for semantic label, summary-val for visual weight */}
          <div className="rep-card">
            <h4>판정</h4>
            <div className="summary-val" style={{ color: verdictColor(verdict) }}>
              {verdictKo(verdict)}
            </div>
            <div style={{ marginTop: 6 }}>
              <VerdictTag verdict={verdict} />
            </div>
            <div className="summary-sub">신뢰도 {confPct}% · 임계값 {thrPct}%</div>
          </div>

          {/* 요약 card */}
          <div className="rep-card">
            <h4>요약</h4>
            <div className="row">
              <span className="k">파일</span>
              <span className="v">{fileLabel} · {formatBytes(fileMeta.sizeBytes)}</span>
            </div>
            <div className="row">
              <span className="k">근거</span>
              <span className="v">{reasons.length}건</span>
            </div>
            <div className="row">
              <span className="k">처리 시간</span>
              <span className="v">{durationMs.toLocaleString('en')}ms</span>
            </div>
            <div className="row">
              <span className="k">모델</span>
              <span className="v">{modelDisplayName}</span>
            </div>
          </div>

          {/* 보고서 정보 card */}
          <div className="rep-card">
            <h4>보고서 정보</h4>
            <div className="row">
              <span className="k">보고서 ID</span>
              <span className="v">{repLabel}</span>
            </div>
            <div className="row">
              <span className="k">분석 ID</span>
              <span className="v">{scanId}</span>
            </div>
            <div className="row">
              <span className="k">발행 시각</span>
              <span className="v">{report ? fmtTime(report.generatedAt) : fmtTime(analyzedAt)}</span>
            </div>
            <div className="row">
              <span className="k">페이지</span>
              <span className="v">{report?.pageCount ?? '—'}</span>
            </div>
            <div className="row">
              <span className="k">생성 방식</span>
              <span className="v">{report ? report.generatedBy : '—'}</span>
            </div>
            {isThreat && (
              <div className="row">
                <span className="k">위협 여부</span>
                <span className="v" style={{ color: 'var(--danger)' }}>위협 감지됨</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
