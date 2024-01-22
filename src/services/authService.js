// src/services/authService.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Session = require("../models/sessionModel");

const saltRounds = 10;
const secretKey =
  "gDtxg@9vtFp2FH.PUhbr9g!qhC6VtKxVs-Ukbe!_scu@wAMZmo!!REoWYoico@MWDuK!UPRjn8X9f9c!b9J9VJGW3p*oiNj4mfnx"; // replace with a secure secret key

async function register(username, password) {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();
  return newUser;
}

async function login(username, password) {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error("Invalid username or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid username or password");
  }

  const token = jwt.sign({ userId: user._id }, secretKey);
  const newSession = new Session({ userId: user._id, token });
  await newSession.save();

  return { user, token };
}

module.exports = { register, login };
