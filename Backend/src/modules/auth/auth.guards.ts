import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";

export const Roles = (...roles: Role[]) => SetMetadata("roles", roles);

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = (request.headers.authorization || "").replace("Bearer ", "");

    try {
      if (!token) throw new Error("Missing token");
      request.user = this.jwt.verify(token);
      return true;
    } catch {
      throw new UnauthorizedException("Sesión inválida o expirada");
    }
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles =
      this.reflector.get<Role[]>("roles", context.getHandler()) || [];
    const user = context.switchToHttp().getRequest().user;

    if (!roles.length || roles.includes(user.role)) return true;
    throw new ForbiddenException("No tiene permisos para este recurso");
  }
}
