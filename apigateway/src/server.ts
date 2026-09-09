import cors from "cors";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { proxyRouter } from "./routes/proxy.routes";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendOrigin }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(morgan("combined"));

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "api-gateway" });
});

app.use("/api", proxyRouter);

app.use((_request: Request, response: Response) => {
  response.status(404).json({ message: "Ruta no encontrada" });
});

app.listen(env.port, () => {
  console.log(`API Gateway listening on ${env.port}`);
});
