import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";

describe("Health (e2e)", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = "test-access";
    process.env.JWT_REFRESH_SECRET = "test-refresh";
    process.env.FEED_SIMULATOR_ENABLED = "false";
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ??
      "postgresql://kite:kite@localhost:5432/kite?schema=public";

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("v1");
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/v1/health (GET)", () => {
    return request(app.getHttpServer())
      .get("/v1/health")
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({ ok: true, service: "kite-api" });
      });
  });
});
