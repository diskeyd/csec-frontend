import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!userId.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 모두 입력하십시오.')
      return
    }
    const ok = await login(userId.trim(), password)
    if (!ok) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
      return
    }
    setError('')
    navigate('/')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-page)',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Brand mark */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 16,
            }}
          >
            <img src="/csec-mark.svg" alt="CSEC" width={34} height={34} />
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--text-strong)',
                letterSpacing: '-0.01em',
              }}
            >
              CSEC
            </span>
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 8,
              color: 'var(--text-strong)',
            }}
          >
            로그인
          </h1>
          <p
            style={{
              fontSize: 13,
              color: 'var(--text-mute)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            회원 계정으로 로그인하시면 분석 기록 조회와
            <br />
            보고서 다운로드를 사용하실 수 있습니다.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            padding: 28,
            boxShadow: 'var(--elev-md)',
          }}
        >
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="login-id"
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-default)',
                  marginBottom: 6,
                }}
              >
                아이디
              </label>
              <input
                id="login-id"
                type="text"
                placeholder="아이디를 입력하십시오"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 10px',
                  fontSize: 13,
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r)',
                  background: 'var(--bg-page)',
                  color: 'var(--text-strong)',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="login-password"
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-default)',
                  marginBottom: 6,
                }}
              >
                비밀번호
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="비밀번호를 입력하십시오"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 10px',
                  fontSize: 13,
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r)',
                  background: 'var(--bg-page)',
                  color: 'var(--text-strong)',
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <p
                role="alert"
                style={{
                  fontSize: 12,
                  color: 'var(--danger)',
                  marginBottom: 14,
                  marginTop: -8,
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: 600,
                background: 'var(--brand-primary)',
                color: 'var(--white)',
                border: 'none',
                borderRadius: 'var(--r)',
                cursor: 'pointer',
                marginBottom: 12,
              }}
            >
              로그인
            </button>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
              }}
            >
              <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--text-mute)', textDecoration: 'none' }}>
                회원가입
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--text-mute)', textDecoration: 'none' }}>
                비밀번호 재설정
              </a>
            </div>
          </form>
        </div>

        {/* Guest line */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 12,
            fontSize: 12,
            color: 'var(--text-mute)',
          }}
        >
          계정 없이 파일을 분석하시겠습니까?{' '}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/') }}
            style={{
              color: 'var(--brand-primary)',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            비회원으로 계속하기 →
          </a>
        </div>
      </div>
    </div>
  )
}
