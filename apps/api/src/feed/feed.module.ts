import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { FeedController } from "./feed.controller";
import { FeedGateway } from "./feed.gateway";
import { FeedService } from "./feed.service";
import { FeedSimulatorService } from "./feed.simulator";

@Module({
  imports: [JwtModule.register({})],
  controllers: [FeedController],
  providers: [FeedService, FeedGateway, FeedSimulatorService],
  exports: [FeedGateway],
})
export class FeedModule {}
