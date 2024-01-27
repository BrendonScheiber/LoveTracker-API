// src/controllers/authController.js

const express = require("express");
const Session = require("../models/sessionModel");
const authService = require("../services/authService");
const { authenticateToken } = require("../middleware/authMiddleware");

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

//Megadja a másik felhasználók id-jét
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

module.exports = authRouter;
