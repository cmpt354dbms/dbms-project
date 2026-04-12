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

  if (loading) return <p className="page">Loading high school...</p>

  return (
    <div className="game-editor-page">
      <div className="page-heading-row">
        <div>
          <h1>Edit High School</h1>
          <p className="muted-text">Update the team name, city, or division.</p>
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
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
