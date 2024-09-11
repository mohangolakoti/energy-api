const SensorData = require("../models/sensordata");

const sensordataHandler = async (req, res, next) => {
  const {
    meter_1,
    Voltage_V1N_meter_1,
    Voltage_V2N_meter_1,
    Voltage_V3N_meter_1,
    Voltage_V12_meter_1,
    Voltage_V23_meter_1,
    Voltage_V31_meter_1,
    Current_I1_meter_1,
    Current_I2_meter_1,
    Current_I3_meter_1,
    Total_KW_meter_1,
    Total_KVA_meter_1,
    Total_KVAR_meter_1,
    Avg_PF_meter_1,
    Frequency_meter_1,
    TotalNet_KWH_meter_1,
    TotalNet_KVAH_meter_1,
    TotalNet_KVARH_meter_1,
    Neutral_Current_meter_1,
  } = req.body;

  let exists = false;
  let sensordata;
  try {
    sensordata = await SensorData.find();
    if (sensordata.length === 1) {
      exists = true;
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Updating Data Failed",
    });
  }

  if (exists) {
    const result = await SensorData.findOneAndUpdate(
      { _id: sensordata[0]._id },
      {
        meter_1: meter_1,
        Voltage_V1N_meter_1: Voltage_V1N_meter_1,
        Voltage_V2N_meter_1: Voltage_V2N_meter_1,
        Voltage_V3N_meter_1: Voltage_V3N_meter_1,
        Voltage_V12_meter_1: Voltage_V12_meter_1,
        Voltage_V23_meter_1: Voltage_V23_meter_1,
        Voltage_V31_meter_1: Voltage_V31_meter_1,
        Current_I1_meter_1: Current_I1_meter_1,
        Current_I2_meter_1: Current_I2_meter_1,
        Current_I3_meter_1: Current_I3_meter_1,
        Total_KW_meter_1: Total_KW_meter_1,
        Total_KVA_meter_1: Total_KVA_meter_1,
        Total_KVAR_meter_1: Total_KVAR_meter_1,
        Avg_PF_meter_1: Avg_PF_meter_1,
        Frequency_meter_1: Frequency_meter_1,
        TotalNet_KWH_meter_1: TotalNet_KWH_meter_1,
        TotalNet_KVAH_meter_1: TotalNet_KVAH_meter_1,
        TotalNet_KVARH_meter_1: TotalNet_KVARH_meter_1,
        Neutral_Current_meter_1: Neutral_Current_meter_1,
      }
    );
  } else {
    try {
      const newSensorData = new SensorData({
        meter_1: meter_1,
        Voltage_V1N_meter_1: Voltage_V1N_meter_1,
        Voltage_V2N_meter_1: Voltage_V2N_meter_1,
        Voltage_V3N_meter_1: Voltage_V3N_meter_1,
        Voltage_V12_meter_1: Voltage_V12_meter_1,
        Voltage_V23_meter_1: Voltage_V23_meter_1,
        Voltage_V31_meter_1: Voltage_V31_meter_1,
        Current_I1_meter_1: Current_I1_meter_1,
        Current_I2_meter_1: Current_I2_meter_1,
        Current_I3_meter_1: Current_I3_meter_1,
        Total_KW_meter_1: Total_KW_meter_1,
        Total_KVA_meter_1: Total_KVA_meter_1,
        Total_KVAR_meter_1: Total_KVAR_meter_1,
        Avg_PF_meter_1: Avg_PF_meter_1,
        Frequency_meter_1: Frequency_meter_1,
        TotalNet_KWH_meter_1: TotalNet_KWH_meter_1,
        TotalNet_KVAH_meter_1: TotalNet_KVAH_meter_1,
        TotalNet_KVARH_meter_1: TotalNet_KVARH_meter_1,
        Neutral_Current_meter_1: Neutral_Current_meter_1,
      });
      await newSensorData.save();
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Updating Data Failed",
      });
    }
  }

  return res.status(200).json({
    message: "Data updated successfully",
  });
};

const getdataHandler = async (req, res, next) => {
  let sensordata, updatedAtnew;
  try {
    sensordata = await SensorData.find();
    console.log(sensordata);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Getting Data Failed",
    });
  }

  const data = {
    meter_1: sensordata[0].meter_1,
    Voltage_V1N_meter_1: sensordata[0].Voltage_V1N_meter_1,
    Voltage_V2N_meter_1: sensordata[0].Voltage_V2N_meter_1,
    Voltage_V3N_meter_1: sensordata[0].Voltage_V3N_meter_1,
    Voltage_V12_meter_1: sensordata[0].Voltage_V12_meter_1,
    Voltage_V23_meter_1: sensordata[0].Voltage_V23_meter_1,
    Voltage_V31_meter_1: sensordata[0].Voltage_V31_meter_1,
    Current_I1_meter_1: sensordata[0].Current_I1_meter_1,
    Current_I2_meter_1: sensordata[0].Current_I2_meter_1,
    Current_I3_meter_1: sensordata[0].Current_I3_meter_1,
    Total_KW_meter_1: sensordata[0].Total_KW_meter_1,
    Total_KVA_meter_1: sensordata[0].Total_KVA_meter_1,
    Total_KVAR_meter_1: sensordata[0].Total_KVAR_meter_1,
    Avg_PF_meter_1: sensordata[0].Avg_PF_meter_1,
    Frequency_meter_1: sensordata[0].Frequency_meter_1,
    TotalNet_KWH_meter_1: sensordata[0].TotalNet_KWH_meter_1,
    TotalNet_KVAH_meter_1: sensordata[0].TotalNet_KVAH_meter_1,
    TotalNet_KVARH_meter_1: sensordata[0].TotalNet_KVARH_meter_1,
    Neutral_Current_meter_1: sensordata[0].Neutral_Current_meter_1,
  };

  return res.status(200).json(data);
};

exports.sensordataHandler = sensordataHandler;
exports.getdataHandler = getdataHandler;