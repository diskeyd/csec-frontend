import { loadMock } from './_load'

export const REPORT_KEYS = {
  all: ['reports'],
  detail: (id) => ['reports', id],
}

export async function getReport(id) {
  // Phase 3: return client.get(`/reports/${id}`).then(r => r.data)
  return loadMock(`report-${id}`)
}
