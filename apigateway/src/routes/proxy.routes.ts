import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env";
import { gatewayAuth } from "../middleware/auth.middleware";

export const proxyRouter = Router();

proxyRouter.use(
  "/auth",
  createProxyMiddleware({
    target: env.backendUrl,
    changeOrigin: true,
    pathRewrite: { "^/": "/auth/" },
  }),
);

proxyRouter.use(
  "/",
  gatewayAuth,
  createProxyMiddleware({
    target: env.backendUrl,
    changeOrigin: true,
    pathRewrite: { "^/": "/" },
  }),
);
