import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAthletes, getSchools, deleteAthlete } from '../api'
import type { AthleteWithStats } from '../types'
import AthleteCard from '../components/AthleteCard'
import AthleteModal from '../components/AthleteModal'


export default function AthletesPage() {
  const navigate = useNavigate()
  const [athletes, setAthletes] = useState<AthleteWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [allSchools, setAllSchools] = useState<string[]>([])
  const [selectedSchools, setSelectedSchools] = useState<Set<string>>(new Set())
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false)
  const allPositions = ['Guard', 'Forward', 'Centre']
  const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set(allPositions))
  const [positionDropdownOpen, setPositionDropdownOpen] = useState(false)
  const [allDivisions, setAllDivisions] = useState<string[]>([])
  const [selectedDivisions, setSelectedDivisions] = useState<Set<string>>(new Set())
  const [divisionDropdownOpen, setDivisionDropdownOpen] = useState(false)
  const [showNoStats, setShowNoStats] = useState(true)
  const [dateMin, setDateMin] = useState(0)
  const [dateMax, setDateMax] = useState(0)
  const [dateStart, setDateStart] = useState(0)
  const [dateEnd, setDateEnd] = useState(0)
  const [sortKey, setSortKey] = useState<string>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [modalAthlete, setModalAthlete] = useState<AthleteWithStats | null>(null)

  useEffect(() => {
    Promise.all([getAthletes(), getSchools()])
      .then(([athleteData, schoolData]) => {
        setAthletes(athleteData)
        const names = schoolData.map(s => s.name).sort()
        setAllSchools(names)
        setSelectedSchools(new Set(names))
        const divs = [...new Set(athleteData.map(a => a.division).filter(Boolean))].sort()
        setAllDivisions(divs)
        setSelectedDivisions(new Set(divs))
        const dates = athleteData.map(a => a.gameDate).filter(Boolean).map(d => new Date(d).getTime())
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

  const closeAllDropdowns = () => {
    setPositionDropdownOpen(false)
    setSchoolDropdownOpen(false)
    setDivisionDropdownOpen(false)
  }

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Delete this athlete and all their records?')
    if (!confirmed) return
    await deleteAthlete(id)
    setAthletes(prev => prev.filter(a => a.id !== id))
  }

  const toTime = (d: string) => new Date(d).getTime()

  const filtered = athletes
    .filter(a => selectedPositions.has(a.position))
    .filter(a => selectedSchools.has(a.highSchool))
    .filter(a => selectedDivisions.has(a.division))
    .filter(a => {
      if (a.points == null) return showNoStats
      if (!a.gameDate) return showNoStats
      const t = toTime(a.gameDate)
      return t >= dateStart && t <= dateEnd
    })
    .sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name':    cmp = a.name.localeCompare(b.name); break
        case 'id':      cmp = a.id - b.id; break
        case 'points':  cmp = (a.points ?? 0) - (b.points ?? 0); break
        case 'rebounds': cmp = (a.rebounds ?? 0) - (b.rebounds ?? 0); break
        case 'assists':  cmp = (a.assists ?? 0) - (b.assists ?? 0); break
        case 'steals':   cmp = (a.steals ?? 0) - (b.steals ?? 0); break
        case 'blocks':   cmp = (a.blocks ?? 0) - (b.blocks ?? 0); break
        default:         cmp = 0
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

  if (loading) return <p className="page" style={{ padding: '2rem' }}>Loading...</p>

  return (
    <div className="page">
      {/* header row */}
      <div className="page-header">
        <h1>Athletes</h1>
        <button className="btn btn-primary" onClick={() => navigate('/athletes/new')}>
          + Add Athlete
        </button>
      </div>

      {/* filter bar */}
      <div className="filter-bar">
        {/* position dropdown */}
        <div className="filter-group">
          <button className="filter-btn" onClick={() => { setPositionDropdownOpen(prev => !prev); setSchoolDropdownOpen(false); setDivisionDropdownOpen(false) }}>
            <span className="filter-label">Position</span>
            {selectedPositions.size === allPositions.length
              ? 'All'
              : selectedPositions.size === 0
                ? 'None'
                : `${selectedPositions.size}`}
            {positionDropdownOpen ? ' ▲' : ' ▼'}
          </button>
          {positionDropdownOpen && (
            <div className="filter-dropdown">
              <label className="select-all">
                <input
                  type="checkbox"
                  checked={selectedPositions.size === allPositions.length}
                  onChange={() => {
                    if (selectedPositions.size === allPositions.length) setSelectedPositions(new Set())
                    else setSelectedPositions(new Set(allPositions))
                  }}
                /> Select All
              </label>
              <hr />
              {allPositions.map(p => (
                <label key={p}>
                  <input
                    type="checkbox"
                    checked={selectedPositions.has(p)}
                    onChange={() => {
                      setSelectedPositions(prev => {
                        const next = new Set(prev)
                        if (next.has(p)) next.delete(p)
                        else next.add(p)
                        return next
                      })
                    }}
                  /> {p}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* school dropdown */}
        <div className="filter-group">
          <button className="filter-btn" onClick={() => { setSchoolDropdownOpen(prev => !prev); setPositionDropdownOpen(false); setDivisionDropdownOpen(false) }}>
            <span className="filter-label">School</span>
            {selectedSchools.size === allSchools.length
              ? 'All'
              : selectedSchools.size === 0
                ? 'None'
                : `${selectedSchools.size}`}
            {schoolDropdownOpen ? ' ▲' : ' ▼'}
          </button>
          {schoolDropdownOpen && (
            <div className="filter-dropdown" style={{ minWidth: '280px' }}>
              <label className="select-all">
                <input
                  type="checkbox"
                  checked={selectedSchools.size === allSchools.length}
                  onChange={() => {
                    if (selectedSchools.size === allSchools.length) setSelectedSchools(new Set())
                    else setSelectedSchools(new Set(allSchools))
                  }}
                /> Select All
              </label>
              <hr />
              {allSchools.map(s => (
                <label key={s}>
                  <input
                    type="checkbox"
                    checked={selectedSchools.has(s)}
                    onChange={() => {
                      setSelectedSchools(prev => {
                        const next = new Set(prev)
                        if (next.has(s)) next.delete(s)
                        else next.add(s)
                        return next
                      })
                    }}
                  /> {s}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* division dropdown */}
        <div className="filter-group">
          <button className="filter-btn" onClick={() => { setDivisionDropdownOpen(prev => !prev); setPositionDropdownOpen(false); setSchoolDropdownOpen(false) }}>
            <span className="filter-label">Division</span>
            {selectedDivisions.size === allDivisions.length
              ? 'All'
              : selectedDivisions.size === 0
                ? 'None'
                : `${selectedDivisions.size}`}
            {divisionDropdownOpen ? ' ▲' : ' ▼'}
          </button>
          {divisionDropdownOpen && (
            <div className="filter-dropdown">
              <label className="select-all">
                <input
                  type="checkbox"
                  checked={selectedDivisions.size === allDivisions.length}
                  onChange={() => {
                    if (selectedDivisions.size === allDivisions.length) setSelectedDivisions(new Set())
                    else setSelectedDivisions(new Set(allDivisions))
                  }}
                /> Select All
              </label>
              <hr />
              {allDivisions.map(d => (
                <label key={d}>
                  <input
                    type="checkbox"
                    checked={selectedDivisions.has(d)}
                    onChange={() => {
                      setSelectedDivisions(prev => {
                        const next = new Set(prev)
                        if (next.has(d)) next.delete(d)
                        else next.add(d)
                        return next
                      })
                    }}
                  /> {d}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* show/hide no stats */}
        <button
          className="filter-btn"
          onClick={() => { setShowNoStats(prev => !prev); closeAllDropdowns() }}
        >
          {showNoStats ? 'Hide No Stats' : 'Show No Stats'}
        </button>

        {/* date range slider */}
        {dateMin !== dateMax && (
          <div className="date-range">
            <span className="filter-label">Date</span>
            <span className="date-range-label">{new Date(dateStart).toLocaleDateString()}</span>
            <div className="date-range-track">
              <input
                type="range"
                min={dateMin}
                max={dateMax}
                value={dateStart}
                onChange={e => setDateStart(Math.min(Number(e.target.value), dateEnd))}
                className="range-thumb"
                style={{ zIndex: 2 }}
              />
              <input
                type="range"
                min={dateMin}
                max={dateMax}
                value={dateEnd}
                onChange={e => setDateEnd(Math.max(Number(e.target.value), dateStart))}
                className="range-thumb"
                style={{ zIndex: 1 }}
              />
            </div>
            <span className="date-range-label">{new Date(dateEnd).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* sort bar */}
      <div className="sort-bar">
        <span className="filter-label">Sort by</span>
        {[
          { key: 'name', label: 'Name' },
          { key: 'id', label: 'ID' },
          { key: 'points', label: 'Points' },
          { key: 'rebounds', label: 'Rebounds' },
          { key: 'assists', label: 'Assists' },
          { key: 'steals', label: 'Steals' },
          { key: 'blocks', label: 'Blocks' },
        ].map(opt => (
          <button
            key={opt.key}
            className={`sort-btn ${sortKey === opt.key ? 'active' : ''}`}
            onClick={() => setSortKey(opt.key)}
          >
            {opt.label}
          </button>
        ))}
        <button className="sort-btn" onClick={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')}>
          {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>
      </div>

      {/* card grid */}
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

      {modalAthlete && (
        <AthleteModal athlete={modalAthlete} onClose={() => setModalAthlete(null)} />
      )}
    </div>
  )
}
