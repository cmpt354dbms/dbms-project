import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAthletes, deleteAthlete, getAthleteGames, getAthletesFullFilmCoverage, getTournamentSummary } from '../api'
import type { AthleteWithStats } from '../types'
import PlayerCardBrief from '../components/PlayerCardBrief'
import PlayerCard from '../components/PlayerCard'
import CheckboxDropdown from '../components/CheckboxDropdown'
import DateRangeSlider from '../components/DateRangeSlider'

const SORT_OPTIONS = [
  { key: 'name',     label: 'Name' },
  { key: 'jerseyNumber', label: 'Jersey #' },
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

  // ─── Filter: film coverage ────────────────────────────────────
  const [filmOnly, setFilmOnly] = useState(false)
  const [filmCoverageIDs, setFilmCoverageIDs] = useState<Set<number>>(new Set())

  // ─── Sorting ──────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState<string>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // ─── Modal ────────────────────────────────────────────────────
  const [playerCard, setPlayerCard] = useState<AthleteWithStats | null>(null)
  const [playerGames, setPlayerGames] = useState<AthleteWithStats[]>([])
  const [loadingPlayerGames, setLoadingPlayerGames] = useState(false)

  const [summary, setSummary] = useState<{
      totalAthletes: number
      totalGames: number
      highestPoints: number
      avgPoints: number
      avgRebounds: number
      avgAssists: number
      avgSteals: number
    } | null>(null)

  // ─── Data Fetching ────────────────────────────────────────────
useEffect(() => {
  getAthletes()
    .then(athleteData => {
      setAthletes(athleteData)
      const names = [...new Set(athleteData.map(a => a.highSchool))].sort()
      setAllSchools(names)
      setSelectedSchools(new Set(names))
      const divs = [...new Set(athleteData.map(a => a.division).filter(Boolean))] as string[]
      divs.sort()
      setAllDivisions(divs)
      setSelectedDivisions(new Set(divs))
      const dates = athleteData
        .map(a => a.gameDate)
        .filter((d): d is string => Boolean(d))
        .map(d => new Date(d).getTime())
      if (dates.length > 0) {
        const min = Math.min(...dates)
        const max = Math.max(...dates)
        setDateMin(min)
        setDateMax(max)
        setDateStart(min)
        setDateEnd(max)
      }

      // fetch film coverage IDs for division query filter
      getAthletesFullFilmCoverage().then(data => {
        setFilmCoverageIDs(new Set(data.map(a => a.id)))
      })

      // fetch tournament summary for stats banner
      getTournamentSummary().then(data => {
        setSummary(data)
      })
    })
    .finally(() => setLoading(false))
}, [])

  // ─── Handlers ─────────────────────────────────────────────────

  const toggleDropdown = (name: string) => {
    setOpenDropdown(prev => (prev === name ? null : name))
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this athlete and all their records?')) return
    await deleteAthlete(id)
    setAthletes(prev => prev.filter(a => a.id !== id))
  }

  const openPlayerCard = async (athlete: AthleteWithStats) => {
    setPlayerCard(athlete)
    setPlayerGames([])
    setLoadingPlayerGames(true)
    try {
      const games = await getAthleteGames(athlete.id)
      setPlayerGames(games.filter(g => g.points != null))
    } finally {
      setLoadingPlayerGames(false)
    }
  }

  const closePlayerCard = () => {
    setPlayerCard(null)
    setPlayerGames([])
    setLoadingPlayerGames(false)
  }

  // ─── Filtering & Sorting ──────────────────────────────────────
  const toTime = (d: string) => new Date(d).getTime()

  const filtered = athletes
    .filter(a => !filmOnly || filmCoverageIDs.has(a.id))
    .filter(a => selectedPositions.has(a.position))
    .filter(a => selectedSchools.has(a.highSchool))
    .filter(a => selectedDivisions.has(a.division))
    .filter(a => {
      if (a.points == null || !a.gameDate) return showNoStats
      const t = toTime(a.gameDate)
      return t >= dateStart && t <= dateEnd
    })
    .sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name':     cmp = a.name.localeCompare(b.name); break
        case 'jerseyNumber': cmp = a.jerseyNumber - b.jerseyNumber; break
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
      {/* page title + add button */}
      <div className="page-header">
        <h1>Athletes</h1>
        <button className="btn btn-primary" onClick={() => navigate('/athletes/new')}>
          + Add Athlete
        </button>
      </div>


      {/* ── Tournament Summary Banner ──────────────────────────── */}
      {summary && (
        <div className="stats-banner">
          <div className="stats-banner-title">Athlete Stats Summary</div>
          <div className="stats-banner-item">
            <span className="stats-banner-val">{summary.totalAthletes}</span>
            <span className="stats-banner-lbl">Athletes</span>
          </div>
          <div className="stats-banner-item">
            <span className="stats-banner-val">{summary.totalGames}</span>
            <span className="stats-banner-lbl">Games</span>
          </div>
          <div className="stats-banner-item">
            <span className="stats-banner-val">{summary.highestPoints}</span>
            <span className="stats-banner-lbl">Top Score</span>
          </div>
          <div className="stats-banner-item">
            <span className="stats-banner-val">{summary.avgPoints}</span>
            <span className="stats-banner-lbl">Avg PTS</span>
          </div>
          <div className="stats-banner-item">
            <span className="stats-banner-val">{summary.avgRebounds}</span>
            <span className="stats-banner-lbl">Avg REB</span>
          </div>
          <div className="stats-banner-item">
            <span className="stats-banner-val">{summary.avgAssists}</span>
            <span className="stats-banner-lbl">Avg AST</span>
          </div>
          <div className="stats-banner-item">
            <span className="stats-banner-val">{summary.avgSteals}</span>
            <span className="stats-banner-lbl">Avg STL</span>
          </div>
        </div>
      )}

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

        <button
          className="filter-btn"
          onClick={() => { setShowNoStats(prev => !prev); setOpenDropdown(null) }}
        >
          {showNoStats ? 'Hide No Stats' : 'Show No Stats'}
        </button>

        <button
          className="filter-btn"
          onClick={() => { setFilmOnly(prev => !prev); setOpenDropdown(null) }}
        >
          {filmOnly ? 'All Athletes' : 'Has Game Film'}
        </button>

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
      <div className="card-grid">
        {filtered.map(a => (
          <PlayerCardBrief
            key={a.id}
            athlete={a}
            onClick={() => openPlayerCard(a)}
            onEdit={() => navigate(`/athletes/${a.id}/edit`)}
            onDelete={() => handleDelete(a.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && <p className="empty-state">No athletes found.</p>}

      {/* ── Detail Modal ───────────────────────────────────────── */}
      {playerCard && (
        <div className="modal-overlay" onClick={closePlayerCard}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={closePlayerCard}>
                Close
              </button>
            </div>
            {loadingPlayerGames ? (
              <p>Loading games...</p>
            ) : (
              <PlayerCard
                games={playerGames.length > 0 ? playerGames : [playerCard]}
                onClose={closePlayerCard}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}