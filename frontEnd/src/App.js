import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';

import Callback from './pages/Callback';
import Mixmaker from './components/Mixmaker';
import './App.css';


function App() {
  //check if logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => { 
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    // <router> to handle routing (i wonder)
    <Router>
      <Routes>
        
        <Route path="/" element={isLoggedIn ? <Navigate to="/search" /> : <Login />} />
        
        <Route path="/callback" element={<Callback />} />
        <Route path="/search" element={isLoggedIn ? <Mixmaker /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
