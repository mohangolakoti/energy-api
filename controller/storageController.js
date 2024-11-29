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

const sensorData = async (req, res) => {
    try {
        const latestData = await EnergyData.findOne().sort({ timestamp: -1 });
        res.json(latestData);
    } catch (error) {
        res.status(500).json({ error: "Error fetching latest sensor data" });
    }
};

const energyConsumption = async (req, res) => {
    try {
        const dates = Array.from({ length: 7 }, (_, i) =>
            subDays(new Date(), 6 - i)
        );

        // Array to store energy data for each day
        const energyData = await Promise.all(
            dates.map(async (date) => {
                const start = startOfDay(date);
                const end = endOfDay(date);

                // Find the most recent record for this day
                const record = await EnergyData.findOne({
                    timestamp: { $gte: start, $lte: end },
                })
                    .sort({ timestamp: -1 })
                    .select("TotalNet_KWH_meter_1 timestamp");

                if (record) {
                    return {
                        date: format(record.timestamp, "yyyy-MM-dd"),
                        energy: record.TotalNet_KWH_meter_1 || 0,
                    };
                } else {
                    // No record found for this date
                    return { date: format(date, "yyyy-MM-dd"), energy: 0 };
                }
            })
        );

        res.status(200).json(energyData);
    } catch (error) {
        console.error("Error fetching energy values:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const prevDayEnergy = async (req, res) => {
    try {
        const yesterday = subDays(new Date(), 1);
        const today = new Date();

        const previousDayRecord = await EnergyData.findOne({
            timestamp: {
                $gte: startOfDay(yesterday),
                $lte: endOfDay(yesterday),
            },
        }).sort({ timestamp: -1 });

        const todayFirstRecord = await EnergyData.findOne({
            timestamp: { $gte: startOfDay(today) },
        }).sort({ timestamp: 1 });

        let initialEnergyValue = null;

        if (previousDayRecord) {
            initialEnergyValue = previousDayRecord.TotalNet_KWH_meter_1;
        } else if (todayFirstRecord) {
            initialEnergyValue = todayFirstRecord.TotalNet_KWH_meter_1;
        }

        res.status(200).json({ initialEnergyValue });
    } catch (error) {
        console.error("Error fetching previous day's energy value:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getHighestKva = async (req, res) => {
    try {
        const today = new Date();

        // Fetch the highest KVA value for today
        const highestKvaToday = await EnergyData.aggregate([
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
                },
            },
        ]);

        // Fetch the highest KVA value for the month
        const highestKvaMonth = await EnergyData.aggregate([
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
                },
            },
        ]);

        res.status(200).json({
            highestKvaToday: highestKvaToday[0]?.highest_kva_today || 0,
            highestKvaMonth: highestKvaMonth[0]?.highest_kva_month || 0,
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

        // Aggregate the total energy consumption for `energy_consumption_meter_1` in the current month
        const monthlyData = await EnergyData.aggregate([
            {
                $match: {
                    timestamp: { $gte: startOfMonth },
                },
            },
            {
                $group: {
                    _id: null,
                    totalEnergyConsumptionMeter1: { $sum: "$energy_consumption_meter_1" },
                },
            },
        ]);

        if (monthlyData.length === 0) {
            return res.status(404).json({ error: "No data found for the current month" });
        }

        // Respond with the total energy consumption for `energy_consumption_meter_1`
        const response = {
            totalEnergyConsumptionMeter1: monthlyData[0].totalEnergyConsumptionMeter1,
        };

        res.json(response);
    } catch (error) {
        console.error("Error fetching monthly energy consumption data:", error);
        res.status(500).json({ error: "Error fetching monthly energy consumption data" });
    }
};

const getYesterdaysAndTodaysFirstRecords = async (req, res) => {
    try {
      // Define date ranges for yesterday and today
      const yesterdayStart = moment().subtract(1, 'days').startOf('day').toDate();
      const yesterdayEnd = moment().subtract(1, 'days').endOf('day').toDate();
      const todayStart = moment().startOf('day').toDate();
      const todayEnd = moment().endOf('day').toDate();
  
      // Query for the first record of yesterday
      const yesterdayRecord = await EnergyData.findOne({
        timestamp: { $gte: yesterdayStart, $lte: yesterdayEnd },
      })
        .sort({ timestamp: 1 }) // Ascending order by timestamp
        .select('TotalNet_KWH_meter_1 Total_KVA_meter_1 timestamp'); // Select only relevant fields
  
      // Query for the first record of today
      const todayRecord = await EnergyData.findOne({
        timestamp: { $gte: todayStart, $lte: todayEnd },
      })
        .sort({ timestamp: 1 }) // Ascending order by timestamp
        .select('TotalNet_KWH_meter_1 Total_KVA_meter_1 timestamp'); // Select only relevant fields
  
      // Respond with the records
      res.status(200).json({
        success: true,
        data: {
          yesterday: yesterdayRecord,
          today: todayRecord,
        },
      });
    } catch (error) {
      console.error('Error fetching records:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch records',
        error: error.message,
      });
    }
  };


module.exports = { sensorData, prevDayEnergy, energyConsumption, getHighestKva, sensorDataByDate, getMonthlyEnergyConsumption, getYesterdaysAndTodaysFirstRecords};