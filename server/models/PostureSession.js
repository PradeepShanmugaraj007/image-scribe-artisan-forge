
const mongoose = require('mongoose');

const PostureSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  totalAlerts: {
    type: Number,
    default: 0
  },
  incorrectPostures: [{
    type: String
  }],
  postureScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
});

module.exports = mongoose.model('PostureSession', PostureSessionSchema);
