import type { AthleteWithStats } from '../types'

interface AthleteModalProps {
  athlete: AthleteWithStats
  onClose: () => void
}

export default function AthleteModal({ athlete, onClose }: AthleteModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{athlete.name}</h2>
        <p className="modal-field"><strong>Email:</strong> {athlete.email}</p>
        <p className="modal-field"><strong>High School:</strong> {athlete.highSchool}</p>
        <p className="modal-field"><strong>Division:</strong> {athlete.division ?? '—'}</p>
        <p className="modal-field"><strong>Position:</strong> {athlete.position ?? '—'}</p>
        <hr />
        <h3>Game Stats</h3>
        {athlete.points != null ? (
          <>
            <p className="modal-field"><strong>Date:</strong> {athlete.gameDate ?? '—'}</p>
            <p className="modal-field"><strong>Points:</strong> {athlete.points}</p>
            <p className="modal-field"><strong>Rebounds:</strong> {athlete.rebounds}</p>
            <p className="modal-field"><strong>Assists:</strong> {athlete.assists}</p>
            <p className="modal-field"><strong>Steals:</strong> {athlete.steals}</p>
            <p className="modal-field"><strong>Blocks:</strong> {athlete.blocks}</p>
            <p className="modal-field"><strong>Fouls:</strong> {athlete.fouls}</p>
            <p className="modal-field"><strong>FG:</strong> {athlete.shotsMade}/{athlete.shotsAttempted}</p>
            <p className="modal-field"><strong>3PM:</strong> {athlete.threePointersMade}</p>
            <p className="modal-field"><strong>FT:</strong> {athlete.freeThrowsMade}/{athlete.freeThrowsAttempted}</p>
          </>
        ) : (
          <p className="modal-field">No game stats available.</p>
        )}
        <div style={{ marginTop: '1.25rem' }}>
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
