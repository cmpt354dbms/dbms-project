import { useState } from 'react'
import type { AthleteWithStats } from '../types'
import type { PlayerCardProps } from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function avg(games: AthleteWithStats[], key: keyof AthleteWithStats): number {
  if (!games.length) return 0
  const sum = games.reduce((acc, g) => acc + (Number(g[key]) || 0), 0)
  return sum / games.length
}

function fmt(val: number, decimals = 1): string {
  return val.toFixed(decimals)
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2)
}

// ─── Extra stat toggle definitions ───────────────────────────────────────────
const EXTRA_STATS = [
  { key: 'fgPct', label: 'FG%'},
  { key: 'threePointersMade', label: '3PM'},
  { key: 'ftPct', label: 'FT%'},
  { key: 'blocks', label: 'BLK'},
  { key: 'fouls', label: 'Fouls'},
] as const

type ExtraKey = typeof EXTRA_STATS[number]['key']

// ─── Checkbox icon ────────────────────────────────────────────────────────────
function CheckIcon({ checked }: { checked: boolean }) {
  return (
    <span style={{
     width: '12px',
      height: '12px',
      borderRadius: '2px',
      border: checked ? '1.5px solid #1d4ed8' : '1.5px solid #d1d5db',
      background: checked ? '#1d4ed8' : 'transparent',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 0.1s',
    }}>
      {checked && (
        <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
          <polyline points="1,2.5 2.8,4 6,1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </span>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PlayerCard({ games }: PlayerCardProps) {
  const [activeExtras, setActiveExtras] = useState<Set<ExtraKey>>(new Set())

  if (!games.length) return null

  const athlete = games[0]
  const hasStats = games.some(g => g.points != null)
  const gameCount = games.length

  // Per-game averages
  const avgPts = avg(games, 'points')
  const avgReb = avg(games, 'rebounds')
  const avgAst = avg(games, 'assists')
  const avgStl = avg(games, 'steals')
  const avgBlk = avg(games, 'blocks')
  const avgFouls = avg(games, 'fouls')
  const avg3pm = avg(games, 'threePointersMade')

  // Shooting percentages (computed from totals, not averaged)
  const totalFgm = games.reduce((s, g) => s + (g.shotsMade ?? 0), 0)
  const totalFga = games.reduce((s, g) => s + (g.shotsAttempted ?? 0), 0)
  const totalFtm = games.reduce((s, g) => s + (g.freeThrowsMade ?? 0), 0)
  const totalFta = games.reduce((s, g) => s + (g.freeThrowsAttempted ?? 0), 0)
  const fgPct = totalFga > 0 ? (totalFgm / totalFga) * 100 : 0
  const ftPct = totalFta > 0 ? (totalFtm / totalFta) * 100 : 0

  const extraValues: Record<ExtraKey, string> = {
    fgPct: `${fgPct.toFixed(1)}%`,
    threePointersMade: fmt(avg3pm),
    ftPct: `${ftPct.toFixed(1)}%`,
    blocks: fmt(avgBlk),
    fouls: fmt(avgFouls),
  }

  const toggleExtra = (key: ExtraKey) => {
    setActiveExtras(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const mainStats = [
    { label: 'PTS', value: fmt(avgPts) },
    { label: 'REB', value: fmt(avgReb) },
    { label: 'AST', value: fmt(avgAst) },
    // NOTE: Turnovers not yet in AthleteWithStats — using STL for now.
    // When TO is added to the schema, swap this entry.
    { label: 'STL', value: fmt(avgStl) },
  ]

  const visibleExtras = EXTRA_STATS.filter(s => activeExtras.has(s.key))

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={s.card}>

      {/* ── Header: avatar + name + position badge ── */}
      <div style={s.header}>
        <div style={s.avatar}>{initials(athlete.name)}</div>
        <div>
          <p style={s.name}>{athlete.name}</p>
          <span style={s.badge}>{athlete.position ?? '—'}</span>
        </div>
      </div>

      {/* ── Info grid: two-column label / value ── */}
      <div style={s.infoGrid}>
        {[
          { key: 'Jersey', val: `#${athlete.jerseyNumber}` },
          { key: 'School', val: athlete.highSchool},
          { key: 'Division', val: athlete.division ?? '—'},
          { key: 'Email', val: athlete.email},
        ].map(row => (
          <>
            <span key={row.key + '-k'} style={s.infoKey}>{row.key}</span>
            <span key={row.key + '-v'} style={s.infoVal}>{row.val}</span>
          </>
        ))}
      </div>

      <hr style={s.divider} />

      {hasStats ? (
        <>
          {/* ── Main stats ── */}
          <p style={s.sectionLabel}>
            Per game averages — {gameCount} game{gameCount !== 1 ? 's' : ''}
          </p>
          <div style={s.mainGrid}>
            {mainStats.map(stat => (
              <div key={stat.label} style={s.statBox}>
                <span style={s.statVal}>{stat.value}</span>
                <span style={s.statLbl}>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* ── Extra stat toggles ── */}
          <p style={s.sectionLabel}>Extra stats</p>
          <div style={s.chipRow}>
            {EXTRA_STATS.map(({ key, label }) => {
              const on = activeExtras.has(key)
              return (
                <button
                  key={key}
                  onClick={() => toggleExtra(key)}
                  style={{ ...s.chip, ...(on ? s.chipOn : {}) }}
                >
                  <CheckIcon checked={on} />
                  {label}
                </button>
              )
            })}
          </div>

          {/* ── Revealed extra stat boxes, same grid style as main stats ── */}
          {visibleExtras.length > 0 && (
            <div style={s.extraGrid}>
              {visibleExtras.map(({ key, label }) => (
                <div key={key} style={s.statBox}>
                  <span style={s.extraVal}>{extraValues[key]}</span>
                  <span style={s.statLbl}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p style={s.noStats}>No game stats available.</p>
      )}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
// Plain hex values — no CSS custom properties — so this works in any React app.
const s: Record<string, React.CSSProperties> = {
  card: {
    background:   '#ffffff',
    border:       '1px solid #e5e7eb',
    borderRadius: '12px',
    padding:      '1.25rem',
    maxWidth:     '460px',
    boxSizing:    'border-box',
  },
  header: {
    display:      'flex',
    alignItems:   'center',
    gap:          '12px',
    marginBottom: '12px',
  },
  avatar: {
    width:          '48px',
    height:         '48px',
    borderRadius:   '50%',
    background:     '#fef3c7',
    color:          '#92400e',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontWeight:     600,
    fontSize:       '15px',
    flexShrink:     0,
    fontFamily:     'monospace',
  },
  name: {
    fontWeight: 600,
    fontSize:   '17px',
    margin:     '0 0 5px',
    color:      '#111827',
  },
  badge: {
    fontSize:     '11px',
    padding:      '2px 9px',
    borderRadius: '999px',
    background:   '#dbeafe',
    color:        '#1e40af',
    fontWeight:   500,
  },
  infoGrid: {
    display:             'grid',
    gridTemplateColumns: 'auto 1fr',
    gap:                 '4px 12px',
    marginBottom:        '4px',
    alignItems:          'baseline',
  },
  infoKey: {
    fontSize:   '12px',
    color:      '#9ca3af',
    whiteSpace: 'nowrap',
  },
  infoVal: {
    fontSize: '12px',
    color:    '#374151',
  },
  divider: {
    border:    'none',
    borderTop: '1px solid #f3f4f6',
    margin:    '12px 0',
  },
  sectionLabel: {
    fontSize:      '10px',
    color:         '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin:        '0 0 10px',
    fontWeight:    500,
  },
  mainGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap:                 '8px',
    marginBottom:        '16px',
  },
  statBox: {
    background:    '#f9fafb',
    borderRadius:  '8px',
    padding:       '12px 6px',
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
    gap:           '4px',
  },
  statVal: {
    fontSize:   '22px',
    fontWeight: 600,
    color:      '#111827',
    lineHeight: 1,
  },
  statLbl: {
    fontSize:      '10px',
    color:         '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  chipRow: {
    display:      'flex',
    flexWrap:     'wrap',
    gap:          '6px',
    marginBottom: '10px',
  },
  chip: {
    display:      'flex',
    alignItems:   'center',
    gap:          '5px',
    fontSize:     '12px',
    padding:      '5px 11px',
    borderRadius: '999px',
    border:       '1px solid #e5e7eb',
    background:   '#ffffff',
    color:        '#374151',
    cursor:       'pointer',
    fontWeight:   500,
    lineHeight:   1,
  },
  chipOn: {
    background:  '#eff6ff',
    color:       '#1d4ed8',
    borderColor: '#bfdbfe',
  },
  extraGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap:                 '8px',
  },
  extraVal: {
    fontSize:   '18px',
    fontWeight: 600,
    color:      '#111827',
    lineHeight: 1,
  },
  noStats: {
    fontSize: '14px',
    color:    '#6b7280',
  },
}
