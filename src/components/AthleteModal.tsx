import type { AthleteWithStats } from '../types'

interface AthleteModalProps {
  athlete: AthleteWithStats
  onClose: () => void
}

export default function AthleteModal({ athlete, onClose }: AthleteModalProps) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', minWidth: '400px' }}>
        <h2>{athlete.name}</h2>
        <p><strong>Email:</strong> {athlete.email}</p>
        <p><strong>High School:</strong> {athlete.highSchool}</p>
        <p><strong>Division:</strong> {athlete.division ?? '—'}</p>
        <p><strong>Position:</strong> {athlete.position ?? '—'}</p>
        <hr />
        <h3>Game Stats</h3>
        {athlete.points != null ? (
          <>
            <p><strong>Date:</strong> {athlete.gameDate ?? '—'}</p>
            <p><strong>Points:</strong> {athlete.points}</p>
            <p><strong>Rebounds:</strong> {athlete.rebounds}</p>
            <p><strong>Assists:</strong> {athlete.assists}</p>
            <p><strong>Steals:</strong> {athlete.steals}</p>
            <p><strong>Blocks:</strong> {athlete.blocks}</p>
            <p><strong>Fouls:</strong> {athlete.fouls}</p>
            <p><strong>FG:</strong> {athlete.shotsMade}/{athlete.shotsAttempted}</p>
            <p><strong>3PM:</strong> {athlete.threePointersMade}</p>
            <p><strong>FT:</strong> {athlete.freeThrowsMade}/{athlete.freeThrowsAttempted}</p>
          </>
        ) : (
          <p>No game stats available.</p>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
