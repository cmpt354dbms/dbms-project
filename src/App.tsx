import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import AthletesPage from './pages/AthletesPage'
import AthleteEditPage from './pages/EditPage'
import AthleteInsertPage from './pages/InsertPage'
import CoachesPage from './pages/CoachesPage'
import CoachesEditPage from './pages/CoachesEditPage'
import CoachesInsertPage from './pages/CoachesInsertPage'
import GamesPage from './pages/GamesPage'
import GameInsertPage from './pages/GameInsertPage'
import GameEditPage from './pages/GameEditPage'
import HighSchoolsPage from './pages/HighSchoolsPage'
import HighSchoolInsertPage from './pages/HighSchoolInsertPage'
import HighSchoolEditPage from './pages/HighSchoolEditPage'
import CollegesPage from './pages/CollegesPage'
import CollegeInsertPage from './pages/CollegeInsertPage'
import CollegeEditPage from './pages/CollegeEditPage'
import ScholarshipInsertPage from './pages/ScholarshipInsertPage'



export default function App() {
  return (
    <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<AthletesPage/>} />
      <Route path="/athletes" element={<AthletesPage />} />
      <Route path="/athletes/:id/edit" element={<AthleteEditPage />} />
      <Route path="/athletes/new" element={<AthleteInsertPage />} />
      <Route path="/coaches" element={<CoachesPage />} />
      <Route path="/coaches/:name/edit" element={<CoachesEditPage />} />
      <Route path="/coaches/new" element={<CoachesInsertPage />} />
      <Route path="/games" element={<GamesPage />} />
      <Route path="/games/new" element={<GameInsertPage />} />
      <Route path="/games/:id/edit" element={<GameEditPage />} />
      <Route path="/high-schools" element={<HighSchoolsPage />} />
      <Route path="/high-schools/new" element={<HighSchoolInsertPage />} />
      <Route path="/high-schools/:name/edit" element={<HighSchoolEditPage />} />
      <Route path="/colleges" element={<CollegesPage />} />
      <Route path="/colleges/new" element={<CollegeInsertPage />} />
      <Route path="/colleges/:name/edit" element={<CollegeEditPage />} />
      <Route path="/scholarships/new" element={<ScholarshipInsertPage />} />
    </Routes>
    </BrowserRouter>
  )
}
