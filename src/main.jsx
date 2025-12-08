import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StartPage } from './pages/StartPage.jsx'
import { GamePage } from './pages/GamePage.jsx'
import { LeaderboardPage } from './pages/LeaderboardPage.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/start" replace />} />
        <Route path="/start" element={<StartPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
