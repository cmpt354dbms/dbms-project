import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAthletes, deleteAthlete } from '../api'
 // import type { Athlete } from '../types'
import type { AthleteWithStats } from '../types'
import PlayerCard from './PlayerCard'

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

  const getGamesForAthlete = (athleteID: number) => {
    return athletes.filter(a => a.id === athleteID && a.points != null)
  }

  const toggleExpand = (id: number) => {
    setExpandedID(prev => prev === id ? null : id)
  }

  const filtered = athletes.filter(a =>
    filter === 'All' ? true : a.position === filter
  )

  const uniqueAthletes = Array.from(
    new Map(filtered.map(a => [a.id, a])).values()
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
          {uniqueAthletes.map(a => (
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
                    {getGamesForAthlete(a.id).length > 0 ? (
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
                          {getGamesForAthlete(a.id).map(game => (
                            <tr key={`${game.id}-${game.gameID}`}>
                              <td>{game.gameDate ?? '—'}</td>
                              <td>{game.points}</td>
                              <td>{game.rebounds}</td>
                              <td>{game.assists}</td>
                              <td>{game.steals}</td>
                              <td>{game.blocks}</td>
                              <td>{game.fouls}</td>
                              <td>{game.shotsMade}/{game.shotsAttempted}</td>
                              <td>{game.threePointersMade}</td>
                              <td>{game.freeThrowsMade}/{game.freeThrowsAttempted}</td>
                            </tr>
                          ))}
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

      {uniqueAthletes.length === 0 && <p>No athletes found.</p>}

      {/* extract as component */}
      {/* modal */}
      {modalAthlete && (
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div>
            <PlayerCard games={getGamesForAthlete(modalAthlete.id)} />
            <button onClick={() => setModalAthlete(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}