import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import MapDashboard from './pages/MapDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{padding: '20px', background: '#green', color: 'white'}}>
          <Link to="/map" style={{color: 'white', marginRight: '20px', fontSize: '24px'}}>
            🗺️ SmartPlate Map
          </Link>
          <Link to="/" style={{color: 'white'}}>Login</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/map" element={<MapDashboard />} />
          <Route path="*" element={<MapDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
