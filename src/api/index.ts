import type {
  AthleteWithStats,
  Coach,
  CoachDetail,
  GameDetailResponse,
  GameFormPayload,
  GameSummary,
  ManagedHighSchool,
  ManagedUniversityTeam,
  TeamOption,
} from '../types'

const BASE_URL = '/api'
export const API = 'http://localhost:5000/api'

const readApiResponse = async <T>(
  res: Response,
  fallbackMessage: string,
): Promise<T> => {
  const text = await res.text()
  let data: { error?: string } = {}

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      if (res.status === 404) {
        throw new Error('Scholarship route was not found. Restart the API server and try again.')
      }
      throw new Error(fallbackMessage)
    }
  }

  if (!res.ok) throw new Error(data.error ?? fallbackMessage)
  return data as T
}

export const getAthletes = async (): Promise<AthleteWithStats[]> => {
  const res = await fetch(`${BASE_URL}/athletes`)
  return res.json()
}

export const getAthleteGames = async (id: number): Promise<AthleteWithStats[]> => {
  const res = await fetch(`${BASE_URL}/athletes/${id}/games`)
  return res.json()
}

export const deleteAthlete = async (id: number): Promise<{ message: string }> => {
  const res = await fetch(`${BASE_URL}/athletes/${id}`, {
    method: 'DELETE'
  })
  return res.json()
}

/*
  insert all other API calls underneath
*/

export const addAthlete = async (athlete: {
  id: number
  name: string
  email: string
  highSchool: string
  position: string
}): Promise<{ message: string }> => {
  const res = await fetch(`${BASE_URL}/athletes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(athlete)
  })
  return res.json()
}

export const editAthlete = async (id: number, athlete: {
  name: string
  email: string
  highSchool: string
  position: string
}): Promise<{ message: string }> => {
  const res = await fetch(`${BASE_URL}/athletes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(athlete)
  })
  return res.json()
}

export const getCoaches = async (): Promise<Coach[]> => {
  const res = await fetch(`${BASE_URL}/coaches`)
  return res.json()
}
 
export const getCoach = async (id: number): Promise<CoachDetail> => {
  const res = await fetch(`${BASE_URL}/coaches/${id}`)
  return res.json()
}
 
export const deleteCoach = async (id: number): Promise<{ message: string }> => {
  const res = await fetch(`${BASE_URL}/coaches/${id}`, { method: 'DELETE' })
  return res.json()
}
 
export const addCoach = async (coach: {
  name: string
  email: string
  phoneNo: string
}): Promise<{ message: string; id?: number }> => {
  const res = await fetch(`${BASE_URL}/coaches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(coach),
  })
  return res.json()
}
 
export const editCoach = async (id: number, coach: {
  name: string
  email: string
  phoneNo: string
}): Promise<{ message: string }> => {
  const res = await fetch(`${BASE_URL}/coaches/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(coach),
  })
  return res.json()
}

export const addScholarship = async (scholarship: {
  athleteID: number
  coachID: number
  offerType: string
  scholarshipAmount: number
}): Promise<{ message?: string; error?: string }> => {
  const res = await fetch(`${BASE_URL}/scholarships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scholarship),
  })
  return readApiResponse(res, 'Failed to add scholarship.')
}

export const deleteScholarship = async (
  coachID: number,
  athleteID: number,
): Promise<{ message?: string; error?: string }> => {
  const res = await fetch(`${BASE_URL}/scholarships/${coachID}/${athleteID}`, {
    method: 'DELETE',
  })
  return readApiResponse(res, 'Failed to remove scholarship.')
}
 
export const getUniversities = async (): Promise<{ name: string; division: string }[]> => {
  const res = await fetch(`${BASE_URL}/universities`)
  return res.json()
}

export const getTeams = async (): Promise<TeamOption[]> => {
  const res = await fetch(`${BASE_URL}/teams`)
  return res.json()
}

export const getHighSchools = async (): Promise<ManagedHighSchool[]> => {
  const res = await fetch(`${BASE_URL}/high-schools`)
  return res.json()
}

export const getHighSchool = async (name: string): Promise<ManagedHighSchool> => {
  const res = await fetch(`${BASE_URL}/high-schools/${encodeURIComponent(name)}`)
  return res.json()
}

export const addHighSchool = async (
  school: { name: string; location: string; division: string },
): Promise<{ message?: string; error?: string }> => {
  const res = await fetch(`${BASE_URL}/high-schools`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(school),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to add high school.')
  return data
}

export const editHighSchool = async (
  name: string,
  school: { name: string; location: string; division: string },
): Promise<{ message?: string; error?: string }> => {
  const res = await fetch(`${BASE_URL}/high-schools/${encodeURIComponent(name)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(school),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to update high school.')
  return data
}

export const deleteHighSchool = async (name: string): Promise<{ message?: string; error?: string }> => {
  const res = await fetch(`${BASE_URL}/high-schools/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to delete high school.')
  return data
}

export const getUniversityTeams = async (): Promise<ManagedUniversityTeam[]> => {
  const res = await fetch(`${BASE_URL}/university-teams`)
  return res.json()
}

export const getUniversityTeam = async (name: string): Promise<ManagedUniversityTeam> => {
  const res = await fetch(`${BASE_URL}/university-teams/${encodeURIComponent(name)}`)
  return res.json()
}

export const addUniversityTeam = async (
  team: { name: string; location: string; division: string; coachID: number | null },
): Promise<{ message?: string; error?: string }> => {
  const res = await fetch(`${BASE_URL}/university-teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(team),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to add university team.')
  return data
}

export const editUniversityTeam = async (
  name: string,
  team: { name: string; location: string; division: string; coachID: number | null },
): Promise<{ message?: string; error?: string }> => {
  const res = await fetch(`${BASE_URL}/university-teams/${encodeURIComponent(name)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(team),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to update university team.')
  return data
}

export const deleteUniversityTeam = async (name: string): Promise<{ message?: string; error?: string }> => {
  const res = await fetch(`${BASE_URL}/university-teams/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to delete university team.')
  return data
}

export const getGames = async (): Promise<GameSummary[]> => {
  const res = await fetch(`${BASE_URL}/games`)
  return res.json()
}

export const getGame = async (id: number): Promise<GameDetailResponse> => {
  const res = await fetch(`${BASE_URL}/games/${id}`)
  return res.json()
}

export const addGame = async (game: GameFormPayload & { gameID: number }): Promise<{ message?: string; error?: string }> => {
  const res = await fetch(`${BASE_URL}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(game)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to add game.')
  return data
}

export const editGame = async (id: number, game: GameFormPayload): Promise<{ message?: string; error?: string }> => {
  const res = await fetch(`${BASE_URL}/games/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(game)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to update game.')
  return data
}

export const deleteGame = async (id: number): Promise<{ message?: string; error?: string }> => {
  const res = await fetch(`${BASE_URL}/games/${id}`, {
    method: 'DELETE'
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to delete game.')
  return data
}

export async function getAthletesFullFilmCoverage(): Promise<AthleteWithStats[]> {
  const res = await fetch('/api/athletes/full-film-coverage')
  return res.json()
}

export async function getTournamentSummary() {
  const res = await fetch('/api/stats/tournament-summary')
  return res.json()
}