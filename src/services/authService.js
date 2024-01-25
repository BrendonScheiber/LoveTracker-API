// src/services/authService.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Session = require("../models/sessionModel");
const Location = require("../models/locationModel");

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

async function getOtherUserIds(userId) {
  const otherUsers = await User.find({ _id: { $ne: userId } });
  const otherUserIds = otherUsers.map((user) => user._id);
  return otherUserIds;
}

async function logout(userId) {
  //console.log("Logout function called for userId:", userId);
  const result = await Session.deleteMany({ userId });
  // console.log("Deleted sessions:", result.deletedCount);
}

async function saveLocation(userId, latitude, longitude) {
  // Ellenőrizzük, van-e még érvényes session a felhasználónak
  const existingSession = await Session.findOne({ userId });

  if (!existingSession) {
    // Ha nincs érvényes session, visszatérünk egy válaszobjektummal
    return { error: "No valid session for the user" };
  }

  // Ellenőrizzük, van-e már helyszínadat a felhasználónak
  const existingLocation = await Location.findOne({ userId });

  if (existingLocation) {
    // Ha van, akkor frissítjük a meglévő helyszínadatot
    existingLocation.latitude = latitude;
    existingLocation.longitude = longitude;
    existingLocation.timestamp = Date.now();
    await existingLocation.save();
    return existingLocation;
  } else {
    // Ha nincs, akkor létrehozunk egy új helyszínadatot
    const newLocation = new Location({ userId, latitude, longitude });
    await newLocation.save();
    return newLocation;
  }
}

async function getAllLocations(userId) {
  const locations = await Location.find({ userId }).select(
    "latitude longitude timestamp"
  );
  return locations;
}

async function getLocation(userId) {
  //const location = await Location.findOne({ userId });
  const location = await Location.find({ userId }).select(
    "latitude longitude timestamp"
  );
  return location;
}

module.exports = {
  register,
  login,
  getOtherUserIds,
  logout,
  saveLocation,
  getLocation,
  getAllLocations,
};
