import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useScan } from '../hooks/useScan'
import PageHead from '../components/chrome/PageHead'
import Icon from '../components/ui/Icon'
import VerdictStrip from '../components/result/VerdictStrip'
import ReasonList from '../components/result/ReasonList'
import ActionList from '../components/result/ActionList'
import AttackChain from '../components/result/AttackChain'
import ShapBarChart from '../components/result/ShapBarChart'
import GradCamView from '../components/result/GradCamView'
import RuleList from '../components/result/RuleList'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Result() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: scan, isLoading, isError } = useScan(id)
  const [inquiry, setInquiry] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [fpReported, setFpReported] = useState(false)

  if (isLoading) {
    return (
      <div className="page2">
        <div className="card2" style={{ padding: '48px 32px', textAlign: 'center' }}>
          <Icon name="circle-notch" size={28} />
          <div style={{ marginTop: 14, fontSize: 13, color: 'var(--text-mute)' }}>
            분석 결과를 불러오는 중입니다
          </div>
        </div>
      </div>
    )
  }

  if (isError || !scan) {
    return (
      <div className="page2">
        <div className="card2" style={{ padding: '48px 32px', textAlign: 'center' }}>
          <Icon name="warning-circle" size={28} />
          <div style={{ marginTop: 14, fontSize: 13, color: 'var(--text-mute)' }}>
            분석 결과를 찾을 수 없습니다
          </div>
        </div>
      </div>
    )
  }

  if (scan.verdict === 'analyzing') {
    return (
      <div className="page2">
        <PageHead
          eyebrow={
            <>
              <span>RESULT</span>
              <span style={{ color: 'var(--text-faint)' }}>·</span>
              <span className="id">{scan.scanId}</span>
            </>
          }
          title={scan.fileMeta.name}
          lead={`${scan.fileMeta.category.toUpperCase()} · ${formatBytes(scan.fileMeta.sizeBytes)} · 분석 완료 ${formatDate(scan.fileMeta.uploadedAt)}`}
        />
        <VerdictStrip
          verdict={scan.verdict}
          confidence={scan.confidence}
          threshold={scan.threshold}
        />
        <div className="card2" style={{ padding: '40px 32px', textAlign: 'center', marginTop: 16 }}>
          <Icon name="circle-notch" size={32} />
          <div style={{ fontSize: 13, color: 'var(--text-strong)', fontWeight: 500, marginTop: 14, marginBottom: 4 }}>
            모델 추론 중
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>
            {scan.modelDisplayName} · 분석 진행 중
          </div>
        </div>
      </div>
    )
  }

  const isClean = scan.verdict === 'clean'
  const isThreat = scan.verdict === 'malicious' || scan.verdict === 'suspicious'

  return (
    <div className="page2">
      {/* L1 — Page header + actions */}
      <PageHead
        eyebrow={
          <>
            <span>RESULT</span>
            <span style={{ color: 'var(--text-faint)' }}>·</span>
            <span className="id">{scan.scanId}</span>
          </>
        }
        title={scan.fileMeta.name}
        lead={`${scan.fileMeta.category.toUpperCase()} · ${formatBytes(scan.fileMeta.sizeBytes)} · 분석 완료 ${formatDate(scan.fileMeta.uploadedAt)}`}
        actions={
          <>
            <button
              className="btn2 btn2-ghost btn2-sm"
              onClick={() => setFpReported(true)}
              title={fpReported ? '신고가 접수되었습니다' : undefined}
            >
              <Icon name="warning-circle" size={13} /> {fpReported ? '신고 접수됨' : '오탐 신고'}
            </button>
            <button
              className="btn2 btn2-outline btn2-sm"
              onClick={() => navigate('/upload')}
            >
              <Icon name="upload" size={13} /> 다시 분석
            </button>
            {scan.reportId && (
              <button
                className="btn2 btn2-primary btn2-sm"
                onClick={() => navigate(`/scans/${id}/report`)}
              >
                <Icon name="file-search" size={13} weight="fill" /> 보고서 보기
              </button>
            )}
          </>
        }
      />

      {/* L2 — Verdict strip */}
      <VerdictStrip
        verdict={scan.verdict}
        confidence={scan.confidence}
        threshold={scan.threshold}
      />

      {/* Tech info grid */}
      <div className="r-info-grid">
        <div className="r-info-cell">
          <div className="key">파일 타입</div>
          <div className="val mono">{scan.fileMeta.mimeType}</div>
        </div>
        <div className="r-info-cell">
          <div className="key">크기</div>
          <div className="val mono">{scan.fileMeta.sizeBytes.toLocaleString('ko-KR')} B</div>
        </div>
        <div className="r-info-cell">
          <div className="key">출처</div>
          <div
            className="val mono"
            style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {scan.fileMeta.source ?? '—'}
          </div>
        </div>
        <div className="r-info-cell">
          <div className="key">사용 모델</div>
          <div className="val mono">{scan.modelDisplayName}</div>
        </div>
      </div>

      {/* SHA-256 row */}
      <div className="r-hash-row">
        <span className="label">SHA-256</span>
        <span className="val">{scan.fileMeta.sha256}</span>
        <button
          className="btn2 btn2-ghost btn2-sm"
          title="복사"
          onClick={() => navigator.clipboard.writeText(scan.fileMeta.sha256)}
        >
          <Icon name="copy" size={12} />
        </button>
      </div>

      {/* L3 — Threat layout: reasons + actions + tech */}
      {isThreat && (
        <>
          <div className="r-main">
            <div>
              <h3 className="r-section-title">
                <span>탐지 근거</span>
                <span className="meta">{scan.reasons.length}건 · severity 정렬</span>
              </h3>
              <ReasonList reasons={scan.reasons} />
            </div>

            <div className="r-side-stack">
              <ActionList actions={scan.recommendedActions} />
              <div className="r-tech">
                <h3>기술 정보</h3>
                <div className="r-tech-row">
                  <span className="k">분석 ID</span>
                  <span className="v">{scan.scanId}</span>
                </div>
                <div className="r-tech-row">
                  <span className="k">모델 버전</span>
                  <span className="v">{scan.modelDisplayName}</span>
                </div>
                <div className="r-tech-row">
                  <span className="k">처리 시간</span>
                  <span className="v">{scan.durationMs.toLocaleString('ko-KR')} ms</span>
                </div>
                <div className="r-tech-row">
                  <span className="k">분석 일시</span>
                  <span className="v">{formatDate(scan.analyzedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* L4/L5 — Explainability + Attack chain */}
          {(scan.explainability || (scan.attackChain && scan.attackChain.length > 0)) && (
            <div className="r-explain">
              {scan.explainability?.kind === 'shap' && (
                <ShapBarChart explainability={scan.explainability} />
              )}
              {scan.explainability?.kind === 'gradcam' && (
                <GradCamView explainability={scan.explainability} />
              )}
              {scan.explainability?.kind === 'heuristic' && (
                <RuleList explainability={scan.explainability} />
              )}

              {scan.attackChain && scan.attackChain.length > 0 && (
                <AttackChain nodes={scan.attackChain} />
              )}
            </div>
          )}

          {/* Inquiry */}
          <div className="r-inquiry">
            <h3>
              <span>이 결과에 대해 질문하기</span>
              <span className="sub">ChatGPT API · 답변은 참고용</span>
            </h3>
            <div className="inquiry-input">
              <input
                type="text"
                value={inquiry}
                onChange={e => { setInquiry(e.target.value); setSubmitted(false) }}
                placeholder="결과에 대해 질문해 보세요"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-strong)' }}
              />
              <button
                className="btn2 btn2-primary btn2-sm"
                disabled={inquiry.trim() === ''}
                onClick={() => setSubmitted(true)}
              >
                <Icon name="arrow-right" size={13} weight="bold" /> 보내기
              </button>
            </div>
            <div className="inquiry-suggestions">
              {(['왜 악성으로 판정됐나요?', '어떤 조치를 해야 하나요?', '이 파일은 무엇인가요?']).map(chip => (
                <button
                  key={chip}
                  className="chip"
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setInquiry(chip); setSubmitted(false) }}
                >
                  {chip}
                </button>
              ))}
            </div>
            {submitted && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-mute)' }}>
                백엔드(ChatGPT API) 연동 후 답변이 제공됩니다. 현재는 질문 입력까지 지원합니다.
              </div>
            )}
          </div>

          {/* FP banner */}
          <div className="fp-warn" style={{ marginTop: 24 }}>
            <span style={{ flexShrink: 0, marginTop: 1, display: 'inline-flex' }}>
              <Icon name="warning-circle" size={16} color="#8a5a39" />
            </span>
            <div>
              <strong>오탐(False Positive) 의심 시</strong> — 본 판정이 잘못되었다고 판단되시면
              보고서 ID와 함께 신고해 주십시오. 신고된 사례는 모델 재학습에 반영됩니다.
            </div>
            <a href="#">오탐 신고 →</a>
          </div>
        </>
      )}

      {/* Clean layout */}
      {isClean && (
        <div className="r-main">
          <div>
            <h3 className="r-section-title">
              <span>검사 결과</span>
              <span className="meta">악성 패턴 미발견</span>
            </h3>
            <div className="reason-row">
              <div className="top">
                <span className="sev" style={{ background: 'var(--success-soft)', color: '#4d6b3f' }}>OK</span>
                <h4>알려진 위협 패턴과 일치하지 않음</h4>
                <span className="pct">{(scan.confidence * 100).toFixed(1)}%</span>
              </div>
              <p className="detail">
                {scan.reasons.length > 0
                  ? scan.reasons[0].detail
                  : '검사한 결과 알려진 악성 패턴과 일치하는 항목이 없습니다.'}
              </p>
            </div>
          </div>
          <div className="r-side-stack">
            <div className="r-tech">
              <h3>기술 정보</h3>
              <div className="r-tech-row">
                <span className="k">분석 ID</span>
                <span className="v">{scan.scanId}</span>
              </div>
              <div className="r-tech-row">
                <span className="k">모델 버전</span>
                <span className="v">{scan.modelDisplayName}</span>
              </div>
              <div className="r-tech-row">
                <span className="k">처리 시간</span>
                <span className="v">{scan.durationMs.toLocaleString('ko-KR')} ms</span>
              </div>
              <div className="r-tech-row">
                <span className="k">분석 일시</span>
                <span className="v">{formatDate(scan.analyzedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
