import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHead from '../components/chrome/PageHead'
import Icon from '../components/ui/Icon'
import { useUploadLimit } from '../hooks/useUploadLimit'
import { createScan } from '../api/scans'
import { Html5Qrcode } from 'html5-qrcode'

// PC → QR image upload (scanFile), mobile → live camera (getUserMedia). Avoids the
// desktop camera/insecure-origin headaches while keeping camera on phones.
const IS_MOBILE = typeof navigator !== 'undefined' &&
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)

const QR_MOCK_RESULT = {
  url: 'https://cdn.suspicious-domain.io/invoice_2026Q1.pdf',
  verdict: '악성 의심',
  detail: 'PhishTank 매치: cdn.suspicious-domain.io (신뢰도 91.3%)',
}

const STAGES = [
  { name: '파일 검증',  hint: 'MIME · 매직바이트 · 무결성',              ms: 240 },
  { name: '구조 파싱',  hint: 'PDF 객체 트리 추출 (134 obj)',             ms: 580 },
  { name: '특성 추출',  hint: 'YARA · 메타 · 임베딩 (218 features)',      ms: 920 },
  { name: '모델 추론',  hint: 'pdf-rf-2.3 → 신뢰도 산출',               ms: 410 },
]

// URL validation for the QR/URL search box: requires a real host (domain with a
// dot + TLD, or localhost), with or without scheme. Rejects arbitrary words.
function isValidUrl(value) {
  const v = value.trim()
  if (!v) return false
  const candidate = /^https?:\/\//i.test(v) ? v : `https://${v}`
  try {
    const host = new URL(candidate).hostname
    return host === 'localhost' || /^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(host)
  } catch {
    return false
  }
}

export default function Upload() {
  const navigate = useNavigate()
  const { used, maxCount, atLimit, increment } = useUploadLimit()

  const [hot, setHot]           = useState(false)
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage]       = useState(0)
  const [qrUrl, setQrUrl]       = useState('')
  const [qrResult, setQrResult] = useState(null)
  const [qrNote, setQrNote]     = useState('')
  const [qrScanning, setQrScanning] = useState(false)
  const [qrError, setQrError]   = useState('')
  const [pickedName, setPickedName] = useState('invoice_2026Q1.pdf')

  const intervalRef = useRef(null)
  const timeoutRef  = useRef(null)
  const pendingScanId = useRef(null)
  const qrInstanceRef = useRef(null)

  useEffect(() => {
    if (!scanning) return

    let p = 0
    let s = 0

    intervalRef.current = setInterval(() => {
      if (p < 100) {
        p += 2
        setProgress(p)
        if (p > (s + 1) * 25 && s < STAGES.length - 1) {
          s++
          setStage(s)
        }
      }
      // Navigate only once the bar is full AND the real analysis (or its demo
      // fallback) has resolved a scanId. Bar holds at 100% while the backend works.
      if (p >= 100 && pendingScanId.current) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        const id = pendingScanId.current
        timeoutRef.current = setTimeout(() => navigate('/scans/' + id), 300)
      }
    }, 60)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current)  clearTimeout(timeoutRef.current)
    }
  }, [scanning, navigate])

  const startScan = (file) => {
    if (atLimit) return
    increment()
    pendingScanId.current = null
    setProgress(0)
    setStage(0)
    setScanning(true)
    // Kick off the real analysis alongside the progress animation. createScan
    // never throws — on backend failure (e.g. missing model weights → 503) it
    // resolves to the demo fixture so the flow always completes.
    createScan(file).then(({ scanId }) => {
      pendingScanId.current = scanId
    })
  }

  const onFilePicked = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setPickedName(f.name)
    startScan(f)
  }

  // Live camera scan (mobile). Renders into #qr-reader; stops on decode / unmount.
  useEffect(() => {
    if (!qrScanning) return
    const qr = new Html5Qrcode('qr-reader')
    qrInstanceRef.current = qr
    qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 220 },
      (decoded) => { onQrDecoded(decoded); setQrScanning(false) },
      () => {}, // per-frame decode misses — ignore
    ).catch(() => {
      setQrError('카메라를 열 수 없습니다. (권한 거부 / 카메라 없음 / 보안 연결 필요)')
      setQrScanning(false)
    })
    return () => {
      const inst = qrInstanceRef.current
      qrInstanceRef.current = null
      if (inst) { inst.stop().then(() => inst.clear()).catch(() => {}) }
    }
  }, [qrScanning])

  function onQrDecoded(text) {
    const v = (text || '').trim()
    setQrUrl(v)
    setQrError('')
    if (isValidUrl(v)) {
      setQrResult({ ...QR_MOCK_RESULT, url: v })
      setQrNote('')
    } else {
      setQrResult(null)
      setQrNote(`QR 인식됨: ${v} (URL 형식이 아닙니다)`)
    }
  }

  function startCameraScan() {
    setQrError(''); setQrResult(null); setQrNote('')
    setQrScanning(true)
  }

  async function stopCameraScan() {
    const inst = qrInstanceRef.current
    qrInstanceRef.current = null
    if (inst) {
      try { await inst.stop() } catch { /* noop */ }
      try { inst.clear() } catch { /* noop */ }
    }
    setQrScanning(false)
  }

  // PC: decode a QR from an uploaded image (no camera needed).
  async function onQrImagePicked(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setQrError(''); setQrResult(null); setQrNote('')
    try {
      const qr = new Html5Qrcode('qr-reader')
      const decoded = await qr.scanFile(file, false)
      try { qr.clear() } catch { /* noop */ }
      onQrDecoded(decoded)
    } catch {
      setQrError('이미지에서 QR 코드를 찾지 못했습니다. 다른 이미지를 시도해 주세요.')
    }
  }

  function handleQrAnalyze() {
    const v = qrUrl.trim()
    if (!v) return
    if (!isValidUrl(v)) {
      setQrResult(null)
      setQrNote('올바른 URL 형식이 아닙니다. (예: example.com/file.pdf)')
      return
    }
    setQrResult({ ...QR_MOCK_RESULT, url: v })
    setQrNote('')
  }

  return (
    <div className="page2">
      <PageHead
        eyebrow="NEW SCAN"
        title="새 분석"
        lead="분석할 파일을 업로드하십시오. 모든 입력은 격리된 환경에서 처리됩니다."
      />

      <div className="upload-wrap">
        {!scanning && maxCount !== Infinity && (
          <div className="upload-meta-row" style={{ marginBottom: 8 }}>
            <span style={{ color: atLimit ? 'var(--red, #ef4444)' : 'var(--text-mute)' }}>
              익명 분석 횟수&nbsp;
              <strong>({used}&nbsp;/&nbsp;{maxCount})</strong>
            </span>
            {atLimit && (
              <span style={{ marginLeft: 12, color: 'var(--red, #ef4444)', fontSize: 12 }}>
                익명 분석은 3회까지 가능합니다 · 로그인 시 무제한
              </span>
            )}
          </div>
        )}

        {!scanning && (
          <div id="upload-panel-file">
            {/* Deployed CSEC pattern (verified): a hidden display:none input + a
                SEPARATE sibling <label htmlFor>. A label[for] reliably opens even a
                display:none input across browsers — including where a programmatic
                .click() is silently blocked. The outer div handles drag-and-drop. */}
            <div
              className={'dropzone2' + (hot ? ' is-hot' : '') + (atLimit ? ' is-disabled' : '')}
              onDragOver={(e) => { if (!atLimit) { e.preventDefault(); setHot(true) } }}
              onDragLeave={() => setHot(false)}
              onDrop={(e) => {
                e.preventDefault(); setHot(false)
                if (atLimit) return
                const f = e.dataTransfer.files?.[0]
                if (f) { setPickedName(f.name); startScan(f) }
              }}
              aria-disabled={atLimit}
            >
              <input
                type="file"
                id="upload-file-input"
                style={{ display: 'none' }}
                onChange={onFilePicked}
                disabled={atLimit}
              />
              <label htmlFor="upload-file-input" style={{ display: 'block', cursor: atLimit ? 'default' : 'pointer' }}>
                <div className="icon-wrap" style={{ color: 'var(--brand-primary)', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3>파일을 끌어다 놓거나 클릭하여 선택</h3>
                <p className="help">단일 파일, 최대 50&nbsp;MB</p>
                <div className="types">
                  PDF · HWP · DOC · DOCX · PPT · PPTX · XLS · XLSX · EXE · DLL · MSI · ZIP · RAR · 7Z · APK · ELF
                </div>
              </label>
            </div>
            <div className="upload-meta-row">
              <span><strong>보존 정책</strong> — 분석 후 24시간 자동 삭제</span>
            </div>
          </div>
        )}

        {scanning && (
          <div className="scan-progress2">
            <div className="sp2-head">
              <Icon name="file" size={18} color="var(--text-mute)" />
              <div>
                <div className="file-name">{pickedName}</div>
                <div className="meta">PDF · 1.4 MB · sha256:7f3c8b9a…</div>
              </div>
              <div className="pct">{progress}%</div>
            </div>
            <div className="sp2-bar">
              <div className="sp2-fill" style={{ width: progress + '%' }} />
            </div>
            <div className="sp2-meta">
              <span>elapsed 00:0{Math.floor(progress / 30)}.{String(progress * 7 % 100).padStart(2, '0')}</span>
              <span>est {Math.max(0, Math.ceil((100 - progress) / 40))}s remaining</span>
            </div>
            <div className="sp2-stages">
              {STAGES.map((s, i) => (
                <div
                  key={i}
                  className={'sp2-stage' + (i < stage ? ' is-done' : i === stage ? ' is-active' : '')}
                >
                  <div className="sp2-dot" />
                  <div>
                    <div style={{ fontWeight: i === stage ? 500 : 400 }}>{s.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                      {s.hint}
                    </div>
                  </div>
                  {i < stage && <span className="ms">{s.ms}ms</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QR / URL 검색 */}
      <div className="card" style={{ padding: '20px 24px', marginTop: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', marginBottom: 14 }}>
          QR / URL 검색
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {IS_MOBILE ? (
            <button
              className="btn btn-secondary btn-sm"
              onClick={qrScanning ? stopCameraScan : startCameraScan}
            >
              <Icon name="globe" size={14} />
              {qrScanning ? 'QR 스캔 중지' : 'QR 스캔'}
            </button>
          ) : (
            <label className="btn btn-secondary btn-sm" htmlFor="qr-image-input" style={{ cursor: 'pointer' }}>
              <Icon name="globe" size={14} />
              QR 이미지
            </label>
          )}
          <input id="qr-image-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={onQrImagePicked} />
          <input
            className="input"
            style={{ flex: 1, minWidth: 220, height: 36, fontSize: 13 }}
            placeholder="https://example.com"
            value={qrUrl}
            onChange={(e) => setQrUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleQrAnalyze() }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={handleQrAnalyze}
            disabled={!qrUrl.trim()}
          >
            분석
          </button>
        </div>
        {/* Camera live view (mobile). Always in DOM (hidden) so scanFile() can bind to it. */}
        <div
          id="qr-reader"
          style={{ maxWidth: 320, marginTop: qrScanning ? 12 : 0, borderRadius: 8, overflow: 'hidden', display: qrScanning ? 'block' : 'none' }}
        />
        {qrError && (
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--danger)' }}>{qrError}</div>
        )}
        {qrNote && (
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-mute)' }}>{qrNote}</div>
        )}
      </div>

      {/* QR / URL 분석 결과 */}
      <div className="card" style={{ padding: '20px 24px', marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', marginBottom: 14 }}>
          QR / URL 분석 결과
        </div>
        {!qrResult ? (
          <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>분석 결과가 여기에 표시됩니다.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-warning">{qrResult.verdict}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-mute)' }}>
                {qrResult.url}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-default)' }}>{qrResult.detail}</div>
          </div>
        )}
      </div>
    </div>
  )
}
