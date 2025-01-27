const mongoose = require('mongoose');

const energySchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        required: true
    },
    // Meter 70
    TotalNet_KWH_meter_1: { type: Number, required: true, default: 0.0 },
    TotalNet_KVAH_meter_1: { type: Number, required: true, default: 0.0 },
    KWHConsumption: { type: Number, required: true, default: 0.0 },
    KVAHConsumption: { type: Number, required: true, default: 0.0 },
    Difference: { type: Number, required: true, default: 0.0 },
    PowerFactor: { type: Number, required: true, default: 0.0 },
    MonthPowerFactor: { type: Number, required: true, default: 0.0 }
});

module.exports = mongoose.model('EnergyData', energySchema);
