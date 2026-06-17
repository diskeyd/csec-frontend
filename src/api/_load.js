// Mock loader. The variable `name` keeps this a single Vite-analyzable dynamic
// import that globs src/mocks/*.json (works at runtime).
// Phase 3: replace each api/*.js body with fetch(`${API_BASE}/...`).
export async function loadMock(name) {
  const mod = await import(`../mocks/${name}.json`)
  return mod.default
}
