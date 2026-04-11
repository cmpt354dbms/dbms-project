import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addAthlete } from '../api'
import type { AthleteFormData } from '../types'

const emptyForm: AthleteFormData = {
  id: undefined,
  name: '',
  email: '',
  highSchool: '',
  position: 'Guard'
}

export default function AthleteInsertPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<AthleteFormData>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [schools, setSchools] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/schools')
      .then(res => res.json())
      .then(data => setSchools(data.map((s: { name: string }) => s.name)))
  }, [])

  const handleSubmit = async () => {
    if (!form.id || !form.name || !form.email || !form.highSchool) {
      setError('All fields are required.')
      return
    }
    try {
      await addAthlete({ ...form, id: form.id! })
      navigate('/athletes')
    } catch (e) {
      setError('Failed to add athlete.')
    }
  }

  return (
    <div>
      <h1>Add Athlete</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <label>ID</label>
        <input
          type="number"
          value={form.id ?? ''}
          onChange={e => setForm({ ...form, id: Number(e.target.value) })}
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
          <option value="">Select a school</option>
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

      <button onClick={handleSubmit}>Add Athlete</button>
      <button onClick={() => navigate('/athletes')}>Cancel</button>
    </div>
  )
}