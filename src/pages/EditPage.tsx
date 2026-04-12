import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAthletes, editAthlete } from '../api'
import type { AthleteFormData } from '../types'

export default function AthleteEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState<AthleteFormData>({
    jerseyNumber: '',
    name: '',
    email: '',
    highSchool: '',
    position: 'Guard'
  })
  const [schools, setSchools] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // fetch schools for dropdown
    fetch('/api/schools')
      .then(res => res.json())
      .then(data => setSchools(data.map((s: { name: string }) => s.name)))
  }, [])

  useEffect(() => {
    getAthletes().then(athletes => {
      const found = athletes.find(a => a.id === Number(id))
      if (found) {
        setForm({
          jerseyNumber: found.jerseyNumber,
          name: found.name,
          email: found.email,
          highSchool: found.highSchool,
          position: (found.position as 'Guard' | 'Forward' | 'Centre') ?? 'Guard'
        })
      } else {
        setError('Athlete not found.')
      }
    }).finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async () => {
    if (form.jerseyNumber === '' || !form.name || !form.email || !form.highSchool) {
      setError('All fields are required.')
      return
    }
    try {
      await editAthlete(Number(id), { ...form, jerseyNumber: Number(form.jerseyNumber) })
      navigate('/athletes')
    } catch (e: any) {
      setError(e.message || 'Failed to update athlete.')
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1>Edit Athlete</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <label>Jersey Number (0–99)</label>
        <input
          type="number"
          min={0}
          max={99}
          value={form.jerseyNumber}
          onChange={e => {
            const val = e.target.value === '' ? '' : Number(e.target.value)
            setForm({ ...form, jerseyNumber: val as number | '' })
          }}
        />
      </div>

      <div>
        <label>Name</label>
        <input
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div>
        <label>Email</label>
        <input
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
      </div>

      <div>
        <label>High School</label>
          <select
            value={form.highSchool}
            onChange={e => setForm({ ...form, highSchool: e.target.value })}
          >
            {schools.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
      </div>

      <div>
        <label>Position</label>
        <select
          value={form.position}
          onChange={e => setForm({ ...form, position: e.target.value as 'Guard' | 'Forward' | 'Centre' })}
        >
          <option value="Guard">Guard</option>
          <option value="Forward">Forward</option>
          <option value="Centre">Centre</option>
        </select>
      </div>

      <button onClick={handleSubmit}>Save Changes</button>
      <button onClick={() => navigate('/athletes')}>Cancel</button>
    </div>
  )
}
