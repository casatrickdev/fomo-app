import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { WalletsService } from "./wallets.service";

type AuthedRequest = Request & { user: { userId: string } };

@Controller("wallets")
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly wallets: WalletsService) {}

  @Get("me")
  listMine(@Req() request: AuthedRequest) {
    return this.wallets.listForUser(request.user.userId);
  }
}
