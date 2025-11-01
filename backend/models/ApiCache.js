const mongoose = require('mongoose');

const apiCacheSchema = new mongoose.Schema({
  endpoint: { 
    type: String, 
    required: true 
  },
  data: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  expires_at: { 
    type: Date, 
    required: true 
  }
});

apiCacheSchema.index({ endpoint: 1 });
apiCacheSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ApiCache', apiCacheSchema);