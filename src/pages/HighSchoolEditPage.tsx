import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { editHighSchool, getHighSchool } from '../api'

export default function HighSchoolEditPage() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const schoolName = name ? decodeURIComponent(name) : ''

  const [form, setForm] = useState({
    name: '',
    location: '',
    division: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!schoolName) return
    getHighSchool(schoolName)
      .then(school => {
        setForm({
          name: school.name,
          location: school.location,
          division: school.division,
        })
      })
      .catch(() => setError('Failed to load high school.'))
      .finally(() => setLoading(false))
  }, [schoolName])

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
      await editHighSchool(schoolName, {
        name: form.name.trim(),
        location: form.location.trim(),
        division: form.division.trim(),
      })
      navigate('/high-schools')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update high school.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="page">Loading...</p>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Edit High School</h1>
        <button className="btn btn-ghost" onClick={() => navigate('/high-schools')}>
          ← Back
        </button>
      </div>

      <div className="form-card">
        {error && <p className="form-error">{error}</p>}

        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-input" name="name" value={form.name} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Location</label>
          <input className="form-input" name="location" value={form.location} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Division</label>
          <input className="form-input" name="division" value={form.division} onChange={handleChange} />
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => navigate('/high-schools')} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
