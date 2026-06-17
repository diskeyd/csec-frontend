import { useNavigate, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon'
import { useAuth } from '../../auth/AuthContext'

const NAV = [
  { to: '/', label: '파일 분석', icon: 'upload', match: (p) => p === '/' || p === '/upload' },
  { to: '/history', label: '분석기록', icon: 'list', match: (p) => p === '/history' },
  { to: '/models', label: '모델 정보', icon: 'cube', match: (p) => p === '/models' },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className={'sb' + (collapsed ? ' is-collapsed' : '')}>
      <div className="sb-brand">
        <div className="sb-mark">
          <img src="/csec-mark.svg" alt="CSEC" width="24" height="24" />
        </div>
        {!collapsed && <span className="sb-name">CSEC</span>}
      </div>

      <nav className="sb-nav">
        {NAV.map((item) => {
          const active = item.match(pathname)
          return (
            <button
              key={item.label}
              className={'sb-item' + (active ? ' is-active' : '')}
              onClick={() => navigate(item.to)}
              title={collapsed ? item.label : undefined}
            >
              <Icon name={item.icon} size={18} weight={active ? 'fill' : 'regular'} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="sb-spacer" />

      {!collapsed && !user && (
        <div className="sb-foot">
          <button
            className="btn btn-primary sb-login-btn"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </div>
      )}

      {!collapsed && user && (
        <div className="sb-foot">
          <div className="sb-user">
            <div className="sb-avatar">{user.initials}</div>
            <div style={{ lineHeight: 1.25, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: 'var(--text-strong)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>회원</div>
            </div>
            <button className="sb-icon-btn" title="로그아웃" onClick={handleLogout}>
              <Icon name="sign-out" size={13} />
            </button>
          </div>
        </div>
      )}

      <button
        className="sb-collapse"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? '펼치기' : '접기'}
      >
        <Icon name={collapsed ? 'caret-right' : 'caret-left'} size={11} />
      </button>
    </aside>
  )
}
