import type { GameFormPayload, GameStatsFormRow, GameTeamFormSection } from '../../types'

export const createEmptyStatsRow = (): GameStatsFormRow => ({
  athleteID: '',
  points: 0,
  shotsMade: 0,
  shotsAttempted: 0,
  threePointersMade: 0,
  freeThrowsMade: 0,
  freeThrowsAttempted: 0,
  fouls: 0,
  blocks: 0,
  rebounds: 0,
  assists: 0,
  steals: 0,
})

export const createEmptyTeamSection = (): GameTeamFormSection => ({
  teamName: '',
  stats: [createEmptyStatsRow()],
})

const statNumber = (value: number | '') => value === '' ? 0 : value

export const normalizeTeamSection = (section?: Partial<GameTeamFormSection>): GameTeamFormSection => ({
  teamName: section?.teamName ?? '',
  stats: section?.stats && section.stats.length > 0 ? section.stats : [createEmptyStatsRow()],
})

export const validateGamePayload = (payload: GameFormPayload): string | null => {
  if (!payload.gameDate) return 'Game date is required.'
  if (payload.teams.length < 2) return 'Two teams are required.'

  const [teamOne, teamTwo] = payload.teams
  if (!teamOne.teamName || !teamTwo.teamName) return 'Both teams must be selected.'
  if (teamOne.teamName === teamTwo.teamName) return 'Team 1 and Team 2 must be different.'

  const athleteIDs = new Set<number>()
  for (const team of payload.teams) {
    const filledRows = team.stats.filter(row => row.athleteID !== '')
    if (filledRows.length === 0) return `${team.teamName} needs at least one player.`

    for (const row of filledRows) {
      if (athleteIDs.has(Number(row.athleteID))) {
        return 'The same player cannot be entered twice in one game.'
      }
      athleteIDs.add(Number(row.athleteID))

      if (statNumber(row.shotsMade) > statNumber(row.shotsAttempted)) return 'Shots made cannot be greater than shots attempted.'
      if (statNumber(row.threePointersMade) > statNumber(row.shotsMade)) return '3PM cannot be greater than shots made.'
      if (statNumber(row.freeThrowsMade) > statNumber(row.freeThrowsAttempted)) return 'Free throws made cannot be greater than free throws attempted.'
    }
  }

  return null
}

export const trimEmptyRows = (section: GameTeamFormSection): GameTeamFormSection => ({
  ...section,
  stats: section.stats.filter(row => row.athleteID !== ''),
})
