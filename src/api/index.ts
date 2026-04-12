import type {
  AthleteWithStats,
  GameDetailResponse,
  GameFormPayload,
  GameSummary,
  TeamOption,
} from '../types'

const BASE_URL = '/api'
export const API = 'http://localhost:5000/api'

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

export const getCoaches = async () => {
  const res = await fetch(`${BASE_URL}/coaches`)
  return res.json()
}
 
export const getCoach = async (id: number) => {
  const res = await fetch(`${BASE_URL}/coaches/${id}`)
  return res.json()
}
 
export const deleteCoach = async (id: number): Promise<{ message: string }> => {
  const res = await fetch(`${BASE_URL}/coaches/${id}`, { method: 'DELETE' })
  return res.json()
}
 
export const addCoach = async (coach: {
  id: number
  name: string
  email: string
  phoneNo: string
}): Promise<{ message: string }> => {
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
 
export const getUniversities = async (): Promise<{ name: string; division: string }[]> => {
  const res = await fetch(`${BASE_URL}/universities`)
  return res.json()
}

export const getTeams = async (): Promise<TeamOption[]> => {
  const res = await fetch(`${BASE_URL}/teams`)
  return res.json()
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