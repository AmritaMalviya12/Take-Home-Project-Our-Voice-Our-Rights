const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const cron = require('node-cron');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const DataSyncService = require('./services/dataSyncService');

// Route imports
const districtRoutes = require('./routes/districts');
const performanceRoutes = require('./routes/performance');
const compareRoutes = require('./routes/compare');
const locationRoutes = require('./routes/location');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/districts', districtRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/location', locationRoutes);

// ================== NEW ROUTES FOR REACT FRONTEND ==================

// Voice search route
app.post('/api/voice/search', async (req, res) => {
  try {
    const { spokenText } = req.body;
    
    if (!spokenText) {
      return res.json({
        success: false,
        error: 'No voice input received'
      });
    }

    console.log('Voice input received:', spokenText);

    // All Uttar Pradesh districts for voice matching
    const upDistricts = [
      'Agra', 'Lucknow', 'Kanpur', 'Varanasi', 'Meerut', 'Prayagraj', 
      'Gorakhpur', 'Aligarh', 'Bareilly', 'Moradabad', 'Mirzapur',
      'Saharanpur', 'Ghaziabad', 'Jhansi', 'Faizabad', 'Sultanpur',
      'Azamgarh', 'Banda', 'Bulandshahr', 'Deoria', 'Etawah', 'Farrukhabad',
      'Fatehpur', 'Ghazipur', 'Gonda', 'Hamirpur', 'Hardoi', 'Jalaun',
      'Jaunpur', 'Kannauj', 'Lakhimpur', 'Lalitpur', 'Maharajganj',
      'Mainpuri', 'Mathura', 'Mau', 'Pilibhit', 'Pratapgarh', 'Rae Bareli',
      'Rampur', 'Saharanpur', 'Sant Kabir Nagar', 'Shahjahanpur', 'Sitapur',
      'Sonbhadra', 'Unnao'
    ];

    // Hindi district names mapping
    const hindiDistricts = {
      'mirzapur': 'Mirzapur',
      'मिर्जापुर': 'Mirzapur',
      'आगरा': 'Agra',
      'लखनऊ': 'Lucknow', 
      'कानपुर': 'Kanpur',
      'वाराणसी': 'Varanasi',
      'मेरठ': 'Meerut',
      'प्रयागराज': 'Prayagraj',
      'गोरखपुर': 'Gorakhpur',
      'अलीगढ़': 'Aligarh',
      'बरेली': 'Bareilly',
      'मुरादाबाद': 'Moradabad',
      'मिर्जापुर': 'Mirzapur',
      'झांसी': 'Jhansi',
      'गाजियाबाद': 'Ghaziabad'
    };

    // Clean and normalize the spoken text
    const cleanText = spokenText.toLowerCase().trim();
    
    // Check for exact matches in Hindi
    if (hindiDistricts[cleanText]) {
      return res.json({
        success: true,
        district: hindiDistricts[cleanText],
        matchType: 'exact_hindi',
        confidence: 'high'
      });
    }

    // Check for partial matches
    let bestMatch = null;
    let highestConfidence = 0;

    upDistricts.forEach(district => {
      const districtLower = district.toLowerCase();
      
      // Exact match
      if (cleanText.includes(districtLower) || districtLower.includes(cleanText)) {
        if (districtLower.length > highestConfidence) {
          bestMatch = district;
          highestConfidence = districtLower.length;
        }
      }
    });

    // Phonetic matches for common mispronunciations
    const phoneticMatches = {
      'mirjapur': 'Mirzapur',
      'mirjapur': 'Mirzapur', 
      'mirjapur': 'Mirzapur',
      'varanasi': 'Varanasi',
      'banaras': 'Varanasi',
      'allahabad': 'Prayagraj',
      'prayag': 'Prayagraj',
      'lakhnow': 'Lucknow',
      'kanpur city': 'Kanpur'
    };
    
    if (phoneticMatches[cleanText] && !bestMatch) {
      bestMatch = phoneticMatches[cleanText];
      highestConfidence = 8;
    }

    if (bestMatch) {
      return res.json({
        success: true,
        district: bestMatch,
        matchType: 'voice_match',
        confidence: highestConfidence > 5 ? 'high' : 'medium'
      });
    }

    // No match found
    res.json({
      success: false,
      error: 'जिला नहीं मिला। कृपया फिर से बोलें।',
      suggestions: upDistricts.slice(0, 5)
    });

  } catch (error) {
    console.error('Voice search error:', error);
    res.status(500).json({
      success: false,
      error: 'Voice processing error'
    });
  }
});

// Get district by name for voice search
app.get('/api/district/:districtName', async (req, res) => {
  try {
    const { districtName } = req.params;
    
    // Demo performance data for any district
    const performanceData = {
      district: districtName,
      currentYear: new Date().getFullYear(),
      performance: {
        current: {
          workDays: Math.floor(Math.random() * 50000) + 20000,
          money: Math.floor(Math.random() * 50000000) + 20000000,
          jobs: Math.floor(Math.random() * 5000) + 2000,
          totalWorks: Math.floor(Math.random() * 200) + 100,
          completedWorks: Math.floor(Math.random() * 150) + 50
        },
        lastYear: {
          workDays: Math.floor(Math.random() * 40000) + 15000,
          money: Math.floor(Math.random() * 40000000) + 15000000,
          jobs: Math.floor(Math.random() * 4000) + 1500,
          totalWorks: Math.floor(Math.random() * 180) + 80,
          completedWorks: Math.floor(Math.random() * 120) + 40
        }
      }
    };
    
    res.json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Districts list for React frontend
app.get('/api/districts/list', async (req, res) => {
  try {
    const districts = [
      { district_code: 'UP01', district_name: 'Agra', state_name: 'Uttar Pradesh' },
      { district_code: 'UP02', district_name: 'Lucknow', state_name: 'Uttar Pradesh' },
      { district_code: 'UP03', district_name: 'Kanpur', state_name: 'Uttar Pradesh' },
      { district_code: 'UP04', district_name: 'Varanasi', state_name: 'Uttar Pradesh' },
      { district_code: 'UP05', district_name: 'Meerut', state_name: 'Uttar Pradesh' },
      { district_code: 'UP06', district_name: 'Prayagraj', state_name: 'Uttar Pradesh' },
      { district_code: 'UP07', district_name: 'Gorakhpur', state_name: 'Uttar Pradesh' },
      { district_code: 'UP08', district_name: 'Aligarh', state_name: 'Uttar Pradesh' },
      { district_code: 'UP09', district_name: 'Bareilly', state_name: 'Uttar Pradesh' },
      { district_code: 'UP10', district_name: 'Moradabad', state_name: 'Uttar Pradesh' },
      { district_code: 'UP11', district_name: 'Mirzapur', state_name: 'Uttar Pradesh' },
      { district_code: 'UP12', district_name: 'Jhansi', state_name: 'Uttar Pradesh' },
      { district_code: 'UP13', district_name: 'Ghaziabad', state_name: 'Uttar Pradesh' },
      { district_code: 'UP14', district_name: 'Saharanpur', state_name: 'Uttar Pradesh' }
    ];
    
    res.json({
      success: true,
      data: districts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Performance data for React frontend
app.get('/api/performance/:districtName', async (req, res) => {
  try {
    const { districtName } = req.params;
    
    // Realistic MGNREGA data
    const performanceData = {
      current: {
        workDays: Math.floor(Math.random() * 50000) + 20000,
        money: Math.floor(Math.random() * 50000000) + 20000000,
        jobs: Math.floor(Math.random() * 5000) + 2000,
        totalWorks: Math.floor(Math.random() * 200) + 100,
        completedWorks: Math.floor(Math.random() * 150) + 50
      },
      lastYear: {
        workDays: Math.floor(Math.random() * 40000) + 15000,
        money: Math.floor(Math.random() * 40000000) + 15000000,
        jobs: Math.floor(Math.random() * 4000) + 1500,
        totalWorks: Math.floor(Math.random() * 180) + 80,
        completedWorks: Math.floor(Math.random() * 120) + 40
      }
    };
    
    // Past 5 years data
    const currentYear = new Date().getFullYear();
    const pastData = [];
    
    for (let i = 1; i <= 5; i++) {
      const year = currentYear - i;
      pastData.push({
        year: year,
        workDays: Math.floor(Math.random() * 30000) + 10000,
        money: Math.floor(Math.random() * 30000000) + 10000000,
        jobs: Math.floor(Math.random() * 3000) + 1000,
        totalWorks: Math.floor(Math.random() * 150) + 50,
        completedWorks: Math.floor(Math.random() * 100) + 30
      });
    }
    
    res.json({
      success: true,
      district: districtName,
      currentYear: currentYear,
      performance: performanceData,
      pastData: pastData.reverse()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working perfectly!',
    timestamp: new Date().toISOString()
  });
});

// Data refresh endpoint
app.post('/api/refresh-data', async (req, res) => {
  try {
    const result = await DataSyncService.syncAllData();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Data refreshed successfully',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MGNREGA API is running',
    timestamp: new Date().toISOString()
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MGNREGA API is running',
    timestamp: new Date().toISOString()
  });
});

// Simple location detection for React
app.get('/api/location/detect', async (req, res) => {
  try {
    // For demo - return random UP district
    const upDistricts = [
      'Agra', 'Lucknow', 'Kanpur', 'Varanasi', 'Meerut', 
      'Prayagraj', 'Gorakhpur', 'Aligarh', 'Bareilly', 'Moradabad',
      'Mirzapur', 'Jhansi', 'Ghaziabad'
    ];
    
    const randomDistrict = upDistricts[Math.floor(Math.random() * upDistricts.length)];
    
    res.json({
      success: true,
      detected: true,
      district: randomDistrict,
      state: 'Uttar Pradesh',
      method: 'demo_auto_detection'
    });
  } catch (error) {
    res.json({
      success: false,
      detected: false,
      error: error.message
    });
  }
});

// ================== FIXED ROUTES - DEPLOYMENT SAFE ==================

// Serve frontend for root route
app.get('/', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Frontend not available'
    });
  }
});

// Catch-all route for SPA - FIXED VERSION
app.get('*', (req, res) => {
  // Check if it's an API route
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'API endpoint not found: ' + req.path
    });
  }
  
  // For all non-API routes, serve the frontend
  try {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Frontend loading failed'
    });
  }
});

// Error handler (should be last)
app.use(errorHandler);

// Scheduled data sync (daily at 2 AM)
cron.schedule('0 2 * * *', async () => {
  console.log('Running scheduled data sync...');
  await DataSyncService.syncAllData();
});

module.exports = app;