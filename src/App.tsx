import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import AthletesPage from './pages/AthletesPage'

export default function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<AthletesPage />} />
      <Route path="/athletes" element={<AthletesPage />} />
    </Routes>
    </BrowserRouter>
  )
}