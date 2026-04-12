// creating interfaces from tables in our SQL schema
// ─── Base Table Types ───────────────────────────────────────────

export interface Coach {
  id: number
  name: string
  email: string
  phoneNo: string
  university?: string      // from JOIN with UniversityTeam
}

export interface HighSchool {
  name: string
  location: string
  division: string
}

export interface Athlete {
  id: number
  name: string
  email: string
  highSchool: string
  position?: 'Guard' | 'Forward' | 'Centre'   // from JOIN with position tables
  division?: string                             // from JOIN with HighSchool
}

// for displaying athlete data alongside their game stats
export interface AthleteWithStats {
  id: number
  name: string
  email: string
  highSchool: string
  division: string
  position: string
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  fouls: number
  shotsMade: number
  shotsAttempted: number
  threePointersMade: number
  freeThrowsMade: number
  freeThrowsAttempted: number
  gameID: number
  gameDate: string
}

export interface UniversityTeam {
  name: string
  location: string
  division: string
  coachID: number
  coachName?: string       // from JOIN with Coach
}

export interface Game {
  gameID: number
  gameDate: string
}

export interface TeamOption {
  name: string
  location: string
  division: string
}

export interface GameTeamSummary {
  teamName: string
  totalScore: number
  playerCount: number
}

export interface GameSummary {
  gameID: number
  gameDate: string
  teams: GameTeamSummary[]
  totalScore: number
  filmURL?: string
}

export interface GameStat {
  athleteID: number
  gameID: number
  athleteName?: string     // from JOIN with Athlete
  gameDate?: string        // from JOIN with Game
  points: number
  shotsMade: number
  shotsAttempted: number
  threePointersMade: number
  freeThrowsMade: number
  freeThrowsAttempted: number
  fouls: number
  blocks: number
  rebounds: number
  assists: number
  steals: number
}

export interface GameFilm {
  gameID: number
  athleteID: number
  filmURL: string
  athleteName?: string     // from JOIN with Athlete
  gameDate?: string        // from JOIN with Game
}

export interface Interested {
  athleteID: number
  coachID: number
  athleteName?: string     // from JOIN with Athlete
  coachName?: string       // from JOIN with Coach
  university?: string      // from JOIN with UniversityTeam
  offerType: 'Full' | 'Partial' | 'Walk-On' | 'Preferred Walk-On'
  scholarshipAmount: number
}

// position tables are just athleteIDs, represented by the position field on Athlete above
export interface Guard {
  athleteID: number
}

export interface Forward {
  athleteID: number
}

export interface Centre {
  athleteID: number
}

// ─── Aggregation / Query Result Types ───────────────────────────

// for GET /games/summary (aggregation query // min/max/avg points) 
export interface StatsSummary {
  highest_points: number
  lowest_points: number
  avg_points: number
  most_rebounds: number
  avg_assists: number
  total_athletes: number
}

// for GET /schools/stats (group by query // avg stats per school)
export interface SchoolStat {
  high_school: string
  division: string
  num_athletes: number
  avg_points: number
  avg_rebounds: number
  avg_assists: number
}

// used for INSERT and UPDATE forms
export interface AthleteFormData {
  id?: number          // optional for update since it's in the URL
  name: string
  email: string
  highSchool: string
  position: 'Guard' | 'Forward' | 'Centre'
}

export interface GameStatsFormRow {
  athleteID: number | ''
  points: number | ''
  shotsMade: number | ''
  shotsAttempted: number | ''
  threePointersMade: number | ''
  freeThrowsMade: number | ''
  freeThrowsAttempted: number | ''
  fouls: number | ''
  blocks: number | ''
  rebounds: number | ''
  assists: number | ''
  steals: number | ''
}

export interface GameTeamFormSection {
  teamName: string
  stats: GameStatsFormRow[]
}

export interface GameFormPayload {
  gameID?: number
  gameDate: string
  filmURL?: string
  teams: GameTeamFormSection[]
}

export interface GameDetailResponse {
  game: Game
  filmURL: string
  teams: Array<{
    teamName: string
    stats: Array<GameStatsFormRow & { athleteName?: string }>
  }>
}

// Pass an array of game records for this athlete
export interface PlayerCardProps {
  games: AthleteWithStats[]
  onClose?: () => void;
}

export interface CoachCardProps {
  coach:    Coach
  onClick:  () => void
  onEdit:   () => void
  onDelete: () => void
}

export interface CoachDetailCardProps {
  detail:   CoachDetail
  onClose:  () => void
}
 
 
// One athlete in the coach's recruit list from JOIN across Interested + Athlete + HighSchool
export interface Recruit {
  athleteID:         number
  athleteName:       string
  athleteEmail:      string
  highSchool:        string | null
  division:          string | null
  position:          'Guard' | 'Forward' | 'Centre' | null
  offerType:         'Full' | 'Partial' | 'Walk-On' | 'Preferred Walk-On'
  scholarshipAmount: number
}
 
// Full response from GET /api/coaches/:id
export interface CoachDetail extends Coach {
  recruits: Recruit[]
}