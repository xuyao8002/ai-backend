const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  model_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Model', required: true },
  title: { type: String, required: true },
  create_time: { type: Date, default: Date.now },
  messages: { type: Array, default: [] }, // [{ role: String, content: String }]
});

module.exports = mongoose.model('Message', messageSchema);
