import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import AthletesPage from './pages/AthletesPage'
import AthleteEditPage from './pages/EditPage'
import AthleteInsertPage from './pages/InsertPage'



export default function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<AthletesPage/>} />
      <Route path="/athletes" element={<AthletesPage />} />
      <Route path="/athletes/:id/edit" element={<AthleteEditPage />} />
      <Route path="/athletes/new" element={<AthleteInsertPage />} />
    </Routes>
    </BrowserRouter>
  )
}