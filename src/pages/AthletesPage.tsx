import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAthletes, deleteAthlete } from '../api'
 // import type { Athlete } from '../types'
import type { AthleteWithStats } from '../types'


export default function AthletesPage() {
  const navigate = useNavigate()
  const [athletes, setAthletes] = useState<AthleteWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('All')
  const [expandedID, setExpandedID] = useState<number | null>(null)
  const [modalAthlete, setModalAthlete] = useState<AthleteWithStats | null>(null)

  useEffect(() => {
    getAthletes()
      .then(setAthletes)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Delete this athlete and all their records?')
    if (!confirmed) return
    await deleteAthlete(id)
    setAthletes(prev => prev.filter(a => a.id !== id))
  }

  const toggleExpand = (id: number) => {
    setExpandedID(prev => prev === id ? null : id)
  }

  const filtered = athletes.filter(a =>
    filter === 'All' ? true : a.position === filter
  )

  if (loading) return <p>Loading...</p>

  // this function returns the "html + css" code rather than seperate html/css files
  return (
    <div>
      <h1>Athletes</h1>

      {/* add athlete button */}
      <button onClick={() => navigate('/athletes/new')}>
        + Add Athlete
      </button>

      {/* position filter */}
      <div>
        {['All', 'Guard', 'Forward', 'Centre'].map(pos => (
          <button
            key={pos}
            onClick={() => setFilter(pos)}
            style={{ fontWeight: filter === pos ? 'bold' : 'normal' }}
          >
            {pos}
          </button>
        ))}
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>High School</th>
            <th>Division</th>
            <th>Position</th>
            <th>Stats</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(a => (
            <>
              <tr key={a.id}>
                <td>{a.id}</td>
                {/* clicking name opens modal */}
                <td>
                  <button onClick={() => setModalAthlete(a)}>
                    {a.name}
                  </button>
                </td>
                <td>{a.email}</td>
                <td>{a.highSchool}</td>
                <td>{a.division ?? '—'}</td>
                <td>{a.position ?? '—'}</td>
                <td>
                  {/* toggle inline stats */}
                  <button onClick={() => toggleExpand(a.id)}>
                    {expandedID === a.id ? 'Hide' : 'Show'}
                  </button>
                </td>
                <td>
                  <button onClick={() => navigate(`/athletes/${a.id}/edit`)}>Edit</button>
                  <button onClick={() => handleDelete(a.id)}>Delete</button>
                </td>
              </tr>

              {/* inline stats row */}
              {expandedID === a.id && (
                <tr key={`${a.id}-stats`}>
                  <td colSpan={8}>
                    {a.points != null ? (
                      <table>
                        <thead>
                          <tr>
                            <th>Game Date</th>
                            <th>PTS</th>
                            <th>REB</th>
                            <th>AST</th>
                            <th>STL</th>
                            <th>BLK</th>
                            <th>FOULS</th>
                            <th>FGM/FGA</th>
                            <th>3PM</th>
                            <th>FTM/FTA</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{a.gameDate ?? '—'}</td>
                            <td>{a.points}</td>
                            <td>{a.rebounds}</td>
                            <td>{a.assists}</td>
                            <td>{a.steals}</td>
                            <td>{a.blocks}</td>
                            <td>{a.fouls}</td>
                            <td>{a.shotsMade}/{a.shotsAttempted}</td>
                            <td>{a.threePointersMade}</td>
                            <td>{a.freeThrowsMade}/{a.freeThrowsAttempted}</td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <p>No game stats available.</p>
                    )}
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && <p>No athletes found.</p>}

      {/* extract as component */}
      {/* modal */}
      {modalAthlete && (
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', minWidth: '400px' }}>
            <h2>{modalAthlete.name}</h2>
            <p><strong>Email:</strong> {modalAthlete.email}</p>
            <p><strong>High School:</strong> {modalAthlete.highSchool}</p>
            <p><strong>Division:</strong> {modalAthlete.division ?? '—'}</p>
            <p><strong>Position:</strong> {modalAthlete.position ?? '—'}</p>
            <hr />
            <h3>Game Stats</h3>
            {modalAthlete.points != null ? (
              <>
                <p><strong>Date:</strong> {modalAthlete.gameDate ?? '—'}</p>
                <p><strong>Points:</strong> {modalAthlete.points}</p>
                <p><strong>Rebounds:</strong> {modalAthlete.rebounds}</p>
                <p><strong>Assists:</strong> {modalAthlete.assists}</p>
                <p><strong>Steals:</strong> {modalAthlete.steals}</p>
                <p><strong>Blocks:</strong> {modalAthlete.blocks}</p>
                <p><strong>Fouls:</strong> {modalAthlete.fouls}</p>
                <p><strong>FG:</strong> {modalAthlete.shotsMade}/{modalAthlete.shotsAttempted}</p>
                <p><strong>3PM:</strong> {modalAthlete.threePointersMade}</p>
                <p><strong>FT:</strong> {modalAthlete.freeThrowsMade}/{modalAthlete.freeThrowsAttempted}</p>
              </>
            ) : (
              <p>No game stats available.</p>
            )}
            <button onClick={() => setModalAthlete(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}