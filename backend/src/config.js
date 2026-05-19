import "dotenv/config";
export const PORT = process.env.PORT || 3001;
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
export const GRID_SIZE = 50;
export const COOLDOWN_MS = 3000;
