import type { AthleteWithStats } from '../types'

interface AthleteCardProps {
  athlete: AthleteWithStats
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function AthleteCard({ athlete, onClick, onEdit, onDelete }: AthleteCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        background: 'white',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* header band */}
      <div style={{
        background: '#1a1a2e',
        color: 'white',
        padding: '1rem',
      }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{athlete.name}</div>
        <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>#{athlete.id}</div>
      </div>

      {/* body */}
      <div style={{ padding: '0.75rem 1rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#e8e8e8',
            borderRadius: '4px',
            padding: '2px 8px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
          }}>
            {athlete.position ?? 'N/A'}
          </span>
          <span style={{
            display: 'inline-block',
            background: '#e8e8e8',
            borderRadius: '4px',
            padding: '2px 8px',
            fontSize: '0.8rem',
            marginLeft: '0.25rem',
          }}>
            {athlete.division ?? '—'}
          </span>
        </div>

        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#555' }}>
          {athlete.highSchool}
        </p>

        {/* key stats */}
        {athlete.points != null ? (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '0.75rem',
            padding: '0.5rem',
            background: '#f5f5f5',
            borderRadius: '4px',
            textAlign: 'center',
            fontSize: '0.85rem',
          }}>
            <div><div style={{ fontWeight: 'bold' }}>{athlete.points}</div><div style={{ color: '#888' }}>PTS</div></div>
            <div><div style={{ fontWeight: 'bold' }}>{athlete.rebounds}</div><div style={{ color: '#888' }}>REB</div></div>
            <div><div style={{ fontWeight: 'bold' }}>{athlete.assists}</div><div style={{ color: '#888' }}>AST</div></div>
            <div><div style={{ fontWeight: 'bold' }}>{athlete.steals}</div><div style={{ color: '#888' }}>STL</div></div>
            <div><div style={{ fontWeight: 'bold' }}>{athlete.blocks}</div><div style={{ color: '#888' }}>BLK</div></div>
          </div>
        ) : (
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.85rem', color: '#999' }}>No stats available</p>
        )}

        {/* action buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <button
            onClick={e => { e.stopPropagation(); onEdit() }}
            style={{
              flex: 1, padding: '0.4rem', border: '1px solid #ccc',
              borderRadius: '4px', background: 'white', cursor: 'pointer',
            }}
          >
            Edit
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            style={{
              flex: 1, padding: '0.4rem', border: '1px solid #ccc',
              borderRadius: '4px', background: 'white', cursor: 'pointer',
              color: '#c00',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
