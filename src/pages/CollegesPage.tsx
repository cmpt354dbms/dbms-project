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

  if (loading) return <p className="page">Loading...</p>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Colleges</h1>
        <button className="btn btn-primary" onClick={() => navigate('/colleges/new')}>
          + Add College
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="games-grid">
        {teams.map(team => (
          <article className="game-card" key={team.name}>
            <div className="game-card-header">
              <div>
                <h2>{team.name}</h2>
                <p>{team.location}</p>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: '#fff' }}
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
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(team)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {teams.length === 0 && <p className="empty-state">No colleges found.</p>}
    </div>
  )
}
