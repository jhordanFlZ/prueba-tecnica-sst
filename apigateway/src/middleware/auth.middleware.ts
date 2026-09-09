import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function gatewayAuth(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  try {
    const authorization = request.header("authorization") || "";

    if (!authorization.startsWith("Bearer ")) {
      response.status(401).json({ message: "Token requerido" });
      return;
    }

    jwt.verify(authorization.slice(7), env.jwtSecret);
    next();
  } catch {
    response.status(401).json({ message: "Token inválido o expirado" });
  }
}
