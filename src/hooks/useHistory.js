import { useQuery } from '@tanstack/react-query'
import { getHistory, HISTORY_KEYS } from '../api/history'

export function useHistory(page, filter) {
  return useQuery({
    queryKey: HISTORY_KEYS.list(page, filter),
    queryFn: () => getHistory(page, filter),
  })
}
