import { BrowserRouter, Routes, Route } from 'react-router-dom'

import AthletesPage from './pages/AthletesPage'
import AthleteEditPage from './pages/EditPage'
import AthleteInsertPage from './pages/InsertPage'
import CoachesPage from './pages/CoachesPage'
import CoachesEditPage from './pages/CoachesEditPage'
import CoachesInsertPage from './pages/CoachesInsertPage'
import GamesPage from './pages/GamesPage'
import GameInsertPage from './pages/GameInsertPage'
import GameEditPage from './pages/GameEditPage'



export default function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<AthletesPage/>} />
      <Route path="/athletes" element={<AthletesPage />} />
      <Route path="/athletes/:id/edit" element={<AthleteEditPage />} />
      <Route path="/athletes/new" element={<AthleteInsertPage />} />
      <Route path="/coaches" element={<CoachesPage />} />
      <Route path="/coaches/:id/edit" element={<CoachesEditPage />} />
      <Route path="/coaches/new" element={<CoachesInsertPage />} />
      <Route path="/games" element={<GamesPage />} />
      <Route path="/games/new" element={<GameInsertPage />} />
      <Route path="/games/:id/edit" element={<GameEditPage />} />
    </Routes>
    </BrowserRouter>
  )
}
