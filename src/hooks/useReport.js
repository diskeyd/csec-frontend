import { useQuery } from '@tanstack/react-query'
import { getReport, REPORT_KEYS } from '../api/reports'

export function useReport(id) {
  return useQuery({
    queryKey: REPORT_KEYS.detail(id),
    queryFn: () => getReport(id),
    enabled: id.length > 0,
  })
}
