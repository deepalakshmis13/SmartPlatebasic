import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import NGODashboard from './pages/NGODashboard';
import DonorDashboard from './pages/DonorDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Toaster } from 'sonner';
import { io } from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
let socket = null;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      
      if (!socket) {
        socket = io(BACKEND_URL, {
          transports: ['websocket', 'polling']
        });
        
        socket.on('connect', () => {
          console.log('WebSocket connected');
        });
        
        socket.on('request_status_changed', (data) => {
          window.dispatchEvent(new CustomEvent('request_status_changed', { detail: data }));
        });
        
        socket.on('new_request', (data) => {
          window.dispatchEvent(new CustomEvent('new_request', { detail: data }));
        });
        
        socket.on('verification_updated', (data) => {
          window.dispatchEvent(new CustomEvent('verification_updated', { detail: data }));
        });
      }
    }
    setLoading(false);
    
    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2]">
        <div className="animate-pulse text-[#1A4D2E] text-xl font-heading">Loading SmartPlate...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* ✅ ALL ORIGINAL ROUTES PRESERVED */}
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to={`/${user.role}`} />} />
          <Route path="/auth/callback" element={<AuthCallback onLogin={handleLogin} />} />
          <Route path="/ngo" element={user && user.role === 'ngo' ? <NGODashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/donor" element={user && user.role === 'donor' ? <DonorDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/volunteer" element={user && user.role === 'volunteer' ? <VolunteerDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={user ? <AnalyticsDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          
          {/* ✅ NEW MAP ROUTE ADDED */}
          <Route path="/map" element={user ? (
            <MapDashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )} />
          
          <Route path="/" element={<Navigate to={user ? `/${user.role}` : '/login'} />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

// ✅ NEW MapDashboard COMPONENT (Inline - No new file needed!)
const MapDashboard = ({ user, onLogout }) => {
  const findNearestFood = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          window.findNearestMatches(pos.coords.latitude, pos.coords.longitude);
          document.querySelector('.smartplate-map-btn')?.classList.add('animate-pulse');
          setTimeout(() => {
            document.querySelector('.smartplate-map-btn')?.classList.remove('animate-pulse');
          }, 2000);
        },
        (err) => {
          console.log('Using Chennai fallback');
          window.findNearestMatches(13.0827, 80.2707); // Chennai center
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      window.findNearestMatches(13.0827, 80.2707);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F7F2] to-[#E8F5E8] p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1A4D2E] to-[#28a745] bg-clip-text text-transparent">
            🗺️ SmartPlate Map Dashboard
          </h1>
          <button 
            onClick={onLogout}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Find Nearest Button */}
        <div className="text-center mb-8">
          <button 
            className="smartplate-map-btn"
            onClick={findNearestFood}
          >
            📍 Find Nearest Food Matches (20km radius)
          </button>
          <p className="text-gray-600 mt-2">
            {user.role === 'ngo' ? 'Find nearby food donors' : 'Find nearby NGOs'}
          </p>
        </div>

        {/* Map Container */}
        <div className="smartplate-matches mb-8">
          <h3 className="text-xl font-semibold mb-4">📋 Nearest Matches Will Appear Here</h3>
          <div id="smartplate-map-matches" className="text-center py-8 text-gray-500">
            Click "Find Nearest" to discover food within 20km! 🌟
          </div>
        </div>

        {/* Interactive Map */}
        <div id="smartplate-map" className="mb-8"></div>
      </div>
    </div>
  );
};

export default App;
