import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGames, getTeams } from '../api'
import type { GameSummary, TeamOption } from '../types'

const formatTeams = (game: GameSummary) => {
  if (game.teams.length === 0) return 'No teams recorded'
  return game.teams.map(team => team.teamName).join(' vs ')
}

const formatScore = (game: GameSummary) => {
  if (game.teams.length === 0) return 'No score'
  return game.teams.map(team => team.totalScore).join(' - ')
}

export default function GamesPage() {
  const navigate = useNavigate()
  const [games, setGames] = useState<GameSummary[]>([])
  const [teams, setTeams] = useState<TeamOption[]>([])
  const [teamFilter, setTeamFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getGames(), getTeams()])
      .then(([gamesData, teamsData]) => {
        setGames(gamesData)
        setTeams(teamsData)
      })
      .catch(() => setError('Failed to load games.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading games...</p>

  const filteredGames = games.filter(game => {
    const matchesTeam = teamFilter
      ? game.teams.some(team => team.teamName === teamFilter)
      : true
    const matchesStart = startDate ? game.gameDate >= startDate : true
    const matchesEnd = endDate ? game.gameDate <= endDate : true
    return matchesTeam && matchesStart && matchesEnd
  })

  const clearFilters = () => {
    setTeamFilter('')
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="games-page">
      <div className="page-heading-row">
        <div>
          <h1>Games</h1>
          <p className="muted-text">Chronological game records built from player stat rows.</p>
        </div>
        <button className="primary-button" onClick={() => navigate('/games/new')}>
          + Add Game
        </button>
      </div>


      {error && <div className="error-banner">{error}</div>}

      <section className="game-filters">
        <label>
          Team
          <select value={teamFilter} onChange={event => setTeamFilter(event.target.value)}>
            <option value="">All teams</option>
            {teams.map(team => (
              <option key={team.name} value={team.name}>{team.name}</option>
            ))}
          </select>
        </label>
        <label>
          Start date
          <input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} />
        </label>
        <label>
          End date
          <input type="date" value={endDate} onChange={event => setEndDate(event.target.value)} />
        </label>
        <button className="secondary-button" type="button" onClick={clearFilters}>
          Clear filters
        </button>
      </section>

      <div className="games-grid">
        {filteredGames.map(game => (
          <article className="game-card" key={game.gameID}>
            <div className="game-card-header">
              <div>
                <h2>{formatTeams(game)}</h2>
                <p>Game #{game.gameID}</p>
              </div>
              <button
                className="icon-button"
                title="Edit game"
                onClick={() => navigate(`/games/${game.gameID}/edit`)}
              >
                Edit
              </button>
            </div>

            <div className="game-card-body">
              <span>
                <strong>Date</strong>
                {game.gameDate}
              </span>
              <span>
                <strong>Score</strong>
                {formatScore(game)}
              </span>
              <span>
                <strong>Players</strong>
                {game.teams.reduce((total, team) => total + team.playerCount, 0)}
              </span>
            </div>
            {game.filmURL && (
              <div className="game-card-film">
                <a href={game.filmURL} target="_blank" rel="noreferrer">
                  Open game film
                </a>
              </div>
            )}
          </article>
        ))}
      </div>

      {filteredGames.length === 0 && <p>No games found.</p>}
    </div>
  )
}
