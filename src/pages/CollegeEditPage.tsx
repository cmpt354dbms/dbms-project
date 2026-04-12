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

  if (loading) return <p className="page">Loading...</p>

  const availableCoaches = coaches.filter(coach => !coach.university || coach.id === currentCoachID)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Edit College</h1>
        <button className="btn btn-ghost" onClick={() => navigate('/colleges')}>
          ← Back
        </button>
      </div>

      <div className="form-card">
        {error && <p className="form-error">{error}</p>}

        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-input" name="name" value={form.name} onChange={handleTextChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Location</label>
          <input className="form-input" name="location" value={form.location} onChange={handleTextChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Division</label>
          <input className="form-input" name="division" value={form.division} onChange={handleTextChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Coach</label>
          <select className="form-input" value={form.coachID} onChange={handleCoachChange}>
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
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => navigate('/colleges')} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
