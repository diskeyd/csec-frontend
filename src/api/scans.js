import { client } from './client'
import { loadMock } from './_load'
import { adaptScan } from './adapt'

export const SCAN_KEYS = {
  all: ['scans'],
  detail: (id) => ['scans', id],
}

// In-SPA cache of adapted scans. The backend has no GET /scans/{id} (anonymous
// results aren't persisted), so a fresh analysis is stored here and read back by
// the Result page via getScan(). History also seeds this cache.
const scanCache = new Map()

export function cacheScan(scan) {
  if (scan?.scanId) scanCache.set(scan.scanId, scan)
}

export async function getScan(id) {
  if (scanCache.has(id)) return scanCache.get(id)
  // Demo fixtures (SC-78xx) live as mocks; real ids not in cache fall through here.
  return loadMock(`scan-${id}`)
}

// Real analysis. POSTs the file to /analyze-full and adapts the result.
// If the backend can't analyze (model weights missing → 503, unsupported file,
// or any network error), we fall back to the demo fixture so the upload flow
// stays alive for the demo. Returns { scanId, source, error? }.
export async function createScan(file) {
  if (file) {
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await client.post('/analyze-full', form)
      const scan = adaptScan(res.data)
      cacheScan(scan)
      return { scanId: scan.scanId, source: 'backend' }
    } catch (err) {
      // fall through to demo fixture
      const demo = await loadMock('scan-SC-7821')
      cacheScan(demo)
      return { scanId: demo.scanId ?? 'SC-7821', source: 'demo-fallback', error: err?.message }
    }
  }
  // No file (URL / hash tabs — backend /analyze-full is file-only): demo fixture.
  const demo = await loadMock('scan-SC-7821')
  cacheScan(demo)
  return { scanId: demo.scanId ?? 'SC-7821', source: 'demo-fallback' }
}

export async function reportFalsePositive(_id) {
  void _id
  // Backend has no false-positive endpoint; optimistic local-only for now.
  return
}
