const SensorData = require("../models/sensordata");

const sensordataHandler = async (req, res, next) => {
  const {
    lineVlotageR,
    lineVoltageY,
    lineVoltageB,
    phaseVolate1,
    phaseVoltage2,
    phaseVoltage3,
    current1,
    current2,
    current3,
    totalKW,
    totalKVA,
    powerFactor1,
    powerFactor2,
    powerFactor3,
    AvgPowerFactor,
    frequency,
    totalNetKVAH,
    totalNetKVAh,
    totalNetKVARH,
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
        lineVlotageR: lineVlotageR,
        lineVoltageY: lineVoltageY,
        lineVoltageB: lineVoltageB,
        phaseVolate1: phaseVolate1,
        phaseVoltage2: phaseVoltage2,
        phaseVoltage3: phaseVoltage3,
        current1: current1,
        current2: current2,
        current3: current3,
        totalKW: totalKW,
        totalKVA: totalKVA,
        powerFactor1: powerFactor1,
        powerFactor2: powerFactor2,
        powerFactor3: powerFactor3,
        AvgPowerFactor: AvgPowerFactor,
        frequency: frequency,
        totalNetKVAH: totalNetKVAH,
        totalNetKVAh: totalNetKVAh,
        totalNetKVARH: totalNetKVARH,
      }
    );
  } else {
    try {
      const newSensorData = new SensorData({
        lineVlotageR: lineVlotageR,
        lineVoltageY: lineVoltageY,
        lineVoltageB: lineVoltageB,
        phaseVolate1: phaseVolate1,
        phaseVoltage2: phaseVoltage2,
        phaseVoltage3: phaseVoltage3,
        current1: current1,
        current2: current2,
        current3: current3,
        totalKW: totalKW,
        totalKVA: totalKVA,
        powerFactor1: powerFactor1,
        powerFactor2: powerFactor2,
        powerFactor3: powerFactor3,
        AvgPowerFactor: AvgPowerFactor,
        frequency: frequency,
        totalNetKVAH: totalNetKVAH,
        totalNetKVAh: totalNetKVAh,
        totalNetKVARH: totalNetKVARH,
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
    lineVlotageR: sensordata[0].lineVlotageR,
    lineVoltageY: sensordata[0].lineVoltageY,
    lineVoltageB: sensordata[0].lineVoltageB,
    phaseVolate1: sensordata[0].phaseVolate1,
    phaseVoltage2: sensordata[0].phaseVoltage2,
    phaseVoltage3: sensordata[0].phaseVoltage3,
    current1: sensordata[0].current1,
    current2: sensordata[0].current2,
    current3: sensordata[0].current3,
    totalKW: sensordata[0].totalKW,
    totalKVA: sensordata[0].totalKVA,
    powerFactor1: sensordata[0].powerFactor1,
    powerFactor2: sensordata[0].powerFactor2,
    powerFactor3: sensordata[0].powerFactor3,
    AvgPowerFactor: sensordata[0].AvgPowerFactor,
    frequency: sensordata[0].frequency,
    totalNetKVAH: sensordata[0].totalNetKVAH,
    totalNetKVAh: sensordata[0].totalNetKVAh,
    totalNetKVARH: sensordata[0].totalNetKVARH,
  };

  return res.status(200).json(data);
};

exports.sensordataHandler = sensordataHandler;
exports.getdataHandler = getdataHandler;
