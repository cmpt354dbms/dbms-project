import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAthletes, getSchools, deleteAthlete } from '../api'
import type { AthleteWithStats } from '../types'
import AthleteCard from '../components/AthleteCard'
import AthleteModal from '../components/AthleteModal'
import CheckboxDropdown from '../components/CheckboxDropdown'
import DateRangeSlider from '../components/DateRangeSlider'

/** Sort options available for the athlete grid */
const SORT_OPTIONS = [
  { key: 'name',     label: 'Name' },
  { key: 'id',       label: 'ID' },
  { key: 'points',   label: 'Points' },
  { key: 'rebounds',  label: 'Rebounds' },
  { key: 'assists',   label: 'Assists' },
  { key: 'steals',    label: 'Steals' },
  { key: 'blocks',    label: 'Blocks' },
]

const ALL_POSITIONS = ['Guard', 'Forward', 'Centre']


export default function AthletesPage() {
  const navigate = useNavigate()

  // ─── Data ─────────────────────────────────────────────────────
  const [athletes, setAthletes] = useState<AthleteWithStats[]>([])
  const [loading, setLoading] = useState(true)

  // ─── Filter: checkbox dropdowns ───────────────────────────────
  const [allSchools, setAllSchools] = useState<string[]>([])
  const [selectedSchools, setSelectedSchools] = useState<Set<string>>(new Set())
  const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set(ALL_POSITIONS))
  const [allDivisions, setAllDivisions] = useState<string[]>([])
  const [selectedDivisions, setSelectedDivisions] = useState<Set<string>>(new Set())

  // tracks which dropdown (if any) is currently open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // ─── Filter: no-stats toggle & date range ─────────────────────
  const [showNoStats, setShowNoStats] = useState(true)
  const [dateMin, setDateMin] = useState(0)
  const [dateMax, setDateMax] = useState(0)
  const [dateStart, setDateStart] = useState(0)
  const [dateEnd, setDateEnd] = useState(0)

  // ─── Sorting ──────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState<string>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // ─── Modal ────────────────────────────────────────────────────
  const [modalAthlete, setModalAthlete] = useState<AthleteWithStats | null>(null)

  // ─── Data Fetching ────────────────────────────────────────────
  // on mount, fetch athletes + schools in parallel, then derive
  // the unique divisions and date range from the athlete data
  useEffect(() => {
    Promise.all([getAthletes(), getSchools()])
      .then(([athleteData, schoolData]) => {
        setAthletes(athleteData)

        // schools come from the HighSchool table (not derived from athletes)
        const names = schoolData.map(s => s.name).sort()
        setAllSchools(names)
        setSelectedSchools(new Set(names))

        // divisions are derived from athlete data
        const divs = [...new Set(athleteData.map(a => a.division).filter(Boolean))].sort()
        setAllDivisions(divs)
        setSelectedDivisions(new Set(divs))

        // date bounds for the range slider (epoch-ms timestamps)
        const dates = athleteData
          .map(a => a.gameDate)
          .filter(Boolean)
          .map(d => new Date(d).getTime())
        if (dates.length > 0) {
          const min = Math.min(...dates)
          const max = Math.max(...dates)
          setDateMin(min)
          setDateMax(max)
          setDateStart(min)
          setDateEnd(max)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  // ─── Handlers ─────────────────────────────────────────────────

  /** Open one dropdown and close the others */
  const toggleDropdown = (name: string) => {
    setOpenDropdown(prev => (prev === name ? null : name))
  }

  /** Delete an athlete after user confirmation */
  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this athlete and all their records?')) return
    await deleteAthlete(id)
    setAthletes(prev => prev.filter(a => a.id !== id))
  }

  // ─── Filtering & Sorting ──────────────────────────────────────
  // chain: position → school → division → stats/date → sort
  const toTime = (d: string) => new Date(d).getTime()

  const filtered = athletes
    .filter(a => selectedPositions.has(a.position))
    .filter(a => selectedSchools.has(a.highSchool))
    .filter(a => selectedDivisions.has(a.division))
    .filter(a => {
      // athletes with no game stats are controlled by the toggle
      if (a.points == null || !a.gameDate) return showNoStats
      // athletes with stats are filtered by the date range
      const t = toTime(a.gameDate)
      return t >= dateStart && t <= dateEnd
    })
    .sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name':     cmp = a.name.localeCompare(b.name); break
        case 'id':       cmp = a.id - b.id; break
        case 'points':   cmp = (a.points ?? 0) - (b.points ?? 0); break
        case 'rebounds':  cmp = (a.rebounds ?? 0) - (b.rebounds ?? 0); break
        case 'assists':   cmp = (a.assists ?? 0) - (b.assists ?? 0); break
        case 'steals':    cmp = (a.steals ?? 0) - (b.steals ?? 0); break
        case 'blocks':    cmp = (a.blocks ?? 0) - (b.blocks ?? 0); break
        default:          cmp = 0
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

  // ─── Render ───────────────────────────────────────────────────

  if (loading) return <p className="page">Loading...</p>

  return (
    <div className="page">
      {/* page title + add button (top-right) */}
      <div className="page-header">
        <h1>Athletes</h1>
        <button className="btn btn-primary" onClick={() => navigate('/athletes/new')}>
          + Add Athlete
        </button>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────── */}
      <div className="filter-bar">
        <CheckboxDropdown
          label="Position"
          allItems={ALL_POSITIONS}
          selectedItems={selectedPositions}
          onSelectionChange={setSelectedPositions}
          isOpen={openDropdown === 'position'}
          onToggle={() => toggleDropdown('position')}
        />
        <CheckboxDropdown
          label="School"
          allItems={allSchools}
          selectedItems={selectedSchools}
          onSelectionChange={setSelectedSchools}
          isOpen={openDropdown === 'school'}
          onToggle={() => toggleDropdown('school')}
          minWidth="280px"
        />
        <CheckboxDropdown
          label="Division"
          allItems={allDivisions}
          selectedItems={selectedDivisions}
          onSelectionChange={setSelectedDivisions}
          isOpen={openDropdown === 'division'}
          onToggle={() => toggleDropdown('division')}
        />

        {/* toggle to show/hide athletes without game stats */}
        <button
          className="filter-btn"
          onClick={() => { setShowNoStats(prev => !prev); setOpenDropdown(null) }}
        >
          {showNoStats ? 'Hide No Stats' : 'Show No Stats'}
        </button>

        {/* dual-thumb slider to narrow the game-date window */}
        <DateRangeSlider
          dateMin={dateMin}
          dateMax={dateMax}
          dateStart={dateStart}
          dateEnd={dateEnd}
          onStartChange={setDateStart}
          onEndChange={setDateEnd}
        />
      </div>

      {/* ── Sort Bar ───────────────────────────────────────────── */}
      <div className="sort-bar">
        <span className="filter-label">Sort by</span>
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.key}
            className={`sort-btn ${sortKey === opt.key ? 'active' : ''}`}
            onClick={() => setSortKey(opt.key)}
          >
            {opt.label}
          </button>
        ))}
        <button
          className="sort-btn"
          onClick={() => setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))}
        >
          {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>
      </div>

      {/* ── Athlete Card Grid ──────────────────────────────────── */}
      {/* grid flows left→right, top→bottom, matching the sort order */}
      <div className="card-grid">
        {filtered.map(a => (
          <AthleteCard
            key={a.id}
            athlete={a}
            onClick={() => setModalAthlete(a)}
            onEdit={() => navigate(`/athletes/${a.id}/edit`)}
            onDelete={() => handleDelete(a.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && <p className="empty-state">No athletes found.</p>}

      {/* ── Detail Modal ───────────────────────────────────────── */}
      {modalAthlete && (
        <AthleteModal athlete={modalAthlete} onClose={() => setModalAthlete(null)} />
      )}
    </div>
  )
}
