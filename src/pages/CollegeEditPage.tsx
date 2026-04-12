import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { editUniversityTeam, getCoaches, getUniversityTeam } from '../api'
import type { Coach } from '../types'

export default function CollegeEditPage() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const teamName = name ? decodeURIComponent(name) : ''

  const [form, setForm] = useState({
    name: '',
    location: '',
    division: '',
    coachID: '',
  })
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [currentCoachID, setCurrentCoachID] = useState<number | null>(null)
  const [currentRecruitCount, setCurrentRecruitCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!teamName) return
    Promise.all([getUniversityTeam(teamName), getCoaches()])
      .then(([team, coachData]) => {
        setCurrentCoachID(team.coachID)
        setCurrentRecruitCount(team.recruitCount)
        setForm({
          name: team.name,
          location: team.location,
          division: team.division,
          coachID: team.coachID == null ? '' : String(team.coachID),
        })
        setCoaches(coachData)
      })
      .catch(() => setError('Failed to load college.'))
      .finally(() => setLoading(false))
  }, [teamName])

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleCoachChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, coachID: event.target.value }))
  }

  const handleSubmit = async () => {
    setError(null)
    if (!form.name.trim() || !form.location.trim() || !form.division.trim()) {
      setError('Name, location, and division are required.')
      return
    }

    if (currentCoachID != null && form.coachID === '' && currentRecruitCount > 0) {
      const confirmed = window.confirm(
        `Removing this college's coach will delete ${currentRecruitCount} scholarship/recruit record${currentRecruitCount === 1 ? '' : 's'}. Continue?`,
      )
      if (!confirmed) return
    }

    setSaving(true)
    try {
      await editUniversityTeam(teamName, {
        name: form.name.trim(),
        location: form.location.trim(),
        division: form.division.trim(),
        coachID: form.coachID === '' ? null : Number(form.coachID),
      })
      navigate('/colleges')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update college.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="page">Loading college...</p>

  const availableCoaches = coaches.filter(coach => !coach.university || coach.id === currentCoachID)

  return (
    <div className="game-editor-page">
      <div className="page-heading-row">
        <div>
          <h1>Edit College</h1>
          <p className="muted-text">Update the university team and assigned coach.</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => navigate('/colleges')}>
          Cancel
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <section className="game-section management-form">
        <label>
          Name
          <input name="name" value={form.name} onChange={handleTextChange} />
        </label>
        <label>
          Location
          <input name="location" value={form.location} onChange={handleTextChange} />
        </label>
        <label>
          Division
          <input name="division" value={form.division} onChange={handleTextChange} />
        </label>
        <label>
          Coach
          <select value={form.coachID} onChange={handleCoachChange}>
            <option value="">No coach</option>
            {availableCoaches.map(coach => (
              <option key={coach.id} value={coach.id}>
                {coach.name} #{coach.id}
              </option>
            ))}
          </select>
          {availableCoaches.length === 0 && (
            <span className="management-help-text">
              No available coaches. <Link className="management-help-link" to="/coaches/new">Add a new coach</Link>.
            </span>
          )}
        </label>
      </section>

      <div className="form-actions">
        <button className="secondary-button" type="button" onClick={() => navigate('/colleges')}>
          Cancel
        </button>
        <button className="primary-button" type="button" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
