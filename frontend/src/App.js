import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import SelectionPage from './components/SelectionPage';
import Dashboard from './components/Dashboard';

function App() {
  const [page, setPage] = useState('landing');
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const goToSelection = () => setPage('selection');
  const goToDashboard = (district) => {
    setSelectedDistrict(district);
    setPage('dashboard');
  };
  const goBack = () => setPage('landing'); // New back function

  return (
    <div className="app" style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '400px',
      margin: 'auto',
      padding: '20px',
      background: 'linear-gradient(to bottom, #fff3e0, #ffecb3)', // Warm yellow gradient
      minHeight: '100vh',
      borderRadius: '20px',
      boxShadow: '0 6px 15px rgba(0,0,0,0.15)'
    }}>
      {page !== 'landing' && (
        <button onClick={goBack} style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: '#ff5722',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>⬅️</button>
      )}
      {page === 'landing' && <LandingPage onManualSelect={goToSelection} onAutoDetect={goToDashboard} />}
      {page === 'selection' && <SelectionPage onSelect={goToDashboard} />}
      {page === 'dashboard' && <Dashboard district={selectedDistrict} />}
    </div>
  );
}

export default App;