import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getClientUuid } from '../utils/session'

const MAX_ANON = 3

function storageKey(uuid) {
  return `mg_upload_used_${uuid}`
}

function readUsed(uuid) {
  try {
    const raw = localStorage.getItem(storageKey(uuid))
    const n = parseInt(raw, 10)
    return isNaN(n) ? 0 : n
  } catch {
    return 0
  }
}

function writeUsed(uuid, count) {
  try {
    localStorage.setItem(storageKey(uuid), String(count))
  } catch {
    // storage unavailable — silently ignore
  }
}

/**
 * Tracks anonymous upload usage against a 3-scan limit.
 * Logged-in users have no limit (maxCount = Infinity).
 *
 * Phase 3 real-backend path (replace the localStorage logic below):
 * // const res = await fetch('/api/limit/upload-remaining', { credentials: 'include' })
 * // const { used, max } = await res.json()
 */
export function useUploadLimit() {
  const { user } = useAuth()
  const isLoggedIn = Boolean(user)
  const maxCount = isLoggedIn ? Infinity : MAX_ANON

  const uuid = getClientUuid()
  const [used, setUsed] = useState(() => (isLoggedIn ? 0 : readUsed(uuid)))

  const atLimit = !isLoggedIn && used >= maxCount

  function increment() {
    if (isLoggedIn) return
    const next = used + 1
    writeUsed(uuid, next)
    setUsed(next)
  }

  const remaining = isLoggedIn ? Infinity : Math.max(0, maxCount - used)

  return { used, maxCount, remaining, atLimit, increment }
}
