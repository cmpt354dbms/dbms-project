import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addHighSchool } from '../api'

export default function HighSchoolInsertPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    location: '',
    division: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async () => {
    setError(null)
    if (!form.name.trim() || !form.location.trim() || !form.division.trim()) {
      setError('Name, location, and division are required.')
      return
    }

    setSaving(true)
    try {
      await addHighSchool({
        name: form.name.trim(),
        location: form.location.trim(),
        division: form.division.trim(),
      })
      navigate('/high-schools')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add high school.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="game-editor-page">
      <div className="page-heading-row">
        <div>
          <h1>Add High School</h1>
          <p className="muted-text">Create a tournament team for athletes and games.</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => navigate('/high-schools')}>
          Cancel
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <section className="game-section management-form">
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} />
        </label>
        <label>
          Location
          <input name="location" value={form.location} onChange={handleChange} />
        </label>
        <label>
          Division
          <input name="division" value={form.division} onChange={handleChange} />
        </label>
      </section>

      <div className="form-actions">
        <button className="secondary-button" type="button" onClick={() => navigate('/high-schools')}>
          Cancel
        </button>
        <button className="primary-button" type="button" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving...' : 'Add High School'}
        </button>
      </div>
    </div>
  )
}
