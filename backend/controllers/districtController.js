const District = require('../models/District');
const CacheService = require('../services/cacheService');

const districtController = {
  async getAllDistricts(req, res, next) {
    try {
      let districts = await CacheService.getCache('all_districts');
      
      if (!districts) {
        districts = await District.find({}).sort({ district_name: 1 });
        await CacheService.setCache('all_districts', districts);
      }
      
      res.json({
        success: true,
        count: districts.length,
        data: districts
      });
    } catch (error) {
      next(error);
    }
  },

  async getDistrictsByState(req, res, next) {
    try {
      const { stateName } = req.params;
      
      const cacheKey = `districts_state_${stateName}`;
      let districts = await CacheService.getCache(cacheKey);
      
      if (!districts) {
        districts = await District.find({ 
          state_name: new RegExp(stateName, 'i') 
        }).sort({ district_name: 1 });
        
        await CacheService.setCache(cacheKey, districts);
      }
      
      res.json({
        success: true,
        count: districts.length,
        data: districts
      });
    } catch (error) {
      next(error);
    }
  },

  async getDistrictByCode(req, res, next) {
    try {
      const { districtCode } = req.params;
      
      const district = await District.findOne({ district_code: districtCode });
      
      if (!district) {
        return res.status(404).json({
          success: false,
          error: 'District not found'
        });
      }
      
      res.json({
        success: true,
        data: district
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = districtController;