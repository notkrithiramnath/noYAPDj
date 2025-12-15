import React from 'react';
import { spotifyService } from '../services/spotifyService';
import './Login.css';

function Login() {
  return (
    <div className="login-container">
      <div className="background-animation">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-wrapper">
            
              
          </div>
          <h1>NoYapDj </h1>
          <p className="subtitle">Discover, search, and play your favorite music</p>
        </div>

        <button 
          onClick={spotifyService.login}
          className="login-button"
        >
          <span className="button-icon">🎵</span>
          <span>Login with Spotify</span>
        </button>


        <div className="login-features">
          <div className="feature">
            <span className="feature-icon">🔍</span>
            <h3>Dj</h3>
            <p>Get a more accurate DJ that wont play the same 4 songs</p>
          </div>
          <div className="feature">
            <span className="feature-icon">▶️</span>
            <h3>No talking</h3>
            <p>Listen to music uninterrupted</p>
          </div>
          <div className="feature">
            <span className="feature-icon">❤️</span>
            <h3>Not sketchy</h3>
            <p>Promise we wont steal your info</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;