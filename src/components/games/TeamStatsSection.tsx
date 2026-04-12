import type { AthleteWithStats, GameStatsFormRow, GameTeamFormSection, TeamOption } from '../../types'
import { createEmptyStatsRow } from './gameFormHelpers'

type Props = {
  label: string
  section: GameTeamFormSection
  teamOptions: TeamOption[]
  athletes: AthleteWithStats[]
  selectedAthleteIDs: Array<number | ''>
  unavailableTeamNames?: string[]
  onChange: (section: GameTeamFormSection) => void
}

const statColumns: Array<{ key: keyof GameStatsFormRow; label: string }> = [
  { key: 'points', label: 'PTS' },
  { key: 'rebounds', label: 'REB' },
  { key: 'assists', label: 'AST' },
  { key: 'steals', label: 'STL' },
  { key: 'blocks', label: 'BLK' },
  { key: 'fouls', label: 'FOUL' },
  { key: 'shotsMade', label: 'FGM' },
  { key: 'shotsAttempted', label: 'FGA' },
  { key: 'threePointersMade', label: '3PM' },
  { key: 'freeThrowsMade', label: 'FTM' },
  { key: 'freeThrowsAttempted', label: 'FTA' },
]

export default function TeamStatsSection({
  label,
  section,
  teamOptions,
  athletes,
  selectedAthleteIDs,
  unavailableTeamNames = [],
  onChange,
}: Props) {
  const teamAthletes = section.teamName
    ? athletes.filter(athlete => athlete.highSchool === section.teamName)
    : []

  const updateRow = (index: number, row: GameStatsFormRow) => {
    onChange({
      ...section,
      stats: section.stats.map((current, rowIndex) => rowIndex === index ? row : current),
    })
  }

  const updateStatValue = (
    row: GameStatsFormRow,
    index: number,
    key: keyof GameStatsFormRow,
    value: string,
  ) => {
    if (key === 'athleteID') return
    const trimmedValue = value.replace(/^0+(?=\d)/, '')
    updateRow(index, {
      ...row,
      [key]: trimmedValue === '' ? 0 : Math.max(0, Number(trimmedValue)),
    })
  }

  const addRow = () => {
    onChange({
      ...section,
      stats: [...section.stats, createEmptyStatsRow()],
    })
  }

  const removeRow = (index: number) => {
    if (index === 0) return
    onChange({
      ...section,
      stats: section.stats.filter((_, rowIndex) => rowIndex !== index),
    })
  }

  return (
    <section className="game-section">
      <div className="game-section-header">
        <h2>{label}</h2>
        <label>
          Team
          <select
            value={section.teamName}
            onChange={event => onChange({ ...section, teamName: event.target.value, stats: [createEmptyStatsRow()] })}
          >
            <option value="">Select team</option>
            {teamOptions.map(team => (
              <option
                key={team.name}
                value={team.name}
                disabled={unavailableTeamNames.includes(team.name)}
              >
                {team.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <table className="stats-entry-table">
        <thead>
          <tr>
            <th>Player</th>
            {statColumns.map(column => (
              <th key={column.key}>{column.label}</th>
            ))}
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {section.stats.map((row, index) => (
            <tr key={index}>
              <td>
                <select
                  value={row.athleteID}
                  disabled={!section.teamName}
                  onChange={event => updateRow(index, {
                    ...row,
                    athleteID: event.target.value === '' ? '' : Number(event.target.value),
                  })}
                >
                  <option value="">{section.teamName ? 'Select player' : 'Select team first'}</option>
                  {teamAthletes.map(athlete => {
                    const selectedElsewhere = selectedAthleteIDs.includes(athlete.id) && athlete.id !== row.athleteID
                    return (
                      <option key={athlete.id} value={athlete.id} disabled={selectedElsewhere}>
                        {athlete.name} #{athlete.id}
                      </option>
                    )
                  })}
                </select>
              </td>

              {statColumns.map(column => (
                <td key={column.key}>
                  <input
                    type="number"
                    min="0"
                    value={row[column.key]}
                    onFocus={event => event.target.select()}
                    onChange={event => updateStatValue(row, index, column.key, event.target.value)}
                  />
                </td>
              ))}

              <td>
                {index > 0 ? (
                  <button className="danger-icon-button" type="button" onClick={() => removeRow(index)}>
                    X
                  </button>
                ) : (
                  <span className="required-row">Required</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="secondary-button" type="button" onClick={addRow} disabled={!section.teamName}>
        + Add player
      </button>
    </section>
  )
}
