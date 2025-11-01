const District = require('../models/District');
const MgnregaData = require('../models/MgnregaData');
const DataGovService = require('./dataGovService');
const CacheService = require('./cacheService');

class DataSyncService {
  async syncAllData() {
    try {
      console.log('Starting data sync...');
      
      const result = await DataGovService.fetchMgnregaData();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Transform and store MGNREGA data
      const transformedRecords = result.data.map(record => 
        DataGovService.transformRecord(record)
      );

      await this.storeMgnregaData(transformedRecords);
      
      // Extract and store districts
      const districtsMap = new Map();
      transformedRecords.forEach(record => {
        districtsMap.set(record.district_code, {
          district_code: record.district_code,
          district_name: record.district_name,
          state_name: record.state_name
        });
      });

      await this.storeDistricts(Array.from(districtsMap.values()));
      
      // Update cache
      await CacheService.setCache('all_districts', Array.from(districtsMap.values()));

      console.log(`Data sync completed: ${transformedRecords.length} records`);
      
      return {
        success: true,
        records: transformedRecords.length,
        districts: districtsMap.size
      };
    } catch (error) {
      console.error('Data sync error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async storeMgnregaData(records) {
    try {
      const bulkOps = records.map(record => ({
        updateOne: {
          filter: {
            district_code: record.district_code,
            financial_year: record.financial_year,
            month: record.month
          },
          update: { $set: record },
          upsert: true
        }
      }));

      if (bulkOps.length > 0) {
        await MgnregaData.bulkWrite(bulkOps);
      }
    } catch (error) {
      console.error('Store MGNREGA data error:', error);
      throw error;
    }
  }

  async storeDistricts(districts) {
    try {
      const bulkOps = districts.map(district => ({
        updateOne: {
          filter: { district_code: district.district_code },
          update: { $set: district },
          upsert: true
        }
      }));

      if (bulkOps.length > 0) {
        await District.bulkWrite(bulkOps);
      }
    } catch (error) {
      console.error('Store districts error:', error);
      throw error;
    }
  }
}

module.exports = new DataSyncService();