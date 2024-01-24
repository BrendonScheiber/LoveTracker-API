// src/middleware.js

const jwt = require("jsonwebtoken");
const secretKey =
  "gDtxg@9vtFp2FH.PUhbr9g!qhC6VtKxVs-Ukbe!_scu@wAMZmo!!REoWYoico@MWDuK!UPRjn8X9f9c!b9J9VJGW3p*oiNj4mfnx"; // azonosítódhoz használt titkos kulcs

function authenticateToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token)
    return res.status(401).json({ error: "Access denied. Token missing." });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token." });
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
