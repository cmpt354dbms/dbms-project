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
    <div className="page">
      <div className="page-header">
        <h1>Add High School</h1>
        <button className="btn btn-ghost" onClick={() => navigate('/high-schools')}>
          ← Back
        </button>
      </div>

      <div className="form-card">
        {error && <p className="form-error">{error}</p>}

        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="School name" />
        </div>

        <div className="form-group">
          <label className="form-label">Location</label>
          <input className="form-input" name="location" value={form.location} onChange={handleChange} placeholder="City, Province" />
        </div>

        <div className="form-group">
          <label className="form-label">Division</label>
          <input className="form-input" name="division" value={form.division} onChange={handleChange} placeholder="e.g. AAAA" />
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Add High School'}
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => navigate('/high-schools')} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
