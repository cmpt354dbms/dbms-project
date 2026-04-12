import type { AthleteWithStats, GameTeamFormSection, TeamOption } from '../../types'
import TeamStatsSection from './TeamStatsSection'

type Props = {
  mode: 'insert' | 'edit'
  gameID?: number | ''
  gameDate: string
  filmURL: string
  teams: GameTeamFormSection[]
  teamOptions: TeamOption[]
  athletes: AthleteWithStats[]
  error: string | null
  saving: boolean
  onGameDateChange: (gameDate: string) => void
  onFilmURLChange: (filmURL: string) => void
  onTeamsChange: (teams: GameTeamFormSection[]) => void
  onSubmit: () => void
  onCancel: () => void
  onDelete?: () => void
}

export default function GameEditorForm({
  mode,
  gameID,
  gameDate,
  filmURL,
  teams,
  teamOptions,
  athletes,
  error,
  saving,
  onGameDateChange,
  onFilmURLChange,
  onTeamsChange,
  onSubmit,
  onCancel,
  onDelete,
}: Props) {
  const selectedAthleteIDs = teams.flatMap(team => team.stats.map(row => row.athleteID)).filter(Boolean)

  const updateTeam = (index: number, section: GameTeamFormSection) => {
    onTeamsChange(teams.map((team, teamIndex) => teamIndex === index ? section : team))
  }

  return (
    <div className="game-editor-page">
      <div className="page-heading-row">
        <div>
          <h1>{mode === 'insert' ? 'Add Game' : `Edit Game #${gameID}`}</h1>
          <p className="muted-text">Enter both teams and at least one player stat row per team.</p>
        </div>
        <button className="secondary-button" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <section className="game-section">
        <h2>Game Details</h2>
        <div className="game-details-grid">
          <label>
            Game Date
            <input
              type="date"
              value={gameDate}
              onChange={event => onGameDateChange(event.target.value)}
            />
          </label>
          <label>
            Full Game Film URL
            <input
              value={filmURL}
              placeholder="Optional link for the whole game"
              onChange={event => onFilmURLChange(event.target.value)}
            />
          </label>
        </div>
      </section>

      <TeamStatsSection
        label="Team 1 Stats"
        section={teams[0]}
        teamOptions={teamOptions}
        athletes={athletes}
        selectedAthleteIDs={selectedAthleteIDs}
        unavailableTeamNames={teams[1].teamName ? [teams[1].teamName] : []}
        onChange={section => updateTeam(0, section)}
      />

      <TeamStatsSection
        label="Team 2 Stats"
        section={teams[1]}
        teamOptions={teamOptions}
        athletes={athletes}
        selectedAthleteIDs={selectedAthleteIDs}
        unavailableTeamNames={teams[0].teamName ? [teams[0].teamName] : []}
        onChange={section => updateTeam(1, section)}
      />

      <div className="form-actions">
        <div>
          {mode === 'edit' && onDelete && (
            <button className="danger-button" type="button" onClick={onDelete} disabled={saving}>
              Delete Game
            </button>
          )}
        </div>
        <div className="form-actions-right">
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary-button" type="button" onClick={onSubmit} disabled={saving}>
            {saving ? 'Saving...' : mode === 'insert' ? 'Create Game' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
