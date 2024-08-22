const mongoose = require("mongoose");

const Schema = mongoose.Schema;


 
const sensordataSchema = new Schema(
  {
    lineVlotageR: {
      type: Schema.Types.Number,
      required: true,
    },
    lineVoltageY: {
      type: Schema.Types.Number,
      required: true,
    },
    lineVoltageB: {
      type: Schema.Types.Number,
      required: true,
    },
    phaseVolate1: {
      type: Schema.Types.Number,
      required: true,
    },
    phaseVoltage2: {
      type: Schema.Types.Number,
      required: true,
    },
    phaseVoltage3: {
      type: Schema.Types.Number,
      required: true,
    },
    current1: {
      type: Schema.Types.Number,
      required: true,
    },
    current2: {
      type: Schema.Types.Number,
      required: true,
    },
    current3: {
      type: Schema.Types.Number,
      required: true,
    },
    totalKW: {
      type: Schema.Types.Number,
      required: true,
    },
    totalKVA: {
      type: Schema.Types.Number,
      required: true,
    },
    powerFactor1: {
      type: Schema.Types.Number,
      required: true,
    },
    powerFactor2: {
      type: Schema.Types.Number,
      required: true,
    },
    powerFactor3: {
      type: Schema.Types.Number,
      required: true,
    },
    AvgPowerFactor: {
      type: Schema.Types.Number,
      required: true,
    },
    frequency: {
      type: Schema.Types.Number,
      required: true,
    },
    totalNetKVAH: {
      type: Schema.Types.Number,
      required: true,
    },
    totalNetKVAh: {
      type: Schema.Types.Number,
      required: true,
    },
    totalNetKVARH: {
      type: Schema.Types.Number,
      required: true,
    },
    timestamp: { type: Date }
  },
  {
    timestamps: true,
  }
);

sensordataSchema.pre('save', function (next) {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
  const now = new Date();
  this.timestamp = new Date(now.getTime() + IST_OFFSET);
  next();
});
  

module.exports = mongoose.model("sensordata", sensordataSchema);