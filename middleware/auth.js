import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const REFRESH_TOKEN_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET_KEY;
const API_KEY = process.env.API_KEY;

const refreshTokens = [];

export const verifyApiKey = (req, res, next) => {
  const apiKey = req.query.apiKey;
  console.log(apiKey, API_KEY);
  if (apiKey !== API_KEY) {
    return res.status(401).json({ message: "Unauthorized - Invalid API key" });
  }
  next();
};

export const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET_KEY, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET_KEY);
  refreshTokens.push(refreshToken);
  return { accessToken, refreshToken };
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
