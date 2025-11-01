import React, { useState } from 'react';
import VoiceSearch from './VoiceSearch';

function LandingPage({ onManualSelect, onAutoDetect }) {
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);

  const handleAutoDetect = async () => {
    if (navigator.geolocation) {
      // Show loading message
      alert('📍 आपकी लोकेशन डिटेक्ट की जा रही है...');
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Use OpenStreetMap Nominatim API for reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=hi`
            );
            const data = await response.json();
            
            console.log('Location API Response:', data);
            
            // Extract district from address
            const address = data.address;
            let district = '';
            
            if (address.district) {
              district = address.district;
            } else if (address.county) {
              district = address.county;
            } else if (address.city) {
              district = address.city;
            } else if (address.state_district) {
              district = address.state_district;
            } else if (address.state) {
              district = address.state;
            }
            
            if (district) {
              // Check if in Uttar Pradesh or show detected location
              const state = address.state || '';
              if (state.includes('Uttar Pradesh') || state.includes('UP')) {
                alert(`📍 आपका जिला डिटेक्ट हुआ: ${district}`);
                onAutoDetect(district);
              } else {
                alert(`📍 आपका जिला: ${district}\nराज्य: ${state}\n\nआप Uttar Pradesh में नहीं हैं, लेकिन फिर भी डेटा देख सकते हैं!`);
                onAutoDetect(district);
              }
            } else {
              // Fallback to backend location detection
              const backendResponse = await fetch('http://localhost:5000/api/location/detect');
              const backendData = await backendResponse.json();
              
              if (backendData.success) {
                alert(`📍 आपका जिला: ${backendData.district}`);
                onAutoDetect(backendData.district);
              } else {
                alert('❌ जिला डिटेक्ट नहीं हो पाया। कृपया मैन्युअल चुनें।');
                onManualSelect();
              }
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            // Fallback to backend location detection
            try {
              const backendResponse = await fetch('http://localhost:5000/api/location/detect');
              const backendData = await backendResponse.json();
              
              if (backendData.success) {
                alert(`📍 आपका जिला: ${backendData.district}`);
                onAutoDetect(backendData.district);
              } else {
                alert('❌ लोकेशन प्रोसेस करने में त्रुटि। कृपया मैन्युअल चुनें।');
                onManualSelect();
              }
            } catch (fallbackError) {
              alert('❌ लोकेशन प्रोसेस करने में त्रुटि। कृपया मैन्युअल चुनें।');
              onManualSelect();
            }
          }
        },
        (error) => {
          // Handle geolocation errors
          let errorMessage = '❌ लोकेशन एक्सेस में त्रुटि। ';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'कृपया लोकेशन permission दें या मैन्युअल चुनें।';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'लोकेशन information unavailable है।';
              break;
            case error.TIMEOUT:
              errorMessage += 'लोकेशन request timeout हो गई।';
              break;
            default:
              errorMessage += 'अनजान error आया है।';
              break;
          }
          
          alert(errorMessage);
          
          // Try backend fallback
          fetch('http://localhost:5000/api/location/detect')
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                alert(`📍 आपका जिला: ${data.district}`);
                onAutoDetect(data.district);
              } else {
                onManualSelect();
              }
            })
            .catch(() => {
              onManualSelect();
            });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    } else {
      alert('❌ आपके browser में location support नहीं है। कृपया मैन्युअल चुनें।');
      onManualSelect();
    }
  };

  const handleVoiceSelect = (district) => {
    setShowVoiceSearch(false);
    onAutoDetect(district);
  };

  const buttonStyle = {
    width: '100%',
    height: '100px',
    fontSize: '22px',
    margin: '20px 0',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'transform 0.3s, box-shadow 0.3s',
    boxShadow: '0 5px 12px rgba(0,0,0,0.25)',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: 'white',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
  };

  const containerStyle = {
    textAlign: 'center',
    animation: 'fadeIn 1.5s',
    padding: '20px'
  };

  const titleStyle = {
    fontSize: '32px',
    color: '#e65100',
    marginBottom: '15px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
  };

  const subtitleStyle = {
    fontSize: '18px',
    color: '#555',
    marginBottom: '30px',
    lineHeight: '1.5'
  };

  const infoBoxStyle = {
    marginTop: '25px',
    padding: '15px',
    background: '#e3f2fd',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#1565c0',
    lineHeight: '1.6',
    border: '2px solid #bbdefb'
  };

  return (
    <div style={containerStyle}>
      {showVoiceSearch && (
        <VoiceSearch 
          onVoiceSelect={handleVoiceSelect}
          onClose={() => setShowVoiceSearch(false)}
        />
      )}
      
      <h1 style={titleStyle}>🌾 हमारे गांव का काम</h1>
      <p style={subtitleStyle}>
        MGNREGA डेटा आसानी से देखें<br />
        <span style={{ fontSize: '16px', color: '#777' }}>
          आपके जिले का रोजगार, मजदूरी और काम का डेटा
        </span>
      </p>
      
      {/* Manual Selection Button */}
      <button 
        onClick={onManualSelect} 
        style={{ 
          ...buttonStyle, 
          background: 'linear-gradient(145deg, #4caf50, #388e3c)',
        }}
        onMouseOver={(e) => { 
          e.target.style.transform = 'scale(1.05)'; 
          e.target.style.boxShadow = '0 8px 20px rgba(76, 175, 80, 0.4)'; 
        }}
        onMouseOut={(e) => { 
          e.target.style.transform = 'scale(1)'; 
          e.target.style.boxShadow = '0 5px 12px rgba(0,0,0,0.25)'; 
        }}
      >
        <span style={{ fontSize: '28px' }}>🗺️</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: 'bold' }}>मैं अपना जिला चुनूंगा</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>ड्रॉपडाउन से जिला चुनें</div>
        </div>
      </button>
      
      {/* Voice Search Button */}
      <button 
        onClick={() => setShowVoiceSearch(true)}
        style={{ 
          ...buttonStyle, 
          background: 'linear-gradient(145deg, #9c27b0, #7b1fa2)',
        }}
        onMouseOver={(e) => { 
          e.target.style.transform = 'scale(1.05)'; 
          e.target.style.boxShadow = '0 8px 20px rgba(156, 39, 176, 0.4)'; 
        }}
        onMouseOut={(e) => { 
          e.target.style.transform = 'scale(1)'; 
          e.target.style.boxShadow = '0 5px 12px rgba(0,0,0,0.25)'; 
        }}
      >
        <span style={{ fontSize: '28px' }}>🎤</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: 'bold' }}>आवाज से जिला चुनें</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>"मिर्जापुर", "आगरा" बोलें</div>
        </div>
      </button>
      
      {/* Location Detect Button */}
      <button 
        onClick={handleAutoDetect} 
        style={{ 
          ...buttonStyle, 
          background: 'linear-gradient(145deg, #2196f3, #1976d2)',
        }}
        onMouseOver={(e) => { 
          e.target.style.transform = 'scale(1.05)'; 
          e.target.style.boxShadow = '0 8px 20px rgba(33, 150, 243, 0.4)'; 
        }}
        onMouseOut={(e) => { 
          e.target.style.transform = 'scale(1)'; 
          e.target.style.boxShadow = '0 5px 12px rgba(0,0,0,0.25)'; 
        }}
      >
        <span style={{ fontSize: '28px' }}>📍</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: 'bold' }}>मेरी लोकेशन से पता लगाओ</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>GPS से आटोमेटिक डिटेक्ट</div>
        </div>
      </button>
      
      {/* Information Box */}
      <div style={infoBoxStyle}>
        <strong>ℹ️ जानकारी:</strong>
        <br/>• <strong>जिला चुनें:</strong> ड्रॉपडाउन से मनपसंद जिला चुनें
        <br/>• <strong>आवाज से:</strong> "मिर्जापुर", "आगरा" बोलकर चुनें
        <br/>• <strong>लोकेशन:</strong> GPS से ऑटोमेटिक जिला डिटेक्ट
        <br/>• <strong>डेटा:</strong> रोजगार, मजदूरी, काम का पूरा डेटा
      </div>

      {/* Features List */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px',
        background: 'linear-gradient(145deg, #fff3e0, #ffecb3)',
        borderRadius: '12px',
        border: '2px solid #ffd54f'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#e65100', marginBottom: '10px' }}>
          ✅ आपको मिलेगा:
        </div>
        <div style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
          • रोजगार प्राप्त परिवारों की संख्या<br/>
          • कुल मजदूरी वितरण<br/>
          • काम के दिन और प्रगति<br/>
          • पिछले सालों से तुलना<br/>
          • आवाज में सुनने की सुविधा
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { 
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95); 
          } 
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          } 
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        
        .app {
          animation: pulse 3s infinite;
        }
      `}</style>
    </div>
  );
}

export default LandingPage;