import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteUniversityTeam, getUniversityTeams } from '../api'
import type { ManagedUniversityTeam } from '../types'

export default function CollegesPage() {
  const navigate = useNavigate()
  const [teams, setTeams] = useState<ManagedUniversityTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getUniversityTeams()
      .then(setTeams)
      .catch(() => setError('Failed to load colleges.'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (team: ManagedUniversityTeam) => {
    const confirmed = window.confirm(`Delete ${team.name}? Coaches and recruits will stay in the database.`)
    if (!confirmed) return

    setError(null)
    try {
      await deleteUniversityTeam(team.name)
      setTeams(prev => prev.filter(current => current.name !== team.name))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete college.')
    }
  }

  if (loading) return <p className="page">Loading colleges...</p>

  return (
    <div className="games-page">
      <div className="page-heading-row">
        <div>
          <h1>Colleges</h1>
          <p className="muted-text">University teams and their assigned recruiting coaches.</p>
        </div>
        <button className="primary-button" onClick={() => navigate('/colleges/new')}>
          + Add College
        </button>
      </div>

      <div className="page-nav">
        <button className="secondary-button" onClick={() => navigate('/athletes')}>Athletes</button>
        <button className="secondary-button" onClick={() => navigate('/games')}>Games</button>
        <button className="secondary-button" onClick={() => navigate('/high-schools')}>High Schools</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="games-grid">
        {teams.map(team => (
          <article className="game-card" key={team.name}>
            <div className="game-card-header">
              <div>
                <h2>{team.name}</h2>
                <p>{team.location}</p>
              </div>
              <button
                className="icon-button"
                onClick={() => navigate(`/colleges/${encodeURIComponent(team.name)}/edit`)}
              >
                Edit
              </button>
            </div>

            <div className="game-card-body">
              <span>
                <strong>Division</strong>
                {team.division}
              </span>
              <span>
                <strong>Coach</strong>
                {team.coachName ?? 'None'}
              </span>
              <span>
                <strong>Recruits</strong>
                {team.recruitCount}
              </span>
            </div>

            <div className="management-card-actions">
              <button className="danger-icon-button" onClick={() => handleDelete(team)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {teams.length === 0 && <p>No colleges found.</p>}
    </div>
  )
}
