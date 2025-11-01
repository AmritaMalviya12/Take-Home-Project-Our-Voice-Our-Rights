import React, { useState } from 'react';

function Dashboard({ district }) {
  const [showPastData, setShowPastData] = useState(false);

  const data = {
    current: { workDays: 500, money: 5000000, jobs: 1000 },
    last: { workDays: 400, money: 4000000, jobs: 800 }
  };

  const pastData = [
    { year: 2023, workDays: 400, money: 40, jobs: 800 },
    { year: 2022, workDays: 350, money: 35, jobs: 700 },
    { year: 2021, workDays: 300, money: 30, jobs: 600 },
    { year: 2020, workDays: 250, money: 25, jobs: 500 },
    { year: 2019, workDays: 200, money: 20, jobs: 400 }
  ];

  const calculateProgress = (current, last) => {
    const percent = Math.round(((current - last) / last) * 100);
    const barColor = percent > 0 ? '#4caf50' : '#f44336';
    const emoji = percent > 0 ? '👍' : '😔';
    const comparisonText = percent > 0 ? `पिछले साल से ${percent}% ज्यादा – बेहतर!` : `पिछले साल से ${Math.abs(percent)}% कम – पिछला साल अच्छा था।`;
    return { percent, barColor, emoji, comparisonText };
  };

  const workProgress = calculateProgress(data.current.workDays, data.last.workDays);
  const moneyProgress = calculateProgress(data.current.money, data.last.money);
  const jobsProgress = calculateProgress(data.current.jobs, data.last.jobs);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };

  const cardStyle = {
    background: 'linear-gradient(45deg, #81c784, #a5d6a7)',
    padding: '20px', // Reduced padding for compactness
    margin: '15px 0', // Reduced margin
    borderRadius: '15px', // Smaller radius
    color: 'white',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)', // Lighter shadow
    fontSize: '18px', // Slightly smaller font
    fontWeight: 'bold',
    animation: 'fadeIn 1s',
    textAlign: 'left'
  };

  const progressBarStyle = {
    width: '100%',
    height: '15px', // Thinner bar
    backgroundColor: '#ddd',
    borderRadius: '7px',
    overflow: 'hidden',
    marginTop: '8px'
  };

  const progressFillStyle = (color) => ({
    width: '70%',
    height: '100%',
    backgroundColor: color,
    transition: 'width 1s ease-in-out'
  });

  const getPastProgressEmoji = (current, previous) => (current > previous ? '👍' : '😔');

  return (
    <div style={{ textAlign: 'center', animation: 'fadeIn 1s', padding: '10px' }}> {/* Added padding for mobile edges */}
      <h2 style={{ fontSize: '26px', color: '#e65100', marginBottom: '20px' }}>📍 {district} जिला</h2>
      
      <div style={cardStyle}>
        🚜 काम के दिन: इस साल {data.current.workDays}, पिछले साल {data.last.workDays}। {workProgress.comparisonText} {workProgress.emoji}
        <div style={progressBarStyle}>
          <div style={progressFillStyle(workProgress.barColor)}></div>
        </div>
      </div>
      
      <div style={cardStyle}>
        💰 पैसे खर्च हुए: इस साल {data.current.money / 100000} लाख, पिछले साल {data.last.money / 100000} लाख। {moneyProgress.comparisonText} {moneyProgress.emoji}
        <div style={progressBarStyle}>
          <div style={progressFillStyle(moneyProgress.barColor)}></div>
        </div>
      </div>
      
      <div style={cardStyle}>
        👷 नौकरियां बनीं: इस साल {data.current.jobs}, पिछले साल {data.last.jobs}। {jobsProgress.comparisonText} {jobsProgress.emoji}
        <div style={progressBarStyle}>
          <div style={progressFillStyle(jobsProgress.barColor)}></div>
        </div>
      </div>
      
      <button 
        onClick={() => speakText(`जिला ${district} में इस साल काम के दिन ${data.current.workDays} हैं, जो पिछले साल से ${workProgress.percent}% ज्यादा हैं।`)} 
        style={{
          width: '100%',
          height: '70px', // Slightly smaller
          fontSize: '20px',
          background: 'linear-gradient(45deg, #9c27b0, #ab47bc)',
          color: 'white',
          border: 'none',
          borderRadius: '15px',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          fontWeight: 'bold',
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        🔊 <span>सुनें</span>
      </button>
      
      <button 
        onClick={() => setShowPastData(!showPastData)} 
        style={{
          width: '100%',
          height: '70px',
          fontSize: '20px',
          background: 'linear-gradient(45deg, #ff9800, #ffa726)',
          color: 'white',
          border: 'none',
          borderRadius: '15px',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          fontWeight: 'bold',
          marginTop: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        📊 <span>पुराने सालों का डेटा देखें</span>
      </button>
      
      {showPastData && (
        <div style={{ marginTop: '15px', textAlign: 'left', overflowX: 'auto' }}> {/* Horizontal scroll for table */}
          <h3 style={{ fontSize: '20px', color: '#e65100' }}>पुराने सालों का डेटा</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px', minWidth: '300px' }}> {/* Min width for scroll */}
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd', fontSize: '14px' }}>साल</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', fontSize: '14px' }}>काम के दिन</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', fontSize: '14px' }}>पैसे (लाख)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', fontSize: '14px' }}>नौकरियां</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', fontSize: '14px' }}>प्रोग्रेस</th>
              </tr>
            </thead>
            <tbody>
              {pastData.map((item, index) => {
                const prevItem = pastData[index + 1];
                const emoji = prevItem ? getPastProgressEmoji(item.workDays, prevItem.workDays) : '👍';
                return (
                  <tr key={item.year}>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.year}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.workDays}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.money}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.jobs}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{emoji}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default Dashboard;
