const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotEnv = require("dotenv");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { format } = require("date-fns");
const app = express();
const sensorDataRoutes = require("./routes/route");
const storageRoutes = require("./routes/storageRoute");
const EnergyData = require("./models/energyData");
const PeakData = require("./models/peakData");

dotEnv.config();

app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 5000;

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.use("/api", sensorDataRoutes);
app.use("/api1", storageRoutes);

let initialKWHValue = null;
let initialKVAHValue = null;

// Function to initialize the energy value from previous day's data
async function initializeInitialEnergyValue() {
  try {
    console.log("Initializing initial energy value...");

    //const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
    const today = format(new Date(), "yyyy-MM-dd");

    /* // Fetch previous day's last data
    const previousDayData = await EnergyData.findOne({
      timestamp: {
        $gte: new Date(yesterday),
        $lt: new Date(today),
      },
    }).sort({ timestamp: -1 });

    if (previousDayData) {
      initialEnergyValue = previousDayData.TotalNet_KWH_meter_1;
      console.log("Initial energy value stored from previous day:", initialEnergyValue); 
    } else {
      console.log("No data found for the previous day. Fetching today's first record.");*/
      const todayFirstRecord = await EnergyData.findOne({
        timestamp: {
          $gte: new Date(today),
        },
      }).sort({ timestamp: 1 });

      if (todayFirstRecord) {
        initialKWHValue = todayFirstRecord.TotalNet_KWH_meter_1;
        initialKVAHValue = todayFirstRecord.TotalNet_KVAH_meter_1;
        console.log("Initial energy value set to today's first record:", initialKWHValue, initialKVAHValue);
      } else {
        console.log("No data found for today yet.");
      }
  } catch (error) {
    console.error("Error initializing initial energy value:", error);
  }
}

// Function to fetch data from the API and store it in the database
async function fetchDataAndStore() {
  try {
    console.log("Fetching and storing sensor data...");

    // Get the current date and calculate the start of the month
    const startOfMonth = new Date();
    startOfMonth.setDate(1); // Set to the first day of the month
    startOfMonth.setHours(0, 0, 0, 0); // Reset time to 00:00:00

    // Fetch the first stored record for this month
    const firstRecordThisMonth = await EnergyData.findOne({
      timestamp: { $gte: startOfMonth },
    })
      .sort({ timestamp: 1 }) // Sort by ascending timestamp to get the first record
      .select("TotalNet_KWH_meter_1 TotalNet_KVAH_meter_1");

    // If no record exists for the current month, log and return
    if (!firstRecordThisMonth) {
      console.log("No records found for this month. Unable to calculate energy consumption.");
      return;
    }

    const initialKWHValueM = firstRecordThisMonth.TotalNet_KWH_meter_1;
    const initialKVAHValueM = firstRecordThisMonth.TotalNet_KVAH_meter_1;

    console.log("This month's initial values:", {
      initialKWHValueM,
      initialKVAHValueM,
    });


    const response = await axios.get("http://65.0.95.129:5000/api/sensordata1");
    const newData = response.data;

    // If no initial energy value has been set, set it to the current value
    if (initialKWHValue === null && initialKVAHValue === null) {
      initialKWHValue = newData.TotalNet_KWH_meter_1;
      initialKVAHValue = newData.TotalNet_KVAH_meter_1;
      console.log("Setting initial energy value to the current value:", initialKWHValue, initialKVAHValue);
    }

    const kwhConsumption = newData.TotalNet_KWH_meter_1 - initialKWHValue;
    const kvahConsumption = newData.TotalNet_KVAH_meter_1 - initialKVAHValue;
    const difference = kvahConsumption - kwhConsumption;
    let powerFactor = (kwhConsumption / kvahConsumption)? kwhConsumption / kvahConsumption : 0;

    //month values 
    const kwhConsumptionM = newData.TotalNet_KWH_meter_1 - initialKWHValueM;
    const kvahConsumptionM = newData.TotalNet_KVAH_meter_1 - initialKVAHValueM;
    const differenceM = kvahConsumptionM - kwhConsumptionM;
    const powerFactorM = (kwhConsumptionM / kvahConsumptionM)? kwhConsumptionM / kvahConsumptionM : 0;
  
    console.log(kwhConsumption)
    console.log(kvahConsumption)
    console.log(difference)
    console.log(powerFactor)
    console.log(powerFactorM)

    // Create a new record for energy data
    const newEnergyData = new EnergyData({
      timestamp: new Date(),
      TotalNet_KWH_meter_1: newData.TotalNet_KWH_meter_1,
      TotalNet_KVAH_meter_1: newData.TotalNet_KVAH_meter_1,
      KWHConsumption: kwhConsumption,
      KVAHConsumption: kvahConsumption,
      Difference: difference,
      PowerFactor: powerFactor,
      MonthPowerFactor:powerFactorM
    });

    await newEnergyData.save();
    console.log("Sensor data stored successfully:", newEnergyData);

  } catch (error) {
    console.error("Error fetching and storing sensor data:", error);
  }
}

async function peakData() {
  try{
    console.log("Fetching and storing Peak data...");
    const response = await axios.get("http://65.0.95.129:5000/api/sensordata1");
    const newData1 = response.data;
    const newPeakData = new PeakData({
      timestamp: new Date(),
      Total_KW_meter_1: newData1.Total_KW_meter_1,
      Total_KVA_meter_1: newData1.Total_KVA_meter_1,
    });
    await newPeakData.save();
    console.log("Sensor data stored successfully :", newPeakData);
  }catch{
    
  }
}

// Set intervals to initialize and fetch data every 10 minutes
setInterval(initializeInitialEnergyValue, 60 * 60000);
setInterval(fetchDataAndStore, 60 * 60000);
setInterval(peakData, 10 * 60000);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
