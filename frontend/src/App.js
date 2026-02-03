import React, { useState, useEffect, useCallback } from 'react';
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

  // Leaflet Map Utilities (Global - for 1-hour demo)
  const initMap = useCallback((mapContainerId) => {
    if (typeof window.L !== 'undefined' && window.L && !window.smartplateMap) {
      window.smartplateMap = window.L.map(mapContainerId).setView([13.0827, 80.2707], 11);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(window.smartplateMap);

      // Sample SmartPlate locations (replace with real API data)
      window.smartplateLocations = [
        {name: '🍚 Donor: Rice 5kg', lat: 13.05, lng: 80.25, type: 'donor'},
        {name: '🥛 Donor: Milk 10L', lat: 13.08, lng: 80.28, type: 'donor'},
        {name: '🥗 NGO Shelter A', lat: 13.07, lng: 80.26, type: 'ngo'},
        {name: '🍞 NGO Soup Kitchen', lat: 13.09, lng: 80.24, type: 'ngo'},
        {name: '🍲 Donor: Veg Curry 3kg', lat: 13.06, lng: 80.27, type: 'donor'},
      ];

      // Haversine distance (km)
      window.getDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      };

      // Find nearest matches
      window.findNearestMatches = (userLat, userLng, maxDist = 20) => {
        if (!window.smartplateMap) return [];
        
        // Clear existing markers
        window.smartplateMap.eachLayer(layer => {
          if (layer instanceof window.L.CircleMarker || layer instanceof window.L.Marker) {
            window.smartplateMap.removeLayer(layer);
          }
        });

        const matches = window.smartplateLocations
          .map(loc => {
            const dist = window.getDistance(userLat, userLng, loc.lat, loc.lng);
            return dist < maxDist ? { ...loc, dist: dist.toFixed(1) } : null;
          })
          .filter(Boolean)
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 5);

        // Add markers
        matches.forEach(match => {
          const color = match.type === 'donor' ? '#28a745' : '#ffc107';
          window.L.circleMarker([match.lat, match.lng], {
            radius: 8,
            fillColor: color,
            color: '#000',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          })
          .addTo(window.smartplateMap)
          .bindPopup(`
            <b>${match.name}</b><br>
            📏 ${match.dist}km away<br>
            <button onclick="window.claimFood('${match.name}')" 
                    style="padding:5px 10px;background:#28a745;color:white;border:none;border-radius:3px;cursor:pointer;">
              Claim Food
            </button>
          `);
        });

        if (matches.length > 0) {
          const group = new window.L.featureGroup(matches.map(m => 
            window.L.circleMarker([m.lat, m.lng])
          ));
          window.smartplateMap.fitBounds(group.getBounds().pad(0.2));
        }

        return matches;
      };

      // Claim food handler
      window.claimFood = (foodName) => {
        alert(`✅ Claimed: ${foodName}\nFood match confirmed!`);
        if (window.posthog) {
          window.posthog.capture('food_claimed', { food: foodName });
        }
      };

      console.log('SmartPlate Map initialized');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2]">
        <div className="animate-pulse text-[#1A4D2E] text-xl font-heading">Loading SmartPlate...</div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Initialize map on app mount */}
      <div 
        id="smartplate-map" 
        style={{ 
          height: '400px', 
          width: '100%', 
          margin: '20px 0',
          display: 'none' 
        }} 
        ref={(el) => {
          if (el && !window.smartplateMap) {
            setTimeout(() => initMap('smartplate-map'), 100);
          }
        }}
      />
      
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to={`/${user.role}`} />} />
          <Route path="/auth/callback" element={<AuthCallback onLogin={handleLogin} />} />
          <Route path="/ngo" element={user && user.role === 'ngo' ? <NGODashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/donor" element={user && user.role === 'donor' ? <DonorDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/volunteer" element={user && user.role === 'volunteer' ? <VolunteerDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={user ? <AnalyticsDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={user ? `/${user.role}` : '/login'} />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
