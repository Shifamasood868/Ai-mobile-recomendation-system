const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema({
    category: { type: String, default: "mobile" },
    images: [{
        public_id: { type: String, required: true },
        url: { type: String, required: true },
    }],
    brand: { type: String, required: true },
    adTitle: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    location: { type: String, required: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    showPhoneNumber: { type: Boolean, default: false },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Listing', phoneSchema);