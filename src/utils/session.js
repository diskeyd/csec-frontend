import Cookies from 'js-cookie'
import { v4 as uuidv4 } from 'uuid'

const CLIENT_UUID_KEY = 'client_uuid'

/**
 * Initialise a persistent client session UUID.
 * If the 'client_uuid' cookie already exists, returns its value unchanged.
 * Otherwise generates a new UUID v4, stores it as a 1-day cookie, and returns it.
 */
export function initClientSession() {
  let uuid = Cookies.get(CLIENT_UUID_KEY)
  if (!uuid) {
    uuid = uuidv4()
    Cookies.set(CLIENT_UUID_KEY, uuid, { expires: 1 })
  }
  return uuid
}

/**
 * Returns the current client UUID, initialising the session if needed.
 * Safe to call before any component mounts.
 */
export function getClientUuid() {
  return initClientSession()
}
