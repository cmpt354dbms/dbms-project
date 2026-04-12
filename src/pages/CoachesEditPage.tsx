import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCoaches, editCoach } from '../api'

export default function CoachesEditPage() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const coachName = name ? decodeURIComponent(name) : ''
  const [coachID, setCoachID] = useState<number | null>(null)

  const [form, setForm] = useState({
    name:    '',
    email:   '',
    phoneNo: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // pre-populate the form with the existing coach data
  useEffect(() => {
    if (!coachName) return
    getCoaches()
      .then(coaches => {
        const coach = coaches.find(current => current.name === coachName)
        if (!coach) throw new Error('Coach not found')
        setCoachID(coach.id)
        setForm({
          name:    coach.name,
          email:   coach.email,
          phoneNo: coach.phoneNo ?? '',
        })
      })
      .catch(() => setError('Could not load coach.'))
      .finally(() => setLoading(false))
  }, [coachName])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    setError(null)

    if (!form.name || !form.email) {
      setError('Name and email are required.')
      return
    }

    if (coachID == null) {
      setError('Could not find coach ID.')
      return
    }

    setSaving(true)
    try {
      await editCoach(coachID, {
        name:    form.name.trim(),
        email:   form.email.trim(),
        phoneNo: form.phoneNo.trim(),
      })
      navigate('/coaches')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update coach.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="page">Loading…</p>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Edit Coach</h1>
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
            placeholder="Full Name"
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
            {saving ? 'Saving…' : 'Save Changes'}
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
