import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AuthCallback({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const userData = urlParams.get('user');
    
    if (token && userData) {
      try {
        onLogin(token, JSON.parse(decodeURIComponent(userData)));
        navigate('/ngo');
      } catch(e) {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [location, navigate, onLogin]);

  return (
    <div style={{padding: '50px', textAlign: 'center'}}>
      <h1>🔄 Authenticating...</h1>
      <p>SmartPlate Map ready at <b>/map</b></p>
    </div>
  );
}
