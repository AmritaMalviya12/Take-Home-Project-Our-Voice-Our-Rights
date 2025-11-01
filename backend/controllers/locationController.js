const District = require('../models/District');

const locationController = {
  async detectLocation(req, res, next) {
    try {
      // In production, implement proper IP geolocation
      // This is a simplified version for demo
      
      const clientIP = req.ip || req.connection.remoteAddress;
      
      // For demo, return random district from Uttar Pradesh
      const upDistricts = await District.find({ 
        state_name: /Uttar Pradesh/i 
      });
      
      if (upDistricts.length === 0) {
        return res.json({
          success: false,
          detected: false,
          message: 'Could not detect location'
        });
      }
      
      const randomDistrict = upDistricts[
        Math.floor(Math.random() * upDistricts.length)
      ];
      
      res.json({
        success: true,
        detected: true,
        method: 'simulated_geolocation',
        data: randomDistrict
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = locationController;