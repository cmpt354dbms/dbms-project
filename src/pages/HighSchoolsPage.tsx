import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteHighSchool, getAthletes, getHighSchools } from '../api'
import type { AthleteWithStats, ManagedHighSchool } from '../types'

export default function HighSchoolsPage() {
  const navigate = useNavigate()
  const [schools, setSchools] = useState<ManagedHighSchool[]>([])
  const [athletes, setAthletes] = useState<AthleteWithStats[]>([])
  const [selectedSchoolName, setSelectedSchoolName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getHighSchools(), getAthletes()])
      .then(([schoolData, athleteData]) => {
        setSchools(schoolData)
        setAthletes(athleteData)
      })
      .catch(() => setError('Failed to load high schools.'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (school: ManagedHighSchool) => {
    const confirmed = window.confirm(
      `Delete ${school.name}? Athletes from this school will no longer be attached to a high school.`
    )
    if (!confirmed) return

    setError(null)
    try {
      await deleteHighSchool(school.name)
      setSchools(prev => prev.filter(current => current.name !== school.name))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete high school.')
    }
  }

  if (loading) return <p className="page">Loading...</p>

  const selectedSchool = selectedSchoolName
    ? schools.find(school => school.name === selectedSchoolName)
    : null
  const roster = selectedSchool
    ? athletes
        .filter(athlete => athlete.highSchool === selectedSchool.name)
        .sort((a, b) => a.jerseyNumber - b.jerseyNumber || a.name.localeCompare(b.name))
    : []

  return (
    <div className="page">
      <div className="page-header">
        <h1>High Schools</h1>
        <button className="btn btn-primary" onClick={() => navigate('/high-schools/new')}>
          + Add High School
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {selectedSchool && (
        <section className="game-section">
          <div className="management-roster-header">
            <div>
              <h2>{selectedSchool.name} Roster</h2>
              <p className="muted-text">{selectedSchool.location} · {selectedSchool.division}</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/athletes/new')}>
              + Add Athlete
            </button>
          </div>

          {roster.length > 0 ? (
            <div className="management-roster-list">
              {roster.map(athlete => (
                <div className="management-roster-row" key={athlete.id}>
                  <strong>#{athlete.jerseyNumber}</strong>
                  <span>{athlete.name}</span>
                  <span>{athlete.position ?? 'No position'}</span>
                  <span>{athlete.email}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-text">No athletes are currently attached to this school.</p>
          )}
        </section>
      )}

      <div className="games-grid">
        {schools.map(school => (
          <article
            className="game-card"
            key={school.name}
            onClick={() => setSelectedSchoolName(school.name)}
          >
            <div className="game-card-header">
              <div>
                <h2>{school.name}</h2>
                <p>{school.location}</p>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: '#fff' }}
                onClick={event => {
                  event.stopPropagation()
                  navigate(`/high-schools/${encodeURIComponent(school.name)}/edit`)
                }}
              >
                Edit
              </button>
            </div>

            <div className="game-card-body">
              <span>
                <strong>Division</strong>
                {school.division}
              </span>
              <span>
                <strong>Athletes</strong>
                {school.athleteCount}
              </span>
              <span>
                <strong>Games</strong>
                {school.gameCount}
              </span>
            </div>

            <div className="management-card-actions">
              <button
                className="btn btn-danger btn-sm"
                onClick={event => {
                  event.stopPropagation()
                  handleDelete(school)
                }}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {schools.length === 0 && <p className="empty-state">No high schools found.</p>}
    </div>
  )
}
