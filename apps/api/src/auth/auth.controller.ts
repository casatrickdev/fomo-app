import {
  refreshSessionSchema,
  requestOtpSchema,
  verifyOtpSchema,
} from "@kite/shared-types";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("otp/request")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  requestOtp(
    @Body(new ZodValidationPipe(requestOtpSchema)) body: { email: string },
  ) {
    return this.auth.requestOtp(body);
  }

  @Post("otp/verify")
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  verifyOtp(
    @Body(new ZodValidationPipe(verifyOtpSchema))
    body: {
      email: string;
      code: string;
    },
  ) {
    return this.auth.verifyOtp(body);
  }

  @Post("refresh")
  @HttpCode(200)
  refresh(
    @Body(new ZodValidationPipe(refreshSessionSchema))
    body: {
      refreshToken: string;
    },
  ) {
    return this.auth.refresh(body.refreshToken);
  }

  @Post("logout")
  @HttpCode(200)
  logout(
    @Body(new ZodValidationPipe(refreshSessionSchema))
    body: {
      refreshToken: string;
    },
  ) {
    return this.auth.logout(body.refreshToken);
  }
}
