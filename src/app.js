// src/app.js

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authController = require("./controllers/authController");

const app = express();
const PORT = 3000;

// Csatlakozás az adatbázishoz (MongoDB)
mongoose.connect("mongodb://localhost:27017/love_tracker");

// Middleware
app.use(bodyParser.json());

// Authentikációs útvonalak
app.use("/auth", authController);

// Alapú visszajelzés, ha az útvonal nem található
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Globális hiba kezelése
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Szerver indítása
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
