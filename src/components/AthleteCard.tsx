import type { AthleteWithStats } from '../types'

interface AthleteCardProps {
  athlete: AthleteWithStats
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function AthleteCard({ athlete, onClick, onEdit, onDelete }: AthleteCardProps) {
  return (
    <div className="athlete-card" onClick={onClick}>
      <div className="athlete-card-header">
        <div className="card-name">{athlete.name}</div>
        <div className="card-id">#{athlete.id}</div>
      </div>

      <div className="athlete-card-body">
        <div className="badge-row">
          <span className="badge">{athlete.position ?? 'N/A'}</span>
          <span className="badge">{athlete.division ?? '—'}</span>
        </div>

        <p className="card-school">{athlete.highSchool}</p>

        {athlete.points != null ? (
          <div className="stats-bar">
            <div><div className="stat-value">{athlete.points}</div><div className="stat-label">PTS</div></div>
            <div><div className="stat-value">{athlete.rebounds}</div><div className="stat-label">REB</div></div>
            <div><div className="stat-value">{athlete.assists}</div><div className="stat-label">AST</div></div>
            <div><div className="stat-value">{athlete.steals}</div><div className="stat-label">STL</div></div>
            <div><div className="stat-value">{athlete.blocks}</div><div className="stat-label">BLK</div></div>
          </div>
        ) : (
          <p className="no-stats-text">No stats available</p>
        )}

        <div className="card-actions">
          <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); onEdit() }}>
            Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); onDelete() }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
