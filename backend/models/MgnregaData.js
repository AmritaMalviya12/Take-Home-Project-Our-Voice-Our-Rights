const mongoose = require('mongoose');

const mgnregaDataSchema = new mongoose.Schema({
  district_code: { 
    type: String, 
    required: true 
  },
  financial_year: { 
    type: String, 
    required: true 
  },
  month: { 
    type: String, 
    required: true 
  },
  households_provided_employment: { 
    type: Number, 
    default: 0 
  },
  total_person_days: { 
    type: Number, 
    default: 0 
  },
  total_wages_paid: { 
    type: Number, 
    default: 0 
  },
  total_works_taken_up: { 
    type: Number, 
    default: 0 
  },
  completed_works: { 
    type: Number, 
    default: 0 
  },
  data_date: { 
    type: Date 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound index for unique records
mgnregaDataSchema.index(
  { 
    district_code: 1, 
    financial_year: 1, 
    month: 1 
  }, 
  { 
    unique: true 
  }
);

mgnregaDataSchema.index({ district_code: 1 });
mgnregaDataSchema.index({ data_date: -1 });

module.exports = mongoose.model('MgnregaData', mgnregaDataSchema);