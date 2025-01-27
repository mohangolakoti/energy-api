const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const { format, subDays, startOfDay, endOfDay, addSeconds } = require('date-fns');
const dotEnv = require('dotenv');
dotEnv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
const moment = require('moment')

const EnergyData = require('../models/energyData');
const PeakData = require('../models/peakData');
const SensorData = require('../models/sensordata')

const sensorData = async (req, res) => {
    try {
        const latestData = await EnergyData.findOne().sort({ timestamp: -1 });
        res.json(latestData);
    } catch (error) {
        res.status(500).json({ error: "Error fetching latest sensor data" });
    }
};

const getHighestKva = async (req, res) => {
    try {
        const today = new Date();

        // Fetch the highest KVA value for today
        const highestToday = await PeakData.aggregate([
            {
                $match: {
                    timestamp: {
                        $gte: startOfDay(today),
                        $lte: today,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    highest_kva_today: { $max: "$Total_KVA_meter_1" },
                    highest_kw_today: { $max: "$Total_KW_meter_1"}
                },
            },
        ]);

        // Fetch the highest KVA value for the month
        const highestMonth = await PeakData.aggregate([
            {
                $match: {
                    timestamp: {
                        $gte: startOfDay(new Date(today.getFullYear(), today.getMonth(), 1)),
                        $lte: today,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    highest_kva_month: { $max: "$Total_KVA_meter_1" },
                    highest_kw_month: { $max: "$Total_KW_meter_1"}
                },
            },
        ]);

        res.status(200).json({
            highestKvaToday: highestToday[0]?.highest_kva_today || 0,
            highestKvaMonth: highestMonth[0]?.highest_kva_month || 0,
            highestKwToday: highestToday[0]?.highest_kw_today || 0,
            highestKwMonth: highestMonth[0]?.highest_kw_month || 0,
        });
    } catch (error) {
        console.error("Error fetching highest KVA values:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const sensorDataByDate = async (req, res) => {
    const { date } = req.params;

    try {
        const data = await EnergyData.find({
            timestamp: {
                $gte: startOfDay(new Date(date)),
                $lte: endOfDay(new Date(date))
            }
        });

        if (data.length === 0) {
            return res.status(404).json({ message: "No data found for the selected date." });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        res.status(500).json({ error: "Error fetching sensor data" });
    }
};

const getMonthlyEnergyConsumption = async (req, res) => {
    try {
        // Get the current date
        const currentDate = new Date();

        // Calculate the first day of the current month
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        // Aggregate the sum of daily last stored values of `KVAHConsumption` in the current month
        const monthlyData = await EnergyData.aggregate([
            {
                $match: {
                    timestamp: { $gte: startOfMonth }, // Match data from the start of the current month
                },
            },
            {
                $addFields: {
                    date: {
                        $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }, // Extract the date part
                    },
                },
            },
            {
                $sort: { timestamp: -1 }, // Sort by timestamp in descending order to get the last value first
            },
            {
                $group: {
                    _id: "$date", // Group by date
                    lastKVAHConsumption: { $first: "$KVAHConsumption" }, // Take the last value of KVAHConsumption for each day
                },
            },
            {
                $group: {
                    _id: null, // Group everything to calculate the total sum
                    totalEnergyConsumption: { $sum: "$lastKVAHConsumption" }, // Sum up the last values for each day
                },
            },
        ]);

        if (monthlyData.length === 0) {
            return res.status(404).json({ error: "No data found for the current month" });
        }

        // Respond with the total energy consumption
        const response = {
            totalEnergyConsumption: monthlyData[0].totalEnergyConsumption,
        };

        res.json(response);
    } catch (error) {
        console.error("Error fetching monthly energy consumption data:", error);
        res.status(500).json({ error: "Error fetching monthly energy consumption data" });
    }
};


module.exports = { sensorData, getHighestKva, sensorDataByDate, getMonthlyEnergyConsumption};