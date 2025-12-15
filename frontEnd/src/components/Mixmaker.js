import React, { useState, useEffect } from 'react';
import './Mixmaker.css';

function SearchTracks() {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [mix, setMix] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load mix from localStorage and fetch top tracks on mount
  useEffect(() => {
    const savedMix = localStorage.getItem('djMix');
    if (savedMix) {
      try {
        setMix(JSON.parse(savedMix));
      } catch (e) {
        console.error('Failed to load mix:', e);
      }
    }
    
    // Fetch user's top tracks
    fetchTopTracks();
  }, []);

  const fetchTopTracks = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      const response = await fetch('http://127.0.0.1:8080/api/top-tracks', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTracks(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch top tracks:', error);
    }
  };

  // Save mix to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('djMix', JSON.stringify(mix));
  }, [mix]);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('Please login first');
      return;
    }

    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `http://127.0.0.1:8080/api/search?q=${encodeURIComponent(query)}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setTracks(data.tracks?.items || []);
      
      if (!data.tracks?.items || data.tracks.items.length === 0) {
        setError('No tracks found');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search tracks');
    }
    setLoading(false);
  };

  const addToMix = (track) => {
    // Check if track is already in mix
    if (!mix.some(t => t.id === track.id)) {
      setMix([...mix, track]);
    }
  };

  const removeFromMix = (trackId) => {
    setMix(mix.filter(t => t.id !== trackId));
  };

  const clearMix = () => {
    setMix([]);
  };

  const moveMixTrack = (fromIndex, toIndex) => {
    const newMix = [...mix];
    const [movedTrack] = newMix.splice(fromIndex, 1);
    newMix.splice(toIndex, 0, movedTrack);
    setMix(newMix);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/';
  };

  return (
    <div className="dj-container">
      <div className="dj-header">
        <h1>🎧 Spotify DJ</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      <div className="dj-layout">
        {/* Search Section */}
        <div className="search-section">
          <h2>🔍 Find Tracks</h2>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search for tracks, artists, or albums..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}

          <div className="tracks-list">
            {loading && <p className="loading">Loading...</p>}
            
            {tracks.length > 0 && (
              <div className="tracks-items">
                <p className="section-label">Results ({tracks.length})</p>
                {tracks.map((track) => (
                  <div key={track.id} className="track-item">
                    <div className="track-item-info">
                      <h4>{track.name}</h4>
                      <p>{track.artists[0]?.name || 'Unknown'}</p>
                    </div>
                    <button 
                      onClick={() => addToMix(track)}
                      className="add-button"
                      disabled={mix.some(t => t.id === track.id)}
                    >
                      {mix.some(t => t.id === track.id) ? '✓ Added' : '+ Add'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!loading && tracks.length === 0 && query && !error && (
              <p className="no-results">Search for your favorite music!</p>
            )}
          </div>
        </div>

        {/* Mix Section */}
        <div className="mix-section">
          <div className="mix-header">
            <h2>🎵 Your Mix</h2>
            {mix.length > 0 && (
              <button onClick={clearMix} className="clear-button">Clear</button>
            )}
          </div>

          {mix.length === 0 ? (
            <div className="empty-mix">
              <p>🎶</p>
              <p>No tracks in your mix yet</p>
              <p>Search and add songs to get started!</p>
            </div>
          ) : (
            <div className="mix-list">
              <p className="section-label">Tracks ({mix.length})</p>
              {mix.map((track, index) => (
                <div key={track.id} className="mix-track">
                  <div className="mix-track-number">{index + 1}</div>
                  <div className="mix-track-info">
                    <h4>{track.name}</h4>
                    <p>{track.artists[0]?.name || 'Unknown'}</p>
                  </div>
                  <div className="mix-track-controls">
                    {index > 0 && (
                      <button 
                        onClick={() => moveMixTrack(index, index - 1)}
                        className="move-button"
                        title="Move up"
                      >
                        ↑
                      </button>
                    )}
                    {index < mix.length - 1 && (
                      <button 
                        onClick={() => moveMixTrack(index, index + 1)}
                        className="move-button"
                        title="Move down"
                      >
                        ↓
                      </button>
                    )}
                    <button 
                      onClick={() => removeFromMix(track.id)}
                      className="remove-button"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              
              {mix.length > 0 && (
                <div className="mix-actions">
                  <a 
                    href={`spotify:playlist`}
                    className="play-mix-button"
                    title="Open in Spotify"
                  >
                    ▶ Play Mix
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchTracks;