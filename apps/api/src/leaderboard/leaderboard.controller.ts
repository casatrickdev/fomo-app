import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { LeaderboardService } from "./leaderboard.service";

@Controller("leaderboard")
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
  constructor(private readonly leaderboard: LeaderboardService) {}

  @Get()
  list(@Query("window") window = "7d") {
    return this.leaderboard.list(window);
  }
}
