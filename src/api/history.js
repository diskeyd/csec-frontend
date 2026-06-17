import { client } from './client'
import { loadMock } from './_load'
import { adaptHistoryItem, adaptScan } from './adapt'
import { cacheScan } from './scans'

export const HISTORY_KEYS = {
  all: ['history'],
  list: (page, filter) => ['history', 'list', page, filter],
}

const PAGE_SIZE = 10

// Real history when logged in (GET /history/my-analyses-full, no server-side
// pagination → paginate client-side). Falls back to the demo dataset when
// anonymous, on error, or when the real list is empty (e.g. no model weights →
// no persisted analyses yet) so the History page still demonstrates the table,
// malicious-row highlighting, and pagination.
export async function getHistory(page, filter) {
  let all = null
  const token = localStorage.getItem('access_token')

  if (token) {
    try {
      const res = await client.get('/history/my-analyses-full')
      const raw = Array.isArray(res.data) ? res.data : []
      if (raw.length > 0) {
        raw.forEach((b) => cacheScan(adaptScan(b))) // seed cache → rows open in Result
        all = raw.map(adaptHistoryItem)
      }
    } catch {
      all = null // fall through to demo
    }
  }

  if (!all) all = await loadMock('history')

  const filtered = filter === 'all' ? all : all.filter((item) => item.verdict === filter)
  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const clampedPage = Math.min(Math.max(1, page), totalPages)
  const start = (clampedPage - 1) * PAGE_SIZE
  const items = filtered.slice(start, start + PAGE_SIZE)

  return { items, page: clampedPage, pageSize: PAGE_SIZE, totalItems, totalPages, filter }
}
