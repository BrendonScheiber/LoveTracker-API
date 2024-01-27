// src/app.js

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Session = require("./models/sessionModel");
const authController = require("./controllers/authController");
const locationController = require("./controllers/locationController");
const { authenticateToken } = require("./middleware/authMiddleware");

const app = express();
const PORT = 3000;

// Csatlakozás az adatbázishoz (MongoDB)
mongoose.connect("mongodb://localhost:27017/love_tracker");

// Middleware
app.use(bodyParser.json());

// Authentikációs útvonalak
app.use("/auth", authController);

app.use("/location", authenticateToken, locationController);

// Védett útvonal hozzáadása
app.get("/locate", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route." });
});

// Logout útvonal hozzáadása
app.post("/auth/logout", authenticateToken, authController);

// Alapú visszajelzés, ha az útvonal nem található
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Globális hiba kezelése
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Az alkalmazás indításakor töröljük a session-ket
mongoose.connection.once("open", async () => {
  await Session.deleteMany({});
  console.log("All sessions deleted");
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
