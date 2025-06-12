const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  adTitle: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
   images: [{
        public_id: { type: String, required: true },
        url: { type: String, required: true },
    }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Listing', listingSchema);