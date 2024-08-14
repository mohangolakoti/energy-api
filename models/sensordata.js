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
  },
  {
    timestamps: true,
  }
);

  

module.exports = mongoose.model("sensordata", sensordataSchema);