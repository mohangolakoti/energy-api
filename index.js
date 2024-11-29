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

let initialEnergyValue = null;

// Function to initialize the energy value from previous day's data
async function initializeInitialEnergyValue() {
  try {
    console.log("Initializing initial energy value...");

    const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
    const today = format(new Date(), "yyyy-MM-dd");

    // Fetch previous day's last data
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
      console.log("No data found for the previous day. Fetching today's first record.");
      const todayFirstRecord = await EnergyData.findOne({
        timestamp: {
          $gte: new Date(today),
        },
      }).sort({ timestamp: 1 });

      if (todayFirstRecord) {
        initialEnergyValue = todayFirstRecord.TotalNet_KWH_meter_1;
        console.log("Initial energy value set to today's first record:", initialEnergyValue);
      } else {
        console.log("No data found for today yet.");
      }
    }
  } catch (error) {
    console.error("Error initializing initial energy value:", error);
  }
}

// Function to fetch data from the API and store it in the database
async function fetchDataAndStore() {
  try {
    console.log("Fetching and storing sensor data...");
    const response = await axios.get("http://65.1.134.192:5000/api/sensordata1");
    const newData = response.data;

    // If no initial energy value has been set, set it to the current value
    if (initialEnergyValue === null) {
      initialEnergyValue = newData.TotalNet_KWH_meter_1;
      console.log("Setting initial energy value to the current value:", initialEnergyValue);
    }

    const energyConsumption = newData.TotalNet_KWH_meter_1 - initialEnergyValue;

    // Create a new record for energy data
    const newEnergyData = new EnergyData({
      timestamp: new Date(),
      Total_KW_meter_1: newData.Total_KW_meter_1,
      TotalNet_KWH_meter_1: newData.TotalNet_KWH_meter_1,
      Total_KVA_meter_1: newData.Total_KVA_meter_1,
      Avg_PF_meter_1: newData.Avg_PF_meter_1,
      TotalNet_KVAH_meter_1: newData.TotalNet_KVAH_meter_1,
      energy_consumption_meter_1: energyConsumption,
    });

    await newEnergyData.save();
    console.log("Sensor data stored successfully:", newEnergyData);

  } catch (error) {
    console.error("Error fetching and storing sensor data:", error);
  }
}

// Set intervals to initialize and fetch data every 10 minutes
setInterval(initializeInitialEnergyValue, 10 * 60000);
setInterval(fetchDataAndStore, 10 * 60000);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
