require('dotenv').config();
const app = require('./app');
const DataSyncService = require('./services/dataSyncService');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initial data sync
    console.log('Performing initial data sync...');
    await DataSyncService.syncAllData();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 MGNREGA API with MVC Architecture is ready!`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
}

startServer();