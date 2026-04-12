import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { addScholarship, getAthletes, getCoach } from '../api'
import type { AthleteWithStats, CoachDetail } from '../types'

const OFFER_TYPES = ['Full', 'Partial', 'Walk-On', 'Preferred Walk-On']

export default function ScholarshipInsertPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const coachID = Number(searchParams.get('coachID'))
  const [coach, setCoach] = useState<CoachDetail | null>(null)
  const [athletes, setAthletes] = useState<AthleteWithStats[]>([])
  const [recruitedAthleteIDs, setRecruitedAthleteIDs] = useState<Set<number>>(new Set())
  const [form, setForm] = useState({
    highSchool: '',
    athleteID: '',
    offerType: 'Partial',
    scholarshipAmount: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isInteger(coachID) || coachID <= 0) {
      setError('Open this page from a coach assigned to a college team.')
      setLoading(false)
      return
    }

    Promise.all([getCoach(coachID), getAthletes()])
      .then(([coachData, athleteData]) => {
        setCoach(coachData)
        setAthletes(athleteData)
        setRecruitedAthleteIDs(new Set(coachData.recruits.map(recruit => recruit.athleteID)))
        if (!coachData.university) {
          setError('This coach needs a college team before adding scholarships.')
        }
      })
      .catch(() => setError('Failed to load scholarship form options.'))
      .finally(() => setLoading(false))
  }, [coachID])

  const highSchoolOptions = Array.from(new Set(athletes.map(athlete => athlete.highSchool))).sort()
  const canRecruit = Boolean(coach?.university)

  const availableAthletes = canRecruit
    ? athletes
        .filter(athlete => !recruitedAthleteIDs.has(athlete.id))
        .filter(athlete => form.highSchool === '' || athlete.highSchool === form.highSchool)
        .sort((a, b) => a.highSchool.localeCompare(b.highSchool) || a.jerseyNumber - b.jerseyNumber)
    : []

  const handleSubmit = async () => {
    setError(null)
    if (!coach) {
      setError('Coach is required.')
      return
    }
    if (!coach.university) {
      setError('This coach needs a college team before adding scholarships.')
      return
    }
    if (!form.athleteID) {
      setError('Player is required.')
      return
    }

    const amountText = form.scholarshipAmount.trim()
    if (amountText === '') {
      setError('Dollar amount is required.')
      return
    }
    if (!/^\d+(\.\d{1,2})?$/.test(amountText)) {
      setError('Dollar amount must be a valid number with up to 2 decimal places.')
      return
    }

    const scholarshipAmount = Number(amountText)
    if (!Number.isFinite(scholarshipAmount)) {
      setError('Dollar amount must be a valid number.')
      return
    }
    if (scholarshipAmount < 0) {
      setError('Scholarship amount cannot be negative.')
      return
    }
    if (scholarshipAmount > 99999999.99) {
      setError('Dollar amount is too large.')
      return
    }

    setSaving(true)
    try {
      await addScholarship({
        coachID: coach.id,
        athleteID: Number(form.athleteID),
        offerType: form.offerType,
        scholarshipAmount,
      })
      navigate('/coaches')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add scholarship.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="page">Loading...</p>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Add Scholarship</h1>
        <button className="btn btn-ghost" onClick={() => navigate('/coaches')}>
          ← Back
        </button>
      </div>

      {coach && (
        <div className="scholarship-context">
          <span><strong>Coach:</strong> {coach.name}</span>
          <span><strong>College:</strong> {coach.university ?? 'No college assigned'}</span>
        </div>
      )}

      <div className="form-card form-card-wide">
        {error && <p className="form-error">{error}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <div className="form-group">
              <label className="form-label">Scholarship Type</label>
              <select
                className="form-input"
                value={form.offerType}
                onChange={event => setForm(prev => ({ ...prev, offerType: event.target.value }))}
              >
                {OFFER_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Dollar Amount</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                value={form.scholarshipAmount}
                placeholder="0"
                onChange={event => setForm(prev => ({ ...prev, scholarshipAmount: event.target.value }))}
              />
            </div>
          </div>

          <div>
            <div className="form-group">
              <label className="form-label">High School</label>
              <select
                className="form-input"
                value={form.highSchool}
                disabled={!canRecruit}
                onChange={event => setForm(prev => ({ ...prev, highSchool: event.target.value, athleteID: '' }))}
              >
                <option value="">{canRecruit ? 'All high schools' : 'Coach needs a college first'}</option>
                {highSchoolOptions.map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Player</label>
              <select
                className="form-input"
                value={form.athleteID}
                disabled={!canRecruit}
                onChange={event => setForm(prev => ({ ...prev, athleteID: event.target.value }))}
              >
                <option value="">{canRecruit ? 'Select player' : 'Coach needs a college first'}</option>
                {availableAthletes.map(athlete => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.name} #{athlete.jerseyNumber}
                  </option>
                ))}
              </select>
              {canRecruit && availableAthletes.length === 0 && (
                <span className="management-help-text">Every athlete is already listed for this coach.</span>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={saving || !canRecruit}>
            {saving ? 'Saving...' : 'Add Scholarship'}
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => navigate('/coaches')} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
