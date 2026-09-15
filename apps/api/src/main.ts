import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ["error", "warn", "log"],
  });
  const config = app.get(ConfigService);
  const origin = config.get<string>("CORS_ORIGIN", "*");
  app.enableCors({ origin, credentials: origin !== "*" });
  app.useWebSocketAdapter(new IoAdapter(app));
  app.setGlobalPrefix("v1");

  const port = Number(config.get("PORT", 3000));
  await app.listen(port);
  Logger.log(`Kite API listening on ${port}`, "Bootstrap");
}

void bootstrap();
