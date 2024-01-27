const Location = require("../models/locationModel");
const Session = require("../models/sessionModel");

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

async function getLocation(userId) {
  const location = await Location.find({ userId }).select(
    "latitude longitude timestamp"
  );
  return location;
}

module.exports = {
  saveLocation,
  getLocation,
};
