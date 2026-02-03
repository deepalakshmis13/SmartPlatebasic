import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import MapDashboard from './pages/MapDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{padding: '20px', background: '#2E7D32', color: 'white'}}>
          <Link to="/map" style={{color: 'white', marginRight: '20px', fontSize: '28px'}}>
            🗺️ SmartPlate Map
          </Link>
          <Link to="/" style={{color: 'white', marginRight: '20px'}}>Login</Link>
          <span style={{fontSize: '14px'}}>Hackathon Demo</span>
        </nav>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/map" element={<MapDashboard />} />
          <Route path="*" element={<MapDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
