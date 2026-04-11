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

export const getSchools = async (): Promise<{ name: string }[]> => {
  const res = await fetch(`${BASE_URL}/schools`)
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