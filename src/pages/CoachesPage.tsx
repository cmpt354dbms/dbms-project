import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Coach, CoachDetail, CoachDetailCardProps, CoachCardProps, Recruit} from '../types'
import { API } from '../api'


async function fetchCoaches(): Promise<Coach[]> {
  const res = await fetch(`${API}/coaches`)
  if (!res.ok) throw new Error('Failed to fetch coaches')
  return res.json()
}

async function fetchCoachDetail(id: number): Promise<CoachDetail> {
  const res = await fetch(`${API}/coaches/${id}`)
  if (!res.ok) throw new Error('Failed to fetch coach detail')
  return res.json()
}

async function deleteCoachAPI(id: number): Promise<void> {
  await fetch(`${API}/coaches/${id}`, { method: 'DELETE' })
}

const SORT_OPTIONS = [
  { key: 'name', label: 'Name'},
  { key: 'id', label: 'ID'},
  { key: 'university', label: 'University'},
]

// Interested.offerType CHECK constraint values
const OFFER_STYLES: Record<string, React.CSSProperties> = {
  'Full': { background: '#dcfce7', color: '#166534' },
  'Partial': { background: '#dbeafe', color: '#1e40af' },
  'Walk-On': { background: '#f3f4f6', color: '#374151' },
  'Preferred Walk-On': { background: '#fef3c7', color: '#92400e' },
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2)
}


function CoachCard({ coach, onClick, onEdit, onDelete }: CoachCardProps) {
  return (
    <div style={s.briefCard}>
      <div style={s.briefTop} onClick={onClick}>
        <div style={s.briefAvatar}>{initials(coach.name)}</div>
        <div style={{ minWidth: 0 }}>
          <p style={s.briefName}>{coach.name}</p>
          <span style={s.briefBadge}>
            {coach.university ?? 'No university'}
          </span>
        </div>
      </div>

      <div style={s.briefInfoGrid}>
        <span style={s.briefInfoKey}>Email</span>
        <span style={{ ...s.briefInfoVal, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {coach.email}
        </span>
        <span style={s.briefInfoKey}>Phone</span>
        {/* phoneNo is nullable in Coach table (no NOT NULL constraint) */}
        <span style={s.briefInfoVal}>{coach.phoneNo ?? '—'}</span>
      </div>

      <div style={s.briefActions}>
        <button style={s.actionBtn} onClick={e => { e.stopPropagation(); onEdit() }}>Edit</button>
        <button style={{ ...s.actionBtn, ...s.actionBtnDanger }} onClick={e => { e.stopPropagation(); onDelete() }}>Delete</button>
      </div>
    </div>
  )
}


function CoachDetailCard({ detail, onClose }: CoachDetailCardProps) {
  const totalScholarships = detail.recruits.reduce(
    (sum, r) => sum + (r.scholarshipAmount ?? 0), 0
  )

  return (
    <div style={s.detailCard}>

      {/* ── Header ── */}
      <div style={s.detailHeader}>
        <div style={s.detailAvatar}>{initials(detail.name)}</div>
        <div>
          <p style={s.detailName}>{detail.name}</p>
          <span style={s.detailBadge}>{detail.university ?? 'No university'}</span>
        </div>
      </div>

      {/* ── Info grid ── */}
      <div style={s.infoGrid}>
        {([
          { key: 'Email', val: detail.email},
          { key: 'Phone', val: detail.phoneNo ?? '—'},
        ] as const).map(row => (
          <>
            <span key={row.key + '-k'} style={s.infoKey}>{row.key}</span>
            <span key={row.key + '-v'} style={s.infoVal}>{row.val}</span>
          </>
        ))}
      </div>

      <hr style={s.divider} />

      {/* ── Recruit list ── */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '10px' }}>
        <p style={s.sectionLabel}>Recruits — {detail.recruits.length}</p>
        {detail.recruits.length > 0 && (
          <p style={{ ...s.sectionLabel, margin: 0 }}>
            Total scholarships: ${totalScholarships.toLocaleString()}
          </p>
        )}
      </div>

      {detail.recruits.length === 0 ? (
        <p style={s.emptyText}>No recruits on file.</p>
      ) : (
        <div style={s.recruitList}>
          {detail.recruits.map((r: Recruit) => (
            <div key={r.athleteID} style={s.recruitRow}>
              <div style={s.recruitLeft}>
                <p style={s.recruitName}>{r.athleteName}</p>
                <p style={s.recruitSub}>
                  {/* highSchool is nullable (ON DELETE SET NULL on Athlete.highSchool) */}
                  {r.highSchool ?? 'No school'} · {r.position ?? '—'}
                </p>
              </div>
              <div style={s.recruitRight}>
                <span style={{ ...s.offerBadge, ...OFFER_STYLES[r.offerType] }}>
                  {r.offerType}
                </span>
                {r.scholarshipAmount > 0 && (
                  <p style={s.scholarshipAmt}>
                    ${r.scholarshipAmount.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button style={s.closeBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

// Page 

export default function CoachesPage() {
  const navigate = useNavigate()

  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [allUniversities, setAllUniversities] = useState<string[]>([])
  const [selectedUnis, setSelectedUnis] = useState<Set<string>>(new Set())
  const [uniOpen, setUniOpen]  = useState(false)


  // Sorting
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Modal 
  const [detail, setDetail] = useState<CoachDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Fetch 

  useEffect(() => {
    fetchCoaches()
      .then(data => {
        setCoaches(data)
        // filter(Boolean) drops null values so the dropdowns only show real options
        const unis = [...new Set(data.map(c => c.university).filter((u): u is string => u != null))]
        unis.sort()
        setAllUniversities(unis)
        setSelectedUnis(new Set(unis))
      })
      .finally(() => setLoading(false))
  }, [])

  // Handlers 

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this coach?')) return
    await deleteCoachAPI(id)
    setCoaches(prev => prev.filter(c => c.id !== id))
  }

  const openDetail = async (coach: Coach) => {
    setDetail(null)
    setLoadingDetail(true)
    try {
      const d = await fetchCoachDetail(coach.id)
      setDetail(d)
    } finally {
      setLoadingDetail(false)
    }
  }

  const toggleUni = (uni: string) => {
    setSelectedUnis(prev => { const next = new Set(prev); next.has(uni) ? next.delete(uni) : next.add(uni); return next })
  }


  // Filter + Sort 

  const filtered = coaches
    .filter(c => {
      // coaches with no university (coachID SET NULL on UniversityTeam) always pass
      // coaches with a university pass only if that university is selected
      return c.university == null || selectedUnis.has(c.university)
    })
    .sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name); break
        case 'id': cmp = a.id - b.id; break
        case 'university': cmp = (a.university ?? '').localeCompare(b.university ?? ''); break
        default: cmp = 0
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

  if (loading) return <p className="page">Loading...</p>


  return (
    <div className="page">

      <div className="page-header">
        <h1>Coaches</h1>
        <button className="btn btn-primary" onClick={() => navigate('/coaches/new')}>
          + Add Coach
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div className="filter-bar">

        <div style={s.dropdownWrap}>
          {uniOpen && (
            <div style={s.dropdownPanel}>
              <button style={s.dropdownCtrl} onClick={() => setSelectedUnis(new Set(allUniversities))}>All</button>
              <button style={s.dropdownCtrl} onClick={() => setSelectedUnis(new Set())}>None</button>
              <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #f3f4f6' }} />
              {allUniversities.map(u => (
                <label key={u} style={s.dropdownItem}>
                  <input type="checkbox" checked={selectedUnis.has(u)} onChange={() => toggleUni(u)} style={{ marginRight: '8px' }} />
                  {u}
                </label>
              ))}
            </div>
          )}
        </div>


      </div>

      {/* ── Sort bar ── */}
      <div className="sort-bar">
        <span className="filter-label">Sort by</span>
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.key}
            className={`sort-btn ${sortKey === opt.key ? 'active' : ''}`}
            onClick={() => setSortKey(opt.key)}
          >
            {opt.label}
          </button>
        ))}
        <button className="sort-btn" onClick={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')}>
          {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>
      </div>

      {/* ── Card grid ── */}
      <div className="card-grid">
        {filtered.map(c => (
          <CoachCard
            key={c.id}
            coach={c}
            onClick={() => openDetail(c)}
            onEdit={() => navigate(`/coaches/${c.id}/edit`)}
            onDelete={() => handleDelete(c.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && <p className="empty-state">No coaches found.</p>}

      {/* ── Detail modal ── */}
      {(loadingDetail || detail) && (
        <div className="modal-overlay" onClick={() => { setDetail(null); setLoadingDetail(false) }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {loadingDetail ? (
              <p style={{ padding: '2rem', color: '#6b7280' }}>Loading...</p>
            ) : detail ? (
              <CoachDetailCard detail={detail} onClose={() => setDetail(null)} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  briefCard: {
    background:    '#ffffff',
    border:        '1px solid #e5e7eb',
    borderRadius:  '12px',
    padding:       '1rem',
    display:       'flex',
    flexDirection: 'column',
    gap:           '10px',
  },
  briefTop: {
    display:    'flex',
    alignItems: 'center',
    gap:        '10px',
    cursor:     'pointer',
  },
  briefAvatar: {
    width:          '40px',
    height:         '40px',
    borderRadius:   '50%',
    background:     '#e0e7ff',
    color:          '#3730a3',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontWeight:     600,
    fontSize:       '13px',
    flexShrink:     0,
  },
  briefName: {
    fontWeight:   600,
    fontSize:     '14px',
    margin:       '0 0 3px',
    color:        '#111827',
    whiteSpace:   'nowrap',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
  },
  briefBadge: {
    fontSize:     '11px',
    padding:      '2px 8px',
    borderRadius: '999px',
    background:   '#ede9fe',
    color:        '#5b21b6',
    fontWeight:   500,
    whiteSpace:   'nowrap',
  },
  briefInfoGrid: {
    display:             'grid',
    gridTemplateColumns: 'auto 1fr',
    gap:                 '3px 10px',
    alignItems:          'baseline',
  },
  briefInfoKey: {
    fontSize:   '11px',
    color:      '#9ca3af',
    whiteSpace: 'nowrap',
  },
  briefInfoVal: {
    fontSize: '12px',
    color:    '#374151',
  },
  briefActions: {
    display:        'flex',
    gap:            '6px',
    justifyContent: 'flex-end',
    paddingTop:     '6px',
    borderTop:      '1px solid #f3f4f6',
  },
  actionBtn: {
    fontSize:     '12px',
    padding:      '4px 12px',
    borderRadius: '6px',
    border:       '1px solid #e5e7eb',
    background:   '#ffffff',
    color:        '#374151',
    cursor:       'pointer',
    fontWeight:   500,
  },
  actionBtnDanger: {
    color:       '#dc2626',
    borderColor: '#fecaca',
    background:  '#fff5f5',
  },
  detailCard: {
    background:   '#ffffff',
    borderRadius: '12px',
    padding:      '1.25rem',
    maxWidth:     '500px',
    width:        '100%',
    boxSizing:    'border-box',
  },
  detailHeader: {
    display:      'flex',
    alignItems:   'center',
    gap:          '12px',
    marginBottom: '12px',
  },
  detailAvatar: {
    width:          '48px',
    height:         '48px',
    borderRadius:   '50%',
    background:     '#e0e7ff',
    color:          '#3730a3',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontWeight:     600,
    fontSize:       '16px',
    flexShrink:     0,
  },
  detailName: {
    fontWeight: 600,
    fontSize:   '18px',
    margin:     '0 0 5px',
    color:      '#111827',
  },
  detailBadge: {
    fontSize:     '11px',
    padding:      '2px 9px',
    borderRadius: '999px',
    background:   '#ede9fe',
    color:        '#5b21b6',
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
    fontSize: '12px', 
    color: '#9ca3af', 
    whiteSpace: 'nowrap' 
  },
  infoVal: { fontSize: '12px', color: '#374151' },
  divider: { border: 'none', borderTop: '1px solid #f3f4f6', margin: '12px 0' },
  sectionLabel: {
    fontSize:      '10px',
    color:         '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin:        '0 0 10px',
    fontWeight:    500,
  },
  emptyText: { fontSize: '13px', color: '#9ca3af', margin: 0 },
  recruitList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  recruitRow: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    background:     '#f9fafb',
    borderRadius:   '8px',
    padding:        '10px 12px',
    gap:            '12px',
  },
  recruitLeft:  { minWidth: 0 },
  recruitName: {
    fontSize:     '13px',
    fontWeight:   600,
    color:        '#111827',
    margin:       '0 0 2px',
    whiteSpace:   'nowrap',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
  },
  recruitSub:   { fontSize: '12px', color: '#9ca3af', margin: 0 },
  recruitRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 },
  offerBadge: {
    fontSize:     '11px',
    padding:      '2px 9px',
    borderRadius: '999px',
    fontWeight:   500,
    whiteSpace:   'nowrap',
  },
  scholarshipAmt: { fontSize: '12px', color: '#374151', fontWeight: 500, margin: 0 },
  closeBtn: {
    fontSize:     '13px',
    padding:      '6px 16px',
    borderRadius: '6px',
    border:       '1px solid #e5e7eb',
    background:   '#ffffff',
    color:        '#374151',
    cursor:       'pointer',
    fontWeight:   500,
  },
  dropdownWrap:  { position: 'relative' },
  dropdownPanel: {
    position:      'absolute',
    top:           'calc(100% + 4px)',
    left:          0,
    background:    '#ffffff',
    border:        '1px solid #e5e7eb',
    borderRadius:  '8px',
    padding:       '8px',
    minWidth:      '180px',
    zIndex:        100,
    boxShadow:     '0 4px 12px rgba(0,0,0,0.08)',
    display:       'flex',
    flexDirection: 'column',
    gap:           '2px',
  },
  dropdownCtrl: {
    fontSize:     '12px',
    padding:      '4px 8px',
    border:       'none',
    background:   'transparent',
    color:        '#6b7280',
    cursor:       'pointer',
    textAlign:    'left',
    borderRadius: '4px',
  },
  dropdownItem: {
    display:      'flex',
    alignItems:   'center',
    fontSize:     '13px',
    color:        '#374151',
    padding:      '4px 8px',
    cursor:       'pointer',
    borderRadius: '4px',
  },
}