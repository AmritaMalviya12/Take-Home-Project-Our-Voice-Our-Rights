import React, { useState, useEffect } from 'react';

function SelectionPage({ onSelect }) {
  const [state, setState] = useState('Uttar Pradesh');
  const [district, setDistrict] = useState('');
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load districts from backend
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/districts/list');
        const data = await response.json();
        
        if (data.success) {
          setDistricts(data.data);
        } else {
          // Fallback districts
          setDistricts([
            'Agra', 'Lucknow', 'Kanpur', 'Varanasi', 'Meerut', 
            'Prayagraj', 'Gorakhpur', 'Aligarh', 'Bareilly', 'Moradabad'
          ]);
        }
      } catch (error) {
        console.error('Error loading districts:', error);
        // Fallback districts
        setDistricts([
          'Agra', 'Lucknow', 'Kanpur', 'Varanasi', 'Meerut', 
          'Prayagraj', 'Gorakhpur', 'Aligarh', 'Bareilly', 'Moradabad'
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDistricts();
  }, []);

  const handleSubmit = () => {
    if (district) {
      if (typeof onSelect === 'function') {
        onSelect(district);
      } else {
        console.error('onSelect is not a function');
      }
    } else {
      alert('कृपया जिला चुनें!');
    }
  };

  const selectStyle = {
    fontSize: '20px',
    padding: '15px',
    width: '100%',
    borderRadius: '15px',
    border: '3px solid #ddd',
    margin: '15px 0',
    backgroundColor: '#fff',
    boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
    fontWeight: 'bold'
  };

  const buttonStyle = {
    width: '100%',
    height: '80px',
    fontSize: '22px',
    background: 'linear-gradient(45deg, #ff9800, #ffa726)',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'transform 0.3s',
    boxShadow: '0 5px 12px rgba(0,0,0,0.25)',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '24px', color: '#ff9800' }}>⏳ जिले लोड हो रहे हैं...</div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', animation: 'fadeIn 1.5s' }}>
      <h2 style={{ fontSize: '28px', color: '#e65100', marginBottom: '25px' }}>🏛️ राज्य और जिला चुनें</h2>
      
      <label style={{ fontSize: '20px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>राज्य: </label>
      <select value={state} onChange={(e) => setState(e.target.value)} style={selectStyle}>
        <option value="Uttar Pradesh">Uttar Pradesh</option>
        <option value="Bihar">Bihar</option>
        <option value="Madhya Pradesh">Madhya Pradesh</option>
      </select>
      
      <label style={{ fontSize: '20px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>जिला: </label>
      <select 
        value={district} 
        onChange={(e) => setDistrict(e.target.value)} 
        style={selectStyle}
      >
        <option value="">जिला चुनें...</option>
        {districts.map((districtObj, index) => (
          <option key={index} value={typeof districtObj === 'object' ? districtObj.district_name : districtObj}>
            {typeof districtObj === 'object' ? districtObj.district_name : districtObj}
          </option>
        ))}
      </select>
      
      <button 
        onClick={handleSubmit} 
        style={buttonStyle}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.08)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        ✅ <span>आगे बढ़ें</span>
      </button>
      
      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}</style>
    </div>
  );
}

export default SelectionPage;