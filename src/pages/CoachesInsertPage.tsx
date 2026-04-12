import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addCoach } from '../api'

export default function CoachesInsertPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name:    '',
    email:   '',
    phoneNo: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    setError(null)

    if (!form.name || !form.email) {
      setError('Name and email are required.')
      return
    }

    setSaving(true)
    try {
      await addCoach({
        name:    form.name.trim(),
        email:   form.email.trim(),
        phoneNo: form.phoneNo.trim(),
      })
      navigate('/coaches')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add coach.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Add Coach</h1>
        <button className="btn btn-ghost" onClick={() => navigate('/coaches')}>
          ← Back
        </button>
      </div>

      <div className="form-card">
        {error && <p className="form-error">{error}</p>}

        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            className="form-input"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="coach@univ.ca"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input
            className="form-input"
            type="text"
            name="phoneNo"
            value={form.phoneNo}
            onChange={handleChange}
            placeholder="604-555-0000"
          />
        </div>

        <div className="form-actions">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Add Coach'}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/coaches')}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
