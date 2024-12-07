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
    const response = await axios.get("http://13.201.229.45:5000/api/sensordata1");
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
  
    console.log(kwhConsumption)
    console.log(kvahConsumption)
    console.log(difference)
    console.log(powerFactor)

    // Create a new record for energy data
    const newEnergyData = new EnergyData({
      timestamp: new Date(),
      TotalNet_KWH_meter_1: newData.TotalNet_KWH_meter_1,
      TotalNet_KVAH_meter_1: newData.TotalNet_KVAH_meter_1,
      KWHConsumption: kwhConsumption,
      KVAHConsumption: kvahConsumption,
      Difference: difference,
      PowerFactor: powerFactor
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
    const response = await axios.get("http://13.201.229.45:5000/api/sensordata1");
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
