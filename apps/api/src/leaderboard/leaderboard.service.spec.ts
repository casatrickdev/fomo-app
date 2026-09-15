import { LeaderboardService } from "./leaderboard.service";

describe("LeaderboardService", () => {
  it("rejects unknown windows", async () => {
    const service = new LeaderboardService({} as never);
    await expect(service.list("yesterday")).rejects.toThrow(
      "Invalid leaderboard window",
    );
  });
});
