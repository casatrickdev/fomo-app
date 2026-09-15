import { updateProfileSchema } from "@kite/shared-types";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { UsersService } from "./users.service";

type AuthedRequest = Request & { user: { userId: string } };

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@Req() request: AuthedRequest) {
    return this.users.getSessionUser(request.user.userId);
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard)
  updateMe(
    @Req() request: AuthedRequest,
    @Body(new ZodValidationPipe(updateProfileSchema))
    body: ReturnType<typeof updateProfileSchema.parse>,
  ) {
    return this.users.updateMe(request.user.userId, body);
  }

  @Get(":handle")
  @UseGuards(JwtAuthGuard)
  getByHandle(@Param("handle") handle: string, @Req() request: AuthedRequest) {
    return this.users.getPublicByHandle(handle, request.user.userId);
  }

  @Post(":handle/follow")
  @UseGuards(JwtAuthGuard)
  follow(@Param("handle") handle: string, @Req() request: AuthedRequest) {
    return this.users.follow(request.user.userId, handle);
  }

  @Delete(":handle/follow")
  @UseGuards(JwtAuthGuard)
  unfollow(@Param("handle") handle: string, @Req() request: AuthedRequest) {
    return this.users.unfollow(request.user.userId, handle);
  }
}
