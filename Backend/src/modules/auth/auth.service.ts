import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../../core/database/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      const validPassword =
        user && (await bcrypt.compare(password, user.passwordHash));

      if (!user || !validPassword) {
        throw new UnauthorizedException("Credenciales incorrectas");
      }

      const token = this.jwt.sign({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return { token, user: { name: user.name, role: user.role } };
    } catch (error) {
      console.error("AUTH ERROR", error);
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException("No fue posible iniciar sesión");
    }
  }
}
