import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import MapDashboard from './pages/MapDashboard';

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh' }}>
        <nav style={{
          padding: '20px', 
          background: 'linear-gradient(90deg, #2E7D32, #4CAF50)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <Link to="/map" style={{ 
            color: 'white', 
            textDecoration: 'none', 
            fontSize: '28px',
            fontWeight: 'bold',
            marginRight: '30px'
          }}>
            🗺️ SmartPlate Map
          </Link>
          <Link to="/" style={{ 
            color: 'white', 
            textDecoration: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.2)'
          }}>
            Login
          </Link>
          <span style={{ marginLeft: 'auto', fontSize: '14px', opacity: 0.9 }}>
            Chennai Food Rescue • Hackathon 2026
          </span>
        </nav>
        
        <main style={{ padding: '40px 20px' }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/map" element={<MapDashboard />} />
            <Route path="*" element={<MapDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
