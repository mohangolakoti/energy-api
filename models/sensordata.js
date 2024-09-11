const mongoose = require("mongoose");

const Schema = mongoose.Schema;


 
const sensordataSchema = new Schema(
  {
    // Meter 1
    meter_1: { type: Schema.Types.String, required: true },
    Voltage_V1N_meter_1: { type: Schema.Types.Number, required: true },
    Voltage_V2N_meter_1: { type: Schema.Types.Number, required: true },
    Voltage_V3N_meter_1: { type: Schema.Types.Number, required: true },
    Voltage_V12_meter_1: { type: Schema.Types.Number, required: true },
    Voltage_V23_meter_1: { type: Schema.Types.Number, required: true },
    Voltage_V31_meter_1: { type: Schema.Types.Number, required: true },
    Current_I1_meter_1: { type: Schema.Types.Number, required: true },
    Current_I2_meter_1: { type: Schema.Types.Number, required: true },
    Current_I3_meter_1: { type: Schema.Types.Number, required: true },
    Total_KW_meter_1: { type: Schema.Types.Number, required: true },
    Total_KVA_meter_1: { type: Schema.Types.Number, required: true },
    Total_KVAR_meter_1: { type: Schema.Types.Number, required: true },
    Avg_PF_meter_1: { type: Schema.Types.Number, required: true },  
    Frequency_meter_1: { type: Schema.Types.Number, required: true },
    TotalNet_KWH_meter_1: { type: Schema.Types.Number, required: true },
    TotalNet_KVAH_meter_1: { type: Schema.Types.Number, required: true },
    TotalNet_KVARH_meter_1: { type: Schema.Types.Number, required: true },
    Neutral_Current_meter_1: { type: Schema.Types.Number, required: true },
    timestamp: {
      type: Date,
      default: function () {
        const now = new Date();
        const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
        return new Date(now.getTime() + IST_OFFSET);
      },
    },
  },
  {
    timestamps: true,
  }
);

  

module.exports = mongoose.model("sensordata", sensordataSchema);