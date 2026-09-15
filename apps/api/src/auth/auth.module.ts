import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { WalletsModule } from "../wallets/wallets.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ConsoleEmailProvider } from "./console-email.provider";
import { EMAIL_PROVIDER } from "./email.provider";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [PassportModule, JwtModule.register({}), WalletsModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    ConsoleEmailProvider,
    { provide: EMAIL_PROVIDER, useExisting: ConsoleEmailProvider },
  ],
  exports: [AuthService],
})
export class AuthModule {}
