import { useQuery } from '@tanstack/react-query'
import { getModels, MODEL_KEYS } from '../api/models'

export function useModels() {
  return useQuery({
    queryKey: MODEL_KEYS.all,
    queryFn: getModels,
  })
}
