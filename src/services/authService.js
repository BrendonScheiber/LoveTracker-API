// src/services/authService.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Session = require("../models/sessionModel");

const saltRounds = 10;
const secretKey =
  "";

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

  const existingSession = await Session.findOne({ userId: user._id });
  if (existingSession) {
    // Ha van, akkor már be van jelentkezve, visszatérünk egy speciális objektummal
    return { isLoggedIn: true, user };
  }

  const token = jwt.sign({ userId: user._id }, secretKey);
  const newSession = new Session({ userId: user._id, token });
  await newSession.save();

  // Ha nincs, létrehozzuk az új session-t és visszatérünk az új session-ös felhasználóval
  return { isLoggedIn: false, user, token };
}

async function logout(userId) {
  const result = await Session.deleteMany({ userId });
}

//Lekéri a másik felhasználók id-jét
async function getOtherUserIds(userId) {
  const otherUsers = await User.find({ _id: { $ne: userId } });
  const otherUserIds = otherUsers.map((user) => user._id);
  return otherUserIds;
}

module.exports = {
  register,
  login,
  getOtherUserIds,
  logout,
};
