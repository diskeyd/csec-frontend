import { createContext, useContext, useState } from 'react'
import { client } from '../api/client'

const LS_KEY = 'malguard_auth'
const TOKEN_KEY = 'access_token'

const AuthContext = createContext(null)

function readPersistedUser() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readPersistedUser)

  // Phase 3 (real backend): POST /api/users/login → { access_token }.
  // The JWT is stored under TOKEN_KEY for the axios interceptor (client.js);
  // the backend login returns only a token, so the display user is derived
  // from the entered username.
  async function login(id, password) {
    const username = id.trim()
    if (!username || !password) return false
    try {
      const res = await client.post('/users/login', { username, password })
      const token = res.data?.access_token
      if (!token) return false
      localStorage.setItem(TOKEN_KEY, token)
      const newUser = {
        name: username,
        email: username,
        initials: username.slice(0, 2).toUpperCase(),
      }
      setUser(newUser)
      localStorage.setItem(LS_KEY, JSON.stringify(newUser))
      return true
    } catch {
      return false
    }
  }

  // Register a new account, then auto-login. Backend POST /api/users/register.
  async function register(id, password) {
    const username = id.trim()
    if (!username || !password) {
      return { ok: false, message: '아이디와 비밀번호를 입력하십시오.' }
    }
    try {
      await client.post('/users/register', { username, password })
      const ok = await login(username, password)
      return { ok, message: ok ? '' : '가입은 되었으나 로그인에 실패했습니다.' }
    } catch (err) {
      return {
        ok: false,
        message: err?.status === 400 ? '이미 사용 중인 아이디입니다.' : '회원가입에 실패했습니다.',
      }
    }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(LS_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
