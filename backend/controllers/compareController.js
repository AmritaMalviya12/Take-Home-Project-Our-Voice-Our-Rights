const MgnregaData = require('../models/MgnregaData');
const CacheService = require('../services/cacheService');

const compareController = {
  async compareDistricts(req, res, next) {
    try {
      const { districtCodes, year, metric } = req.body;
      
      if (!districtCodes || !Array.isArray(districtCodes) || districtCodes.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Please provide district codes array'
        });
      }
      
      const cacheKey = `compare_${districtCodes.join('_')}_${year}_${metric}`;
      let compareData = await CacheService.getCache(cacheKey);
      
      if (!compareData) {
        let query = { district_code: { $in: districtCodes } };
        if (year) {
          query.financial_year = year;
        }
        
        const data = await MgnregaData.find(query).sort({ data_date: -1 });
        
        // Group by district and get latest record
        const districtMap = new Map();
        data.forEach(record => {
          if (!districtMap.has(record.district_code)) {
            districtMap.set(record.district_code, record);
          }
        });
        
        compareData = Array.from(districtMap.values());
        await CacheService.setCache(cacheKey, compareData, 30);
      }
      
      res.json({
        success: true,
        count: compareData.length,
        data: compareData
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = compareController;