import React from 'react';

export default function MapDashboard() {
  return (
    <div style={{padding: '50px', textAlign: 'center'}}>
      <h1>🗺️ SmartPlate - Find Nearest Food Matches</h1>
      <p>Chennai Food Donor Map (Hackathon Demo)</p>
      <div style={{height: '600px', margin: '20px auto', maxWidth: '1000px'}}>
        <iframe
          src="/index.html"
          width="100%"
          height="100%"
          title="SmartPlate Map"
          style={{border: 'none', borderRadius: '12px'}}
        />
      </div>
      <button 
        style={{
          padding: '15px 30px', 
          fontSize: '18px', 
          background: '#4CAF50', 
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
        onClick={() => alert('GPS Location → Green Chennai Donor Markers! 🎉')}
      >
        🎯 Find Nearest Food Matches
      </button>
    </div>
  );
}
