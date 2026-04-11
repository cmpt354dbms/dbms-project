import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addGame, getAthletes, getGames, getTeams } from '../api'
import GameEditorForm from '../components/games/GameEditorForm'
import {
  createEmptyTeamSection,
  trimEmptyRows,
  validateGamePayload,
} from '../components/games/gameFormHelpers'
import type { AthleteWithStats, GameTeamFormSection, TeamOption } from '../types'

export default function GameInsertPage() {
  const navigate = useNavigate()
  const [gameID, setGameID] = useState<number | ''>('')
  const [gameDate, setGameDate] = useState('')
  const [filmURL, setFilmURL] = useState('')
  const [teams, setTeams] = useState<GameTeamFormSection[]>([createEmptyTeamSection(), createEmptyTeamSection()])
  const [teamOptions, setTeamOptions] = useState<TeamOption[]>([])
  const [athletes, setAthletes] = useState<AthleteWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getTeams(), getAthletes(), getGames()])
      .then(([teamsData, athletesData, gamesData]) => {
        setTeamOptions(teamsData)
        setAthletes(Array.from(new Map(athletesData.map(athlete => [athlete.id, athlete])).values()))
        const nextID = gamesData.reduce((max, game) => Math.max(max, game.gameID), 200) + 1
        setGameID(nextID)
      })
      .catch(() => setError('Failed to load form options.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async () => {
    const payload = {
      gameID,
      gameDate,
      filmURL,
      teams: teams.map(trimEmptyRows),
    }

    if (payload.gameID === '') {
      setError('Game ID is required.')
      return
    }

    const validationPayload = {
      ...payload,
      gameID: Number(payload.gameID),
    }

    const validationError = validateGamePayload(validationPayload)
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)
    try {
      await addGame(validationPayload)
      navigate('/games')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Loading game form...</p>

  return (
    <GameEditorForm
      mode="insert"
      gameID={gameID}
      gameDate={gameDate}
      filmURL={filmURL}
      teams={teams}
      teamOptions={teamOptions}
      athletes={athletes}
      error={error}
      saving={saving}
      onGameDateChange={setGameDate}
      onFilmURLChange={setFilmURL}
      onTeamsChange={setTeams}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/games')}
    />
  )
}
