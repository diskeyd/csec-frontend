import { useState } from 'react'
import { Routes, Route, Outlet, Navigate } from 'react-router-dom'
import Sidebar from './components/chrome/Sidebar'
import Upload from './pages/Upload'
import Result from './pages/Result'
import Report from './pages/Report'
import History from './pages/History'
import Models from './pages/Models'
import Login from './pages/Login'

function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="app">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Upload />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/scans/:id" element={<Result />} />
        <Route path="/scans/:id/report" element={<Report />} />
        <Route path="/history" element={<History />} />
        <Route path="/models" element={<Models />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
