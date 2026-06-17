import { loadMock } from './_load'

export const MODEL_KEYS = {
  all: ['models'],
}

export async function getModels() {
  // Phase 3: return client.get('/models').then(r => r.data)
  return loadMock('models')
}
