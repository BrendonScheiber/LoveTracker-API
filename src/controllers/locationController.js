const express = require("express");
const locationService = require("../services/locationService");
const { authenticateToken } = require("../middleware/authMiddleware");
const Session = require("../models/sessionModel");
const User = require("../models/userModel");

const locationRouter = express.Router();

// Elmenti a felhasználó helyzetét
locationRouter.post("/save-location", authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.userId;
    const newLocation = await locationService.saveLocation(
      userId,
      latitude,
      longitude
    );
    res.json(newLocation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Megadja az adott felhasználó helyzetét
locationRouter.get("/:userId", authenticateToken, async (req, res) => {
  try {
    const requesterId = req.user.userId;
    const requestedUserId = req.params.userId;

    // Ellenőrizzük, van-e még érvényes session a felhasználónak
    const existingSession = await Session.findOne({ userId: requesterId });
    if (!existingSession) {
      return res.status(401).json({ error: "Unauthorized - Invalid session" });
    }

    // Ellenőrizzük, hogy a kért felhasználó létezik
    const requestedUser = await User.findById(requestedUserId);
    if (!requestedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const location = await locationService.getLocation(requestedUserId);
    res.json(location);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = locationRouter;
