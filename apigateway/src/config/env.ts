import "dotenv/config";

export const env = {
  port: Number(process.env.PORT || 3000),
  backendUrl: process.env.BACKEND_URL || "http://localhost:3001",
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
};
