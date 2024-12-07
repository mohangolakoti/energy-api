const mongoose = require('mongoose');

const peakDataSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        required: true
    },
    // Meter 1
    Total_KVA_meter_1: { type: Number, required: true, default: 0.0 },
    Total_KW_meter_1: { type: Number, required: true, default: 0.0 }
});

module.exports = mongoose.model('PeakData', peakDataSchema);
