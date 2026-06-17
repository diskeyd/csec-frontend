import { useQuery } from '@tanstack/react-query'
import { getScan, SCAN_KEYS } from '../api/scans'

export function useScan(id) {
  return useQuery({
    queryKey: SCAN_KEYS.detail(id),
    queryFn: () => getScan(id),
    enabled: id.length > 0,
  })
}
