import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function Callback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    console.log('Callback component mounted'); // Check if component loads
    console.log('Search params:', searchParams.toString()); // Check URL params
    
    const code = searchParams.get('code');
    console.log('Code from URL:', code); // Check if code exists
    
    if (code) {
      console.log('Code found, fetching token...');
      fetch(`http://127.0.0.1:8080/api/callback?code=${code}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to get token');
          return res.json();
        })
        .then((data) => {
          console.log('Response data:', data);
          if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            console.log('Token saved now redirecting...');
            window.location.href = '/search';
          }
        })
        .catch((error) => {
          console.error('Auth error:', error);
          window.location.href = '/';
        });
    } else {
      console.log('No code in URL!');
    }
  }, []);

  return (
    <div style={{ textAlign: 'center', paddingTop: '50px', color: '#fff' }}>
      <h2>Authenticating...</h2>
      <p>Please wait while we log you in.</p>
    </div>
  );
}

export default Callback;