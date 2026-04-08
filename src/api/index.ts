import type { AthleteWithStats } from '../types'

const BASE_URL = '/api'

export const getAthletes = async (): Promise<AthleteWithStats[]> => {
  const res = await fetch(`${BASE_URL}/athletes`)
  return res.json()
}

export const deleteAthlete = async (id: number): Promise<{ message: string }> => {
  const res = await fetch(`${BASE_URL}/athletes/${id}`, {
    method: 'DELETE'
  })
  return res.json()
}