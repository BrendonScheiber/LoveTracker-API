// src/controllers/authController.js

const express = require("express");
const authService = require("../services/authService");
const { authenticateToken } = require("../middleware/authMiddleware");
const Session = require("../models/sessionModel");
const User = require("../models/userModel");

const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const newUser = await authService.register(username, password);
    res.json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const authResult = await authService.login(username, password);
    res.json(authResult);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

authRouter.get("/located-userid", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Ellenőrizzük, van-e még érvényes session a felhasználónak
    const existingSession = await Session.findOne({ userId });
    if (!existingSession) {
      return res.status(401).json({ error: "Unauthorized - Invalid session" });
    }

    const otherUserIds = await authService.getOtherUserIds(userId);
    res.json(otherUserIds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

authRouter.post("/logout", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    await authService.logout(userId);
    res.json({ message: "Logout successful." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

authRouter.post("/save-location", authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.userId;
    const newLocation = await authService.saveLocation(
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

authRouter.get("/location/:userId", authenticateToken, async (req, res) => {
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

    const location = await authService.getLocation(requestedUserId);
    res.json(location);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = authRouter;
