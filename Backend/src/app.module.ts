import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PrismaService } from "./core/database/prisma.service";
import { AlertCorrelationService } from "./modules/alerts/alert-correlation.service";
import { AuthController } from "./modules/auth/auth.controller";
import { JwtGuard, RolesGuard } from "./modules/auth/auth.guards";
import { AuthService } from "./modules/auth/auth.service";
import { DashboardController } from "./modules/dashboard/dashboard.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get("JWT_SECRET", "dev-secret"),
        signOptions: { expiresIn: "8h" },
      }),
    }),
  ],
  controllers: [AuthController, DashboardController],
  providers: [
    PrismaService,
    AuthService,
    AlertCorrelationService,
    JwtGuard,
    RolesGuard,
  ],
})
export class AppModule {}
