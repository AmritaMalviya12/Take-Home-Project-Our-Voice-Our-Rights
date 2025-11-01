import React, { useState, useEffect } from 'react';
import config from './config';

function VoiceSearch({ onVoiceSelect, onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('ready');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setStatus('listening');
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setStatus('error');
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          alert('माइक permission denied. कृपया browser settings से allow करें।');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript) {
          processVoiceInput(transcript);
        } else {
          setStatus('ready');
        }
      };

      setRecognition(recognition);
    } else {
      setStatus('unsupported');
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const processVoiceInput = async (spokenText) => {
    setStatus('processing');
    
    try {
      // UPDATED URL - using config
      const response = await fetch(`${config.apiBase}/voice/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spokenText })
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        
        // Get district data - UPDATED URL
        const districtResponse = await fetch(`${config.apiBase}/district/${data.district}`);
        const districtData = await districtResponse.json();
        
        if (districtData.success) {
          setTimeout(() => {
            onVoiceSelect(data.district);
          }, 1000);
        }
      } else {
        setStatus('not_found');
        setTranscript(`"${spokenText}" - ${data.error}`);
      }
    } catch (error) {
      console.error('Voice search API error:', error);
      setStatus('error');
      setTranscript('Network error. Please try again.');
    }
  };

  const startListening = () => {
    if (recognition) {
      setStatus('listening');
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'ready':
        return 'माइक के icon पर क्लिक करें और जिले का नाम बोलें';
      case 'listening':
        return '🔴 सुन रहा हूं... जिले का नाम बोलें';
      case 'processing':
        return '⚡ आपका जिला ढूंढ रहा हूं...';
      case 'success':
        return '✅ जिला मिल गया!';
      case 'not_found':
        return '❌ जिला नहीं मिला। फिर से कोशिश करें';
      case 'error':
        return '❌ त्रुटि हुई। फिर से कोशिश करें';
      case 'unsupported':
        return '❌ आपके browser में voice support नहीं है';
      default:
        return 'माइक के icon पर क्लिक करें';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening': return '#ff9800';
      case 'processing': return '#2196f3';
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'not_found': return '#ff9800';
      default: return '#666';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '20px',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{ color: '#e65100', marginBottom: '20px', fontSize: '24px' }}>
          🎤 Voice Search
        </h3>
        
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: isListening ? '#ff9800' : '#2196f3',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: status !== 'unsupported' ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s',
          transform: isListening ? 'scale(1.1)' : 'scale(1)',
          animation: isListening ? 'pulse 1s infinite' : 'none'
        }} 
          onClick={isListening ? stopListening : startListening}
          onMouseOver={(e) => !isListening && (e.target.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => !isListening && (e.target.style.transform = 'scale(1)')}
        >
          <span style={{ fontSize: '40px', color: 'white' }}>
            {isListening ? '🔴' : '🎤'}
          </span>
        </div>

        <div style={{
          padding: '15px',
          margin: '15px 0',
          background: '#f5f5f5',
          borderRadius: '10px',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ 
            color: getStatusColor(),
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {getStatusMessage()}
          </span>
        </div>

        {transcript && (
          <div style={{
            padding: '10px',
            margin: '10px 0',
            background: '#e3f2fd',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <strong>आपने बोला:</strong> "{transcript}"
          </div>
        )}

        <div style={{ 
          margin: '15px 0',
          padding: '10px',
          background: '#fff3e0',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <strong>उदाहरण:</strong> "मिर्जापुर", "आगरा", "लखनऊ"
        </div>

        <button 
          onClick={onClose}
          style={{
            padding: '12px 24px',
            background: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '10px'
          }}
        >
          बंद करें
        </button>

        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default VoiceSearch;