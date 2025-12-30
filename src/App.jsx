import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/pages/HomePage/HomePage'
import RoomLobby from './components/pages/RoomLobby/RoomLobby'
import GameBoard from './components/pages/GameBoard/GameBoard'
import Tutorial from './components/pages/Tutorial/Tutorial'
import SpectatorLobby from './components/pages/SpectatorLobby/SpectatorLobby'
import SpectatorGameBoard from './components/pages/SpectatorGameBoard/SpectatorGameBoard'
import './App.css'

/**
 * Main application component with routing
 *
 * Routes:
 * - / : HomePage (create/join room)
 * - /lobby/:roomId : RoomLobby (wait for players, configure settings)
 * - /game/:roomId : GameBoard (actual game play)
 * - /tutorial : Tutorial (game instructions)
 * - /spectator-lobby : SpectatorLobby (configure AI battle)
 * - /spectator/:roomId : SpectatorGameBoard (watch AI battle)
 */
function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lobby/:roomId" element={<RoomLobby />} />
          <Route path="/game/:roomId" element={<GameBoard />} />
          <Route path="/tutorial" element={<Tutorial />} />
          <Route path="/spectator-lobby" element={<SpectatorLobby />} />
          <Route path="/spectator/:roomId" element={<SpectatorGameBoard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
