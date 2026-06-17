import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactPaginatePkg from 'react-paginate'
import PageHead from '../components/chrome/PageHead'
import Icon from '../components/ui/Icon'
import VerdictTag from '../components/ui/VerdictTag'
import { useHistory } from '../hooks/useHistory'

// react-paginate is CJS ({ default: fn }); Vite ESM interop may not unwrap it → normalize
const ReactPaginate = ReactPaginatePkg.default || ReactPaginatePkg

// Deterministic 30-point sparkline data (no Math.random)
const SPARK_TOTAL = [
  14, 18, 12, 22, 17, 25, 20, 15, 28, 19,
  23, 16, 30, 21, 18, 27, 24, 13, 26, 22,
  19, 31, 17, 25, 20, 29, 23, 18, 27, 24,
]

const SPARK_MAL = [
  4, 6, 3, 8, 5, 9, 7, 4, 11, 6,
  8, 5, 12, 7, 6, 10, 9, 3, 10, 8,
  6, 13, 5, 9, 7, 11, 8, 5, 10, 9,
]

function totalSparkPoints() {
  return SPARK_TOTAL.map((v, i) => {
    const x = (i / 29) * 280
    const max = Math.max(...SPARK_TOTAL)
    const y = 30 - (v / max) * 26
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

function verdictColor(verdict) {
  if (verdict === 'malicious') return 'var(--danger)'
  if (verdict === 'suspicious') return 'var(--warning)'
  return 'var(--success)'
}

function fileTypeLabel(category) {
  const MAP = {
    pdf: 'PDF',
    pe: 'EXE',
    office: 'DOC',
    archive: 'ZIP',
    url: 'URL',
  }
  return MAP[category] ?? category.toUpperCase()
}

function formatAnalyzedAt(raw) {
  try {
    const d = new Date(raw)
    const y = d.getFullYear()
    const mo = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${mo}-${day} ${h}:${m}`
  } catch {
    return raw
  }
}

export default function History() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useHistory(page, filter)

  const displayItems = search.trim()
    ? (data?.items ?? []).filter((item) =>
        item.fileName.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : (data?.items ?? [])

  const totalItems = data?.totalItems ?? 0
  const totalPages = data?.totalPages ?? 1
  const currentPage = data?.page ?? page

  function handleFilterChange(next) {
    setFilter(next)
    setPage(1)
  }

  function handleRowClick(item) {
    if (!item.hasFixture) return
    navigate('/scans/' + item.scanId)
  }

  function handlePageChange({ selected }) {
    setPage(selected + 1)
  }

  const pageStart = totalItems === 0 ? 0 : (currentPage - 1) * (data?.pageSize ?? 20) + 1
  const pageEnd = Math.min(currentPage * (data?.pageSize ?? 20), totalItems)

  return (
    <div className="page2">
      <PageHead
        eyebrow="HISTORY"
        title="분석 기록"
        lead="이전 분석 결과를 검색하고 필터링할 수 있습니다. 데이터는 90일간 보관됩니다."
        actions={
          <>
            <button className="btn2 btn2-outline btn2-sm">
              <Icon name="download" size={13} /> CSV 내보내기
            </button>
            <button
              className="btn2 btn2-primary btn2-sm"
              onClick={() => navigate('/upload')}
            >
              새 분석
            </button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="hist-stats">
        <div className="hist-kpi">
          <div className="lbl">전체 분석 (90일)</div>
          <div className="row">
            <div className="val">7,821</div>
            <div className="delta">7일 평균 247건/일</div>
          </div>
          <svg className="hist-kpi-spark" viewBox="0 0 280 32" preserveAspectRatio="none">
            <polyline className="spark-line" points={totalSparkPoints()} />
          </svg>
        </div>

        <div className="hist-kpi">
          <div className="lbl">악성 탐지 (90일)</div>
          <div className="row">
            <div className="val">1,847</div>
            <div className="delta up">▲ 12% vs 직전 90일</div>
          </div>
          <svg className="hist-kpi-spark" viewBox="0 0 280 32" preserveAspectRatio="none">
            {SPARK_MAL.map((v, i) => {
              const max = Math.max(...SPARK_MAL)
              const height = (v / max) * 26
              const slot = 280 / SPARK_MAL.length
              return (
                <rect
                  key={i}
                  className="spark-bar danger"
                  x={i * slot}
                  y={30 - height}
                  width={slot - 2}
                  height={height}
                />
              )
            })}
          </svg>
        </div>
      </div>

      {/* Toolbar */}
      <div className="hist-toolbar">
        <div className="hist-tabs">
          <button
            className={'hist-tab' + (filter === 'all' ? ' is-active' : '')}
            onClick={() => handleFilterChange('all')}
          >
            전체
          </button>
          <button
            className={'hist-tab' + (filter === 'malicious' ? ' is-active' : '')}
            onClick={() => handleFilterChange('malicious')}
          >
            악성
          </button>
          <button
            className={'hist-tab' + (filter === 'suspicious' ? ' is-active' : '')}
            onClick={() => handleFilterChange('suspicious')}
          >
            의심
          </button>
          <button
            className={'hist-tab' + (filter === 'clean' ? ' is-active' : '')}
            onClick={() => handleFilterChange('clean')}
          >
            정상
          </button>
        </div>
        <div className="hist-search">
          <Icon name="search" size={12} color="var(--text-mute)" />
          <input
            placeholder="현재 페이지 파일명으로 검색…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
      </div>

      {/* Table */}
      <table className="tbl2">
        <thead>
          <tr>
            <th style={{ width: 90 }}>ID</th>
            <th>파일</th>
            <th style={{ width: 80 }}>크기</th>
            <th style={{ width: 100 }}>판정</th>
            <th style={{ width: 140 }}>신뢰도</th>
            <th style={{ width: 100 }}>모델</th>
            <th style={{ width: 130 }}>분석 시각</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-mute)' }}>
                불러오는 중…
              </td>
            </tr>
          )}
          {!isLoading && displayItems.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-mute)' }}>
                결과가 없습니다.
              </td>
            </tr>
          )}
          {!isLoading &&
            displayItems.map((item) => {
              const clickable = item.hasFixture
              const confPct =
                item.confidence != null ? item.confidence * 100 : null
              const thrPct = Math.round(item.threshold * 100)

              return (
                <tr
                  key={item.scanId}
                  className={
                    'body-row' +
                    (!clickable ? ' row-muted' : '') +
                    (item.verdict === 'malicious' ? ' is-mal' : '')
                  }
                  onClick={clickable ? () => handleRowClick(item) : undefined}
                  style={{ cursor: clickable ? 'pointer' : 'default' }}
                  {...(clickable && {
                    tabIndex: 0,
                    role: 'button',
                    'aria-label': `${item.fileName} 분석 결과 보기`,
                    onKeyDown: (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        if (e.key === ' ') e.preventDefault()
                        handleRowClick(item)
                      }
                    },
                  })}
                >
                  <td>
                    <span className="id">{item.scanId.slice(0, 8)}</span>
                  </td>
                  <td>
                    <div className="file-cell">
                      <div className="ftype">{fileTypeLabel(item.fileCategory)}</div>
                      <span className="file-name">{item.fileName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="meta">{item.sizeLabel}</span>
                  </td>
                  <td>
                    <VerdictTag verdict={item.verdict} />
                  </td>
                  <td>
                    {confPct == null ? (
                      <span className="meta" style={{ color: 'var(--text-faint)' }}>
                        —
                      </span>
                    ) : (
                      <div className="hist-conf">
                        <div className="ct">
                          <div
                            className="cf"
                            style={{
                              width: confPct + '%',
                              background: verdictColor(item.verdict),
                            }}
                          />
                          <div
                            className="thr"
                            style={{ left: thrPct + '%' }}
                          />
                        </div>
                        <span className="pct">{confPct.toFixed(1)}%</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="meta">{item.modelId}</span>
                  </td>
                  <td>
                    <span className="meta">{formatAnalyzedAt(item.analyzedAt)}</span>
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination2">
        <span>
          {totalItems === 0 ? '0건' : `${pageStart}–${pageEnd} / ${totalItems.toLocaleString()}건`}
        </span>
        <ReactPaginate
          pageCount={totalPages}
          forcePage={currentPage - 1}
          onPageChange={handlePageChange}
          pageRangeDisplayed={3}
          marginPagesDisplayed={1}
          previousLabel={<Icon name="caret-left" size={10} />}
          nextLabel={<Icon name="caret-right" size={10} />}
          breakLabel="…"
          containerClassName="pg-btns"
          pageClassName="pg-btn"
          pageLinkClassName="pg-btn-link"
          activeClassName="is-active"
          previousClassName="pg-btn"
          nextClassName="pg-btn"
          breakClassName="pg-btn"
          disabledClassName="is-disabled"
        />
      </div>
    </div>
  )
}
