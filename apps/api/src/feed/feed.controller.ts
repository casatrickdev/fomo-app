import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { FeedService } from "./feed.service";

type AuthedRequest = Request & { user: { userId: string } };

@Controller("feed")
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly feed: FeedService) {}

  @Get()
  list(@Req() request: AuthedRequest, @Query("cursor") cursor?: string) {
    return this.feed.list(request.user.userId, cursor);
  }
}
