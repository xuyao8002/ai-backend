const mongoose = require('mongoose');

const userModelSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  model_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Model', required: true },
  api_key: { type: String, required: true },
  base_url: { type: String, required: true },
});

module.exports = mongoose.model('UserModel', userModelSchema);
