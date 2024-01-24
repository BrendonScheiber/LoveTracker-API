// src/controllers/locationController.js
const Location = require("../models/locationModel");

async function addLocation(req, res) {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.userId;

    const newLocation = new Location({ userId, latitude, longitude });
    await newLocation.save();

    res.json({ message: "Location added successfully" });
  } catch (error) {
    console.error("Error adding location:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getLocations(req, res) {
  const userId = req.user.userId;

  try {
    const locations = await Location.find({ userId }).sort({ timestamp: -1 });
    res.json(locations);
  } catch (error) {
    console.error("Error getting locations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { addLocation, getLocations };
