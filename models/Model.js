const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
  model_name: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Model', modelSchema);
