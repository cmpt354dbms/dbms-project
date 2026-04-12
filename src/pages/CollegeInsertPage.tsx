import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addUniversityTeam, getCoaches } from '../api'
import type { Coach } from '../types'

export default function CollegeInsertPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    location: '',
    division: '',
    coachID: '',
  })
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCoaches()
      .then(setCoaches)
      .catch(() => setError('Failed to load coaches.'))
  }, [])

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

    setSaving(true)
    try {
      await addUniversityTeam({
        name: form.name.trim(),
        location: form.location.trim(),
        division: form.division.trim(),
        coachID: form.coachID === '' ? null : Number(form.coachID),
      })
      navigate('/colleges')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add college.')
    } finally {
      setSaving(false)
    }
  }

  const availableCoaches = coaches.filter(coach => !coach.university)

  return (
    <div className="game-editor-page">
      <div className="page-heading-row">
        <div>
          <h1>Add College</h1>
          <p className="muted-text">Create a university team for recruiting records.</p>
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
          {saving ? 'Saving...' : 'Add College'}
        </button>
      </div>
    </div>
  )
}
