import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteGame, editGame, getAthletes, getGame, getTeams } from '../api'
import GameEditorForm from '../components/games/GameEditorForm'
import {
  createEmptyTeamSection,
  normalizeTeamSection,
  trimEmptyRows,
  validateGamePayload,
} from '../components/games/gameFormHelpers'
import type { AthleteWithStats, GameTeamFormSection, TeamOption } from '../types'

export default function GameEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const gameID = Number(id)
  const [gameDate, setGameDate] = useState('')
  const [filmURL, setFilmURL] = useState('')
  const [teams, setTeams] = useState<GameTeamFormSection[]>([createEmptyTeamSection(), createEmptyTeamSection()])
  const [teamOptions, setTeamOptions] = useState<TeamOption[]>([])
  const [athletes, setAthletes] = useState<AthleteWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getTeams(), getAthletes(), getGame(gameID)])
      .then(([teamsData, athletesData, gameData]) => {
        setTeamOptions(teamsData)
        setAthletes(Array.from(new Map(athletesData.map(athlete => [athlete.id, athlete])).values()))
        setGameDate(gameData.game.gameDate)
        setFilmURL(gameData.filmURL ?? '')
        setTeams([
          normalizeTeamSection(gameData.teams[0]),
          normalizeTeamSection(gameData.teams[1]),
        ])
      })
      .catch(() => setError('Failed to load game.'))
      .finally(() => setLoading(false))
  }, [gameID])

  const handleSubmit = async () => {
    const payload = {
      gameDate,
      filmURL,
      teams: teams.map(trimEmptyRows),
    }

    const validationError = validateGamePayload(payload)
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)
    try {
      await editGame(gameID, payload)
      navigate('/games')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update game.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this entire game? This will remove all player stats and film links for this game.'
    )
    if (!confirmed) return

    setSaving(true)
    setError(null)
    try {
      await deleteGame(gameID)
      navigate('/games')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete game.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Loading game...</p>

  return (
    <GameEditorForm
      mode="edit"
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
      onDelete={handleDelete}
    />
  )
}
