// Adapters: map the team FastAPI backend response shapes onto the frontend's
// existing view-model shapes. The backend is simpler than this UI, so
// explainability (SHAP / GradCAM / attack-chain) has NO backend source — those
// fields stay null here; the demo keeps them via the mock fallback in scans.js.

const VERDICT_MAP = { 악성: 'malicious', 정상: 'clean' }

export function verdictFromResult(result) {
  return VERDICT_MAP[result] ?? 'suspicious'
}

export function categoryFromExt(ext) {
  const e = String(ext || '').toLowerCase().replace(/^\./, '')
  if (e === 'pdf') return 'pdf'
  if (e === 'exe' || e === 'dll') return 'pe'
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'hwp'].includes(e)) return 'office'
  if (['zip', 'rar', '7z'].includes(e)) return 'archive'
  return e || 'pdf'
}

function mimeFromExt(ext) {
  const e = String(ext || '').toLowerCase().replace(/^\./, '')
  const MAP = {
    pdf: 'application/pdf',
    exe: 'application/x-msdownload',
    dll: 'application/x-msdownload',
  }
  return MAP[e] || 'application/octet-stream'
}

// backend file_size is a pre-formatted string e.g. "1.23 MB" — parse to bytes
// for the UI fields that expect a number; fall back to 0 when unparseable.
function parseSizeToBytes(sizeLabel) {
  if (typeof sizeLabel === 'number') return sizeLabel
  const m = String(sizeLabel || '').match(/([\d.]+)\s*(B|KB|MB|GB)?/i)
  if (!m) return 0
  const n = parseFloat(m[1])
  const unit = (m[2] || 'B').toUpperCase()
  const mult = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 }[unit] || 1
  return Math.round(n * mult)
}

// backend /analyze-full (or a /history item) → frontend scan-result shape.
// Sparse on purpose: explainability/attackChain/reasons come back null because
// the backend doesn't compute them. backend-only extras (summary, normal/
// malicious %, performance) are preserved for display.
export function adaptScan(b) {
  return {
    scanId: b.analysis_id,
    verdict: verdictFromResult(b.result),
    confidence: typeof b.confidence === 'number' ? b.confidence / 100 : null,
    threshold: 0.5,
    modelId: b.model_info?.type ? String(b.model_info.type).toLowerCase() : 'model',
    modelDisplayName: b.model_info?.type ?? '분석 모델',
    fileMeta: {
      name: b.filename,
      sizeBytes: parseSizeToBytes(b.file_size),
      mimeType: mimeFromExt(b.extension),
      category: categoryFromExt(b.extension),
      sha256: b.sha256,
      uploadedAt: b.created_at ?? b.log?.start_time ?? null,
      source: 'upload',
    },
    reasons: [],
    explainability: null,
    attackChain: null,
    recommendedActions: [],
    isFalsePositive: false,
    fpReportedAt: null,
    analyzedAt: b.created_at ?? b.log?.start_time ?? null,
    durationMs: b.log
      ? Math.round(((b.log.model_load || 0) + (b.log.preprocess || 0) + (b.log.inference || 0)) * 1000)
      : null,
    reportId: null,
    reportUrl: b.report_url ?? null,
    normal: b.normal,
    malicious: b.malicious,
    summary: b.summary,
    performance: b.performance,
    _source: 'backend',
  }
}

// backend /history item → frontend history-row shape
export function adaptHistoryItem(b) {
  return {
    scanId: b.analysis_id,
    fileName: b.filename,
    fileCategory: categoryFromExt(b.extension),
    verdict: verdictFromResult(b.result),
    confidence: typeof b.confidence === 'number' ? b.confidence / 100 : 0,
    threshold: 0.5,
    modelId: b.model_info?.type ? String(b.model_info.type).toLowerCase() : 'model',
    sizeLabel: b.file_size,
    analyzedAt: b.created_at,
    hasFixture: true,
  }
}
