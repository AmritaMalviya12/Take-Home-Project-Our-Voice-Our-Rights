const MgnregaData = require('../models/MgnregaData');
const District = require('../models/District');
const CacheService = require('../services/cacheService');

const performanceController = {
  async getDistrictPerformance(req, res, next) {
    try {
      const { districtCode } = req.params;
      const { year, limit = 12 } = req.query;
      
      // Validate district exists
      const district = await District.findOne({ district_code: districtCode });
      if (!district) {
        return res.status(404).json({
          success: false,
          error: 'District not found'
        });
      }
      
      const cacheKey = `performance_${districtCode}_${year || 'all'}_${limit}`;
      let performanceData = await CacheService.getCache(cacheKey);
      
      if (!performanceData) {
        let query = { district_code: districtCode };
        if (year) {
          query.financial_year = year;
        }
        
        performanceData = await MgnregaData.find(query)
          .sort({ data_date: -1 })
          .limit(parseInt(limit));
        
        await CacheService.setCache(cacheKey, performanceData, 30);
      }
      
      res.json({
        success: true,
        district: district.district_name,
        count: performanceData.length,
        data: performanceData
      });
    } catch (error) {
      next(error);
    }
  },

  async getStateSummary(req, res, next) {
    try {
      const { stateName } = req.params;
      
      const cacheKey = `state_summary_${stateName}`;
      let summary = await CacheService.getCache(cacheKey);
      
      if (!summary) {
        const districts = await District.find({ 
          state_name: new RegExp(stateName, 'i') 
        });
        
        const districtCodes = districts.map(d => d.district_code);
        const currentYear = new Date().getFullYear();
        const financialYear = `${currentYear}-${(currentYear + 1).toString().slice(2)}`;
        
        const stateData = await MgnregaData.aggregate([
          {
            $match: {
              district_code: { $in: districtCodes },
              financial_year: financialYear
            }
          },
          {
            $group: {
              _id: null,
              totalHouseholds: { $sum: '$households_provided_employment' },
              totalPersonDays: { $sum: '$total_person_days' },
              totalWages: { $sum: '$total_wages_paid' },
              totalWorks: { $sum: '$total_works_taken_up' },
              completedWorks: { $sum: '$completed_works' },
              reportingDistricts: { $addToSet: '$district_code' }
            }
          }
        ]);
        
        const result = stateData[0] || {};
        summary = {
          state: stateName,
          totalDistricts: districts.length,
          reportingDistricts: result.reportingDistricts ? result.reportingDistricts.length : 0,
          totalHouseholds: result.totalHouseholds || 0,
          totalPersonDays: result.totalPersonDays || 0,
          totalWages: result.totalWages || 0,
          totalWorks: result.totalWorks || 0,
          completedWorks: result.completedWorks || 0,
          completionRate: result.totalWorks ? ((result.completedWorks / result.totalWorks) * 100).toFixed(2) : 0
        };
        
        await CacheService.setCache(cacheKey, summary, 60);
      }
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = performanceController;