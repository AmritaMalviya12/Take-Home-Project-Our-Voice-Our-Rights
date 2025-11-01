const axios = require('axios');

class DataGovService {
  constructor() {
    this.baseURL = 'https://api.data.gov.in/resource/eea94a85-4f1a-4a54-9dd7-fdbfa5101e66';
    this.apiKey = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
  }

  async fetchMgnregaData(districtCode = null) {
    try {
      // Try real API first
      let url = `${this.baseURL}?api-key=${this.apiKey}&format=json&limit=1000`;
      
      if (districtCode) {
        url += `&filters[district_code]=${districtCode}`;
      }

      const response = await axios.get(url, { timeout: 5000 });
      
      if (response.data && response.data.records) {
        return {
          success: true,
          data: response.data.records,
          count: response.data.records.length,
          source: 'data_gov'
        };
      }
      
      // If real API fails, use demo data
      return this.getDemoData(districtCode);
      
    } catch (error) {
      console.log('Real API failed, using demo data...');
      return this.getDemoData(districtCode);
    }
  }

  getDemoData(districtCode = null) {
     console.log('Generating demo data...');
    // Real MGNREGA districts from Uttar Pradesh
    const upDistricts = [
      { district_code: 'UP01', district_name: 'Agra', state_name: 'Uttar Pradesh' },
      { district_code: 'UP02', district_name: 'Aligarh', state_name: 'Uttar Pradesh' },
      { district_code: 'UP03', district_name: 'Prayagraj', state_name: 'Uttar Pradesh' },
      { district_code: 'UP04', district_name: 'Ambedkar Nagar', state_name: 'Uttar Pradesh' },
      { district_code: 'UP05', district_name: 'Amethi', state_name: 'Uttar Pradesh' },
      { district_code: 'UP06', district_name: 'Amroha', state_name: 'Uttar Pradesh' },
      { district_code: 'UP07', district_name: 'Auraiya', state_name: 'Uttar Pradesh' },
      { district_code: 'UP08', district_name: 'Azamgarh', state_name: 'Uttar Pradesh' },
      { district_code: 'UP09', district_name: 'Baghpat', state_name: 'Uttar Pradesh' },
      { district_code: 'UP10', district_name: 'Bahraich', state_name: 'Uttar Pradesh' },
      { district_code: 'UP11', district_name: 'Ballia', state_name: 'Uttar Pradesh' },
      { district_code: 'UP12', district_name: 'Balrampur', state_name: 'Uttar Pradesh' },
      { district_code: 'UP13', district_name: 'Banda', state_name: 'Uttar Pradesh' },
      { district_code: 'UP14', district_name: 'Barabanki', state_name: 'Uttar Pradesh' },
      { district_code: 'UP15', district_name: 'Bareilly', state_name: 'Uttar Pradesh' }
    ];

    const months = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
    const currentYear = new Date().getFullYear();
    const financialYear = `${currentYear}-${(currentYear + 1).toString().slice(2)}`;

    let demoData = [];

    upDistricts.forEach(district => {
      if (districtCode && district.district_code !== districtCode) return;

      months.forEach((month, index) => {
        demoData.push({
          district_code: district.district_code,
          district_name: district.district_name,
          state_name: district.state_name,
          financial_year: financialYear,
          month: month,
          households_provided_employment: Math.floor(Math.random() * 5000) + 1000,
          total_person_days: Math.floor(Math.random() * 50000) + 10000,
          total_wages_paid: (Math.random() * 500 + 100).toFixed(2),
          total_works_taken_up: Math.floor(Math.random() * 200) + 50,
          completed_works: Math.floor(Math.random() * 150) + 30,
          data_date: new Date(currentYear, index, 15)
        });
      });
    });

        console.log(`Generated ${demoData.length} demo records`);

        
    return {
      success: true,
      data: demoData,
      count: demoData.length,
      source: 'demo_data'
    };
  }

  transformRecord(record) {
    return {
      district_code: record.district_code,
      district_name: record.district_name,
      state_name: record.state_name,
      financial_year: record.financial_year,
      month: record.month,
      households_provided_employment: parseInt(record.households_provided_employment) || 0,
      total_person_days: parseInt(record.total_person_days) || 0,
      total_wages_paid: parseFloat(record.total_wages_paid) || 0,
      total_works_taken_up: parseInt(record.total_works_taken_up) || 0,
      completed_works: parseInt(record.completed_works) || 0,
      data_date: record.data_date || new Date()
    };
  }
}

module.exports = new DataGovService();