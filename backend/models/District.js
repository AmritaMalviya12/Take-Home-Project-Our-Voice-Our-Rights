const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  district_code: { 
    type: String, 
    required: true, 
    unique: true 
  },
  district_name: { 
    type: String, 
    required: true 
  },
  state_name: { 
    type: String, 
    required: true 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

districtSchema.index({ district_name: 1 });
districtSchema.index({ state_name: 1 });

module.exports = mongoose.model('District', districtSchema);