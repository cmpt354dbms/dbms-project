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
      })
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Delete this athlete and all their records?')
    if (!confirmed) return
    await deleteAthlete(id)
    setAthletes(prev => prev.filter(a => a.id !== id))
  }

  const filtered = athletes
    .filter(a => selectedPositions.has(a.position))
    .filter(a => selectedSchools.has(a.highSchool))
    .filter(a => selectedDivisions.has(a.division))
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

  if (loading) return <p>Loading...</p>

  // this function returns the "html + css" code rather than seperate html/css files
  return (
    <div>
      <h1>Athletes</h1>

      {/* add athlete button */}
      <button onClick={() => navigate('/athletes/new')}>
        + Add Athlete
      </button>

      {/* filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {/* position dropdown */}
        <div style={{ position: 'relative' }}>
          <strong>Position: </strong>
          <button onClick={() => { setPositionDropdownOpen(prev => !prev); setSchoolDropdownOpen(false); setDivisionDropdownOpen(false) }}>
            {selectedPositions.size === allPositions.length
              ? 'All Positions'
              : selectedPositions.size === 0
                ? 'None Selected'
                : `${selectedPositions.size} Selected`}
            {positionDropdownOpen ? ' ▲' : ' ▼'}
          </button>
          {positionDropdownOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, zIndex: 10,
              background: 'white', border: '1px solid #ccc', borderRadius: '4px',
              padding: '0.5rem', minWidth: '180px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedPositions.size === allPositions.length}
                  onChange={() => {
                    if (selectedPositions.size === allPositions.length) setSelectedPositions(new Set())
                    else setSelectedPositions(new Set(allPositions))
                  }}
                />{' '}Select All
              </label>
              <hr style={{ margin: '0.25rem 0' }} />
              {allPositions.map(p => (
                <label key={p} style={{ display: 'block', marginBottom: '0.25rem', cursor: 'pointer' }}>
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
                  />{' '}{p}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* school dropdown */}
        <div style={{ position: 'relative' }}>
          <strong>School: </strong>
          <button onClick={() => { setSchoolDropdownOpen(prev => !prev); setPositionDropdownOpen(false); setDivisionDropdownOpen(false) }}>
            {selectedSchools.size === allSchools.length
              ? 'All Schools'
              : selectedSchools.size === 0
                ? 'None Selected'
                : `${selectedSchools.size} Selected`}
            {schoolDropdownOpen ? ' ▲' : ' ▼'}
          </button>
          {schoolDropdownOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, zIndex: 10,
              background: 'white', border: '1px solid #ccc', borderRadius: '4px',
              padding: '0.5rem', minWidth: '250px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedSchools.size === allSchools.length}
                  onChange={() => {
                    if (selectedSchools.size === allSchools.length) setSelectedSchools(new Set())
                    else setSelectedSchools(new Set(allSchools))
                  }}
                />{' '}Select All
              </label>
              <hr style={{ margin: '0.25rem 0' }} />
              {allSchools.map(s => (
                <label key={s} style={{ display: 'block', marginBottom: '0.25rem', cursor: 'pointer' }}>
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
                  />{' '}{s}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* division dropdown */}
        <div style={{ position: 'relative' }}>
          <strong>Division: </strong>
          <button onClick={() => { setDivisionDropdownOpen(prev => !prev); setPositionDropdownOpen(false); setSchoolDropdownOpen(false) }}>
            {selectedDivisions.size === allDivisions.length
              ? 'All Divisions'
              : selectedDivisions.size === 0
                ? 'None Selected'
                : `${selectedDivisions.size} Selected`}
            {divisionDropdownOpen ? ' ▲' : ' ▼'}
          </button>
          {divisionDropdownOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, zIndex: 10,
              background: 'white', border: '1px solid #ccc', borderRadius: '4px',
              padding: '0.5rem', minWidth: '150px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedDivisions.size === allDivisions.length}
                  onChange={() => {
                    if (selectedDivisions.size === allDivisions.length) setSelectedDivisions(new Set())
                    else setSelectedDivisions(new Set(allDivisions))
                  }}
                />{' '}Select All
              </label>
              <hr style={{ margin: '0.25rem 0' }} />
              {allDivisions.map(d => (
                <label key={d} style={{ display: 'block', marginBottom: '0.25rem', cursor: 'pointer' }}>
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
                  />{' '}{d}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* sort controls */}
      <div style={{ marginBottom: '1rem' }}>
        <strong>Sort by: </strong>
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
            onClick={() => setSortKey(opt.key)}
            style={{ fontWeight: sortKey === opt.key ? 'bold' : 'normal', marginRight: '0.25rem' }}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')}
          style={{ marginLeft: '0.5rem' }}
        >
          {sortDir === 'asc' ? '↑ Ascending' : '↓ Descending'}
        </button>
      </div>

      {/* athlete card grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem',
      }}>
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

      {filtered.length === 0 && <p>No athletes found.</p>}

      {modalAthlete && (
        <AthleteModal athlete={modalAthlete} onClose={() => setModalAthlete(null)} />
      )}
    </div>
  )
}