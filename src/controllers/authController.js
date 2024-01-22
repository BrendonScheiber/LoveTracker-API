// src/controllers/authController.js

const express = require("express");
const authService = require("../services/authService");

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

module.exports = authRouter;
